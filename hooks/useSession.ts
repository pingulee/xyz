"use client";

import { useEffect, useState } from "react";

// ISR로 캐시된 상세 페이지에서 세션 의존 편집 UI를 켜기 위한 클라이언트 훅.
// mount 후 /api/session/me 를 한 번 조회한다. 초기 상태는 "비로그인"이라
// 캐시된 HTML과 일치하고(하이드레이션 안전), 관리자/기사는 응답 후 UI가 나타난다.
export type SessionInfo = {
  isAdmin: boolean;
  boosterId: number | null;
  boosterName: string;
};

const EMPTY: SessionInfo = { isAdmin: false, boosterId: null, boosterName: "" };

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
          isAdmin: Boolean(data.isAdmin),
          boosterId: data.boosterId ?? null,
          boosterName: data.boosterName ?? "",
        });
      })
      .catch(() => {
        /* 네트워크 실패 시 비로그인으로 둔다(편집 UI 미노출) */
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
