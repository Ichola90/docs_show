import type { Metadata } from "next";
import { BookRatingsProvider } from "@/components/books/book-ratings-provider";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";
import "./library.css";

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
  icons: {
    icon: "/icon.svg",
  },
  description:
    "Découvrez DOCS SHOW : lisez des livres tech en ligne, progressez chapitre par chapitre et testez vos connaissances à votre rythme.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "DOCS SHOW",
    title: "DOCS SHOW || La bibliothèque des livres tech",
    description:
      "Découvrez DOCS SHOW : lisez des livres tech en ligne, progressez chapitre par chapitre et testez vos connaissances à votre rythme.",
    url: `${SITE_URL}/`,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "DOCS SHOW — La bibliothèque des livres tech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DOCS SHOW || La bibliothèque des livres tech",
    description:
      "Lisez des livres tech en ligne, avancez chapitre par chapitre et testez vos connaissances.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <BookRatingsProvider>{children}</BookRatingsProvider>
      </body>
    </html>
  );
}
