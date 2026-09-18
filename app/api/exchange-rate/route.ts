import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { parseExchangeRate } from "@/lib/exchange-rate";

export const dynamic = "force-dynamic";

// Cache only validated results; a failed refresh must not cache an invalid response.
const getRate = unstable_cache(async () => {
  const response = await fetch(
    process.env.EXCHANGE_RATE_API_URL ?? "https://api.frankfurter.dev/v2/rate/CNY/KRW",
    { cache: "no-store", signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) throw new Error("Exchange rate provider unavailable");
  return parseExchangeRate(await response.json());
}, ["cny-krw-reference-rate-v1"], { revalidate: 3600 });

export async function GET() {
  try {
    const rate = await getRate();
    // Even a last-known cached result must remain within the freshness window.
    parseExchangeRate({ ...rate, base: "CNY", quote: "KRW" });
    return NextResponse.json(rate, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "환율을 불러오지 못했습니다." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
