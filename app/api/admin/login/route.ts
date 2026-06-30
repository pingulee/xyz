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

  const token = createSession();
  return NextResponse.json({ ok: true }, {
    status: 200,
    headers: { "Set-Cookie": getSessionCookieHeader(token) },
  });
}
