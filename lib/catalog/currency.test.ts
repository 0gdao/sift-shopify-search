import { describe, expect, it } from "vitest";

import { currencyExponent, formatMoney, toMinorUnits } from "./currency";

describe("currency helpers", () => {
  it("handles two-decimal currencies", () => {
    expect(currencyExponent("USD")).toBe(2);
    expect(toMinorUnits(49.95, "USD")).toBe(4_995);
    expect(formatMoney(4_995, "USD", "en-US")).toBe("$49.95");
  });

  it("handles zero-decimal currencies", () => {
    expect(currencyExponent("JPY")).toBe(0);
    expect(toMinorUnits(4_995, "JPY")).toBe(4_995);
  });

  it("falls back safely for an unknown currency", () => {
    expect(currencyExponent("INVALID")).toBe(2);
  });
});
