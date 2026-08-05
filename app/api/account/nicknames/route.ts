import { NextResponse } from "next/server";
import { getSession } from "@/lib/authz";
import { guardMutationRequest } from "@/lib/request-security";
import {
  addNickname,
  deleteNickname,
  isValidRiotId,
  listNicknames,
  normalizeRiotId,
} from "@/lib/users";
import { verifyRiotId, RiotUnavailableError } from "@/lib/riot";
import type { Session } from "@/lib/session";

export const runtime = "nodejs";

function gate(request: Request): Session | null {
  const session = getSession(request);
  if (!session || session.userId < 1 || session.role === "admin") return null;
  return session;
}

// 롤 닉네임(Riot ID) 목록.
export async function GET(request: Request) {
  const session = gate(request);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }
  const nicknames = await listNicknames(session.userId);
  return NextResponse.json({ nicknames });
}

// 추가. Riot ID 형식(이름#태그) 검증, 상한/중복이면 실패.
export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 2 * 1024 });
  if (rejected) return rejected;
  const session = gate(request);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

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

  // 클라이언트 "확인"을 신뢰하지 않고 서버에서 실존을 재확인한다.
  try {
    const { valid } = await verifyRiotId(riotId);
    if (!valid) {
      return NextResponse.json(
        { message: "존재하지 않는 Riot ID입니다. 확인 후 등록해주세요." },
        { status: 400 },
      );
    }
  } catch (error) {
    if (error instanceof RiotUnavailableError) {
      return NextResponse.json(
        { message: "지금은 확인할 수 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 503 },
      );
    }
    throw error;
  }

  const result = await addNickname(session.userId, riotId);
  if ("error" in result) {
    const message =
      result.error === "limit"
        ? "닉네임은 최대 10개까지 등록할 수 있습니다."
        : "이미 등록된 Riot ID입니다.";
    return NextResponse.json({ message }, { status: 409 });
  }
  return NextResponse.json({ ok: true, id: result.id, riotId });
}

// 삭제.
export async function DELETE(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 2 * 1024 });
  if (rejected) return rejected;
  const session = gate(request);
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  let payload: { id?: number | string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const id = Number(payload.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }
  const ok = await deleteNickname(session.userId, id);
  if (!ok) {
    return NextResponse.json({ message: "닉네임을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
