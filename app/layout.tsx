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
