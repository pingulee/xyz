import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function isAdminPassword(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  return Boolean(adminPassword && password === adminPassword);
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const password = String(formData.get("password") ?? "").trim();
  if (!isAdminPassword(password)) {
    return NextResponse.json({ message: "관리자 비밀번호가 일치하지 않습니다." }, { status: 403 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "파일을 선택해주세요." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ message: "JPG, PNG, WEBP, GIF 파일만 업로드 가능합니다." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "images", "lineup");

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, safeName), buffer);

  return NextResponse.json({ path: `/images/lineup/${safeName}` }, { status: 201 });
}
