import Link from "next/link";
import type { Book } from "@/data/books";
import { ActionButton } from "@/components/ui/action-button";
import { BookCover } from "@/components/books/book-cover";
import { BookRatingDisplay } from "@/components/books/book-rating-display";

export function BookCard({ book }: { book: Book }) {
  const hasFullReader =
    Boolean(book.hasReader) ||
    [
      "concevez-site-web-php-mysql",
      "apprenez-programmer-c",
    ].includes(book.id);

  return (
    <article className="book-card">
      <div className="book-card-cover-reveal">
        {hasFullReader ? (
          <Link
            className="cover-button"
            href={`/livres/${book.id}`}
            aria-label={`Lire ${book.title}`}
          >
            <BookCover book={book} />
          </Link>
        ) : (
          <div
            className="cover-button is-unavailable"
            aria-label={`${book.title} — Bientôt disponible`}
            style={{ cursor: "default" }}
          >
            <BookCover book={book} />
          </div>
        )}
      </div>
      <div className="book-card-info-reveal">
        <div className="book-card-info">
          <div className="book-card-meta">
            <span>{book.category}</span>
            <BookRatingDisplay
              bookId={book.id}
              initialRating={book.rating}
              initialCount={book.reviewCount}
            />
          </div>
          <div className="book-card-heading">
            <h3>{book.title}</h3>
          </div>
          <div className="book-card-description">
            <p className="book-subtitle">{book.subtitle}</p>
            <p className="book-description">{book.description}</p>
          </div>
          <div className="book-card-footer">
            <span>{book.level}</span>
            <span>{book.pages} · {book.duration}</span>
          </div>
          {hasFullReader ? (
            <ActionButton
              className="book-card-cta text-link"
              href={`/livres/${book.id}`}
              variant="secondary"
              size="small"
              aria-label={`Découvrir le livre ${book.title}`}
            >
              Découvrir le livre
            </ActionButton>
          ) : (
            <ActionButton
              className="book-card-cta is-upcoming text-link"
              variant="secondary"
              size="small"
              disabled
              title="Ce livre sera bientôt disponible dans la bibliothèque"
              aria-label={`${book.title} — Bientôt disponible`}
            >
              Bientôt disponible
            </ActionButton>
          )}
        </div>
      </div>
    </article>
  );
}
