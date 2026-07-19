import { CatalogError, type CatalogMode } from "./types";

const DEFAULT_CATALOG_URL = "https://catalog.shopify.com/api/ucp/mcp";
const DEFAULT_PROFILE_URL =
  "https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json";

export type CatalogConfig = {
  mode: CatalogMode;
  catalogUrl: string;
  profileUrl: string;
  savedCatalogSlug?: string;
};

function validateCatalogUrl(value: string): string {
  try {
    const url = new URL(value);
    const isShopifyHost =
      url.hostname === "shopify.com" || url.hostname.endsWith(".shopify.com");
    if (url.protocol !== "https:" || !isShopifyHost) throw new Error();
    return url.toString();
  } catch {
    throw new CatalogError(
      "SHOPIFY_CATALOG_URL must be an HTTPS Shopify endpoint",
      "CONFIGURATION_ERROR",
      503,
    );
  }
}

function validateProfileUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error();
    return url.toString();
  } catch {
    throw new CatalogError(
      "SHOPIFY_AGENT_PROFILE_URL must be an HTTPS URL",
      "CONFIGURATION_ERROR",
      503,
    );
  }
}

export function getCatalogConfig(): CatalogConfig {
  const configuredMode = process.env.CATALOG_MODE ?? "auto";
  if (!["auto", "live", "mock"].includes(configuredMode)) {
    throw new CatalogError(
      "CATALOG_MODE must be auto, live, or mock",
      "CONFIGURATION_ERROR",
      503,
    );
  }

  return {
    mode: configuredMode === "mock" ? "mock" : "live",
    catalogUrl: validateCatalogUrl(
      process.env.SHOPIFY_CATALOG_URL ?? DEFAULT_CATALOG_URL,
    ),
    profileUrl: validateProfileUrl(
      process.env.SHOPIFY_AGENT_PROFILE_URL ?? DEFAULT_PROFILE_URL,
    ),
    savedCatalogSlug: process.env.SHOPIFY_SAVED_CATALOG_SLUG?.trim() || undefined,
  };
}

export { validateCatalogUrl, validateProfileUrl };
