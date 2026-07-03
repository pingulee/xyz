import { NextResponse } from "next/server";
import { getChampions, syncChampionsFromRiot } from "@/lib/champions";
import {
  getSessionTokenFromRequest,
  validateSession,
} from "@/lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdminRequest(request: Request): boolean {
  const token = getSessionTokenFromRequest(request);
  return token ? validateSession(token) : false;
}

export async function GET() {
  try {
    return NextResponse.json({ champions: await getChampions() });
  } catch (error) {
    console.error("Failed to load champions", error);
    return NextResponse.json(
      { message: "챔피언 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(
      { message: "관리자 권한이 필요합니다." },
      { status: 403 },
    );
  }

  try {
    await syncChampionsFromRiot();
    return NextResponse.json({ champions: await getChampions() });
  } catch (error) {
    console.error("Failed to sync champions", error);
    return NextResponse.json(
      { message: "Riot 챔피언 목록을 동기화하지 못했습니다." },
      { status: 500 },
    );
  }
}
