import { NextResponse } from "next/server";
import { guardMutationRequest } from "@/lib/request-security";
import { isValidRiotId, normalizeRiotId } from "@/lib/users";
import { getSoloTier, RiotUnavailableError } from "@/lib/riot";

export const runtime = "nodejs";

// 견적 계산기: Riot ID의 현재 솔로랭크 티어를 조회한다(op.gg 파싱, 키 불필요).
// 공개 엔드포인트(비회원도 계산 가능)라 세션 게이트는 없다. 형식은 서버가 재검증.
export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 2 * 1024 });
  if (rejected) return rejected;

  let payload: { riotId?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const riotId = normalizeRiotId(payload.riotId ?? "");
  if (!isValidRiotId(riotId)) {
    return NextResponse.json(
      { message: "Riot ID 형식이 올바르지 않습니다. (예: 소환사명#KR1)" },
      { status: 400 },
    );
  }

  try {
    const tier = await getSoloTier(riotId);
    if (!tier.ranked) {
      return NextResponse.json(
        {
          ranked: false,
          level: tier.level,
          message: "티어 정보(솔로랭크)를 찾을 수 없습니다.",
        },
        { status: 200 },
      );
    }
    return NextResponse.json({
      ranked: true,
      level: tier.level,
      tierIndex: tier.tierIndex,
      division: tier.division,
      lp: tier.lp,
      tierName: tier.tierName,
    });
  } catch (error) {
    if (error instanceof RiotUnavailableError) {
      return NextResponse.json(
        { message: "지금은 조회할 수 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 503 },
      );
    }
    throw error;
  }
}
