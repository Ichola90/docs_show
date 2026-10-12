"use client";

import { useEffect, useState } from "react";
import type { Book } from "@/data/books";
import { useBookRating } from "@/components/books/book-ratings-provider";

function getRatingStorageKey(bookId: string) {
  return `atelier:rating:${bookId}:v1`;
}

function getClientIdStorageKey() {
  return "atelier:rating-client:v1";
}

export function BookRating({ book }: { book: Book }) {
  const { rating, count, submitRating } = useBookRating(
    book.id,
    book.rating,
    book.reviewCount,
  );
  const [selectedRating, setSelectedRating] = useState(0);
  const [submittedRating, setSubmittedRating] = useState<number | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      try {
        const storedRating = localStorage.getItem(getRatingStorageKey(book.id));
        if (storedRating !== null) {
          const parsedRating = Number(storedRating);
          if (Number.isInteger(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
            setSubmittedRating(parsedRating);
            setSelectedRating(parsedRating);
          }
        }

        let storedClientId = localStorage.getItem(getClientIdStorageKey());
        if (!storedClientId) {
          storedClientId = window.crypto.randomUUID();
          localStorage.setItem(getClientIdStorageKey(), storedClientId);
        }
        setClientId(storedClientId);
      } catch {
        setError("Le stockage local est indisponible. Activez-le pour envoyer une note.");
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [book.id]);

  const handleSubmit = async () => {
    if (!clientId || !submitRating || selectedRating < 1 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await submitRating(book.id, selectedRating, clientId);
      setSubmittedRating(selectedRating);
      try {
        localStorage.setItem(getRatingStorageKey(book.id), String(selectedRating));
      } catch {
        setError("Votre note est enregistrée, mais ce navigateur ne peut pas mémoriser votre vote.");
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Votre note n’a pas pu être enregistrée.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="book-rating" aria-labelledby={`${book.id}-rating-title`}>
      <div className="book-rating-copy">
        <span className="eyebrow">LECTURE TERMINÉE</span>
        <h3 id={`${book.id}-rating-title`}>Votre avis compte.</h3>
        <p>
          {count > 0 && rating
            ? `Note moyenne : ${rating} / 5 · ${count} avis`
            : "Soyez le premier à noter ce livre."}
        </p>
      </div>
      {submittedRating !== null ? (
        <p className="book-rating-thanks" role="status">
          Merci pour votre note de {submittedRating} / 5.
        </p>
      ) : (
        <div className="book-rating-form">
          <div className="book-rating-stars" role="group" aria-label="Votre note sur 5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                aria-pressed={selectedRating === value}
                className={value <= selectedRating ? "is-selected" : ""}
                disabled={isSubmitting}
                key={value}
                onClick={() => setSelectedRating(value)}
                type="button"
              >
                ★
              </button>
            ))}
          </div>
          <button
            className="book-rating-submit"
            disabled={!clientId || selectedRating < 1 || isSubmitting}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? "Enregistrement…" : "Envoyer ma note"}
          </button>
        </div>
      )}
      {error && <p className="book-rating-error" role="alert">{error}</p>}
    </section>
  );
}
