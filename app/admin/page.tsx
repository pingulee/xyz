import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

// 관리자 전용 로그인 폼은 통합 로그인으로 흡수됐다. 북마크 보존을 위해 리다이렉트.
export default function AdminPage() {
  redirect("/login");
}
