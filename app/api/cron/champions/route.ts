import { NextResponse } from "next/server";
import { getChampions, syncChampionsFromRiot } from "@/lib/champions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const authHeader = request.headers.get("authorization") ?? "";
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 401 });
  }

  try {
    await syncChampionsFromRiot();
    const champions = await getChampions();

    return NextResponse.json({
      ok: true,
      count: champions.length,
      version: champions[0]?.version ?? null,
    });
  } catch (error) {
    console.error("Failed to sync champions from cron", error);
    return NextResponse.json(
      { message: "챔피언 목록 동기화에 실패했습니다." },
      { status: 500 },
    );
  }
}
