import { NextResponse } from "next/server";
import { clearKnightSessionCookieHeader } from "@/lib/knightSession";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json({ ok: true }, {
    headers: { "Set-Cookie": clearKnightSessionCookieHeader() },
  });
}
