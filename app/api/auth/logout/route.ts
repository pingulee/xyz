import { NextResponse } from "next/server";
import { clearSessionCookieHeader } from "@/lib/session";
import { clearSessionCookieHeader as clearLegacyAdmin } from "@/lib/adminSession";
import { clearBoosterSessionCookieHeader as clearLegacyBooster } from "@/lib/boosterSession";

export const runtime = "nodejs";

// 통합 로그아웃. 신규 쿠키와 과도기 구 쿠키(관리자·기사)를 모두 지워 어떤 세션이든
// 한 번에 종료한다. Phase 5에서 구 쿠키 clear를 제거한다.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", clearSessionCookieHeader());
  res.headers.append("Set-Cookie", clearLegacyAdmin());
  res.headers.append("Set-Cookie", clearLegacyBooster());
  return res;
}
