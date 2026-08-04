import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

// scrypt 비밀번호 해시. 저장 포맷 `salt:hash`(hex), scrypt N=64바이트.
// 기존 booster·review 인증(app/api/booster/login·app/api/review)과 100% 동일
// 포맷이라, 저장된 기존 해시 문자열을 users 테이블로 그대로 복사해도 재검증이
// 성립한다(재해싱·비번 재설정 불필요). 3중 중복이던 로직을 여기로 단일화.
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const inputBuffer = scryptSync(password, salt, 64);
  return (
    hashBuffer.length === inputBuffer.length &&
    timingSafeEqual(hashBuffer, inputBuffer)
  );
}

// 존재하지 않는 username으로 로그인 시도할 때도 scrypt를 한 번 태워 응답 시간을
// 균일화한다. "없는 계정"이 "비번 불일치"보다 빨리 응답하면 username 열거가
// 가능해지므로 이를 막는다. 모듈 로드 시 더미 해시를 1회 생성해 재사용.
const DUMMY_HASH = hashPassword("timing-equalizer-not-a-real-account");
export function dummyVerify(password: string): void {
  verifyPassword(password, DUMMY_HASH);
}
