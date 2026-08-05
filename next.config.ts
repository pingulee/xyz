import type { NextConfig } from "next";

// 전 응답에 붙이는 보안 헤더.
// - X-Frame-Options: iframe 삽입 차단(클릭재킹).
// - X-Content-Type-Options: MIME 스니핑 차단. 업로드된 이미지가 다른 타입으로
//   해석되는 것을 막는다.
// - Referrer-Policy: 외부로 전체 URL이 새지 않게 제한.
// - Permissions-Policy: 안 쓰는 강력 기능(카메라·마이크·위치)을 끈다.
// CSP는 Next 인라인 부트스트랩 때문에 script/style unsafe-inline이 필요하지만,
// 외부 리소스·object·base·frame·교차 출처 폼을 차단해 XSS 피해 범위를 줄인다.
// JSON-LD의 저장형 XSS는 출력 인코딩(lib/jsonld.ts)으로 별도 차단한다.
const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "manifest-src 'self'",
      "media-src 'self'",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
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
