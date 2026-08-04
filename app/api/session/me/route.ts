import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import { getAuthUserById } from "@/lib/users";
import { resolveBoosterId } from "@/lib/authz";
import { getBoosterById } from "@/lib/booster";

// 상세 페이지(review/[id]·booster/[slug])를 ISR로 정적 캐시하기 위해 세션 읽기를
// 서버 렌더에서 뺐다. 편집 UI·마이페이지 등은 클라이언트가 이 엔드포인트로 자기
// 세션을 확인한다. 쿠키가 HttpOnly라 서버 왕복이 필요하다. 세션 의존이라 항상 동적.
//
// 통합 세션(신규 쿠키)을 우선 읽고, 없으면 구 관리자·기사 쿠키를 폴백으로 흡수한다
// (getSessionFromRequest). 반환은 role/userId/username을 추가하되, 기존 클라이언트
// 계약(isAdmin/boosterId/boosterName)을 그대로 유지해 ISR 상세페이지가 안 깨진다.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      {
        role: null,
        userId: null,
        username: "",
        isAdmin: false,
        boosterId: null,
        boosterName: "",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const isAdmin = session.role === "admin";
  let boosterId: number | null = null;
  let boosterName = "";
  let username = "";

  if (session.role === "booster") {
    boosterId = await resolveBoosterId(session);
    if (boosterId) {
      const booster = await getBoosterById(boosterId);
      boosterName = booster?.name ?? "";
    }
  }

  // 고객·기사의 로그인 아이디. 신규 세션은 users.id로 조회된다(구 기사 쿠키의
  // booster.id는 users에서 못 찾아 빈 문자열 — 과도기 허용).
  if (!isAdmin) {
    const user = await getAuthUserById(session.userId);
    username = user?.username ?? "";
  }

  return NextResponse.json(
    {
      role: session.role,
      userId: isAdmin ? null : session.userId,
      username,
      isAdmin,
      boosterId,
      boosterName,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
