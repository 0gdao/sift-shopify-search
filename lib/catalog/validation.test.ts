import { describe, expect, it } from "vitest";

import { parseProductInput, parseSearchInput } from "./validation";

describe("parseSearchInput", () => {
  it("normalizes location and supplies safe defaults", () => {
    expect(
      parseSearchInput({
        query: "  trail shoes  ",
        context: { country: "us", currency: "usd" },
      }),
    ).toEqual({
      query: "trail shoes",
      limit: 12,
      context: { country: "US", currency: "USD" },
      filters: { available: true },
    });
  });

  it("rejects inverted price ranges", () => {
    expect(() =>
      parseSearchInput({
        query: "headphones",
        filters: { available: true, priceMin: 200, priceMax: 100 },
      }),
    ).toThrow("Maximum price");
  });

  it("rejects oversized cursors and page sizes", () => {
    expect(() => parseSearchInput({ query: "watch", limit: 51 })).toThrow();
    expect(() =>
      parseSearchInput({ query: "watch", cursor: "x".repeat(2_001) }),
    ).toThrow();
  });
});

describe("parseProductInput", () => {
  it("accepts Shopify GIDs and selections", () => {
    expect(
      parseProductInput({
        id: "gid://shopify/Product/123",
        selected: [{ name: "Color", label: "Black" }],
      }),
    ).toEqual({
      id: "gid://shopify/Product/123",
      selected: [{ name: "Color", label: "Black" }],
    });
  });

  it("rejects arbitrary identifiers", () => {
    expect(() => parseProductInput({ id: "https://attacker.test/product" })).toThrow(
      "Invalid Shopify product ID",
    );
  });
});
