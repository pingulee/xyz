import { NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "crypto";
import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

type ReviewRow = RowDataPacket & {
  password_hash: string | null;
};

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const inputBuffer = scryptSync(password, salt, 64);
  return (
    hashBuffer.length === inputBuffer.length &&
    timingSafeEqual(hashBuffer, inputBuffer)
  );
}

export async function POST(request: Request) {
  let payload: { id?: string; password?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const id = Number(payload.id);
  const password = payload.password?.trim() ?? "";

  if (!Number.isInteger(id) || id < 1 || !password) {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  const [rows] = await getPool().execute<ReviewRow[]>(
    `SELECT password_hash FROM \`review\` WHERE id = :id LIMIT 1`,
    { id },
  );

  const review = rows[0];
  if (!review) {
    return NextResponse.json({ message: "후기를 찾을 수 없습니다." }, { status: 404 });
  }

  if (!review.password_hash || !verifyPassword(password, review.password_hash)) {
    return NextResponse.json({ message: "비밀번호가 일치하지 않습니다." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
