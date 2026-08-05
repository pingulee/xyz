import { createHash, randomBytes } from "crypto";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { oncePerProcess } from "@/lib/schema-once";

// 비밀번호 재설정 토큰. 원문 토큰은 메일 링크로만 전달하고 DB엔 SHA-256 해시만
// 저장한다(DB 유출 시 토큰 재현 방지). 1시간 유효 + 1회용.
export const ensureResetSchema = oncePerProcess(async () => {
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_hash CHAR(64) NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (token_hash),
      INDEX idx_reset_user (user_id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
});

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * 재설정 토큰 발급. 원문(URL용)을 반환하고 DB엔 해시만 저장한다.
 * 같은 유저의 기존 미사용 토큰은 무효화(used=1)해 활성 토큰을 하나로 유지한다.
 */
export async function createResetToken(userId: number): Promise<string> {
  await ensureResetSchema();
  const pool = getPool();
  await pool.execute(
    `UPDATE password_reset_tokens SET used = 1 WHERE user_id = :uid AND used = 0`,
    { uid: userId },
  );
  const raw = randomBytes(32).toString("hex"); // 64 hex chars, 256bit
  await pool.execute(
    `INSERT INTO password_reset_tokens (token_hash, user_id, expires_at)
     VALUES (:hash, :uid, DATE_ADD(NOW(), INTERVAL 1 HOUR))`,
    { hash: hashToken(raw), uid: userId },
  );
  return raw;
}

/**
 * 토큰 소진. 원자적 UPDATE(used=0 AND 미만료)로 1회용·경쟁을 보장하고,
 * 성공 시 연결된 user_id를 반환한다. 무효/만료/이미 사용이면 null.
 */
export async function consumeResetToken(raw: string): Promise<number | null> {
  if (!/^[0-9a-f]{64}$/.test(raw)) return null;
  await ensureResetSchema();
  const pool = getPool();
  const hash = hashToken(raw);
  const [res] = await pool.execute<ResultSetHeader>(
    `UPDATE password_reset_tokens SET used = 1
     WHERE token_hash = :hash AND used = 0 AND expires_at > NOW()`,
    { hash },
  );
  if (res.affectedRows !== 1) return null;

  const [rows] = await pool.execute<(RowDataPacket & { user_id: number })[]>(
    `SELECT user_id FROM password_reset_tokens WHERE token_hash = :hash LIMIT 1`,
    { hash },
  );
  return rows[0]?.user_id ?? null;
}
