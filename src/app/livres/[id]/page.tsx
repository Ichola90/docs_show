import type { Metadata } from "next";
import { Suspense } from "react";
import { BookReader } from "@/components/reader/book-reader";
import { ClientBookReaderFallback } from "@/components/reader/client-book-reader-fallback";
import { getBookById } from "@/data/book-content";
import { createPageMetadata } from "@/lib/seo";

type BookPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const book = await getBookById(id);

    if (!book) {
      return createPageMetadata({
        title: "Lecture du livre",
        description: "Lisez ce livre en direct sur la plateforme DOCS SHOW.",
        path: `/livres/${id}/`,
      });
    }

    return createPageMetadata({
      title: book.title,
      description: book.description,
      path: `/livres/${book.id}/`,
    });
  } catch {
    return createPageMetadata({
      title: "Lecture du livre",
      description: "Lisez ce livre en direct sur la plateforme DOCS SHOW.",
      path: `/livres/`,
    });
  }
}

async function BookPageContent({ params }: BookPageProps) {
  const { id } = await params;
  try {
    const book = await getBookById(id);

    if (!book) {
      return <ClientBookReaderFallback bookId={id} />;
    }

    return <BookReader book={book} />;
  } catch (error) {
    console.error(`Erreur chargement livre serveur ${id}:`, error);
    return <ClientBookReaderFallback bookId={id} />;
  }
}

export default function BookPage({ params }: BookPageProps) {
  return (
    <main className="reader-page">
      <Suspense fallback={<div className="reader-loading" aria-label="Chargement du livre" />}>
        <BookPageContent params={params} />
      </Suspense>
    </main>
  );
}
