const BLOCKED_RETURN_PREFIXES = ["/admin", "/admax"];

export function getSafeReturnPath(referer: string, host: string) {
  if (!referer) return "/";

  try {
    const url = new URL(referer);
    const path = `${url.pathname}${url.search}${url.hash}`;

    if (
      url.host !== host ||
      BLOCKED_RETURN_PREFIXES.some((prefix) => path.startsWith(prefix))
    ) {
      return "/";
    }

    return path;
  } catch {
    return "/";
  }
}
