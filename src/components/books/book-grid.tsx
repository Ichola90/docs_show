import type { Book } from "@/data/books";
import { BookCard } from "@/components/books/book-card";
import { Reveal } from "@/components/ui/reveal";

export function BookGrid({ books }: { books: Book[] }) {
  return (
    <div className="book-grid">
      {books.map((book, index) => (
        <Reveal
          className="book-card-reveal"
          delay={(index % 4) * 80}
          distance={32}
          key={book.id}
        >
          <BookCard book={book} />
        </Reveal>
      ))}
    </div>
  );
}
