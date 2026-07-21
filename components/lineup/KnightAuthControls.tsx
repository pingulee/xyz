"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";

type AuthStatus = { loggedIn: boolean };

export default function KnightAuthControls({
  className = "",
}: {
  className?: string;
}) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    fetch("/api/knight/status", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as AuthStatus;
        if (mounted) {
          setLoggedIn(data.loggedIn);
        }
      })
      .catch(() => {
        if (mounted) {
          setLoggedIn(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/knight/logout", {
        method: "POST",
      });

      if (response.ok) {
        setLoggedIn(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (loggedIn === null) {
    return null;
  }

  if (loggedIn) {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={handleLogout}
        aria-label="기사 로그아웃"
        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <LogOut size={18} />
      </button>
    );
  }

  return (
    <Link
      href="/login"
      aria-label="로그인"
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 ${className}`}
    >
      <LogIn size={18} />
    </Link>
  );
}
