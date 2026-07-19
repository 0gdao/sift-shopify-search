"use client";

import { useState } from "react";

import { formatMoney } from "@/lib/catalog/currency";
import type { CatalogMode, CatalogProduct } from "@/lib/catalog/types";

import { ArrowIcon, CheckIcon, PlusIcon, StarIcon } from "./icons";

type ProductCardProps = {
  product: CatalogProduct;
  mode: CatalogMode;
  shortlisted: boolean;
  onView: (product: CatalogProduct) => void;
  onToggleShortlist: (product: CatalogProduct) => void;
};

function priceLabel(product: CatalogProduct): string {
  const minimum = product.price.min;
  const maximum = product.price.max;
  if (!minimum) return "Price at merchant";
  if (!maximum || maximum.amount === minimum.amount) {
    return formatMoney(minimum.amount, minimum.currency);
  }
  return `From ${formatMoney(minimum.amount, minimum.currency)}`;
}

export function ProductCard({
  product,
  mode,
  shortlisted,
  onView,
  onToggleShortlist,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const category = product.categories[0] ?? "Shopify find";
  const initials = product.title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <article className="product-card">
      <button
        className="product-visual"
        type="button"
        onClick={() => onView(product)}
        aria-label={`View ${product.title}`}
      >
        {product.image && !imageFailed ? (
          <img
            src={product.image.url}
            alt={product.image.alt}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="product-fallback" aria-hidden="true">
            {initials}
          </span>
        )}
        <span className="product-category">{category}</span>
        {mode === "mock" ? <span className="demo-image-tag">Demo</span> : null}
      </button>
      <div className="product-card-body">
        <div className="product-card-heading">
          <div>
            <h3>{product.title}</h3>
            <p className="product-price">{priceLabel(product)}</p>
          </div>
          {product.rating ? (
            <span className="rating" aria-label={`${product.rating.value} out of 5 stars`}>
              <StarIcon />
              {product.rating.value.toFixed(1)}
            </span>
          ) : null}
        </div>
        <p className="product-description">{product.description ?? "Details available from the merchant."}</p>
        <div className="product-meta">
          <span>{product.sellerCount || 1} {product.sellerCount === 1 ? "shop" : "shops"}</span>
          <span>{product.options.length ? `${product.options.length} options` : "Ready to buy"}</span>
        </div>
        <div className="product-actions">
          <button className="text-button" type="button" onClick={() => onView(product)}>
            See offers <ArrowIcon />
          </button>
          <button
            className={`compare-button${shortlisted ? " is-selected" : ""}`}
            type="button"
            onClick={() => onToggleShortlist(product)}
            aria-pressed={shortlisted}
          >
            {shortlisted ? <CheckIcon /> : <PlusIcon />}
            {shortlisted ? "Saved" : "Compare"}
          </button>
        </div>
      </div>
    </article>
  );
}
