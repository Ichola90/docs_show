import type { Metadata } from "next";
import { Suspense } from "react";
import { BookTestExperience } from "@/components/reader/book-test-experience";
import { ClientBookTestFallback } from "@/components/reader/client-book-test-fallback";
import { getBookById } from "@/data/book-content";
import { createPageMetadata } from "@/lib/seo";

type BookTestPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({ params }: BookTestPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const book = await getBookById(id);
    const title = book ? `Test — ${book.title}` : "Test de connaissances";
    const description = book
      ? `Testez vos connaissances après la lecture de ${book.title}.`
      : "Testez vos connaissances sur DOCS SHOW.";

    return createPageMetadata({
      title,
      description,
      path: `/livres/${id}/test/`,
      noIndex: true,
    });
  } catch {
    return createPageMetadata({
      title: "Test de connaissances",
      description: "Testez vos connaissances sur DOCS SHOW.",
      path: `/livres/`,
      noIndex: true,
    });
  }
}

async function BookTestPageContent({ params }: BookTestPageProps) {
  const { id } = await params;
  try {
    const book = await getBookById(id);

    if (!book) {
      return <ClientBookTestFallback bookId={id} />;
    }

    return <BookTestExperience book={book} />;
  } catch (error) {
    console.error(`Erreur chargement test livre serveur ${id}:`, error);
    return <ClientBookTestFallback bookId={id} />;
  }
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
