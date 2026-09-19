import type { MetadataRoute } from "next";
import { LEGAL_PAGES, LEGAL_PAGES_READY, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const legal = LEGAL_PAGES_READY
    ? LEGAL_PAGES.map((page) => ({ url: `${SITE_URL}${page.href}`, changeFrequency: "yearly" as const, priority: 0.3 }))
    : [];

  return [{ url: SITE_URL, changeFrequency: "monthly", priority: 1 }, ...legal];
}
