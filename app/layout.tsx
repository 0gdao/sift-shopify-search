import type { Metadata } from "next";

import "./globals.css";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sift-shopify-search.vercel.app",
);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Sift — Search Products Across Shopify Stores",
    template: "%s | Sift",
  },
  description:
    "Search and compare live products, prices, variants, and offers across eligible Shopify stores with Shopify Global Catalog MCP.",
  applicationName: "Sift",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Shopify product search",
    "Shopify Global Catalog MCP",
    "cross-store product search",
    "Shopify price comparison",
    "open source product search engine",
    "UCP catalog",
  ],
  authors: [{ name: "ECORN", url: "https://ecorn.agency/" }],
  creator: "ECORN",
  publisher: "ECORN",
  category: "shopping",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Sift",
    title: "Sift — Search Products Across Shopify Stores",
    description:
      "Search live products, prices, variants, and merchant offers across Shopify's Global Catalog.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sift — Shopify-Wide Product Search",
    description:
      "Search and compare live products across eligible Shopify merchants.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
