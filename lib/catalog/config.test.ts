import { afterEach, describe, expect, it } from "vitest";

import { getCatalogConfig, validateCatalogUrl, validateProfileUrl } from "./config";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("catalog configuration", () => {
  it("uses live mode by default without credentials", () => {
    process.env.CATALOG_MODE = "auto";
    expect(getCatalogConfig().mode).toBe("live");
  });

  it("supports explicit mock mode", () => {
    process.env.CATALOG_MODE = "mock";
    expect(getCatalogConfig().mode).toBe("mock");
  });

  it("restricts catalog endpoint overrides to Shopify HTTPS hosts", () => {
    expect(validateCatalogUrl("https://catalog.shopify.com/api/ucp/mcp")).toContain(
      "catalog.shopify.com",
    );
    expect(() => validateCatalogUrl("https://attacker.test/catalog")).toThrow();
    expect(() => validateCatalogUrl("http://catalog.shopify.com/catalog")).toThrow();
  });

  it("allows an independently hosted HTTPS agent profile", () => {
    expect(validateProfileUrl("https://agent.example/profile.json")).toBe(
      "https://agent.example/profile.json",
    );
    expect(() => validateProfileUrl("http://agent.example/profile.json")).toThrow();
  });
});
