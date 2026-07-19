import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { searchCatalog, searchPayload } from "./client";
import type { SearchInput } from "./types";

const originalEnv = { ...process.env };

const input: SearchInput = {
  query: "trail shoes",
  limit: 10,
  context: { country: "US", currency: "USD" },
  filters: {
    available: true,
    priceMin: 50,
    priceMax: 150,
    condition: "new",
    ratingMin: 4.5,
  },
};

beforeEach(() => {
  process.env = {
    ...originalEnv,
    CATALOG_MODE: "live",
  };
});

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("searchPayload", () => {
  it("maps app filters to the Shopify UCP contract", () => {
    expect(
      searchPayload(input, {
        mode: "live",
        catalogUrl: "https://catalog.shopify.com/api/ucp/mcp",
        profileUrl: "https://agent.example/profile.json",
        savedCatalogSlug: "independent-goods",
      }),
    ).toEqual({
      query: "trail shoes",
      saved_catalog_slug: "independent-goods",
      context: { address_country: "US", currency: "USD" },
      filters: {
        available: true,
        ships_to: { country: "US" },
        condition: ["new"],
        price: { min: 5_000, max: 15_000 },
        rating: { variant: { min: 4.5 } },
      },
      pagination: { limit: 10 },
    });
  });
});

describe("live catalog client", () => {
  it("sends keyless JSON-RPC requests with an agent profile", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          result: {
            structuredContent: {
              products: [],
              pagination: { has_next_page: false, total_count: 0 },
            },
          },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await searchCatalog(input);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const catalogCall = fetchMock.mock.calls[0];
    expect(catalogCall?.[0]).toBe("https://catalog.shopify.com/api/ucp/mcp");
    expect(new Headers(catalogCall?.[1]?.headers).has("Authorization")).toBe(false);
    const body = JSON.parse(String(catalogCall?.[1]?.body));
    expect(body).toMatchObject({
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "search_catalog",
        arguments: {
          meta: { "ucp-agent": { profile: expect.stringContaining("shopify.dev") } },
          catalog: { query: "trail shoes" },
        },
      },
    });
  });

  it("returns a safe error when the catalog rejects a request", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(new Response("nope", { status: 401 })),
    );
    await expect(searchCatalog(input)).rejects.toMatchObject({
      code: "CATALOG_UNAVAILABLE",
      status: 502,
    });
  });

  it("rejects malformed JSON-RPC responses", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: {} })));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCatalog(input)).rejects.toMatchObject({
      code: "INVALID_UPSTREAM_RESPONSE",
    });
  });
});
