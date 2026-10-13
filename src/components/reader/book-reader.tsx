"use client";

import { useState } from "react";
import Link from "next/link";
import type { Book } from "@/data/books";
import {
  getBookReadingProgress,
  saveBookReadingProgress,
  type BookReadingProgress,
} from "@/data/book-progress";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { BrandMark } from "@/components/ui/brand-mark";
import { ChapterContent } from "@/components/reader/chapter-content";
import { ReaderSidebar } from "@/components/reader/reader-sidebar";
import { BookReviewsSection } from "@/components/books/book-reviews-section";
import { useEffect } from "react";

type BookReaderProps = {
  book: Book;
};

export function BookReader({ book }: BookReaderProps) {
  const [progress, setProgress] = useState<BookReadingProgress | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const chapterIndex = progress?.currentChapterIndex ?? 0;
  const isReadingComplete =
    progress?.completedThrough === book.chapters.length - 1;

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      try {
        setProgress(getBookReadingProgress(book.id, book.chapters.length));
      } catch (error) {
        setProgressError(
          error instanceof Error
            ? error.message
            : "La progression de lecture n’a pas pu être chargée.",
        );
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [book.id, book.chapters.length]);

  const saveProgress = (nextProgress: BookReadingProgress) => {
    try {
      saveBookReadingProgress(book.id, nextProgress);
      setProgress(nextProgress);
      setProgressError(null);
      return true;
    } catch (error) {
      setProgressError(
        error instanceof Error
          ? error.message
          : "La progression de lecture n’a pas pu être enregistrée.",
      );
      return false;
    }
  };

  const handleChapterSelect = (index: number) => {
    if (!progress || index < 0 || index > progress.completedThrough + 1) return;
    saveProgress({ ...progress, currentChapterIndex: index });
  };

  const handleChapterComplete = (index: number) => {
    if (!progress || index > progress.completedThrough + 1) return;
    const completedThrough = Math.max(progress.completedThrough, index);
    const nextProgress = {
      currentChapterIndex: Math.min(index + 1, book.chapters.length - 1),
      completedThrough,
    };
    saveProgress(nextProgress);
  };

  return (
    <>
      <div className="reader-topbar">
        <Link className="reader-back" href="/bibliotheque">
          <ArrowIcon direction="left" /> Retour à la bibliothèque
        </Link>
        <Link className="reader-brand" href="/" aria-label="DOCS SHOW, accueil">
          <BrandMark />
          <span className="brand-text-3d">DOCS SHOW</span>
        </Link>
        {isReadingComplete && (
          <Link className="reader-topbar-end" href={`/livres/${book.id}/test`}>
            PASSER LE TEST
          </Link>
        )}
      </div>
      {progressError && (
        <p className="reader-progress-error" role="alert">
          {progressError}
        </p>
      )}
      {progressError && !progress ? (
        <section className="reading-content quiz-access-message" role="alert">
          <span className="eyebrow">PROGRESSION INDISPONIBLE</span>
          <h1>Votre lecture ne peut pas être vérifiée.</h1>
          <p>{progressError}</p>
          <p>Vérifiez les données du navigateur avant de reprendre le livre.</p>
        </section>
      ) : !progress ? (
        <div className="reader-loading" aria-label="Chargement de votre progression" />
      ) : (
        <div className="reader-layout">
          <ReaderSidebar
            book={book}
            chapterIndex={chapterIndex}
            completedThrough={progress.completedThrough}
            onChapterSelect={handleChapterSelect}
          />
          <section className="reading-content" aria-live="polite">
            <div className="reading-content-top">
              <span>{book.title.toUpperCase()}</span>
              <span>CHAPITRE {String(chapterIndex + 1).padStart(2, "0")}</span>
            </div>
            <ChapterContent
              book={book}
              chapterIndex={chapterIndex}
              onChapterSelect={handleChapterComplete}
              isReadingComplete={isReadingComplete}
            />
            <BookReviewsSection book={book} />
          </section>
        </div>
      )}
    </>
  );
}
