import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sift — Shopify-Wide Product Search",
    short_name: "Sift",
    description:
      "Search and compare products across eligible Shopify merchants.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f0e8",
    theme_color: "#151515",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
