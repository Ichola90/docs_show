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
    ...books.map((book) => ({
      url: `${SITE_URL}/livres/${book.id}/`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
