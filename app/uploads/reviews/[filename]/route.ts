import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "fs";
import { join, resolve, basename } from "path";

export const runtime = "nodejs";

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function getUploadDir(): string {
  return process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads", "reviews");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  const safeName = basename(filename);
  const uploadDir = resolve(getUploadDir());
  const filePath = resolve(join(uploadDir, safeName));

  if (!filePath.startsWith(uploadDir)) {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!existsSync(filePath)) {
    return NextResponse.json({ message: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  const ext = safeName.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = MIME_MAP[ext];
  if (!mimeType) {
    return NextResponse.json({ message: "지원하지 않는 파일 형식입니다." }, { status: 400 });
  }

  const fileBuffer = readFileSync(filePath);

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
