import type { Metadata, Viewport } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingContact from "@/components/layout/FloatingContact";
import { site } from "@/lib/site";
import "./globals.css";

// Pretendard 동적 서브셋 CSS(@font-face 55KB)를 비동기로 주입.
// 인라인하면 렌더 차단 HTML 문서를 부풀리고, 일반 <link>는 렌더 차단 →
// JS로 stylesheet를 append하면 첫 페인트를 막지 않음. font-display:swap이 FOUT 처리.
const FONT_LOADER = `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='/fonts/pretendard/pretendardvariable-dynamic-subset.css';document.head.appendChild(l);})();`;

const BRAND_NAME = "XYZ";
const HOME_TITLE = "롤 대리·롤 듀오 전문 XYZ | 개인 기사보다 저렴한 가격";
const HOME_DESCRIPTION =
  "롤 대리·롤 듀오 전문 XYZ는 중간 마진을 줄여 개인 기사보다 저렴한 가격으로 진행합니다. 구간별 요금과 검증 기사 전적, 실제 작업 후기, 승률 보장 기준을 투명하게 공개합니다.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: BRAND_NAME,
  title: {
    default: HOME_TITLE,
    template: "%s | XYZ",
  },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: site.url,
    siteName: BRAND_NAME,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
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
        {/* 폰트 서브셋 CSS 비동기 주입(렌더 차단·HTML 부풀림 둘 다 회피) */}
        <script dangerouslySetInnerHTML={{ __html: FONT_LOADER }} />
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
