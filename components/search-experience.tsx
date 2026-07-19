"use client";

import { FormEvent, useRef, useState } from "react";

import type {
  CatalogMode,
  CatalogProduct,
  SearchResponse,
} from "@/lib/catalog/types";

import { CompareTray } from "./compare-tray";
import { ArrowIcon, SearchIcon, SlidersIcon } from "./icons";
import { ProductCard } from "./product-card";
import { ProductDrawer } from "./product-drawer";

type FilterState = {
  country: string;
  currency: string;
  priceMin: string;
  priceMax: string;
  condition: "any" | "new" | "secondhand";
  rating: "any" | "4" | "4.5";
};

const suggestions = [
  "trail running shoes",
  "wireless headphones",
  "linen shirt",
  "ceramic planter",
];

const initialFilters: FilterState = {
  country: "US",
  currency: "USD",
  priceMin: "",
  priceMax: "",
  condition: "any",
  rating: "any",
};

export function SearchExperience() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [pagination, setPagination] = useState<SearchResponse["pagination"]>();
  const [mode, setMode] = useState<CatalogMode>("mock");
  const [status, setStatus] = useState<"idle" | "loading" | "loadingMore" | "ready" | "error">("idle");
  const [error, setError] = useState<string>();
  const [messages, setMessages] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct>();
  const [shortlist, setShortlist] = useState<CatalogProduct[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const abortRef = useRef<AbortController | undefined>(undefined);

  async function search(
    searchQuery: string,
    cursor?: string,
    append = false,
    activeFilters: FilterState = filters,
  ) {
    const cleanQuery = searchQuery.trim();
    if (cleanQuery.length < 2) {
      setError("Tell us a little more—use at least two characters.");
      setStatus("error");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus(append ? "loadingMore" : "loading");
    setError(undefined);
    if (!append) setActiveQuery(cleanQuery);

    try {
      const response = await fetch("/api/catalog/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          query: cleanQuery,
          cursor,
          limit: 12,
          context: {
            country: activeFilters.country,
            currency: activeFilters.currency,
          },
          filters: {
            available: true,
            ...(activeFilters.priceMin
              ? { priceMin: Number(activeFilters.priceMin) }
              : {}),
            ...(activeFilters.priceMax
              ? { priceMax: Number(activeFilters.priceMax) }
              : {}),
            ...(activeFilters.condition !== "any"
              ? { condition: activeFilters.condition }
              : {}),
            ...(activeFilters.rating !== "any"
              ? { ratingMin: Number(activeFilters.rating) }
              : {}),
          },
        }),
      });
      const body = (await response.json()) as SearchResponse & {
        error?: { message?: string };
      };
      if (!response.ok) throw new Error(body.error?.message ?? "Search is unavailable");
      setProducts((current) => (append ? [...current, ...body.products] : body.products));
      setPagination(body.pagination);
      setMode(body.mode);
      setMessages(body.messages);
      setStatus("ready");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "Search is unavailable");
      setStatus("error");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void search(query);
  }

  function runSuggestion(value: string) {
    setQuery(value);
    void search(value);
  }

  function toggleShortlist(product: CatalogProduct) {
    setShortlist((current) => {
      if (current.some((item) => item.id === product.id)) {
        return current.filter((item) => item.id !== product.id);
      }
      if (current.length >= 3) return [...current.slice(1), product];
      return [...current, product];
    });
  }

  const hasResults = (status === "ready" || status === "loadingMore") && products.length > 0;
  const isSearching = status === "loading";

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Sift home">
          <span>SIFT</span><i aria-hidden="true">✣</i>
        </a>
        <nav aria-label="Product promises">
          <span>Live catalog</span>
          <span>Shop-direct checkout</span>
          <a href="https://shopify.dev/docs/agents/catalog/global-catalog" target="_blank" rel="noopener noreferrer">
            How it works ↗
          </a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker"><span /> Search the independent internet</p>
          <h1>Find the thing.<br /><em>Skip the mall.</em></h1>
          <p className="hero-subtitle">
            One search across eligible Shopify merchants. Real offers, clear choices,
            straight to the shop.
          </p>
        </div>
        <aside className="catalog-note" aria-label="Catalog summary">
          <div className="catalog-orbit" aria-hidden="true"><span>S</span></div>
          <div>
            <span className="eyebrow">Powered by Shopify Catalog</span>
            <strong>Many storefronts.<br />One live shelf.</strong>
          </div>
          <span className="catalog-index">01 / DISCOVER</span>
        </aside>
      </section>

      <section className="search-shell" aria-label="Product search">
        <form onSubmit={submit}>
          <div className="search-main-row">
            <SearchIcon className="search-icon" />
            <label htmlFor="catalog-query" className="sr-only">Search products</label>
            <input
              id="catalog-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What are you hunting for?"
              autoComplete="off"
            />
            <button className="search-submit" type="submit" disabled={isSearching}>
              {isSearching ? "Sifting…" : "Search all shops"}<ArrowIcon />
            </button>
          </div>

          <div className="search-lower-row">
            <button
              className={`filter-toggle${filtersOpen ? " is-open" : ""}`}
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
              aria-expanded={filtersOpen}
            >
              <SlidersIcon /> Filters
            </button>
            <div className="quick-searches">
              <span>Try</span>
              {suggestions.slice(0, 3).map((suggestion) => (
                <button type="button" key={suggestion} onClick={() => runSuggestion(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {filtersOpen ? (
            <div className="filter-panel">
              <label>
                Ships to
                <select
                  value={filters.country}
                  onChange={(event) => setFilters({ ...filters, country: event.target.value })}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="TR">Türkiye</option>
                  <option value="JP">Japan</option>
                </select>
              </label>
              <label>
                Currency
                <select
                  value={filters.currency}
                  onChange={(event) => setFilters({ ...filters, currency: event.target.value })}
                >
                  {[
                    "USD",
                    "CAD",
                    "GBP",
                    "AUD",
                    "EUR",
                    "TRY",
                    "JPY",
                  ].map((currency) => <option key={currency}>{currency}</option>)}
                </select>
              </label>
              <label>
                Min price
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  placeholder="Any"
                  value={filters.priceMin}
                  onChange={(event) => setFilters({ ...filters, priceMin: event.target.value })}
                />
              </label>
              <label>
                Max price
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  placeholder="Any"
                  value={filters.priceMax}
                  onChange={(event) => setFilters({ ...filters, priceMax: event.target.value })}
                />
              </label>
              <label>
                Condition
                <select
                  value={filters.condition}
                  onChange={(event) => setFilters({
                    ...filters,
                    condition: event.target.value as FilterState["condition"],
                  })}
                >
                  <option value="any">Any</option>
                  <option value="new">New</option>
                  <option value="secondhand">Secondhand</option>
                </select>
              </label>
              <label>
                Rating
                <select
                  value={filters.rating}
                  onChange={(event) => setFilters({
                    ...filters,
                    rating: event.target.value as FilterState["rating"],
                  })}
                >
                  <option value="any">Any</option>
                  <option value="4">4.0+</option>
                  <option value="4.5">4.5+</option>
                </select>
              </label>
              <button className="apply-filter" type="button" onClick={() => activeQuery && void search(activeQuery)}>
                Apply filters
              </button>
            </div>
          ) : null}
        </form>
      </section>

      <section className={`results-section${status === "idle" ? " is-idle" : ""}`} aria-live="polite">
        {status === "idle" ? (
          <div className="idle-grid">
            <div className="idle-manifesto">
              <span className="section-number">01</span>
              <h2>The good stuff is scattered.</h2>
              <p>We bring the shelves together—not the shops. You still buy from the people who found, made, or stocked it.</p>
            </div>
            <div className="principle-card is-orange">
              <span>LIVE</span><strong>Current price<br />and availability.</strong>
            </div>
            <div className="principle-card is-green">
              <span>DIRECT</span><strong>No mystery<br />marketplace layer.</strong>
            </div>
            <button className="suggestion-card" type="button" onClick={() => runSuggestion("wireless headphones")}>
              <span>Start with a search</span>
              <strong>Wireless<br />headphones</strong>
              <ArrowIcon />
            </button>
          </div>
        ) : null}

        {isSearching ? (
          <div className="results-loading">
            <div className="loading-heading"><span /><span /></div>
            <div className="skeleton-grid">
              {Array.from({ length: 6 }, (_, index) => <div className="skeleton-card" key={index} />)}
            </div>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="state-card error-state">
            <span className="state-code">ERR / RETRY</span>
            <h2>The shelf went quiet.</h2>
            <p>{error}</p>
            <button type="button" onClick={() => void search(activeQuery || query)}>Try that search again</button>
          </div>
        ) : null}

        {status === "ready" && !products.length ? (
          <div className="state-card empty-state">
            <span className="state-code">0 / MATCHES</span>
            <h2>Too specific. Let’s loosen it.</h2>
            <p>Remove a filter or try a broader product name instead of a brand-and-model search.</p>
            <button type="button" onClick={() => {
              setFilters(initialFilters);
              void search(activeQuery, undefined, false, initialFilters);
            }}>Clear filters and retry</button>
          </div>
        ) : null}

        {hasResults ? (
          <>
            <div className="results-header">
              <div>
                <span className="section-number">02</span>
                <div>
                  <p className="eyebrow">Best matches for</p>
                  <h2>“{activeQuery}”</h2>
                </div>
              </div>
              <div className="result-count">
                <strong>{pagination?.estimatedTotal ?? products.length}</strong>
                <span>estimated matches</span>
              </div>
              <span className={`mode-pill ${mode}`}>{mode === "live" ? "Live Shopify Catalog" : "Demo catalog"}</span>
            </div>
            {messages.length && mode === "mock" ? <p className="catalog-message">{messages[0]}</p> : null}
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  mode={mode}
                  shortlisted={shortlist.some((item) => item.id === product.id)}
                  onView={setSelectedProduct}
                  onToggleShortlist={toggleShortlist}
                />
              ))}
            </div>
            {pagination?.hasNextPage ? (
              <button
                className="load-more"
                type="button"
                disabled={status === "loadingMore"}
                onClick={() => void search(activeQuery, pagination.cursor, true)}
              >
                {status === "loadingMore" ? "Loading the next shelf…" : "Load more finds"}<ArrowIcon />
              </button>
            ) : null}
          </>
        ) : null}
      </section>

      <footer>
        <div className="brand footer-brand"><span>SIFT</span><i>✣</i></div>
        <p>Search broadly. Buy directly.</p>
        <div className="footer-meta">
          <span>Independent shops, one live catalog.</span>
          <a href="https://ecorn.agency/" target="_blank" rel="noopener noreferrer">
            Built by ECORN <ArrowIcon />
          </a>
        </div>
      </footer>

      {selectedProduct ? (
        <ProductDrawer
          product={selectedProduct}
          mode={mode}
          currency={filters.currency}
          onClose={() => setSelectedProduct(undefined)}
        />
      ) : null}

      <CompareTray
        products={shortlist}
        mode={mode}
        open={compareOpen}
        onOpen={() => setCompareOpen(true)}
        onClose={() => setCompareOpen(false)}
        onRemove={(id) => setShortlist((current) => current.filter((item) => item.id !== id))}
      />
    </main>
  );
}
