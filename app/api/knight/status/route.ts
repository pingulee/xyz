import { NextResponse } from "next/server";
import { getKnightLineupId } from "@/lib/knightSession";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return NextResponse.json({ loggedIn: Boolean(getKnightLineupId(request)) });
}
