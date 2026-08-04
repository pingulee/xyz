import { RowDataPacket, ResultSetHeader } from "mysql2";
import { getPool } from "@/lib/db";
import { oncePerProcess } from "@/lib/schema-once";

export type UserRole = "customer" | "booster";

export type AuthUser = {
  id: number;
  username: string;
  role: UserRole;
};

type UserRow = RowDataPacket & {
  id: number;
  username: string;
  password_hash: string;
  role: UserRole;
  active: 0 | 1;
};

type BoosterBackfillRow = RowDataPacket & {
  id: number;
  name: string;
  booster_password_hash: string;
};

type ColumnMetaRow = RowDataPacket & {
  IS_NULLABLE: "YES" | "NO";
  COLUMN_TYPE: string;
};

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

// 대소문자·동형문자 중복과 열거를 막기 위해 소문자·trim 정규화 후 저장·조회한다.
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(username: string): boolean {
  return USERNAME_RE.test(username);
}

/**
 * 통합 인증 스키마 보정(프로세스당 1회). 전부 "추가만" — DROP·NOT NULL화 없음이라
 * 이전 배포와 공존하고 롤백 안전하다.
 *  - users 테이블 신설(username UNIQUE, scrypt 해시, role)
 *  - booster.user_id / review.user_id 논리 연결 컬럼(NULL 허용, FK 안 검)
 *  - review.password_hash 를 NULL 허용으로 완화(로그인 후기는 비번이 없다)
 *  - 기존 기사 계정을 users로 승계(해시 문자열 그대로 복사, 재해싱 없음)
 */
export const ensureAuthSchema = oncePerProcess(async () => {
  const pool = getPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      username VARCHAR(30) NOT NULL,
      password_hash VARCHAR(200) NOT NULL,
      role ENUM('customer','booster') NOT NULL DEFAULT 'customer',
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_username (username)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await pool.execute(
    `ALTER TABLE booster ADD COLUMN IF NOT EXISTS user_id BIGINT UNSIGNED NULL`,
  );
  await pool.execute(
    `ALTER TABLE review ADD COLUMN IF NOT EXISTS user_id BIGINT UNSIGNED NULL`,
  );
  await pool.execute(
    `ALTER TABLE review ADD INDEX IF NOT EXISTS idx_review_user (user_id)`,
  );

  // review.password_hash 가 정본 스키마에선 NOT NULL이라 로그인 후기(비번 없음)
  // INSERT가 막힌다. 현재 nullability를 확인해 NOT NULL일 때만 완화한다(타입 유지).
  const [cols] = await pool.execute<ColumnMetaRow[]>(
    `SELECT IS_NULLABLE, COLUMN_TYPE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'review'
       AND COLUMN_NAME = 'password_hash'
     LIMIT 1`,
  );
  const meta = cols[0];
  if (meta && meta.IS_NULLABLE === "NO" && /^[a-z0-9()]+$/i.test(meta.COLUMN_TYPE)) {
    await pool.execute(
      `ALTER TABLE review MODIFY COLUMN password_hash ${meta.COLUMN_TYPE} NULL`,
    );
  }

  await backfillBoosterUsers();
});

/**
 * user_id 미연결 + 로그인 비번 보유 기사를 users로 승계한다. 해시 문자열을 그대로
 * 복사(포맷 동일)하고 booster.user_id로 연결한다. username은 이름이 규칙을 통과하고
 * 미중복이면 사용, 아니면 booster{id} 폴백. 원본 booster_password_hash는 지우지
 * 않는다(롤백 안전망 + 과도기 name 로그인 폴백). oncePerProcess 안에서 1회 실행.
 */
async function backfillBoosterUsers(): Promise<void> {
  const pool = getPool();
  const [boosters] = await pool.execute<BoosterBackfillRow[]>(
    `SELECT id, name, booster_password_hash
     FROM booster
     WHERE user_id IS NULL AND booster_password_hash IS NOT NULL`,
  );

  for (const booster of boosters) {
    const base = normalizeUsername(booster.name);
    const primary = isValidUsername(base) ? base : `booster${booster.id}`;
    const fallback = `booster${booster.id}`;

    for (const username of primary === fallback ? [primary] : [primary, fallback]) {
      try {
        const [res] = await pool.execute<ResultSetHeader>(
          `INSERT INTO users (username, password_hash, role)
           VALUES (:username, :hash, 'booster')`,
          { username, hash: booster.booster_password_hash },
        );
        await pool.execute(
          `UPDATE booster SET user_id = :userId WHERE id = :id`,
          { userId: res.insertId, id: booster.id },
        );
        break; // 성공 → 다음 기사
      } catch {
        // username UNIQUE 충돌 → 다음 후보(booster{id})로 재시도. 둘 다 실패하면
        // 이 기사는 다음 배포에서 다시 시도된다(user_id 여전히 NULL).
      }
    }
  }
}

export async function getUserByUsername(username: string): Promise<UserRow | null> {
  await ensureAuthSchema();
  const [rows] = await getPool().execute<UserRow[]>(
    `SELECT id, username, password_hash, role, active
     FROM users WHERE username = :username AND active = 1 LIMIT 1`,
    { username: normalizeUsername(username) },
  );
  return rows[0] ?? null;
}

// password_hash를 절대 노출하지 않는 공개 조회.
export async function getAuthUserById(id: number): Promise<AuthUser | null> {
  await ensureAuthSchema();
  const [rows] = await getPool().execute<UserRow[]>(
    `SELECT id, username, role FROM users WHERE id = :id AND active = 1 LIMIT 1`,
    { id },
  );
  const row = rows[0];
  return row ? { id: row.id, username: row.username, role: row.role } : null;
}

// 고객 셀프 회원가입. role은 서버에서 'customer'로 강제한다. username UNIQUE 경쟁은
// INSERT 실패로 잡는다. 성공 시 새 user id 반환, username 중복이면 null.
export async function createCustomer(
  username: string,
  passwordHash: string,
): Promise<number | null> {
  await ensureAuthSchema();
  try {
    const [res] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO users (username, password_hash, role)
       VALUES (:username, :hash, 'customer')`,
      { username: normalizeUsername(username), hash: passwordHash },
    );
    return res.insertId;
  } catch {
    return null;
  }
}
