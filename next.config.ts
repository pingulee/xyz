import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // 소규모 CSS 번들을 HTML에 인라인 → 렌더 차단 <link> 요청 제거 (LCP/FCP 개선)
  experimental: {
    inlineCss: true,
  },
  // 폰트 서브셋(불변 파일명)은 장기 캐시 → 재방문 시 재다운로드 방지
  async headers() {
    return [
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
