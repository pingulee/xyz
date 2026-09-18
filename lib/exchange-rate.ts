export type ExchangeRate = { date: string; rate: number };

/** Reject malformed, future, and outdated data instead of displaying a guessed rate. */
export function parseExchangeRate(value: unknown, now = Date.now()): ExchangeRate {
  if (!value || typeof value !== "object") throw new Error("Invalid exchange rate");
  const { date, base, quote, rate } = value as Record<string, unknown>;
  if (base !== "CNY" || quote !== "KRW" || typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0 || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Invalid exchange rate");
  }
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date || timestamp > now + 86400000 || now - timestamp > 7 * 86400000) {
    throw new Error("Outdated exchange rate");
  }
  return { date, rate };
}

export function approximateWon(cny: number, rate: number): string {
  return `약 ${Math.floor(cny * rate).toLocaleString("ko-KR")}원`;
}
