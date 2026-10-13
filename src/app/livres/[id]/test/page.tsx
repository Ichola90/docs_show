import type { Metadata } from "next";
import { Suspense } from "react";
import { BookTestExperience } from "@/components/reader/book-test-experience";
import { ClientBookTestFallback } from "@/components/reader/client-book-test-fallback";
import { getBookById } from "@/data/book-content";
import { createPageMetadata } from "@/lib/seo";

type BookTestPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return [
    { id: "concevez-site-web-php-mysql" },
    { id: "apprenez-programmer-c" },
  ];
}

export async function generateMetadata({ params }: BookTestPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);
  const title = book ? `Test — ${book.title}` : "Test de connaissances";
  const description = book
    ? `Testez vos connaissances après la lecture de ${book.title}.`
    : "Testez vos connaissances sur DOCS SHOW.";

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

  if (!book) {
    return <ClientBookTestFallback bookId={id} />;
  }

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
