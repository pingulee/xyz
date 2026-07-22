import { NextResponse } from "next/server";
import { clearBoosterSessionCookieHeader } from "@/lib/boosterSession";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json({ ok: true }, {
    headers: { "Set-Cookie": clearBoosterSessionCookieHeader() },
  });
}
