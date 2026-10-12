import type { Metadata } from "next";

export const SITE_URL = "https://docs-show.onrender.com";
const SOCIAL_IMAGE = "/opengraph-image";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const brandedTitle = `DOCS SHOW || ${title}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: "DOCS SHOW",
      title: brandedTitle,
      description,
      url,
      images: [
        {
          url: SOCIAL_IMAGE,
          width: 1200,
          height: 630,
          alt: "DOCS SHOW — La bibliothèque des livres tech",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}
