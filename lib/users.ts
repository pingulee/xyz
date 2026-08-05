import { RowDataPacket, ResultSetHeader } from "mysql2";
import { getPool } from "@/lib/db";
import { oncePerProcess } from "@/lib/schema-once";
import { ensureBoosterSchema } from "@/lib/booster";
// 아이디 규칙은 서버·클라 공용 정책 모듈에서 온다(중복 방지). 내부에서도 쓰므로
// import 후 재노출한다(기존 `@/lib/users`의 isValidUsername import 경로 유지).
import { isValidUsername } from "@/lib/authPolicy";
export { isValidUsername };

export type UserRole = "customer" | "booster";

export type AuthUser = {
  id: number;
  username: string;
  role: UserRole;
};

export type Account = {
  id: number;
  username: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
};

type UserRow = RowDataPacket & {
  id: number;
  username: string;
  password_hash: string;
  email: string | null;
  display_name: string | null;
  role: UserRole;
  active: 0 | 1;
};

type BoosterBackfillRow = RowDataPacket & {
  id: number;
  name: string;
  booster_password_hash: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Riot ID = 게임명#태그. 게임명 3~16자(공백·# 제외), 태그 영숫자 2~5자.
const RIOT_ID_RE = /^[^#\s][^#]{1,14}[^#\s]#[A-Za-z0-9]{2,5}$/;

export const MAX_NICKNAMES = 10;

// 대소문자·동형문자 중복과 열거를 막기 위해 소문자·trim 정규화 후 저장·조회한다.
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length <= 255 && EMAIL_RE.test(email);
}

// 사이트 닉네임(표시용). 후기·문의 작성자로 쓰인다. 2~20자, 공백만 불가.
export function normalizeDisplayName(raw: string): string {
  return raw.trim();
}

export function isValidDisplayName(name: string): boolean {
  return name.length >= 2 && name.length <= 20;
}

// Riot ID 검증 + 정규화(양끝 공백 제거). 저장 형식은 입력 그대로(태그 대소문자 유지).
export function normalizeRiotId(raw: string): string {
  return raw.trim();
}

export function isValidRiotId(riotId: string): boolean {
  return RIOT_ID_RE.test(riotId);
}

/**
 * 통합 인증 스키마 보정(프로세스당 1회). 전부 "추가만" — DROP·NOT NULL화 없음이라
 * 이전 배포와 공존하고 롤백 안전하다.
 *  - users 테이블 신설(username UNIQUE, scrypt 해시, role)
 *  - users.email 컬럼 + UNIQUE(가입 이메일 필수·고유, 기존 행은 NULL 허용)
 *  - user_lol_nicknames(회원별 Riot ID 여러 개)
 *  - 기존 기사 계정을 users로 승계(해시 문자열 그대로 복사, 재해싱 없음)
 *
 * 테이블 연결 컬럼은 각 테이블의 스키마 보정이 담당한다(자기 테이블 컬럼은 자기
 * ensure에서 만들어야 그 테이블만 쓰는 라우트에서도 컬럼이 보장된다):
 *  - booster.user_id → ensureBoosterSchema
 *  - review.user_id / password_hash NULL 완화 → ensureReviewSchema
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

  // 이메일: 추가만. NULL 허용(기존 행 보존) + UNIQUE(NULL은 MySQL에서 중복 허용).
  await pool.execute(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL`,
  );
  await pool.execute(
    `ALTER TABLE users ADD UNIQUE INDEX IF NOT EXISTS uq_users_email (email)`,
  );
  // 사이트 닉네임(표시용, 고유 아님). 추가만.
  await pool.execute(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(20) NULL`,
  );

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS user_lol_nicknames (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      riot_id VARCHAR(40) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_nick_user (user_id),
      UNIQUE KEY uq_nick_user_riot (user_id, riot_id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  // 백필이 booster.user_id를 쓰므로 booster 스키마(user_id 컬럼)를 먼저 보장한다.
  await ensureBoosterSchema();
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
    `SELECT id, username, password_hash, email, role, active
     FROM users WHERE username = :username AND active = 1 LIMIT 1`,
    { username: normalizeUsername(username) },
  );
  return rows[0] ?? null;
}

/**
 * 이메일로 계정 조회(아이디 찾기·비번 재설정용). 열거 방지를 위해 호출부는
 * 존재 여부와 무관하게 동일 응답을 낸다. active=1만.
 */
export async function getUserByEmail(email: string): Promise<Account | null> {
  await ensureAuthSchema();
  const [rows] = await getPool().execute<UserRow[]>(
    `SELECT id, username, email, display_name, role FROM users
     WHERE email = :email AND active = 1 LIMIT 1`,
    { email: normalizeEmail(email) },
  );
  const row = rows[0];
  return row
    ? {
        id: row.id,
        username: row.username,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
      }
    : null;
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

// 마이페이지 표시용(이메일·닉네임 포함, 비번 제외).
export async function getAccountById(id: number): Promise<Account | null> {
  await ensureAuthSchema();
  const [rows] = await getPool().execute<UserRow[]>(
    `SELECT id, username, email, display_name, role
     FROM users WHERE id = :id AND active = 1 LIMIT 1`,
    { id },
  );
  const row = rows[0];
  return row
    ? {
        id: row.id,
        username: row.username,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
      }
    : null;
}

// 후기·문의 작성자명으로 쓸 사이트 닉네임. 미설정이면 username 폴백.
export async function getDisplayNameById(id: number): Promise<string | null> {
  await ensureAuthSchema();
  const [rows] = await getPool().execute<UserRow[]>(
    `SELECT display_name, username FROM users WHERE id = :id AND active = 1 LIMIT 1`,
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return row.display_name?.trim() || row.username;
}

// 현재 비밀번호 검증용(내부). password_hash 포함이라 라우트 밖으로 내보내지 않는다.
export async function getPasswordHashById(id: number): Promise<string | null> {
  await ensureAuthSchema();
  const [rows] = await getPool().execute<UserRow[]>(
    `SELECT password_hash FROM users WHERE id = :id AND active = 1 LIMIT 1`,
    { id },
  );
  return rows[0]?.password_hash ?? null;
}

// 고객 셀프 회원가입. role은 서버에서 'customer'로 강제한다. username·email UNIQUE
// 경쟁은 INSERT 실패로 잡는다. 성공 시 새 user id, 중복이면 어떤 컬럼이 충돌했는지 반환.
export async function createCustomer(
  username: string,
  passwordHash: string,
  email: string,
  displayName: string,
): Promise<{ id: number } | { error: "username" | "email" | "unknown" }> {
  await ensureAuthSchema();
  try {
    const [res] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO users (username, password_hash, email, display_name, role)
       VALUES (:username, :hash, :email, :displayName, 'customer')`,
      {
        username: normalizeUsername(username),
        hash: passwordHash,
        email: normalizeEmail(email),
        displayName: normalizeDisplayName(displayName),
      },
    );
    return { id: res.insertId };
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err.code === "ER_DUP_ENTRY") {
      return { error: err.message?.includes("uq_users_email") ? "email" : "username" };
    }
    return { error: "unknown" };
  }
}

export async function updateUserDisplayName(
  id: number,
  displayName: string,
): Promise<void> {
  await ensureAuthSchema();
  await getPool().execute(
    `UPDATE users SET display_name = :name WHERE id = :id`,
    { name: normalizeDisplayName(displayName), id },
  );
}

export async function updateUserPassword(
  id: number,
  passwordHash: string,
): Promise<void> {
  await ensureAuthSchema();
  await getPool().execute(
    `UPDATE users SET password_hash = :hash WHERE id = :id`,
    { hash: passwordHash, id },
  );
}

// 이메일 변경. UNIQUE 충돌이면 false.
export async function updateUserEmail(
  id: number,
  email: string,
): Promise<boolean> {
  await ensureAuthSchema();
  try {
    await getPool().execute(
      `UPDATE users SET email = :email WHERE id = :id`,
      { email: normalizeEmail(email), id },
    );
    return true;
  } catch (e) {
    if ((e as { code?: string }).code === "ER_DUP_ENTRY") return false;
    throw e;
  }
}

// ── Riot ID(롤 닉네임) ──

export type LolNickname = { id: number; riotId: string };

export async function listNicknames(userId: number): Promise<LolNickname[]> {
  await ensureAuthSchema();
  const [rows] = await getPool().execute<
    (RowDataPacket & { id: number; riot_id: string })[]
  >(
    `SELECT id, riot_id FROM user_lol_nicknames
     WHERE user_id = :uid ORDER BY created_at ASC`,
    { uid: userId },
  );
  return rows.map((r) => ({ id: r.id, riotId: r.riot_id }));
}

/**
 * Riot ID 추가. 상한(MAX_NICKNAMES) 초과 또는 중복이면 실패 코드 반환.
 * 상한 확인과 INSERT 사이 경쟁은 UNIQUE(user_id, riot_id)로 중복만 막고,
 * 개수 상한은 낙관적으로 본다(회원 본인만 호출하는 저빈도 경로).
 */
export async function addNickname(
  userId: number,
  riotId: string,
): Promise<{ id: number } | { error: "limit" | "duplicate" }> {
  await ensureAuthSchema();
  const existing = await listNicknames(userId);
  if (existing.length >= MAX_NICKNAMES) return { error: "limit" };

  try {
    const [res] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO user_lol_nicknames (user_id, riot_id) VALUES (:uid, :riot)`,
      { uid: userId, riot: normalizeRiotId(riotId) },
    );
    return { id: res.insertId };
  } catch (e) {
    if ((e as { code?: string }).code === "ER_DUP_ENTRY") {
      return { error: "duplicate" };
    }
    throw e;
  }
}

export async function deleteNickname(
  userId: number,
  nicknameId: number,
): Promise<boolean> {
  await ensureAuthSchema();
  const [res] = await getPool().execute<ResultSetHeader>(
    `DELETE FROM user_lol_nicknames WHERE id = :id AND user_id = :uid`,
    { id: nicknameId, uid: userId },
  );
  return res.affectedRows > 0;
}

// 가입 시 여러 Riot ID를 한 번에 저장(검증 통과분만, 중복 무시).
export async function addNicknamesBulk(
  userId: number,
  riotIds: string[],
): Promise<void> {
  const unique = Array.from(
    new Set(riotIds.map(normalizeRiotId).filter(isValidRiotId)),
  ).slice(0, MAX_NICKNAMES);
  for (const riotId of unique) {
    try {
      await getPool().execute(
        `INSERT INTO user_lol_nicknames (user_id, riot_id) VALUES (:uid, :riot)`,
        { uid: userId, riot: riotId },
      );
    } catch {
      // 중복(UNIQUE) 무시
    }
  }
}
