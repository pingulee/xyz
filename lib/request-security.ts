import { NextResponse } from "next/server";
import { site } from "@/lib/site";

type MutationGuardOptions = {
  maxBytes?: number;
  contentTypes?: readonly string[];
};

/**
 * 상태 변경 API 공통 방어.
 * - 교차 사이트 브라우저 요청 거부(CSRF 보조 방어; 세션 쿠키는 SameSite=Strict)
 * - 예상 Content-Type만 허용
 * - 프록시가 제공하는 Content-Length 기준으로 과대 본문을 파싱 전에 거부
 *
 * 실제 전송량 상한은 리버스 프록시/CDN에서도 반드시 설정해야 한다. chunked 요청은
 * 애플리케이션에 도착하기 전에 제한하는 것이 메모리 DoS 방어에 가장 안전하다.
 */
export function guardMutationRequest(
  request: Request,
  options: MutationGuardOptions = {},
): NextResponse | null {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") {
    return NextResponse.json({ message: "허용되지 않은 요청 출처입니다." }, { status: 403 });
  }

  const origin = request.headers.get("origin");
  if (origin) {
    const allowedOrigins = new Set([site.url, new URL(request.url).origin]);
    if (!allowedOrigins.has(origin)) {
      return NextResponse.json({ message: "허용되지 않은 요청 출처입니다." }, { status: 403 });
    }
  }

  const allowedTypes = options.contentTypes ?? ["application/json"];
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  const declaredLength = request.headers.get("content-length");
  if (contentType && !allowedTypes.includes(contentType)) {
    return NextResponse.json({ message: "지원하지 않는 요청 형식입니다." }, { status: 415 });
  }

  const maxBytes = options.maxBytes ?? 32 * 1024;
  const contentLength = declaredLength;
  if (contentLength) {
    const bytes = Number(contentLength);
    if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > maxBytes) {
      return NextResponse.json({ message: "요청 본문이 너무 큽니다." }, { status: 413 });
    }
  }

  return null;
}
