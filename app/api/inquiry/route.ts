import { NextResponse } from "next/server";
import { getInquiryList } from "@/lib/inquiry";
import { site } from "@/lib/site";

export const runtime = "nodejs";

// Preserve existing inquiry records; only new submissions are closed.
export async function GET() {
  const inquiries = await getInquiryList();
  return NextResponse.json({ inquiries });
}

export async function POST() {
  return NextResponse.json(
    { message: `위챗 ID ${site.wechatId}를 친구 추가해 주세요. 위챗이 없다면 ${site.contactEmail}으로 문의를 남겨주세요.` },
    { status: 410 },
  );
}
