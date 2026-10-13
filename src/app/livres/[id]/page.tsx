import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookReader } from "@/components/reader/book-reader";
import { books, getBookSummaryById } from "@/data/books";
import { getBookById } from "@/data/book-content";
import { createPageMetadata } from "@/lib/seo";

type BookPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = getBookSummaryById(id) ?? (await getBookById(id));

  if (!book) {
    return createPageMetadata({
      title: "Livre introuvable",
      description: "Ce livre n’est pas disponible dans la bibliothèque DOCS SHOW.",
      path: `/livres/${id}/`,
    });
  }

  return createPageMetadata({
    title: book.title,
    description: book.description,
    path: `/livres/${book.id}/`,
  });
}

async function BookPageContent({ params }: BookPageProps) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) notFound();

  return <BookReader book={book} />;
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
