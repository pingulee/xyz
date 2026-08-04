"use client";

import { useEffect, useState } from "react";
import type { Role } from "@/lib/session";

// ISR로 캐시된 페이지에서 세션 의존 UI(편집·인증 컨트롤·마이페이지)를 켜기 위한
// 클라이언트 훅. mount 후 /api/session/me 를 한 번 조회한다. 초기 상태는 "비로그인"
// 이라 캐시된 HTML과 일치(하이드레이션 안전)하고, 로그인 상태면 뒤이어 반영된다.
export type SessionInfo = {
  role: Role | null;
  userId: number | null;
  username: string;
  // 하위호환 필드(기존 ReviewDetailView·BoosterReview 계약).
  isAdmin: boolean;
  boosterId: number | null;
  boosterName: string;
};

const EMPTY: SessionInfo = {
  role: null,
  userId: null,
  username: "",
  isAdmin: false,
  boosterId: null,
  boosterName: "",
};

export function useSession(): { session: SessionInfo; loading: boolean } {
  const [session, setSession] = useState<SessionInfo>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/session/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : EMPTY))
      .then((data: Partial<SessionInfo>) => {
        if (!alive) return;
        setSession({
          role: data.role ?? null,
          userId: data.userId ?? null,
          username: data.username ?? "",
          isAdmin: Boolean(data.isAdmin),
          boosterId: data.boosterId ?? null,
          boosterName: data.boosterName ?? "",
        });
      })
      .catch(() => {
        /* 네트워크 실패 시 비로그인으로 둔다 */
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { session, loading };
}
