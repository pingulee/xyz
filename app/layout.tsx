import type { Metadata, Viewport } from "next";
import { pretendard } from "./fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { site } from "@/lib/site";
import "./globals.css";

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
