import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "fs";
import { join, resolve, basename } from "path";

export const runtime = "nodejs";

const ALLOWED_FOLDERS = new Set(["reviews", "notices", "lineups"]);

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function getUploadBase(): string {
  return process.env.UPLOAD_BASE_DIR
    ?? process.env.UPLOAD_DIR?.replace(/\/reviews$/, "")
    ?? join(process.cwd(), "uploads");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ folder: string; filename: string }> },
) {
  const { folder, filename } = await params;

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ message: "잘못된 경로입니다." }, { status: 400 });
  }

  const safeFile = basename(filename);
  const uploadDir = resolve(join(getUploadBase(), folder));
  const filePath = resolve(join(uploadDir, safeFile));

  if (!filePath.startsWith(uploadDir)) {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!existsSync(filePath)) {
    return NextResponse.json({ message: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  const ext = safeFile.split(".").pop()?.toLowerCase() ?? "";
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
