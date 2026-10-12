"use client";

import { useState } from "react";
import type { Book } from "@/data/books";
import { useBookRating } from "@/components/books/book-ratings-provider";

export function BookRating({ book }: { book: Book }) {
  const { rating, count, userRating, ready, submitRating } = useBookRating(
    book.id,
    book.rating,
    book.reviewCount,
  );
  const [selectedRating, setSelectedRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!ready || !submitRating || selectedRating < 1 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await submitRating(book.id, selectedRating);
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
        <p>Votre note est enregistrée uniquement sur cet appareil.</p>
      </div>
      {userRating !== undefined ? (
        <p className="book-rating-thanks" role="status">
          Merci pour votre note de {userRating} / 5.
        </p>
      ) : (
        <div className="book-rating-form">
          <div className="book-rating-stars" role="group" aria-label="Votre note sur 5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                aria-pressed={selectedRating === value}
                className={value <= selectedRating ? "is-selected" : ""}
                disabled={!ready || isSubmitting}
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
            disabled={!ready || selectedRating < 1 || isSubmitting}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? "Enregistrement…" : "Enregistrer ma note"}
          </button>
        </div>
      )}
      {error && <p className="book-rating-error" role="alert">{error}</p>}
    </section>
  );
}
