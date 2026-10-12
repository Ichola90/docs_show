import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { BookRatingsProvider } from "@/components/books/book-ratings-provider";
import { SITE_URL, SOCIAL_IMAGE_URL, LOGO_URL } from "@/lib/seo";
import "./globals.css";
import "./library.css";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "DOCS SHOW",
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  title: {
    default: "DOCS SHOW || La bibliothèque des livres tech",
    template: "DOCS SHOW || %s",
  },
  description:
    "Découvrez DOCS SHOW : lisez des livres tech en ligne, progressez chapitre par chapitre et testez vos compétences à votre rythme.",
  keywords: [
    "livres tech",
    "cours informatique",
    "apprendre à programmer",
    "PHP et MySQL",
    "programmation C",
    "clean code",
    "data science",
    "intelligence artificielle",
    "architecture web",
    "tutoriel informatique gratuit",
    "DOCS SHOW",
  ],
  authors: [{ name: "ICHOLA AKIOSSI" }],
  creator: "ICHOLA AKIOSSI",
  publisher: "DOCS SHOW",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "DOCS SHOW",
    title: "DOCS SHOW || La bibliothèque des livres tech",
    description:
      "Lisez des livres tech en ligne, avancez chapitre par chapitre, explorez les codes sources et testez vos connaissances.",
    url: `${SITE_URL}/`,
    images: [
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
    title: "DOCS SHOW || La bibliothèque des livres tech",
    description:
      "Lisez des livres tech en ligne, avancez chapitre par chapitre et validez vos compétences avec des quiz interactifs.",
    images: [SOCIAL_IMAGE_URL],
  },
  robots: {
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": `${SITE_URL}/`,
      "name": "DOCS SHOW",
      "description":
        "La bibliothèque en ligne pour apprendre les technologies, une page à la fois.",
      "inLanguage": "fr-FR",
      "publisher": {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organization`,
      "name": "DOCS SHOW",
      "url": `${SITE_URL}/`,
      "logo": {
        "@type": "ImageObject",
        "url": LOGO_URL,
        "width": 512,
        "height": 512,
      },
      "founder": {
        "@type": "Person",
        "name": "ICHOLA AKIOSSI",
      },
      "description":
        "Bibliothèque de livres tech avec lecture chapitre par chapitre, éditeur de code et tests de validation.",
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <BookRatingsProvider>{children}</BookRatingsProvider>
      </body>
    </html>
  );
}
