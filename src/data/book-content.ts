import "server-only";
import { getBookSummaryById, type Book, type BookChapter } from "@/data/books";

type SerializedChapter = {
  title: string;
  part?: string;
  pages: {
    number: number;
    blocks: {
      type: string;
      text: string;
      language?: string;
    }[];
  }[];
};

function hydrateChapters(chapters: SerializedChapter[]): BookChapter[] {
  return chapters.map((chapter) => ({
    title: chapter.title,
    part: chapter.part,
    pages: chapter.pages.map((page) => ({
      number: page.number,
      blocks: page.blocks.map((block) => {
        if (block.type === "code") {
          return {
            type: "code",
            text: block.text,
            ...(block.language ? { language: block.language } : {}),
          };
        }

        return {
          type: block.type === "heading" ? "heading" : "paragraph",
          text: block.text,
        };
      }),
    })),
  }));
}

export async function getBookById(id: string): Promise<Book | undefined> {
  const book = getBookSummaryById(id);
  if (!book) return undefined;

  if (book.id === "concevez-site-web-php-mysql") {
    const { default: data } = await import("./php-mysql-chapters.json");
    return { ...book, chapters: hydrateChapters(data.chapters) };
  }

  if (book.id === "apprenez-programmer-c") {
    const { default: data } = await import("./c-programming-chapters.json");
    return { ...book, chapters: hydrateChapters(data.chapters) };
  }

  return book;
}
