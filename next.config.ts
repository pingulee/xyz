import type { NextConfig } from "next";

// 전 응답에 붙이는 보안 헤더.
// - X-Frame-Options: iframe 삽입 차단(클릭재킹).
// - X-Content-Type-Options: MIME 스니핑 차단. 업로드된 이미지가 다른 타입으로
//   해석되는 것을 막는다.
// - Referrer-Policy: 외부로 전체 URL이 새지 않게 제한.
// - Permissions-Policy: 안 쓰는 강력 기능(카메라·마이크·위치)을 끈다.
// CSP는 두지 않는다. inlineCss·인라인 JSON-LD·폰트 로더 인라인 스크립트가 있어
// nonce 없이는 안전한 정책을 만들 수 없고, 잘못 걸면 사이트가 깨진다. 저장형
// XSS는 출력 인코딩(lib/jsonld.ts)으로 원천 차단했다.
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // 서버 버전·프레임워크를 노출하는 X-Powered-By 제거.
  poweredByHeader: false,
  // 소규모 CSS 번들을 HTML에 인라인 → 렌더 차단 <link> 요청 제거 (LCP/FCP 개선)
  experimental: {
    inlineCss: true,
  },
  // 폰트 서브셋(불변 파일명)은 장기 캐시 → 재방문 시 재다운로드 방지
  async headers() {
    return [
      {
        // 모든 경로에 보안 헤더 적용.
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
