import { randomBytes } from "crypto";
import type { PoolConnection } from "mysql2/promise";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { oncePerProcess } from "@/lib/schema-once";

// 기사 가입 코드. 관리자가 발급 → 합격 기사에게 전달 → 기사 회원가입 시 1회 소진.
// 코드가 곧 승인이므로 유효 코드로 가입하면 즉시 활성 기사가 된다.
export const ensureCodeSchema = oncePerProcess(async () => {
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS booster_signup_codes (
      code VARCHAR(32) NOT NULL,
      used TINYINT(1) NOT NULL DEFAULT 0,
      used_by_user_id BIGINT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      used_at TIMESTAMP NULL,
      PRIMARY KEY (code)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
});

export type SignupCode = {
  code: string;
  used: boolean;
  usedByUserId: number | null;
  createdAt: string;
  usedAt: string | null;
};

type CodeRow = RowDataPacket & {
  code: string;
  used: 0 | 1;
  used_by_user_id: number | null;
  created_at: Date;
  used_at: Date | null;
};

export async function createSignupCode(): Promise<string> {
  await ensureCodeSchema();
  const code = randomBytes(12).toString("hex"); // 24 hex chars
  await getPool().execute(
    `INSERT INTO booster_signup_codes (code) VALUES (:code)`,
    { code },
  );
  return code;
}

/**
 * 코드 유효성만 확인(소진 안 함). 회원가입 1단계에서 코드부터 검증하는 용도.
 * 미사용 코드가 존재하면 true. 실제 소진은 가입 트랜잭션의 consumeCode가 한다
 * (확인~가입 사이 경합은 거기서 최종 판정하므로 여기선 낙관적 확인만).
 */
export async function verifyCode(code: string): Promise<boolean> {
  await ensureCodeSchema();
  const [rows] = await getPool().execute<CodeRow[]>(
    `SELECT code FROM booster_signup_codes WHERE code = :code AND used = 0 LIMIT 1`,
    { code },
  );
  return rows.length === 1;
}

export async function listSignupCodes(): Promise<SignupCode[]> {
  await ensureCodeSchema();
  const [rows] = await getPool().execute<CodeRow[]>(
    `SELECT code, used, used_by_user_id, created_at, used_at
     FROM booster_signup_codes ORDER BY created_at DESC LIMIT 200`,
  );
  return rows.map((r) => ({
    code: r.code,
    used: r.used === 1,
    usedByUserId: r.used_by_user_id,
    createdAt: (r.created_at as Date).toISOString(),
    usedAt: r.used_at ? (r.used_at as Date).toISOString() : null,
  }));
}

/**
 * 트랜잭션 커넥션에서 코드를 소진한다. 미사용 코드만 소비하며(WHERE used=0),
 * affectedRows로 동시 사용을 막는다(둘이 같은 코드를 동시에 쓰면 하나만 성공).
 * 실패(무효/이미 사용)면 false — 호출부가 롤백한다.
 */
export async function consumeCode(
  conn: PoolConnection,
  code: string,
  userId: number,
): Promise<boolean> {
  const [res] = await conn.execute<ResultSetHeader>(
    `UPDATE booster_signup_codes
     SET used = 1, used_by_user_id = :userId, used_at = NOW()
     WHERE code = :code AND used = 0`,
    { code, userId },
  );
  return res.affectedRows === 1;
}

export async function deleteSignupCode(code: string): Promise<void> {
  await ensureCodeSchema();
  // 미사용 코드만 폐기(사용된 코드는 이력으로 남긴다).
  await getPool().execute(
    `DELETE FROM booster_signup_codes WHERE code = :code AND used = 0`,
    { code },
  );
}
