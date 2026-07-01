import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile, mkdir, access } from "fs/promises";
import { constants } from "fs";
import { join, resolve, basename } from "path";

export const runtime = "nodejs";

const ALLOWED_FOLDERS = new Set(["lineups"]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function getUploadDir(folder: string): Promise<string> {
  const base = process.env.UPLOAD_BASE_DIR
    ?? process.env.UPLOAD_DIR?.replace(/\/reviews$/, "")
    ?? join(process.cwd(), "uploads");
  const dir = resolve(join(base, folder));
  await mkdir(dir, { recursive: true });
  await access(dir, constants.W_OK);
  return dir;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ folder: string }> },
) {
  const { folder } = await params;

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ message: "잘못된 업로드 경로입니다." }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "이미지를 선택해주세요." }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { message: "JPG, PNG, WEBP 이미지만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: "이미지는 5MB 이하만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  let uploadDir: string;
  try {
    uploadDir = await getUploadDir(folder);
  } catch (err) {
    console.error(`[upload/${folder}] 디렉터리 접근 실패:`, err);
    return NextResponse.json(
      { message: "업로드 디렉터리에 접근할 수 없습니다. UPLOAD_BASE_DIR 환경변수를 확인해주세요." },
      { status: 500 },
    );
  }

  const ext = EXT_MAP[file.type] ?? "jpg";
  const safeName = basename(`${randomUUID()}.${ext}`);
  const filePath = resolve(join(uploadDir, safeName));

  if (!filePath.startsWith(uploadDir)) {
    return NextResponse.json({ message: "잘못된 파일명입니다." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
  } catch (err) {
    console.error(`[upload/${folder}] 파일 저장 실패:`, filePath, err);
    return NextResponse.json({ message: "이미지 저장에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json(
    { imageUrl: `/uploads/${folder}/${safeName}` },
    { status: 201 },
  );
}
