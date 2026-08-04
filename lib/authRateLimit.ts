import { createHash } from "crypto";
import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { oncePerProcess } from "@/lib/schema-once";

// 로그인·회원가입 무차별 대입/남용 방어. IP 해시당 15분 창 안 시도 횟수를 세고
// 상한을 넘으면 잠시 차단한다. scrypt 비용과 함께 온라인 공격을 완화한다.
const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 20;

type RateRow = RowDataPacket & { attempts: number; expired: 0 | 1 };

const ensureSchema = oncePerProcess(async () => {
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS auth_rate_limits (
      ip_hash VARCHAR(64) NOT NULL,
      attempts INT UNSIGNED NOT NULL DEFAULT 0,
      window_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (ip_hash)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
});

function ipHashOf(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    request.headers.get("x-real-ip") ??
    forwardedFor?.split(",")[0]?.trim() ??
    "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

export async function isAuthRateLimited(request: Request): Promise<boolean> {
  await ensureSchema();
  const [rows] = await getPool().execute<RateRow[]>(
    `SELECT attempts,
            (window_start < (NOW() - INTERVAL ${WINDOW_MINUTES} MINUTE)) AS expired
     FROM auth_rate_limits WHERE ip_hash = :ipHash LIMIT 1`,
    { ipHash: ipHashOf(request) },
  );
  const row = rows[0];
  if (!row || row.expired) return false;
  return row.attempts >= MAX_ATTEMPTS;
}

export async function recordAuthAttempt(request: Request): Promise<void> {
  await ensureSchema();
  // 창이 만료됐으면 1로 리셋, 아니면 증가.
  await getPool().execute(
    `INSERT INTO auth_rate_limits (ip_hash, attempts, window_start)
     VALUES (:ipHash, 1, NOW())
     ON DUPLICATE KEY UPDATE
       attempts = IF(window_start < (NOW() - INTERVAL ${WINDOW_MINUTES} MINUTE), 1, attempts + 1),
       window_start = IF(window_start < (NOW() - INTERVAL ${WINDOW_MINUTES} MINUTE), NOW(), window_start)`,
    { ipHash: ipHashOf(request) },
  );
}

export async function clearAuthAttempts(request: Request): Promise<void> {
  await ensureSchema();
  await getPool().execute(
    `DELETE FROM auth_rate_limits WHERE ip_hash = :ipHash`,
    { ipHash: ipHashOf(request) },
  );
}
