import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // 소규모 CSS 번들을 HTML에 인라인 → 렌더 차단 <link> 요청 제거 (LCP/FCP 개선)
  experimental: {
    inlineCss: true,
  },
};

export default nextConfig;
