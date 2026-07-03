import { NextResponse } from "next/server";
import { clearSessionCookieHeader } from "@/lib/adminSession";
import { getSafeReturnPath } from "@/lib/returnPath";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const returnPath = getSafeReturnPath(
    request.headers.get("referer") ?? "",
    requestUrl.host,
  );

  const response = NextResponse.redirect(new URL(returnPath, requestUrl.origin));
  response.headers.append("Set-Cookie", clearSessionCookieHeader());
  return response;
}
