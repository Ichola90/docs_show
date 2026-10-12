"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Book } from "@/data/books";
import { getBookReadingProgress } from "@/data/book-progress";
import { BookCover } from "@/components/books/book-cover";
import { BookQuiz } from "@/components/reader/book-quiz";
import { ActionButton } from "@/components/ui/action-button";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { BrandMark } from "@/components/ui/brand-mark";
import { Reveal } from "@/components/ui/reveal";

export function BookTestExperience({ book }: { book: Book }) {
  const [accessState, setAccessState] = useState<
    "checking" | "available" | "locked" | "error"
  >("checking");
  const [accessError, setAccessError] = useState<string | null>(null);
  const readingHref = `/livres/${book.id}`;

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      try {
        const progress = getBookReadingProgress(book.id, book.chapters.length);
        setAccessState(
          progress.completedThrough === book.chapters.length - 1
            ? "available"
            : "locked",
        );
      } catch (error) {
        setAccessError(
          error instanceof Error
            ? error.message
            : "La progression de lecture n’a pas pu être vérifiée.",
        );
        setAccessState("error");
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [book.id, book.chapters.length]);

  if (accessState === "checking") {
    return (
      <main className="reader-page">
        <div className="reader-loading" aria-label="Vérification de votre lecture" />
      </main>
    );
  }

  if (accessState !== "available") {
    return (
      <main className="reader-page">
        <div className="reader-topbar">
          <Link className="reader-back" href={readingHref}>
            <ArrowIcon direction="left" /> Retour à la lecture
          </Link>
          <Link className="reader-brand" href="/" aria-label="DOCS SHOW, accueil">
            <BrandMark />
            <span className="brand-text-3d">DOCS SHOW</span>
          </Link>
          <span className="reader-topbar-end">TEST VERROUILLÉ</span>
        </div>
        <section className="reading-content quiz-access-message" role="status">
          <span className="eyebrow">LECTURE REQUISE</span>
          <h1>Terminez le livre avant le test.</h1>
          <p>
            Pour valider vos acquis, lisez toutes les sections dans l’ordre
            jusqu’à la dernière page. Votre progression est conservée sur cet
            appareil.
          </p>
          {accessError && <p className="reader-progress-error">{accessError}</p>}
          <ActionButton href={readingHref}>Reprendre la lecture</ActionButton>
        </section>
      </main>
    );
  }

  return (
    <>
      <Reveal>
        <div className="reader-topbar">
          <Link className="reader-back" href="/bibliotheque">
            <ArrowIcon direction="left" /> Retour à la bibliothèque
          </Link>
          <Link className="reader-brand" href="/" aria-label="DOCS SHOW, accueil">
            <BrandMark />
            <span className="brand-text-3d">DOCS SHOW</span>
          </Link>
          <span className="reader-topbar-end">ESPACE DE TEST</span>
        </div>
      </Reveal>
      <div className="reader-layout">
        <aside className="reader-sidebar">
          <Reveal>
            <div className="reader-sidebar-intro">
              <BookCover book={book} compact />
              <p className="eyebrow">{book.category}</p>
              <h1>{book.title}</h1>
              <p className="reader-subtitle">{book.subtitle}</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="reader-test-steps">
              <p className="chapter-list-title">ÉTAPE 02 / 02</p>
              <ol className="chapter-list">
                <li>
                  <span className="reader-step-link">
                    <span>01</span> Lecture des chapitres
                  </span>
                </li>
                <li><span className="reader-current-step"><span>02</span> Testez vos acquis</span></li>
              </ol>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="reader-note">Le test vous aide à faire le point sur les idées retenues.</div>
          </Reveal>
        </aside>
        <section className="reading-content">
            <Reveal>
              <div className="reading-content-top">
                <span>{book.title.toUpperCase()}</span>
                <span>ÉVALUATION</span>
              </div>
            </Reveal>
            <BookQuiz book={book} />
        </section>
      </div>
    </>
  );
}
