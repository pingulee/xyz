import assert from "node:assert/strict";
import test from "node:test";
import { approximateWon, parseExchangeRate } from "../lib/exchange-rate.ts";
import { boostingPrices } from "../lib/site.ts";

const now = Date.parse("2026-09-18T10:00:00Z");
const sample = { base: "CNY", quote: "KRW", date: "2026-09-18", rate: 205.9699 };

test("whole-won estimates truncate instead of rounding or rounding to thousands", () => {
  assert.equal(approximateWon(40, sample.rate), "약 8,238원");
  assert.equal(approximateWon(1450, sample.rate), "약 298,656원");
  assert.equal(approximateWon(20, 200), "약 4,000원");
  assert.notEqual(approximateWon(40, 205), approximateWon(40, 206));
});

test("accept latest reference date, including weekends, and reject unusable provider data", () => {
  assert.deepEqual(parseExchangeRate(sample, now), { date: sample.date, rate: sample.rate });
  assert.doesNotThrow(() => parseExchangeRate({ ...sample, date: "2026-09-16" }, now));
  for (const changes of [{ rate: 0 }, { rate: -1 }, { rate: Infinity }, { rate: "205" }, { base: "USD" }, { quote: "CNY" }, { date: "2026-09-01" }, { date: "2026-10-01" }, { date: "2026-02-30" }]) {
    assert.throws(() => parseExchangeRate({ ...sample, ...changes }, now));
  }
  assert.throws(() => parseExchangeRate(null, now));
});

test("all 23 quoted CNY prices retain the requested tier boundaries and amounts", () => {
  assert.deepEqual(boostingPrices.map(g => g.rows.map(r => r.cny)), [
    [40, 70, 100, 130], [20, 25, 30, 35, 50, 70],
    [800, 850, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450],
  ]);
  assert.deepEqual(boostingPrices[0].rows.map(row => row.label), ["다이아 이하", "마스터", "그랜드마스터", "챌린저"]);
  assert.equal(boostingPrices[2].rows[12].label, "마스터 1,200~1,299 LP");
  assert.match(boostingPrices[1].note, /6승 1패 = 순승 5승/);
});
