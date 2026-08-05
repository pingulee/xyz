// 아이디·비밀번호 정책(서버·클라이언트 공용). crypto/db 의존 없이 순수 검증만 둬
// 서버 라우트와 클라이언트 폼이 같은 규칙·문구를 쓰게 한다. 다른 사이트 표준에 맞춘 규격.

// 아이디: 영문 소문자로 시작, 영문 소문자·숫자·밑줄, 4~20자.
export const USERNAME_MIN = 4;
export const USERNAME_MAX = 20;
const USERNAME_RE = /^[a-z][a-z0-9_]{3,19}$/;
export const USERNAME_RULE_TEXT =
  "아이디는 영문 소문자로 시작하는 4~20자(영문 소문자·숫자·_)여야 합니다.";

export function isValidUsername(username: string): boolean {
  return USERNAME_RE.test(username);
}

// 비밀번호: 8~64자, 영문·숫자·특수문자 각 1자 이상.
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;
export const PASSWORD_RULE_TEXT =
  "비밀번호는 8~64자이며 영문·숫자·특수문자를 각각 1자 이상 포함해야 합니다.";

export function isValidPassword(password: string): boolean {
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) return false;
  return (
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
