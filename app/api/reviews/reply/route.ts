import { NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { getKnightLineupId } from "@/lib/knightSession";
import { getSessionTokenFromRequest, validateSession } from "@/lib/adminSession";

export const runtime = "nodejs";

type ReviewRow = RowDataPacket & { lineup_id: number | null };

function isAdminRequest(request: Request): boolean {
  const token = getSessionTokenFromRequest(request);
  return token ? validateSession(token) : false;
}

export async function POST(request: Request) {
  const knightLineupId = getKnightLineupId(request);
  if (!knightLineupId) {
    return NextResponse.json({ message: "기사 로그인이 필요합니다." }, { status: 401 });
  }

  let payload: { reviewId?: string; content?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const reviewId = Number(payload.reviewId);
  const content = payload.content?.trim() ?? "";

  if (!Number.isInteger(reviewId) || reviewId < 1) {
    return NextResponse.json({ message: "후기를 찾을 수 없습니다." }, { status: 400 });
  }
  if (content.length < 1 || content.length > 500) {
    return NextResponse.json({ message: "답변은 1~500자로 입력해주세요." }, { status: 400 });
  }

  const [rows] = await getPool().execute<ReviewRow[]>(
    `SELECT lineup_id FROM reviews WHERE id = :reviewId LIMIT 1`,
    { reviewId },
  );
  const review = rows[0];
  if (!review) {
    return NextResponse.json({ message: "후기를 찾을 수 없습니다." }, { status: 404 });
  }
  if (review.lineup_id !== knightLineupId) {
    return NextResponse.json({ message: "해당 후기에 답변 권한이 없습니다." }, { status: 403 });
  }

  // 이미 답변 있으면 교체
  await getPool().execute(
    `DELETE FROM review_replies WHERE review_id = :reviewId`,
    { reviewId },
  );
  const [result] = await getPool().execute<ResultSetHeader>(
    `INSERT INTO review_replies (review_id, lineup_id, content) VALUES (:reviewId, :lineupId, :content)`,
    { reviewId, lineupId: knightLineupId, content },
  );

  const [replyRows] = await getPool().execute<RowDataPacket[]>(
    `SELECT id, lineup_id, content, created_at FROM review_replies WHERE id = :id`,
    { id: result.insertId },
  );
  const r = replyRows[0];
  return NextResponse.json({
    reply: {
      id: String(r.id),
      lineupId: String(r.lineup_id),
      content: r.content,
      createdAt: (r.created_at as Date).toISOString(),
    },
  }, { status: 201 });
}

export async function DELETE(request: Request) {
  const knightLineupId = getKnightLineupId(request);
  const admin = isAdminRequest(request);
  if (!knightLineupId && !admin) {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 401 });
  }

  let payload: { reviewId?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const reviewId = Number(payload.reviewId);
  if (!Number.isInteger(reviewId) || reviewId < 1) {
    return NextResponse.json({ message: "후기를 찾을 수 없습니다." }, { status: 400 });
  }

  if (!admin) {
    const [rows] = await getPool().execute<RowDataPacket[]>(
      `SELECT lineup_id FROM review_replies WHERE review_id = :reviewId LIMIT 1`,
      { reviewId },
    );
    if (rows[0]?.lineup_id !== knightLineupId) {
      return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
    }
  }

  await getPool().execute(`DELETE FROM review_replies WHERE review_id = :reviewId`, { reviewId });
  return NextResponse.json({ ok: true });
}
