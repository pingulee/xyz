import { NextResponse } from "next/server";
import { guardMutationRequest } from "@/lib/request-security";
import { isAuthRateLimited, recordAuthAttempt } from "@/lib/authRateLimit";
import { isValidRiotId, normalizeRiotId } from "@/lib/users";
import { verifyRiotId, RiotUnavailableError } from "@/lib/riot";

export const runtime = "nodejs";

// Riot ID 실존 확인(가입/닉네임 추가 전 "확인" 버튼). op.gg로 조회한다.
// 남용 방지 위해 레이트리밋을 건다(외부 조회라 비용이 있다).
export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 2 * 1024 });
  if (rejected) return rejected;
  if (await isAuthRateLimited(request)) {
    return NextResponse.json(
      { message: "시도가 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }
  await recordAuthAttempt(request);

  let riotId = "";
  try {
    const body = (await request.json()) as { riotId?: string };
    riotId = normalizeRiotId(body.riotId ?? "");
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!isValidRiotId(riotId)) {
    return NextResponse.json(
      { valid: false, message: "형식이 올바르지 않습니다. (예: 소환사명#KR1)" },
      { status: 400 },
    );
  }

  try {
    const { valid } = await verifyRiotId(riotId);
    return NextResponse.json({
      valid,
      message: valid
        ? "확인되었습니다."
        : "존재하지 않는 Riot ID입니다. 다시 확인해주세요.",
    });
  } catch (error) {
    if (error instanceof RiotUnavailableError) {
      return NextResponse.json(
        { message: "지금은 확인할 수 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 503 },
      );
    }
    console.error("riot verify failed", error);
    return NextResponse.json({ message: "확인에 실패했습니다." }, { status: 500 });
  }
}
