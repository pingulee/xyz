import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile, mkdir, access } from "fs/promises";
import { constants } from "fs";
import { join, resolve, basename } from "path";
import { getSessionTokenFromRequest, validateSession } from "@/lib/adminSession";

export const runtime = "nodejs";

const ALLOWED_FOLDERS = new Set(["booster"]);

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
    ?? join(process.cwd(), "upload");
  const dir = resolve(join(base, folder));
  await mkdir(dir, { recursive: true });
  await access(dir, constants.W_OK);
  return dir;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ folder: string }> },
) {
  // 업로드는 관리자 기사 관리 화면에서만 쓴다. 인증이 없으면 누구나 5MB
  // 파일을 무제한으로 써서 디스크를 채우거나, 임의 바이트를 이 도메인의
  // 공개 URL로 호스팅할 수 있다(MIME은 클라이언트가 보내는 값이라 못 믿는다).
  // 본문 파싱보다 먼저 막아 미인증 요청이 파일을 읽지도 못하게 한다.
  const token = getSessionTokenFromRequest(request);
  if (!token || !validateSession(token)) {
    return NextResponse.json(
      { message: "관리자 권한이 필요합니다." },
      { status: 403 },
    );
  }

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
    { imageUrl: `/upload/${folder}/${safeName}` },
    { status: 201 },
  );
}
