import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import customBooks from "@/data/custom-books.json";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const officialBookIds = [
    "concevez-site-web-php-mysql",
    "apprenez-programmer-c",
  ];

  const customBookIds = Array.isArray(customBooks)
    ? customBooks.map((b: { id: string }) => b.id).filter(Boolean)
    : [];

  const allBookIds = Array.from(new Set([...officialBookIds, ...customBookIds]));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/bibliotheque/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/publier/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/assistant/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...allBookIds.map((id) => ({
      url: `${SITE_URL}/livres/${id}/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
