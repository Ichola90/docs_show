import type { Metadata } from "next";
import { BookRatingsProvider } from "@/components/books/book-ratings-provider";
import "./globals.css";
import "./library.css";

export const metadata: Metadata = {
  title: "Atelier — La bibliothèque des livres tech",
  description:
    "Lisez des livres tech en ligne, progressez chapitre par chapitre et testez vos connaissances à votre rythme.",
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
