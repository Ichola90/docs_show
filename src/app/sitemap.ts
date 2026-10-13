import type { MetadataRoute } from "next";
import { books } from "@/data/books";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/bibliotheque/`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/publier/`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...["concevez-site-web-php-mysql", "apprenez-programmer-c"].map((id) => ({
      url: `${SITE_URL}/livres/${id}/`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
