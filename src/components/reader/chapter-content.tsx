import type { Book } from "@/data/books";
import { ActionButton } from "@/components/ui/action-button";
import { BookRating } from "@/components/reader/book-rating";

type ChapterContentProps = {
  book: Book;
  chapterIndex: number;
  onChapterSelect: (index: number) => void;
  isReadingComplete: boolean;
};

function parseTableOfContents(text: string) {
  const entries: { title: string; page: string }[] = [];
  const entryPattern = /([\s\S]*?)\.{3,}\s*(\d{1,3})(?=\s|$)/g;

  for (const match of text.matchAll(entryPattern)) {
    const title = match[1]
      .replace(/^Sommaire\s+\d+\/\d+\s*/i, "")
      .trim();

    if (title) entries.push({ title, page: match[2] });
  }

  return entries;
}

export function ChapterContent({
  book,
  chapterIndex,
  onChapterSelect,
  isReadingComplete,
}: ChapterContentProps) {
  const chapter = book.chapters[chapterIndex];
  const isLastChapter = chapterIndex === book.chapters.length - 1;
  const isTableOfContents =
    chapterIndex === 0 && chapter.title.toLowerCase().includes("sommaire");

  return (
    <>
      <div className="chapter-heading">
        <span className="eyebrow">
          {chapter.part ?? "LIRE · COMPRENDRE · PROGRESSER"}
        </span>
        <h2>{chapter.title}</h2>
        <div className="chapter-byline">
          <span>{book.author}</span><span>·</span><span>{book.level}</span>
          {chapter.pages && (
            <>
              <span>·</span>
              <span>
                Pages {chapter.pages[0].number}
                {chapter.pages.length > 1
                  ? `–${chapter.pages[chapter.pages.length - 1].number}`
                  : ""}
              </span>
            </>
          )}
        </div>
      </div>
      {chapter.pages ? (
        <div className="chapter-body book-pages">
          {chapter.pages.map((page) => (
            <article className="book-reading-page" key={page.number}>
              <div className="book-reading-page-heading">
                <span>LECTURE</span>
                <span>
                  PAGE {page.number} / {Number.parseInt(book.pages, 10)}
                </span>
              </div>
              {page.blocks.length === 0 ? (
                <p className="book-page-unavailable">
                  Cette page ne contient pas de texte extractible.
                </p>
              ) : (
                page.blocks.map((block, index) => {
                  const tocEntries =
                    isTableOfContents && block.type === "paragraph"
                      ? parseTableOfContents(block.text)
                      : [];
                  const isPageLabel =
                    isTableOfContents &&
                    block.type === "paragraph" &&
                    /^Sommaire\s+\d+\/\d+$/i.test(block.text.trim());

                  if (isPageLabel) return null;

                  if (tocEntries.length > 1) {
                    return (
                      <div
                        className="book-toc"
                        key={`${chapterIndex}-${page.number}-${index}`}
                      >
                        {tocEntries.map((entry, entryIndex) => (
                          <div
                            className="book-toc-entry"
                            key={`${entry.page}-${entryIndex}`}
                            title={entry.title}
                            aria-label={`${entry.title}, page ${entry.page}`}
                          >
                            <span className="book-toc-title">{entry.title}</span>
                            <span className="book-toc-leader" aria-hidden="true" />
                            <span className="book-toc-page">{entry.page}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (block.type === "code") {
                    return (
                      <div
                        key={`${chapterIndex}-${page.number}-${index}`}
                        className="book-code-editor"
                        aria-label={`Exemple de code${block.language ? ` ${block.language}` : ""}`}
                        tabIndex={0}
                        onCopy={(event) => event.preventDefault()}
                        onCut={(event) => event.preventDefault()}
                        onPaste={(event) => event.preventDefault()}
                        onContextMenu={(event) => event.preventDefault()}
                        onKeyDown={(event) => {
                          if (
                            (event.ctrlKey || event.metaKey) &&
                            ["c", "x", "v"].includes(event.key.toLowerCase())
                          ) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <div className="book-code-editor-toolbar" aria-hidden="true">
                          <span className="book-code-editor-lights">
                            <i />
                            <i />
                            <i />
                          </span>
                          <span>{block.language ?? "CODE"}</span>
                          <span>LECTURE SEULE</span>
                        </div>
                        <pre>
                          <code>{block.text}</code>
                        </pre>
                      </div>
                    );
                  }

                  if (block.type === "heading") {
                    return (
                      <h3
                        key={`${chapterIndex}-${page.number}-${index}`}
                        className="book-page-heading"
                      >
                        {block.text}
                      </h3>
                    );
                  }

                  return (
                    <p key={`${chapterIndex}-${page.number}-${index}`}>
                      {block.text}
                    </p>
                  );
                })
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="chapter-body">
          {chapter.content?.map((paragraph, index) => (
            <p key={paragraph}>
              {index === 0 && <span className="drop-cap">{paragraph[0]}</span>}
              {index === 0 ? paragraph.slice(1) : paragraph}
            </p>
          ))}
        </div>
      )}
      {isLastChapter && isReadingComplete && (
        <BookRating book={book} />
      )}
      <div className="chapter-footer">
        <span>
          {String(chapterIndex + 1).padStart(2, "0")} / {String(book.chapters.length).padStart(2, "0")}
        </span>
        {chapter.pages && (
          <span>
            Page {chapter.pages[chapter.pages.length - 1].number} sur{" "}
            {Number.parseInt(book.pages, 10)}
          </span>
        )}
        {isLastChapter && isReadingComplete ? (
          <ActionButton href={`/livres/${book.id}/test`}>
            Passer le test
          </ActionButton>
        ) : (
          <ActionButton
            className="chapter-next-button"
            onClick={() => onChapterSelect(chapterIndex)}
          >
            {isLastChapter
              ? "Terminer la lecture et passer au test"
              : "Terminer cette section"}
          </ActionButton>
        )}
      </div>
    </>
  );
}
