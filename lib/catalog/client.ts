import { getCatalogConfig, type CatalogConfig } from "./config";
import { toMinorUnits } from "./currency";
import { getMockProduct, searchMockCatalog } from "./mock";
import { normalizeProductResponse, normalizeSearchResponse } from "./normalize";
import {
  CatalogError,
  type ProductInput,
  type ProductResponse,
  type SearchInput,
  type SearchResponse,
} from "./types";

type JsonRpcResponse = {
  result?: { structuredContent?: unknown };
  error?: { code?: number; message?: string };
};

async function responseText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 500);
  } catch {
    return "";
  }
}

async function callCatalog(
  config: CatalogConfig,
  name: "search_catalog" | "get_product",
  catalog: Record<string, unknown>,
  requestId: string,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(config.catalogUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        id: requestId,
        params: {
          name,
          arguments: {
            meta: { "ucp-agent": { profile: config.profileUrl } },
            catalog,
          },
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new CatalogError(
        "Shopify Catalog took too long to respond",
        "CATALOG_TIMEOUT",
        504,
        { cause: error },
      );
    }
    throw new CatalogError(
      "Shopify Catalog is unavailable",
      "CATALOG_UNAVAILABLE",
      502,
      { cause: error },
    );
  }

  if (!response.ok) {
    const detail = await responseText(response);
    console.error("Shopify Catalog request failed", response.status, detail);
    throw new CatalogError(
      "Shopify Catalog request failed",
      "CATALOG_UNAVAILABLE",
      response.status === 429 ? 429 : 502,
    );
  }

  const body = (await response.json()) as JsonRpcResponse;
  if (body.error) {
    console.error("Shopify Catalog RPC error", body.error.code, body.error.message);
    throw new CatalogError(
      "Shopify Catalog rejected the request",
      "CATALOG_UNAVAILABLE",
      502,
    );
  }
  if (!body.result || !("structuredContent" in body.result)) {
    throw new CatalogError(
      "Shopify Catalog returned an invalid response",
      "INVALID_UPSTREAM_RESPONSE",
      502,
    );
  }
  return body.result.structuredContent;
}

function searchPayload(input: SearchInput, config: CatalogConfig): Record<string, unknown> {
  const currency = input.context.currency ?? "USD";
  const filters: Record<string, unknown> = { available: input.filters.available };
  const context: Record<string, unknown> = {};

  if (input.context.country) {
    context.address_country = input.context.country;
    filters.ships_to = { country: input.context.country };
  }
  if (input.context.currency) context.currency = input.context.currency;
  if (input.filters.condition) filters.condition = [input.filters.condition];
  if (input.filters.priceMin !== undefined || input.filters.priceMax !== undefined) {
    filters.price = {
      ...(input.filters.priceMin !== undefined
        ? { min: toMinorUnits(input.filters.priceMin, currency) }
        : {}),
      ...(input.filters.priceMax !== undefined
        ? { max: toMinorUnits(input.filters.priceMax, currency) }
        : {}),
    };
  }
  if (input.filters.ratingMin !== undefined) {
    filters.rating = { variant: { min: input.filters.ratingMin } };
  }

  return {
    query: input.query,
    ...(config.savedCatalogSlug
      ? { saved_catalog_slug: config.savedCatalogSlug }
      : {}),
    ...(Object.keys(context).length ? { context } : {}),
    filters,
    pagination: {
      limit: input.limit,
      ...(input.cursor ? { cursor: input.cursor } : {}),
    },
  };
}

export async function searchCatalog(input: SearchInput): Promise<SearchResponse> {
  const requestId = crypto.randomUUID();
  const config = getCatalogConfig();
  if (config.mode === "mock") return searchMockCatalog(input, requestId);

  const content = await callCatalog(
    config,
    "search_catalog",
    searchPayload(input, config),
    requestId,
  );
  return normalizeSearchResponse(content, "live", requestId);
}

export async function getProduct(
  input: ProductInput,
  currency = "USD",
): Promise<ProductResponse | undefined> {
  const requestId = crypto.randomUUID();
  const config = getCatalogConfig();
  if (config.mode === "mock") {
    return getMockProduct(input, currency, requestId);
  }

  const content = await callCatalog(
    config,
    "get_product",
    { id: input.id, ...(input.selected.length ? { selected: input.selected } : {}) },
    requestId,
  );
  return normalizeProductResponse(content, "live", requestId);
}

export { searchPayload };
