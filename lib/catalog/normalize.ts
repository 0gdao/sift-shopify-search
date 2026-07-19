import type {
  CatalogProduct,
  Money,
  Offer,
  ProductResponse,
  SearchResponse,
} from "./types";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function string(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function number(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function plainText(value: unknown): string | undefined {
  const source = record(value);
  const text = string(source.plain) ?? string(source.html) ?? string(value);
  if (!text) return undefined;

  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .trim();
}

function normalizeMoney(value: unknown): Money | undefined {
  const source = record(value);
  const amount = number(source.amount);
  const currency = string(source.currency);
  if (amount === undefined || !currency) return undefined;
  return { amount, currency };
}

function safeExternalUrl(value: unknown): string | undefined {
  const candidate = string(value);
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function normalizeOffer(value: unknown): Offer | undefined {
  const source = record(value);
  const id = string(source.id);
  if (!id) return undefined;
  const availability = record(source.availability);
  const seller = record(source.seller);
  const sellerName = string(seller.name);

  return {
    id,
    title: string(source.title),
    price: normalizeMoney(source.price),
    checkoutUrl: safeExternalUrl(source.checkout_url),
    available:
      typeof availability.available === "boolean" ? availability.available : true,
    status: string(availability.status),
    condition: array(source.condition).flatMap((item) => string(item) ?? []),
    options: array(source.options).flatMap((item) => {
      const option = record(item);
      const name = string(option.name);
      const label = string(option.label);
      return name && label ? [{ name, label }] : [];
    }),
    seller: sellerName
      ? {
          id: string(seller.id),
          name: sellerName,
          domain: string(seller.domain),
          url: safeExternalUrl(seller.url),
        }
      : undefined,
  };
}

export function normalizeProduct(value: unknown): CatalogProduct | undefined {
  const source = record(value);
  const id = string(source.id);
  const title = string(source.title);
  if (!id || !title) return undefined;

  const priceRange = record(source.price_range);
  const rating = record(source.rating);
  const ratingValue = number(rating.value);
  const firstImage = array(source.media)
    .map(record)
    .find((media) => media.type === "image" && safeExternalUrl(media.url));
  const offers = array(source.variants).flatMap((variant) => {
    const normalized = normalizeOffer(variant);
    return normalized ? [normalized] : [];
  });
  const sellers = new Set(
    offers.map((offer) => offer.seller?.id ?? offer.seller?.name).filter(Boolean),
  );

  return {
    id,
    title,
    description: plainText(source.description),
    url: safeExternalUrl(source.url),
    image: firstImage
      ? {
          url: safeExternalUrl(firstImage.url)!,
          alt: string(firstImage.alt_text) ?? title,
        }
      : undefined,
    price: {
      min: normalizeMoney(priceRange.min),
      max: normalizeMoney(priceRange.max),
    },
    rating:
      ratingValue === undefined
        ? undefined
        : {
            value: ratingValue,
            count: number(rating.count),
            scaleMax: number(rating.scale_max) ?? 5,
          },
    options: array(source.options).flatMap((item) => {
      const option = record(item);
      const name = string(option.name);
      if (!name) return [];
      const values = array(option.values).flatMap((entry) => {
        const label = string(record(entry).label) ?? string(entry);
        return label ? [label] : [];
      });
      return [{ name, values }];
    }),
    offers,
    sellerCount: sellers.size || (offers.length ? 1 : 0),
    categories: array(source.categories).flatMap((item) => {
      const category = record(item);
      return string(category.value) ?? [];
    }),
  };
}

function messages(value: unknown): string[] {
  return array(value).flatMap((item) => {
    if (typeof item === "string") return item;
    const source = record(item);
    return string(source.message) ?? string(source.text) ?? [];
  });
}

export function normalizeSearchResponse(
  value: unknown,
  mode: SearchResponse["mode"],
  requestId: string,
): SearchResponse {
  const source = record(value);
  const pagination = record(source.pagination);

  return {
    mode,
    products: array(source.products).flatMap((item) => {
      const product = normalizeProduct(item);
      return product ? [product] : [];
    }),
    pagination: {
      cursor: string(pagination.cursor),
      hasNextPage: pagination.has_next_page === true,
      estimatedTotal: number(pagination.total_count),
    },
    messages: messages(source.messages),
    requestId,
  };
}

export function normalizeProductResponse(
  value: unknown,
  mode: ProductResponse["mode"],
  requestId: string,
): ProductResponse | undefined {
  const source = record(value);
  const product = normalizeProduct(source.product);
  if (!product) return undefined;

  return {
    mode,
    product,
    messages: messages(source.messages),
    requestId,
  };
}
