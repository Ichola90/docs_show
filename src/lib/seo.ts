import type { Metadata } from "next";

export const SITE_URL = "https://docs-show.onrender.com";
export const SOCIAL_IMAGE_URL = `${SITE_URL}/opengraph-image.png`;
export const LOGO_URL = `${SITE_URL}/logo.png`;

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
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: "DOCS SHOW",
      title: brandedTitle,
      description,
      url,
      images: [
        {
          url: LOGO_URL,
          secureUrl: LOGO_URL,
          width: 512,
          height: 512,
          type: "image/png",
          alt: "DOCS SHOW — Logo officiel",
        },
        {
          url: SOCIAL_IMAGE_URL,
          secureUrl: SOCIAL_IMAGE_URL,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: "DOCS SHOW — La bibliothèque des livres tech",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: [SOCIAL_IMAGE_URL],
    },
  };
}
