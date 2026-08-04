import { NextResponse } from "next/server";
import { createSession, getSessionCookieHeader } from "@/lib/adminSession";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: { password?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const password = payload.password?.trim() ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ message: "비밀번호가 일치하지 않습니다." }, { status: 403 });
  }

  // 챔피언 동기화는 로그인이 아니라 cron(/api/cron/champions)에서 돌린다.
  // 로그인마다 외부 API를 치면 응답이 느려지고 트리거가 사람 로그인에 묶인다.
  const token = createSession();
  return NextResponse.json({ ok: true }, {
    status: 200,
    headers: { "Set-Cookie": getSessionCookieHeader(token) },
  });
}
