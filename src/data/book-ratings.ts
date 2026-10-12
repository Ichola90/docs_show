import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { books, type Book } from "@/data/books";

type StoredRatings = {
  version: 1;
  books: Record<string, Record<string, number>>;
};

export type BookRatingSummary = {
  rating: string | null;
  count: number;
};

let writeQueue: Promise<void> = Promise.resolve();

function getRatingsFilePath() {
  return (
    process.env.BOOK_RATINGS_FILE ??
    path.join(process.cwd(), ".data", "book-ratings.json")
  );
}

function isStoredRatings(value: unknown): value is StoredRatings {
  if (
    typeof value !== "object" ||
    value === null ||
    !("version" in value) ||
    value.version !== 1 ||
    !("books" in value) ||
    typeof value.books !== "object" ||
    value.books === null
  ) {
    return false;
  }

  return Object.values(value.books).every(
    (votes) =>
      typeof votes === "object" &&
      votes !== null &&
      Object.values(votes).every(
        (rating) =>
          typeof rating === "number" &&
          Number.isInteger(rating) &&
          rating >= 1 &&
          rating <= 5,
      ),
  );
}

async function readRatings(): Promise<StoredRatings> {
  try {
    const raw = await readFile(
      /* turbopackIgnore: true */ getRatingsFilePath(),
      "utf8",
    );
    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Le fichier des évaluations est illisible.");
    }

    if (!isStoredRatings(parsed)) {
      throw new Error("Le fichier des évaluations a un format invalide.");
    }

    return parsed;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return { version: 1, books: {} };
    }

    throw error;
  }
}

function createSummary(book: Book, votes: Record<string, number>): BookRatingSummary {
  const baselineCount = book.reviewCount;
  const baselineRating = Number.parseFloat(book.rating.replace(",", "."));
  const validBaselineRating =
    baselineCount > 0 && Number.isFinite(baselineRating) ? baselineRating : 0;
  const newVotes = Object.values(votes);
  const count = baselineCount + newVotes.length;
  if (count === 0) return { rating: null, count: 0 };

  const totalRating =
    validBaselineRating * baselineCount +
    newVotes.reduce((total, rating) => total + rating, 0);

  return {
    rating: (totalRating / count).toFixed(1).replace(".", ","),
    count,
  };
}

export async function getBookRatingSummaries(): Promise<
  Record<string, BookRatingSummary>
> {
  const stored = await readRatings();

  return Object.fromEntries(
    books.map((book) => [
      book.id,
      createSummary(book, stored.books[book.id] ?? {}),
    ]),
  );
}

export async function saveBookRating(
  book: Book,
  clientId: string,
  rating: number,
): Promise<BookRatingSummary> {
  const operation = writeQueue.then(async () => {
    const stored = await readRatings();
    const votes = stored.books[book.id] ?? {};
    votes[clientId] = rating;
    stored.books[book.id] = votes;

    const filePath = getRatingsFilePath();
    const directory = path.dirname(filePath);
    await mkdir(directory, { recursive: true });
    const temporaryPath = `${filePath}.${process.pid}.tmp`;
    await writeFile(
      /* turbopackIgnore: true */ temporaryPath,
      JSON.stringify(stored),
      "utf8",
    );
    await rename(
      /* turbopackIgnore: true */ temporaryPath,
      /* turbopackIgnore: true */ filePath,
    );

    return createSummary(book, votes);
  });

  writeQueue = operation.then(
    () => undefined,
    () => undefined,
  );

  return operation;
}
