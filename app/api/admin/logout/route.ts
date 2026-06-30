import { NextResponse } from "next/server";
import { clearSessionCookieHeader, deleteSession, getSessionTokenFromRequest } from "@/lib/adminSession";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = getSessionTokenFromRequest(request);
  if (token) deleteSession(token);

  return NextResponse.json({ ok: true }, {
    headers: { "Set-Cookie": clearSessionCookieHeader() },
  });
}
