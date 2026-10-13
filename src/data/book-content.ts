import "server-only";
import { books, getBookSummaryById, type Book, type BookChapter } from "@/data/books";
import { getCustomBookById, getCustomBooks } from "@/lib/custom-books-store";

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

export async function getAllBooksWithCustom(): Promise<Book[]> {
  const customBooks = await getCustomBooks();
  return [...customBooks, ...books];
}

export async function getBookById(id: string): Promise<Book | undefined> {
  // 1. Livres officiels statiques disponibles
  if (id === "concevez-site-web-php-mysql") {
    const book = getBookSummaryById(id);
    if (!book) return undefined;
    const { default: data } = await import("./php-mysql-chapters.json");
    return { ...book, chapters: hydrateChapters(data.chapters) };
  }

  if (id === "apprenez-programmer-c") {
    const book = getBookSummaryById(id);
    if (!book) return undefined;
    const { default: data } = await import("./c-programming-chapters.json");
    return { ...book, chapters: hydrateChapters(data.chapters) };
  }

  // 2. Si c'est un livre officiel indisponible (les 8 autres livres)
  const officialBook = getBookSummaryById(id);
  if (officialBook) {
    return undefined;
  }

  // 3. Livres personnalisés créés par les auteurs
  const custom = await getCustomBookById(id);
  if (custom) return custom;

  return undefined;
}
