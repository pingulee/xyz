"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
        className={`rounded-full border border-gold/20 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        로그아웃
      </button>
    );
  }

  return (
    <Link
      href="/login"
      className={`rounded-full bg-gold-gradient px-6 py-3 text-sm font-black text-black shadow-gold transition hover:-translate-y-0.5 ${className}`}
    >
      로그인
    </Link>
  );
}
