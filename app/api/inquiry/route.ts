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
    { message: `디스코드 @${site.discordUsername} 또는 텔레그램 @${site.telegramUsername}으로 문의해 주세요.` },
    { status: 410 },
  );
}
