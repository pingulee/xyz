import { NextResponse } from "next/server";
import {
  clearSessionCookieHeader,
  deleteSession,
  getSessionTokenFromRequest,
} from "@/lib/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getReturnPath(referer: string, host: string) {
  if (!referer) return "/";

  try {
    const url = new URL(referer);
    const path = `${url.pathname}${url.search}${url.hash}`;

    if (
      url.host !== host ||
      path.startsWith("/admin") ||
      path.startsWith("/admax")
    ) {
      return "/";
    }

    return path;
  } catch {
    return "/";
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = getSessionTokenFromRequest(request);
  const returnPath = getReturnPath(
    request.headers.get("referer") ?? "",
    requestUrl.host,
  );

  if (token) {
    deleteSession(token);
  }

  const response = NextResponse.redirect(new URL(returnPath, requestUrl.origin));
  response.headers.append("Set-Cookie", clearSessionCookieHeader());
  return response;
}
