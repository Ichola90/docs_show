import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookTestExperience } from "@/components/reader/book-test-experience";
import { books, getBookSummaryById } from "@/data/books";
import { getBookById } from "@/data/book-content";
import { createPageMetadata } from "@/lib/seo";

type BookTestPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export async function generateMetadata({ params }: BookTestPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = getBookSummaryById(id) ?? (await getBookById(id));
  const title = book ? `Test — ${book.title}` : "Test introuvable";
  const description = book
    ? `Testez vos connaissances après la lecture de ${book.title}.`
    : "Ce test n’est pas disponible dans DOCS SHOW.";

  return {
    ...createPageMetadata({
      title,
      description,
      path: `/livres/${id}/test/`,
      noIndex: true,
    }),
  };
}

async function BookTestPageContent({ params }: BookTestPageProps) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) notFound();

  return <BookTestExperience book={book} />;
}

export default function BookTestPage({ params }: BookTestPageProps) {
  return (
    <main className="reader-page">
      <Suspense fallback={<div className="reader-loading" aria-label="Chargement du test" />}>
        <BookTestPageContent params={params} />
      </Suspense>
    </main>
  );
}
