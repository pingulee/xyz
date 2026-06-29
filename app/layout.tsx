import type { Metadata } from "next";
import { pretendard } from "./fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "롤대리.xyz | 롤대리 롤듀오 롤계정 상담",
    template: "%s | 롤대리.xyz",
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
    "롤 계정 상담",
    "롤 작업 후기",
    "롤대리 후기",
    "기사 모집",
    "리그 오브 레전드 대리",
    "롤대리.xyz",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "롤대리.xyz | 롤대리 롤듀오 롤계정 상담",
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "롤대리.xyz | 롤대리 롤듀오 롤계정 상담",
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${pretendard.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
