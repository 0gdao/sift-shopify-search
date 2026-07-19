import { ImageResponse } from "next/og";

export const alt = "Sift — search products across Shopify stores";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f0e8",
          color: "#151515",
          padding: "64px 72px",
          border: "18px solid #151515",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-3px" }}>
              SIFT
            </span>
            <span
              style={{
                display: "flex",
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "#ff6238",
              }}
            />
          </div>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              background: "#d8ff3e",
              padding: "14px 22px",
              fontSize: 20,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Live Shopify Catalog
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              maxWidth: 950,
              fontSize: 82,
              lineHeight: 0.98,
              fontWeight: 900,
              letterSpacing: "-5px",
            }}
          >
            Search every Shopify shelf.
          </div>
          <div style={{ display: "flex", fontSize: 28 }}>
            Compare live products, variants, prices, and merchant offers.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          <span>Open source · Shopify Global Catalog MCP</span>
          <span style={{ color: "#ff6238" }}>Built by ECORN</span>
        </div>
      </div>
    ),
    size,
  );
}
