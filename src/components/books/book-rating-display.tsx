"use client";

import { useBookRating } from "@/components/books/book-ratings-provider";

type BookRatingDisplayProps = {
  bookId: string;
  initialRating: string;
  initialCount: number;
};

export function BookRatingDisplay({
  bookId,
  initialRating,
  initialCount,
}: BookRatingDisplayProps) {
  const { rating, count } = useBookRating(
    bookId,
    initialRating,
    initialCount,
  );

  if (count === 0 || rating === "Nouveau") {
    return <span className="book-new-label">{initialRating}</span>;
  }

  return (
    <span
      className="rating"
      aria-label={`Note ${rating} sur 5, ${count} avis`}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16">
        <path d="m8 1.4 1.95 3.95 4.36.63-3.15 3.07.74 4.34L8 11.34l-3.9 2.05.74-4.34-3.15-3.07 4.36-.63L8 1.4Z" />
      </svg>
      <span>{rating}</span>
      <span className="review-count">({count})</span>
    </span>
  );
}
