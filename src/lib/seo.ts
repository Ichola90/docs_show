import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://docsshow.vercel.app";

export const SOCIAL_IMAGE_URL = `${SITE_URL}/opengraph-image.png`;
export const TWITTER_IMAGE_URL = `${SITE_URL}/twitter-image.png`;
export const LOGO_URL = `${SITE_URL}/logo.png`;

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
};

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  authors,
}: PageMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const brandedTitle = `DOCS SHOW || ${title}`;
  const effectiveImageUrl = image || SOCIAL_IMAGE_URL;
  const effectiveImageAlt = imageAlt || `DOCS SHOW — ${title}`;

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
      type,
      locale: "fr_FR",
      siteName: "DOCS SHOW",
      title: brandedTitle,
      description,
      url,
      images: [
        {
          url: effectiveImageUrl,
          secureUrl: effectiveImageUrl,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: effectiveImageAlt,
        },
        {
          url: LOGO_URL,
          secureUrl: LOGO_URL,
          width: 512,
          height: 512,
          type: "image/png",
          alt: "DOCS SHOW — Logo officiel",
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: [effectiveImageUrl],
      creator: "@docsshow",
      site: "@docsshow",
    },
  };
}
