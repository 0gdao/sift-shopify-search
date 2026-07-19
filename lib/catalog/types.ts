export type CatalogMode = "live" | "mock";

export type Money = {
  amount: number;
  currency: string;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type Seller = {
  id?: string;
  name: string;
  domain?: string;
  url?: string;
};

export type Offer = {
  id: string;
  title?: string;
  price?: Money;
  checkoutUrl?: string;
  available: boolean;
  status?: string;
  condition?: string[];
  options: Array<{ name: string; label: string }>;
  seller?: Seller;
};

export type CatalogProduct = {
  id: string;
  title: string;
  description?: string;
  url?: string;
  image?: { url: string; alt: string };
  price: { min?: Money; max?: Money };
  rating?: { value: number; count?: number; scaleMax: number };
  options: ProductOption[];
  offers: Offer[];
  sellerCount: number;
  categories: string[];
};

export type SearchInput = {
  query: string;
  cursor?: string;
  limit: number;
  context: {
    country?: string;
    currency?: string;
  };
  filters: {
    priceMin?: number;
    priceMax?: number;
    condition?: "new" | "secondhand";
    available: boolean;
    ratingMin?: number;
  };
};

export type SearchResponse = {
  mode: CatalogMode;
  products: CatalogProduct[];
  pagination: {
    cursor?: string;
    hasNextPage: boolean;
    estimatedTotal?: number;
  };
  messages: string[];
  requestId: string;
};

export type ProductResponse = {
  mode: CatalogMode;
  product: CatalogProduct;
  messages: string[];
  requestId: string;
};

export type ProductInput = {
  id: string;
  selected: Array<{ name: string; label: string }>;
};

export type CatalogErrorCode =
  | "CONFIGURATION_ERROR"
  | "AUTHENTICATION_FAILED"
  | "CATALOG_UNAVAILABLE"
  | "CATALOG_TIMEOUT"
  | "INVALID_UPSTREAM_RESPONSE";

export class CatalogError extends Error {
  constructor(
    message: string,
    public readonly code: CatalogErrorCode,
    public readonly status: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "CatalogError";
  }
}
