import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { syncChampionsFromRiot } from "@/lib/champions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 챔피언 동기화 cron 엔드포인트.
 *
 * 관리자 로그인 트리거를 대체한다. 호스팅(Hostinger) 공유 서버는 SSH crontab이
 * 없어 hPanel Cron Jobs에서 이 URL을 curl로 주기 호출한다.
 *   curl -sS -H "x-cron-secret: <CRON_SECRET>" https://롤대리.xyz/api/cron/champions
 *
 * 세션이 없으므로 CRON_SECRET 헤더로 인증한다. robots.txt가 /api/ 를 막지만
 * cron curl은 그와 무관하게 직접 호출한다.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const url = new URL(request.url);
  const provided =
    request.headers.get("x-cron-secret") ??
    url.searchParams.get("key") ??
    "";

  // 길이가 다르면 timingSafeEqual이 던지므로 먼저 거른다.
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function handle(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { message: "CRON_SECRET이 설정되지 않았습니다." },
      { status: 503 },
    );
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 401 });
  }

  try {
    await syncChampionsFromRiot();
    return NextResponse.json({ ok: true, syncedAt: new Date().toISOString() });
  } catch (error) {
    console.error("cron champion sync failed", error);
    return NextResponse.json({ message: "동기화 실패" }, { status: 500 });
  }
}

// cron은 대개 GET으로 호출한다. POST도 같은 동작을 허용한다.
export const GET = handle;
export const POST = handle;
