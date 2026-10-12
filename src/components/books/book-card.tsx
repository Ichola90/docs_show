import Link from "next/link";
import type { Book } from "@/data/books";
import { ActionButton } from "@/components/ui/action-button";
import { BookCover } from "@/components/books/book-cover";
import { BookRatingDisplay } from "@/components/books/book-rating-display";
import { Reveal } from "@/components/ui/reveal";

export function BookCard({ book }: { book: Book }) {
  const hasFullReader = [
    "concevez-site-web-php-mysql",
    "apprenez-programmer-c",
  ].includes(book.id);

  return (
    <article className="book-card">
      <Reveal className="book-card-cover-reveal">
        <Link
          className="cover-button"
          href={`/livres/${book.id}`}
          aria-label={`Lire ${book.title}`}
        >
          <BookCover book={book} />
        </Link>
      </Reveal>
      <Reveal className="book-card-info-reveal" delay={70}>
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
              className="text-link"
              href={`/livres/${book.id}`}
              variant="quiet"
              size="small"
            >
              Découvrir le livre
            </ActionButton>
          ) : (
            <ActionButton
              className="text-link"
              variant="quiet"
              size="small"
              disabled
            >
              Bientôt disponible
            </ActionButton>
          )}
        </div>
      </Reveal>
    </article>
  );
}
