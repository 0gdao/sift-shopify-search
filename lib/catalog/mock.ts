import { currencyExponent } from "./currency";
import type {
  CatalogProduct,
  Money,
  ProductInput,
  ProductResponse,
  SearchInput,
  SearchResponse,
} from "./types";

type MockSeed = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  basePrice: number;
  maxPrice?: number;
  rating: number;
  reviews: number;
  options: Array<{ name: string; values: string[] }>;
  sellers: string[];
  condition?: "new" | "secondhand";
};

const seeds: MockSeed[] = [
  {
    id: "gid://shopify/Product/demo-trail-shoe",
    title: "Cloudline Trail Runner",
    description: "A lightweight, grippy trail shoe built for mixed terrain and long weekends.",
    category: "Running shoes",
    tags: ["shoe", "running", "trail", "outdoor", "sneaker"],
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=82",
    basePrice: 118,
    maxPrice: 129,
    rating: 4.8,
    reviews: 214,
    options: [
      { name: "Color", values: ["Persimmon", "Slate"] },
      { name: "Size", values: ["8", "9", "10", "11"] },
    ],
    sellers: ["North Ridge Supply", "Runstead"],
  },
  {
    id: "gid://shopify/Product/demo-linen-shirt",
    title: "Washed Linen Camp Shirt",
    description: "Relaxed European linen with a soft garment wash and coconut shell buttons.",
    category: "Shirts",
    tags: ["shirt", "linen", "mens", "summer", "clothing"],
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=82",
    basePrice: 72,
    rating: 4.6,
    reviews: 89,
    options: [
      { name: "Color", values: ["Bone", "Tobacco", "Ink"] },
      { name: "Size", values: ["S", "M", "L", "XL"] },
    ],
    sellers: ["Common Thread"],
  },
  {
    id: "gid://shopify/Product/demo-headphones",
    title: "Studio Arc Headphones",
    description: "Warm, detailed over-ear headphones with 42-hour battery life and soft-touch controls.",
    category: "Headphones",
    tags: ["headphones", "wireless", "audio", "music", "bluetooth"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=82",
    basePrice: 94,
    maxPrice: 109,
    rating: 4.7,
    reviews: 361,
    options: [{ name: "Color", values: ["Graphite", "Cream"] }],
    sellers: ["Modular Audio", "Good Listening Co."],
  },
  {
    id: "gid://shopify/Product/demo-tote",
    title: "Market Day Canvas Tote",
    description: "Heavyweight recycled canvas, reinforced handles, and six pockets for everyday carry.",
    category: "Bags",
    tags: ["bag", "tote", "canvas", "recycled", "accessory"],
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=82",
    basePrice: 46,
    rating: 4.9,
    reviews: 128,
    options: [{ name: "Color", values: ["Natural", "Olive", "Black"] }],
    sellers: ["Fieldwork Goods"],
  },
  {
    id: "gid://shopify/Product/demo-watch",
    title: "Morrow Field Watch",
    description: "A compact, water-resistant field watch with sapphire crystal and a woven strap.",
    category: "Watches",
    tags: ["watch", "field", "accessory", "gift", "mens"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=82",
    basePrice: 164,
    maxPrice: 182,
    rating: 4.5,
    reviews: 76,
    options: [{ name: "Strap", values: ["Olive", "Navy", "Leather"] }],
    sellers: ["Morrow Workshop", "Proper Time"],
  },
  {
    id: "gid://shopify/Product/demo-planter",
    title: "Pebble Self-Watering Planter",
    description: "A sculptural ceramic planter with a hidden reservoir for calmer plant care.",
    category: "Planters",
    tags: ["planter", "home", "ceramic", "plant", "garden"],
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=82",
    basePrice: 38,
    maxPrice: 54,
    rating: 4.8,
    reviews: 147,
    options: [
      { name: "Color", values: ["Chalk", "Moss", "Clay"] },
      { name: "Size", values: ["Small", "Large"] },
    ],
    sellers: ["Still Life Studio"],
  },
  {
    id: "gid://shopify/Product/demo-jacket",
    title: "Reproofed Chore Jacket",
    description: "A broken-in cotton twill chore coat, professionally reproofed for a second life.",
    category: "Jackets",
    tags: ["jacket", "chore coat", "secondhand", "clothing", "workwear"],
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=82",
    basePrice: 84,
    rating: 4.4,
    reviews: 32,
    options: [{ name: "Size", values: ["M", "L"] }],
    sellers: ["Again & Again"],
    condition: "secondhand",
  },
  {
    id: "gid://shopify/Product/demo-skin-set",
    title: "Mineral Morning Skin Set",
    description: "A fragrance-free cleanser, mineral serum, and daily barrier cream for sensitive skin.",
    category: "Skin care",
    tags: ["skin", "beauty", "serum", "cleanser", "gift"],
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=82",
    basePrice: 68,
    rating: 4.7,
    reviews: 203,
    options: [{ name: "Routine", values: ["Essential", "Complete"] }],
    sellers: ["Good Mineral"],
  },
];

function money(major: number, currency: string): Money {
  return {
    amount: Math.round(major * 10 ** currencyExponent(currency)),
    currency,
  };
}

function buildProduct(seed: MockSeed, currency: string): CatalogProduct {
  const offers = seed.sellers.map((seller, index) => ({
    id: `gid://shopify/ProductVariant/${seed.id.split("/").pop()}-${index + 1}`,
    title: index ? "Alternate merchant offer" : "Featured offer",
    price: money(seed.basePrice + index * 7, currency),
    checkoutUrl: `https://example.com/?demo-offer=${encodeURIComponent(seed.id)}-${index + 1}`,
    available: true,
    status: index === 1 ? "running_low" : "in_stock",
    condition: [seed.condition ?? "new"],
    options: seed.options.map((option) => ({
      name: option.name,
      label: option.values[0]!,
    })),
    seller: {
      id: `gid://shopify/Shop/demo-${index + 1}-${seed.id.split("/").pop()}`,
      name: seller,
      domain: "example.com",
      url: "https://example.com/",
    },
  }));

  return {
    id: seed.id,
    title: seed.title,
    description: seed.description,
    image: { url: seed.image, alt: seed.title },
    price: {
      min: money(seed.basePrice, currency),
      max: money(seed.maxPrice ?? seed.basePrice, currency),
    },
    rating: { value: seed.rating, count: seed.reviews, scaleMax: 5 },
    options: seed.options,
    offers,
    sellerCount: seed.sellers.length,
    categories: [seed.category],
  };
}

export function searchMockCatalog(
  input: SearchInput,
  requestId: string,
): SearchResponse {
  const currency = input.context.currency ?? "USD";
  const terms = input.query.toLowerCase().split(/\s+/).filter(Boolean);
  const start = input.cursor ? Number.parseInt(input.cursor, 10) || 0 : 0;
  const matches = seeds.filter((seed) => {
    const haystack = [
      seed.title,
      seed.description,
      seed.category,
      ...seed.tags,
    ]
      .join(" ")
      .toLowerCase();
    const queryMatches = terms.every((term) => haystack.includes(term));
    const conditionMatches =
      !input.filters.condition ||
      (seed.condition ?? "new") === input.filters.condition;
    const minMatches =
      input.filters.priceMin === undefined ||
      (seed.maxPrice ?? seed.basePrice) >= input.filters.priceMin;
    const maxMatches =
      input.filters.priceMax === undefined || seed.basePrice <= input.filters.priceMax;
    const ratingMatches =
      input.filters.ratingMin === undefined || seed.rating >= input.filters.ratingMin;
    return queryMatches && conditionMatches && minMatches && maxMatches && ratingMatches;
  });
  const page = matches.slice(start, start + input.limit);
  const next = start + page.length;

  return {
    mode: "mock",
    products: page.map((seed) => buildProduct(seed, currency)),
    pagination: {
      cursor: next < matches.length ? String(next) : undefined,
      hasNextPage: next < matches.length,
      estimatedTotal: matches.length,
    },
    messages: ["Demo catalog — set CATALOG_MODE=live for live global results."],
    requestId,
  };
}

export function getMockProduct(
  input: ProductInput,
  currency: string,
  requestId: string,
): ProductResponse | undefined {
  const seed = seeds.find((item) => item.id === input.id);
  if (!seed) return undefined;
  const product = buildProduct(seed, currency);
  const selected = new Map(input.selected.map((item) => [item.name, item.label]));

  product.offers = product.offers.map((offer) => ({
    ...offer,
    options: product.options.map((option) => ({
      name: option.name,
      label: selected.get(option.name) ?? option.values[0]!,
    })),
  }));

  return {
    mode: "mock",
    product,
    messages: ["Demo offer links open example.com."],
    requestId,
  };
}
