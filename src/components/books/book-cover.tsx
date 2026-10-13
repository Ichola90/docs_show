import type { CSSProperties } from "react";
import { books, type Book } from "@/data/books";

type BookCoverProps = {
  book: Book;
  compact?: boolean;
};

export function BookCover({ book, compact = false }: BookCoverProps) {
  const index = books.findIndex(({ id }) => id === book.id);
  const bookNumber = index >= 0 ? String(index + 1).padStart(2, "0") : "DOC";

  return (
    <div
      className={`book-cover cover-${book.cover}${compact ? " book-cover-compact" : ""}`}
      style={{ "--cover-accent": book.coverAccent } as CSSProperties}
      role="img"
      aria-label={`Couverture de ${book.title}`}
    >
      <div className="cover-topline">
        <span>DOCS SHOW / LIVRE</span>
        <span>{bookNumber}</span>
      </div>
      <div className="cover-art" aria-hidden="true">
        {book.cover === "code" && <span className="code-glyph">{"{ }"}</span>}
        {book.cover === "data" && (
          <span className="data-glyph">
            <i /><i /><i /><i /><i />
          </span>
        )}
        {book.cover === "product" && <span className="product-glyph">◉</span>}
        {book.cover === "startup" && <span className="startup-glyph">✳</span>}
      </div>
      <div className="cover-copy">
        <span>{book.coverText}</span>
        <strong>{book.title}</strong>
      </div>
    </div>
  );
}
