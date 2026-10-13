import type { Metadata } from "next";
import { BookCatalog } from "@/components/books/book-catalog";
import { PlatformBanner } from "@/components/layout/platform-banner";
import { getAllBooksWithCustom } from "@/data/book-content";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Bibliothèque de livres tech",
  description:
    "Explorez les livres tech de DOCS SHOW, filtrez par domaine et niveau, puis choisissez votre prochaine lecture.",
  path: "/bibliotheque/",
});

export default async function LibraryPage() {
  const books = await getAllBooksWithCustom();

  return (
    <main className="site-shell" id="contenu-principal">
      <PlatformBanner />
      <BookCatalog initialBooks={books} />
    </main>
  );
}
