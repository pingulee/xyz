"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { useSession } from "@/hooks/useSession";

// 헤더 인증 컨트롤. 비로그인=로그인 링크, 로그인=로그아웃(+고객은 마이페이지).
// 세션은 useSession(/api/session/me)으로 조회 — 관리자·기사·고객 통합.
export default function AuthControls({ className = "" }: { className?: string }) {
  const { session, loading } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const iconCls = `inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 ${className}`;

  const logout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) return null;

  if (!session.role) {
    return (
      <Link href="/login" aria-label="로그인" className={iconCls}>
        <LogIn size={18} />
      </Link>
    );
  }

  // role별 페이지(관리자/마이페이지)는 헤더 텍스트 메뉴에 노출된다. 여기선 로그아웃만.
  return (
    <button
      type="button"
      onClick={logout}
      disabled={loggingOut}
      aria-label="로그아웃"
      className={`${iconCls} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <LogOut size={18} />
    </button>
  );
}
