import { NextResponse } from "next/server";
import { getSessionTokenFromRequest, validateSession } from "@/lib/adminSession";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = getSessionTokenFromRequest(request);
  const isAdmin = token ? validateSession(token) : false;
  return NextResponse.json({ isAdmin });
}
