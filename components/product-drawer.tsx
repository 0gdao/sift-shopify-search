"use client";

import { useCallback, useEffect, useState } from "react";

import { formatMoney } from "@/lib/catalog/currency";
import type {
  CatalogMode,
  CatalogProduct,
  ProductResponse,
} from "@/lib/catalog/types";

import { ArrowIcon, CloseIcon, StarIcon } from "./icons";

type ProductDrawerProps = {
  product: CatalogProduct;
  mode: CatalogMode;
  currency: string;
  onClose: () => void;
};

function firstSelections(product: CatalogProduct): Record<string, string> {
  return Object.fromEntries(
    product.options.flatMap((option) =>
      option.values[0] ? [[option.name, option.values[0]]] : [],
    ),
  );
}

export function ProductDrawer({ product, mode, currency, onClose }: ProductDrawerProps) {
  const [detail, setDetail] = useState(product);
  const [selected, setSelected] = useState<Record<string, string>>(() => firstSelections(product));
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string>();

  const loadDetail = useCallback(
    async (selections: Record<string, string>) => {
      setStatus("loading");
      setError(undefined);
      try {
        const response = await fetch("/api/catalog/product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-sift-currency": currency,
          },
          body: JSON.stringify({
            id: product.id,
            selected: Object.entries(selections).map(([name, label]) => ({ name, label })),
          }),
        });
        const body = (await response.json()) as ProductResponse & {
          error?: { message?: string };
        };
        if (!response.ok) throw new Error(body.error?.message ?? "Could not load offers");
        setDetail(body.product);
        setStatus("ready");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load offers");
        setStatus("error");
      }
    },
    [currency, product.id],
  );

  useEffect(() => {
    void loadDetail(selected);
  }, [loadDetail]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  function chooseOption(name: string, label: string) {
    const next = { ...selected, [name]: label };
    setSelected(next);
    void loadDetail(next);
  }

  const sortedOffers = [...detail.offers].sort(
    (first, second) => (first.price?.amount ?? Infinity) - (second.price?.amount ?? Infinity),
  );

  return (
    <div className="drawer-layer" role="presentation">
      <button className="drawer-backdrop" type="button" onClick={onClose} aria-label="Close product details" />
      <aside className="product-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-header">
          <span className="eyebrow">Product offers</span>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close" autoFocus>
            <CloseIcon />
          </button>
        </div>

        <div className="drawer-product">
          {detail.image ? <img src={detail.image.url} alt={detail.image.alt} /> : null}
          <div>
            <h2 id="drawer-title">{detail.title}</h2>
            {detail.rating ? (
              <p className="drawer-rating">
                <StarIcon /> {detail.rating.value.toFixed(1)}
                {detail.rating.count ? ` · ${detail.rating.count} reviews` : ""}
              </p>
            ) : null}
          </div>
        </div>

        {detail.description ? <p className="drawer-description">{detail.description}</p> : null}

        {detail.options.length ? (
          <div className="option-stack">
            {detail.options.map((option) => (
              <fieldset key={option.name}>
                <legend>{option.name}</legend>
                <div className="option-list">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={selected[option.name] === value ? "is-selected" : ""}
                      onClick={() => chooseOption(option.name, value)}
                      aria-pressed={selected[option.name] === value}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        ) : null}

        <div className="offer-heading">
          <div>
            <span className="eyebrow">Available now</span>
            <h3>{sortedOffers.length || detail.sellerCount} merchant offers</h3>
          </div>
          {status === "loading" ? <span className="loading-dot">Updating</span> : null}
        </div>

        {status === "error" ? (
          <div className="inline-error">
            <p>{error}</p>
            <button type="button" onClick={() => void loadDetail(selected)}>Try again</button>
          </div>
        ) : null}

        <div className="offer-list" aria-live="polite">
          {sortedOffers.map((offer, index) => (
            <article className="offer-row" key={offer.id}>
              <div>
                <span className="offer-rank">{index === 0 ? "Best price" : `Offer ${index + 1}`}</span>
                <h4>{offer.seller?.name ?? "Shopify merchant"}</h4>
                <p>{offer.available ? offer.status?.replaceAll("_", " ") ?? "Available" : "Unavailable"}</p>
              </div>
              <div className="offer-action">
                <strong>
                  {offer.price
                    ? formatMoney(offer.price.amount, offer.price.currency)
                    : "See price"}
                </strong>
                {offer.checkoutUrl && offer.available ? (
                  <a href={offer.checkoutUrl} target="_blank" rel="noopener noreferrer">
                    {mode === "mock" ? "Demo merchant" : "Go to merchant"} <ArrowIcon />
                  </a>
                ) : (
                  <span className="disabled-link">Not available</span>
                )}
              </div>
            </article>
          ))}
        </div>

        {!sortedOffers.length && status !== "loading" ? (
          <div className="drawer-empty">
            <h3>No exact offer for this combination</h3>
            <p>Try another option, or visit the product page for the latest merchant details.</p>
            {detail.url ? (
              <a href={detail.url} target="_blank" rel="noopener noreferrer">View product</a>
            ) : null}
          </div>
        ) : null}

        <p className="merchant-note">
          You’ll finish with the merchant. Prices and availability can change after handoff.
        </p>
      </aside>
    </div>
  );
}
