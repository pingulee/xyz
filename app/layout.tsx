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
    default: "xyz | 프리미엄 롤 대리 서비스",
    template: "%s | xyz",
  },
  description: site.description,
  keywords: [
    "롤 대리",
    "롤 듀오",
    "롤 계정",
    "롤대리 가격",
    "기사 모집",
    "리그오브레전드 대리",
    "xyz",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "xyz | 프리미엄 롤 대리 서비스",
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "xyz | 프리미엄 롤 대리 서비스",
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
