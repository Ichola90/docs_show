import type { Metadata } from "next";
import { BookCatalog } from "@/components/books/book-catalog";
import { PlatformBanner } from "@/components/layout/platform-banner";

export const metadata: Metadata = {
  title: "Bibliothèque — Atelier",
  description: "Explorez les livres tech, filtrez par domaine et choisissez votre prochaine lecture.",
};

export default function LibraryPage() {
  return (
    <main className="site-shell" id="contenu-principal">
      <PlatformBanner />
      <BookCatalog />
    </main>
  );
}
