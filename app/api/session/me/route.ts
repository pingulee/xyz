import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, validateSession } from "@/lib/adminSession";
import {
  BOOSTER_SESSION_COOKIE,
  validateBoosterSession,
} from "@/lib/boosterSession";
import { getBoosterById } from "@/lib/booster";

// 상세 페이지(review/[id]·booster/[slug])를 ISR로 정적 캐시하기 위해 세션 읽기를
// 서버 렌더에서 뺐다. 관리자/기사 편집 UI는 클라이언트가 이 엔드포인트로 자기
// 세션을 확인해 조건부 노출한다. 쿠키가 HttpOnly라 document.cookie로는 못 읽어
// 서버 왕복이 필요하다. 세션 의존이라 항상 동적, 캐시 금지.
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = validateSession(cookieStore.get(SESSION_COOKIE)?.value ?? "");
  const boosterId = validateBoosterSession(
    cookieStore.get(BOOSTER_SESSION_COOKIE)?.value ?? "",
  );

  // 로그인한 기사면 답변 폼 프리필용 이름을 함께 준다.
  let boosterName = "";
  if (boosterId) {
    const booster = await getBoosterById(boosterId);
    boosterName = booster?.name ?? "";
  }

  return NextResponse.json(
    { isAdmin, boosterId, boosterName },
    { headers: { "Cache-Control": "no-store" } },
  );
}
