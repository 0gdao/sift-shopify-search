import { describe, expect, it } from "vitest";

import { normalizeProduct, normalizeProductResponse, normalizeSearchResponse } from "./normalize";

const upstreamProduct = {
  id: "gid://shopify/Product/123",
  title: "Trail <Runner>",
  description: { html: "<p>Fast &amp; <strong>light</strong>.</p>" },
  url: "https://merchant.example/products/trail-runner",
  price_range: {
    min: { amount: 8_999, currency: "USD" },
    max: { amount: 12_999, currency: "USD" },
  },
  media: [
    {
      type: "image",
      url: "https://cdn.shopify.com/trail.jpg",
      alt_text: "Trail shoe",
    },
  ],
  options: [{ name: "Size", values: [{ label: "9" }, { label: "10" }] }],
  variants: [
    {
      id: "gid://shopify/ProductVariant/456",
      title: "Black / 10",
      price: { amount: 8_999, currency: "USD" },
      checkout_url: "https://merchant.example/cart/456:1",
      availability: { available: true, status: "in_stock" },
      options: [{ name: "Size", label: "10" }],
      seller: {
        id: "gid://shopify/Shop/789",
        name: "Trail Shop",
        url: "https://merchant.example",
      },
    },
  ],
  rating: { value: 4.7, scale_max: 5, count: 100 },
};

describe("catalog normalization", () => {
  it("strips upstream HTML and keeps stable product fields", () => {
    const product = normalizeProduct(upstreamProduct);
    expect(product).toMatchObject({
      id: "gid://shopify/Product/123",
      title: "Trail <Runner>",
      description: "Fast & light.",
      sellerCount: 1,
      options: [{ name: "Size", values: ["9", "10"] }],
    });
    expect(product?.offers[0]?.seller?.name).toBe("Trail Shop");
  });

  it("drops unsafe external URLs", () => {
    const product = normalizeProduct({
      ...upstreamProduct,
      url: "javascript:alert(1)",
      variants: [
        {
          ...upstreamProduct.variants[0],
          checkout_url: "http://merchant.example/cart",
        },
      ],
    });
    expect(product?.url).toBeUndefined();
    expect(product?.offers[0]?.checkoutUrl).toBeUndefined();
  });

  it("tolerates malformed products without failing the whole page", () => {
    const response = normalizeSearchResponse(
      {
        products: [{ title: "Missing ID" }, upstreamProduct],
        pagination: { has_next_page: true, cursor: "next", total_count: 80 },
        messages: [{ message: "Unsupported attribute ignored" }],
      },
      "live",
      "request-1",
    );
    expect(response.products).toHaveLength(1);
    expect(response.pagination).toEqual({
      cursor: "next",
      hasNextPage: true,
      estimatedTotal: 80,
    });
    expect(response.messages).toEqual(["Unsupported attribute ignored"]);
  });

  it("rejects a malformed product detail envelope", () => {
    expect(normalizeProductResponse({ product: {} }, "live", "request-2")).toBeUndefined();
  });
});
