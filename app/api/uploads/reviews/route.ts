import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join, resolve, basename } from "path";
import { Readable } from "stream";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads", "reviews");
  const resolved = resolve(dir);
  if (!existsSync(resolved)) {
    mkdirSync(resolved, { recursive: true });
  }
  return resolved;
}

export async function POST(request: Request) {
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
    return NextResponse.json({ message: "JPG, PNG, WEBP 이미지만 업로드할 수 있습니다." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: "이미지는 5MB 이하만 업로드할 수 있습니다." }, { status: 400 });
  }

  const ext = EXT_MAP[file.type] ?? "jpg";
  const filename = `${randomUUID()}.${ext}`;

  let uploadDir: string;
  try {
    uploadDir = getUploadDir();
  } catch {
    return NextResponse.json({ message: "업로드 디렉터리를 생성할 수 없습니다." }, { status: 500 });
  }

  // path traversal 방지: basename만 사용
  const safeName = basename(filename);
  const filePath = join(uploadDir, safeName);
  const safeResolved = resolve(filePath);
  if (!safeResolved.startsWith(uploadDir)) {
    return NextResponse.json({ message: "잘못된 파일명입니다." }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);
  } catch {
    return NextResponse.json({ message: "이미지 저장에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ imageUrl: `/api/uploads/reviews/${safeName}` }, { status: 201 });
}

function writeFile(path: string, data: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = createWriteStream(path);
    const readable = Readable.from(data);
    readable.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}
