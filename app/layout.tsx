import type { Metadata, Viewport } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingContact from "@/components/layout/FloatingContact";
import { site } from "@/lib/site";
import "./globals.css";

// Pretendard 동적 서브셋 CSS를 인라인(렌더 차단 <link> 요청 제거 → LCP/FCP 개선).
// url(./woff2-dynamic-subset/...) 상대경로를 절대경로로 치환(HTML에 인라인되면 기준 URL이 페이지가 되므로).
const pretendardSubsetCss = readFileSync(
  join(
    process.cwd(),
    "public/fonts/pretendard/pretendardvariable-dynamic-subset.css",
  ),
  "utf8",
).replace(/url\(\.\//g, "url(/fonts/pretendard/");

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "XYZ | 롤 대리 롤 듀오 롤 계정",
    template: "%s | XYZ",
  },
  description: site.description,
  keywords: [
    "롤 대리",
    "롤대리",
    "롤 듀오",
    "롤듀오",
    "롤 계정",
    "롤 대리 가격",
    "롤 듀오 가격",
    "롤계정",
    "롤 작업 후기",
    "롤대리 후기",
    "기사 모집",
    "롤 업디",
    "XYZ",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "XYZ | 롤 대리 롤 듀오 롤 계정",
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/images/profile.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "XYZ | 롤 대리 롤 듀오 롤 계정",
    description: site.description,
    images: ["/images/profile.webp"],
  },
  verification: {
    google: "bd8AUpF-AipHBtAmr4brhshsGfRijvw5TmLDUlMS2rA",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning className="h-full antialiased">
      <head>
        {/* Pretendard 동적 서브셋 @font-face 인라인(unicode-range → 쓰인 subset woff2만 다운로드).
            렌더 차단 <link> 대신 인라인 <style>로 크리티컬 경로에서 제거. */}
        <style dangerouslySetInnerHTML={{ __html: pretendardSubsetCss }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
