import fs from "node:fs/promises";
import path from "node:path";
import type { Book } from "@/data/books";

const CUSTOM_BOOKS_FILE = path.join(
  process.cwd(),
  "src",
  "data",
  "custom-books.json"
);

// Cache mémoire
let memoryCustomBooks: Book[] = [];

/**
 * Récupère l'ensemble des livres uploadés par les auteurs (stockés dans custom-books.json)
 */
export async function getCustomBooks(): Promise<Book[]> {
  try {
    const raw = await fs.readFile(CUSTOM_BOOKS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryCustomBooks = parsed;
      return parsed;
    }
    return memoryCustomBooks;
  } catch {
    return memoryCustomBooks;
  }
}

/**
 * Récupère un livre personnalisé par son identifiant
 */
export async function getCustomBookById(id: string): Promise<Book | undefined> {
  const all = await getCustomBooks();
  return all.find((b) => b.id === id);
}

/**
 * Enregistre un nouveau livre dans custom-books.json
 */
export async function saveCustomBook(book: Book): Promise<void> {
  if (!book.id || ["__proto__", "constructor", "prototype"].includes(book.id)) {
    throw new Error("Identifiant de livre non valide.");
  }
  const all = await getCustomBooks();
  const existingIndex = all.findIndex((b) => b.id === book.id);

  if (existingIndex >= 0) {
    all[existingIndex] = book;
  } else {
    all.unshift(book); // Ajoute en tête pour être visible immédiatement
  }

  memoryCustomBooks = all;

  try {
    await fs.writeFile(
      CUSTOM_BOOKS_FILE,
      JSON.stringify(all, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.warn("Écriture custom-books.json en lecture seule, conservé en mémoire:", err);
  }
}

