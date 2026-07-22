import { NextResponse } from "next/server";
import { getBoosterLineupId } from "@/lib/boosterSession";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return NextResponse.json({ loggedIn: Boolean(getBoosterLineupId(request)) });
}
