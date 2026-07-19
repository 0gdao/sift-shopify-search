import { SearchExperience } from "@/components/search-experience";

export default function HomePage() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sift-shopify-search.vercel.app";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Sift",
    url: siteUrl,
    description:
      "An open source search and comparison interface for Shopify Global Catalog MCP.",
    applicationCategory: "ShoppingApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      name: "ECORN",
      url: "https://ecorn.agency/",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SearchExperience />
    </>
  );
}
