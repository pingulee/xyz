import { NextResponse } from "next/server";
import { clearSessionCookieHeader } from "@/lib/session";
import { guardMutationRequest } from "@/lib/request-security";

export const runtime = "nodejs";

// 통합 로그아웃. 단일 세션 쿠키(xyz_session)를 지운다.
export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, {
    maxBytes: 1024,
    contentTypes: ["application/json", "text/plain"],
  });
  if (rejected) return rejected;

  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", clearSessionCookieHeader());
  return res;
}
