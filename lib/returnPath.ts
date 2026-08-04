const BLOCKED_RETURN_PREFIXES = ["/admin"];

export function getSafeReturnPath(referer: string, host: string) {
  if (!referer) return "/";

  try {
    const url = new URL(referer);
    const path = `${url.pathname}${url.search}${url.hash}`;

    // `https://우리도메인//evil.com` 의 pathname은 `//evil.com`이다. host 검사는
    // 통과하지만 이 값을 다시 URL로 해석하면 프로토콜 상대 주소가 되어
    // 외부 도메인으로 나간다(오픈 리다이렉트). 슬래시·역슬래시로 시작하는
    // 두 번째 문자를 막아 항상 이 사이트 내부 경로로만 돌아가게 한다.
    const isProtocolRelative = /^[/\\]{2}/.test(path.replace(/\\/g, "/"));

    if (
      url.host !== host ||
      isProtocolRelative ||
      !path.startsWith("/") ||
      BLOCKED_RETURN_PREFIXES.some((prefix) => path.startsWith(prefix))
    ) {
      return "/";
    }

    return path;
  } catch {
    return "/";
  }
}
