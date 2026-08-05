import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join, resolve, basename } from "path";

export const runtime = "nodejs";

// booster=기사 업로드 이미지, champion=cron이 받아둔 챔피언 이미지.
const ALLOWED_FOLDERS = new Set(["booster", "champion"]);

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

// 업로드 서빙 루트. 저장(api/upload)과 반드시 같은 값이어야 한다.
// 프로덕션은 UPLOAD_DIR(영속 디렉토리)을 주입한다.
function getUploadBase(): string {
  return process.env.UPLOAD_DIR ?? join(process.cwd(), "upload");
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

  if (filePath !== join(uploadDir, safeFile)) {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  let fileStat;
  try {
    fileStat = await stat(filePath);
  } catch {
    return NextResponse.json({ message: "파일을 찾을 수 없습니다." }, { status: 404 });
  }
  if (!fileStat.isFile() || fileStat.size > 10 * 1024 * 1024) {
    return NextResponse.json({ message: "지원하지 않는 파일입니다." }, { status: 400 });
  }

  const ext = safeFile.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = MIME_MAP[ext];
  if (!mimeType) {
    return NextResponse.json({ message: "지원하지 않는 파일 형식입니다." }, { status: 400 });
  }

  const fileBuffer = await readFile(filePath);

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
