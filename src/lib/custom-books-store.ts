import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { Book } from "@/data/books";

const CUSTOM_BOOKS_FILE = path.join(
  process.cwd(),
  "src",
  "data",
  "custom-books.json"
);

const TMP_CUSTOM_BOOKS_FILE = path.join(
  os.tmpdir(),
  "docs_show_custom_books.json"
);

// Cache mémoire
let memoryCustomBooks: Book[] = [];

/**
 * Récupère l'ensemble des livres uploadés par les auteurs.
 * Priorités :
 * 1. GitHub Gist (si GITHUB_GIST_ID & GITHUB_TOKEN configurés)
 * 2. Fichier temporaire /tmp (persistant sur Vercel durant la vie du conteneur)
 * 3. Fichier embarqué dans le dépôt (src/data/custom-books.json)
 * 4. Cache mémoire
 */
export async function getCustomBooks(): Promise<Book[]> {
  const gistId = process.env.GITHUB_GIST_ID;
  const gistToken = process.env.GITHUB_TOKEN;

  if (gistId && gistToken) {
    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          Authorization: `Bearer ${gistToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "docs-show-app",
        },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const fileContent = data.files?.["books.json"]?.content;
        if (fileContent) {
          const parsed = JSON.parse(fileContent);
          if (Array.isArray(parsed)) {
            memoryCustomBooks = parsed;
            return parsed;
          }
        }
      }
    } catch (err: unknown) {
      const isDynamic = err && typeof err === "object" && ("digest" in err || (err as Error).message?.includes("Dynamic server usage"));
      if (!isDynamic) {
        console.warn("Erreur lecture custom books depuis GitHub Gist:", err);
      }
    }
  }

  // 2. Fichier /tmp
  try {
    const rawTmp = await fs.readFile(TMP_CUSTOM_BOOKS_FILE, "utf-8");
    const parsedTmp = JSON.parse(rawTmp);
    if (Array.isArray(parsedTmp) && parsedTmp.length > 0) {
      memoryCustomBooks = parsedTmp;
      return parsedTmp;
    }
  } catch {
    // Pas de fichier tmp présent
  }

  // 3. Fichier local src/data/custom-books.json
  try {
    const raw = await fs.readFile(CUSTOM_BOOKS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const bundledIds = new Set(parsed.map((b) => b.id));
      const memoryOnly = memoryCustomBooks.filter((b) => !bundledIds.has(b.id));
      const merged = [...memoryOnly, ...parsed];
      memoryCustomBooks = merged;
      return merged;
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
 * Enregistre un nouveau livre dans le store JSON
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

  // 1. Sauvegarde dans /tmp
  try {
    await fs.writeFile(
      TMP_CUSTOM_BOOKS_FILE,
      JSON.stringify(all, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.warn("Écriture /tmp non disponible:", err);
  }

  // 2. Sauvegarde sur disque de build si disponible
  try {
    await fs.writeFile(
      CUSTOM_BOOKS_FILE,
      JSON.stringify(all, null, 2),
      "utf-8"
    );
  } catch {
    // Environnement Vercel lecture seule
  }

  // 3. Sauvegarde sur GitHub Gist si configuré
  const gistId = process.env.GITHUB_GIST_ID;
  const gistToken = process.env.GITHUB_TOKEN;

  if (gistId && gistToken) {
    try {
      await fetch(`https://api.github.com/gists/${gistId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${gistToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "docs-show-app",
        },
        body: JSON.stringify({
          files: {
            "books.json": {
              content: JSON.stringify(all, null, 2),
            },
          },
        }),
      });
    } catch (err) {
      console.warn("Erreur écriture GitHub Gist pour les livres:", err);
    }
  }
}
