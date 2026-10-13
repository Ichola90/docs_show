import { BookCover } from "@/components/books/book-cover";
import { BookRatingDisplay } from "@/components/books/book-rating-display";
import type { Book } from "@/data/books";

type ReaderSidebarProps = {
  book: Book;
  chapterIndex: number;
  completedThrough: number;
  onChapterSelect: (index: number) => void;
};

export function ReaderSidebar({
  book,
  chapterIndex,
  completedThrough,
  onChapterSelect,
}: ReaderSidebarProps) {
  const totalPages = Number.parseInt(book.pages, 10);
  const completedChapter = book.chapters[completedThrough];
  const completedPage = completedChapter?.pages?.at(-1)?.number;
  const progress =
    completedPage && totalPages
      ? Math.round((completedPage / totalPages) * 100)
      : Math.round(((completedThrough + 1) / book.chapters.length) * 100);
  const chapterGroups: {
    title: string;
    chapters: { title: string; index: number }[];
  }[] = [];

  book.chapters.forEach((chapter, index) => {
    const groupTitle = chapter.part ?? "Chapitres";
    let group = chapterGroups[chapterGroups.length - 1];

    if (!group || group.title !== groupTitle) {
      group = { title: groupTitle, chapters: [] };
      chapterGroups.push(group);
    }
    group.chapters.push({ title: chapter.title, index });
  });

  return (
    <aside className="reader-sidebar">
      <div className="reader-sidebar-intro">
        <BookCover book={book} compact />
        <p className="eyebrow">{book.category}</p>
        <h1>{book.title}</h1>
        <p className="reader-subtitle">{book.subtitle}</p>
        <a
          href="#avis-lecteurs"
          className="reader-sidebar-ratings-pill"
          title="Consulter et donner un avis"
        >
          <BookRatingDisplay
            bookId={book.id}
            initialRating={book.rating}
            initialCount={book.reviewCount}
          />
          <span className="reader-sidebar-ratings-cta">· Avis</span>
        </a>
      </div>
      <div className="reader-progress">
        <div className="reader-progress-label">
          <span>VOTRE PROGRESSION</span>
          <span>{Math.max(0, progress)}%</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Progression dans le livre"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
      <p className="chapter-list-title">ÉTAPE 01 / 02 · LECTURE</p>
      {book.chapters.length > 30 ? (
        <select
          className="reader-chapter-select"
          aria-label="Choisir une section du livre"
          value={chapterIndex}
          onChange={(event) => onChapterSelect(Number(event.target.value))}
        >
          {chapterGroups.map((group) => (
            <optgroup key={group.title} label={group.title}>
              {group.chapters.map((chapter) => (
                <option
                  key={chapter.index}
                  value={chapter.index}
                  disabled={chapter.index > completedThrough + 1}
                >
                  {String(chapter.index + 1).padStart(2, "0")} · {chapter.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      ) : (
        <ol className="chapter-list">
          {book.chapters.map((chapter, index) => (
            <li key={`${chapter.title}-${index}`}>
              <button
                className={index === chapterIndex ? "active" : ""}
                type="button"
                disabled={index > completedThrough + 1}
                aria-current={index === chapterIndex ? "step" : undefined}
                onClick={() => onChapterSelect(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {chapter.title}
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="reader-note">
        Lisez les sections dans l’ordre. La suivante se débloque à la fin de chacune.
      </div>
    </aside>
  );
}
