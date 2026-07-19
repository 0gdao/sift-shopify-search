"use client";

import { useEffect } from "react";

import { formatMoney } from "@/lib/catalog/currency";
import type { CatalogMode, CatalogProduct } from "@/lib/catalog/types";

import { ArrowIcon, CloseIcon } from "./icons";

type CompareTrayProps = {
  products: CatalogProduct[];
  mode: CatalogMode;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRemove: (id: string) => void;
};

function price(product: CatalogProduct): string {
  const value = product.price.min;
  return value ? formatMoney(value.amount, value.currency) : "At merchant";
}

export function CompareTray({
  products,
  mode,
  open,
  onOpen,
  onClose,
  onRemove,
}: CompareTrayProps) {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, open]);

  if (!products.length) return null;

  return (
    <>
      <div className="compare-tray" aria-label="Comparison shortlist">
        <div className="compare-tray-copy">
          <strong>{products.length}/3</strong>
          <span>Ready to compare</span>
        </div>
        <div className="compare-thumbs">
          {products.map((product) => (
            <div className="compare-thumb" key={product.id}>
              {product.image ? <img src={product.image.url} alt="" /> : <span>{product.title[0]}</span>}
              <button type="button" onClick={() => onRemove(product.id)} aria-label={`Remove ${product.title}`}>
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>
        <button className="compare-now" type="button" onClick={onOpen} disabled={products.length < 2}>
          Compare now <ArrowIcon />
        </button>
      </div>

      {open ? (
        <div className="compare-layer" role="presentation">
          <button className="drawer-backdrop" type="button" onClick={onClose} aria-label="Close comparison" />
          <section className="compare-dialog" role="dialog" aria-modal="true" aria-labelledby="compare-title">
            <div className="compare-dialog-header">
              <div>
                <span className="eyebrow">Side by side</span>
                <h2 id="compare-title">Your sharpest shortlist.</h2>
              </div>
              <button className="icon-button" type="button" onClick={onClose} aria-label="Close" autoFocus>
                <CloseIcon />
              </button>
            </div>
            <div className="comparison-grid" style={{ "--product-count": products.length } as React.CSSProperties}>
              <div className="comparison-label is-top">Product</div>
              {products.map((product) => (
                <div className="comparison-product" key={`head-${product.id}`}>
                  {product.image ? <img src={product.image.url} alt="" /> : null}
                  <h3>{product.title}</h3>
                </div>
              ))}
              <div className="comparison-label">Starting price</div>
              {products.map((product) => <strong key={`price-${product.id}`}>{price(product)}</strong>)}
              <div className="comparison-label">Rating</div>
              {products.map((product) => (
                <span key={`rating-${product.id}`}>
                  {product.rating ? `${product.rating.value.toFixed(1)} / 5` : "No rating"}
                </span>
              ))}
              <div className="comparison-label">Merchant choice</div>
              {products.map((product) => (
                <span key={`seller-${product.id}`}>{product.sellerCount || 1} shops</span>
              ))}
              <div className="comparison-label">Options</div>
              {products.map((product) => (
                <span key={`option-${product.id}`}>
                  {product.options.map((option) => option.name).join(", ") || "Standard"}
                </span>
              ))}
              <div className="comparison-label">Best offer</div>
              {products.map((product) => {
                const offer = product.offers.find((item) => item.checkoutUrl && item.available);
                return offer?.checkoutUrl ? (
                  <a
                    key={`offer-${product.id}`}
                    href={offer.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {mode === "mock" ? "Open demo" : "Visit shop"} <ArrowIcon />
                  </a>
                ) : (
                  <span key={`offer-${product.id}`}>View details</span>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
