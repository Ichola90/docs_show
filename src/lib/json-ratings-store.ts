import fs from "node:fs/promises";
import path from "node:path";

export type BookReview = {
  id: string;
  name: string;
  rating: number;
  comment?: string;
  createdAt: string;
};

export type BookRatingStats = {
  votesCount: number;
  starsTotal: number;
  reviews: BookReview[];
};

export type RatingsStore = Record<string, BookRatingStats>;

const LOCAL_STORE_FILE = path.join(
  process.cwd(),
  "src",
  "data",
  "ratings-store.json"
);

// Fallback in-memory cache
let memoryStore: RatingsStore = {};

/**
 * Lit le fichier JSON des évaluations et avis.
 * Priorité :
 * 1. GitHub Gist (si GITHUB_GIST_ID & GITHUB_TOKEN configurés)
 * 2. JSONBin.io (si JSONBIN_BIN_ID & JSONBIN_API_KEY configurés)
 * 3. Fichier JSON local (src/data/ratings-store.json)
 */
export async function getRatingsStore(): Promise<RatingsStore> {
  const gistId = process.env.GITHUB_GIST_ID;
  const gistToken = process.env.GITHUB_TOKEN;

  if (gistId && gistToken) {
    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          Authorization: `Bearer ${gistToken}`,
          Accept: "application/vnd.github+json",
        },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const fileContent =
          data.files?.["ratings.json"]?.content ||
          data.files?.[Object.keys(data.files)[0]]?.content;
        if (fileContent) {
          const parsed = JSON.parse(fileContent);
          memoryStore = parsed;
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Erreur lecture GitHub Gist:", err);
    }
  }

  const jsonBinId = process.env.JSONBIN_BIN_ID;
  const jsonBinKey = process.env.JSONBIN_API_KEY;

  if (jsonBinId && jsonBinKey) {
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${jsonBinId}/latest`, {
        headers: {
          "X-Master-Key": jsonBinKey,
        },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          memoryStore = data.record;
          return data.record;
        }
      }
    } catch (err) {
      console.warn("Erreur lecture JSONBin:", err);
    }
  }

  // Fallback: Lecture du fichier JSON local
  try {
    const raw = await fs.readFile(LOCAL_STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    memoryStore = parsed;
    return parsed;
  } catch {
    return memoryStore;
  }
}

/**
 * Sauvegarde le store JSON.
 */
export async function saveRatingsStore(store: RatingsStore): Promise<void> {
  memoryStore = store;

  const gistId = process.env.GITHUB_GIST_ID;
  const gistToken = process.env.GITHUB_TOKEN;

  if (gistId && gistToken) {
    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${gistToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: {
            "ratings.json": {
              content: JSON.stringify(store, null, 2),
            },
          },
        }),
      });
      if (res.ok) return;
    } catch (err) {
      console.warn("Erreur écriture GitHub Gist:", err);
    }
  }

  const jsonBinId = process.env.JSONBIN_BIN_ID;
  const jsonBinKey = process.env.JSONBIN_API_KEY;

  if (jsonBinId && jsonBinKey) {
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${jsonBinId}`, {
        method: "PUT",
        headers: {
          "X-Master-Key": jsonBinKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(store),
      });
      if (res.ok) return;
    } catch (err) {
      console.warn("Erreur écriture JSONBin:", err);
    }
  }

  // Fallback: Écriture sur disque local
  try {
    await fs.writeFile(LOCAL_STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    // Sur Vercel en read-only sans env vars, le store reste conservé en mémoire pour la durée de la fonction
    console.info("Sauvegarde disque locale non disponible (read-only ou serverless), conservé en mémoire.", err);
  }
}

/**
 * Ajoute un avis et recalcule les métriques pour un livre.
 */
export async function addReviewToStore(
  bookId: string,
  newReview: {
    name: string;
    rating: number;
    comment?: string;
  }
): Promise<{ stats: BookRatingStats; store: RatingsStore }> {
  if (["__proto__", "constructor", "prototype"].includes(bookId)) {
    throw new Error("Identifiant de livre non autorisé.");
  }
  const store = await getRatingsStore();
  const current = store[bookId] ?? {
    votesCount: 0,
    starsTotal: 0,
    reviews: [],
  };

  const reviewEntry: BookReview = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: newReview.name.trim(),
    rating: newReview.rating,
    comment: newReview.comment?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const updatedReviews = [reviewEntry, ...(current.reviews || [])];
  const updatedVotesCount = current.votesCount + 1;
  const updatedStarsTotal = current.starsTotal + newReview.rating;

  const updatedStats: BookRatingStats = {
    votesCount: updatedVotesCount,
    starsTotal: updatedStarsTotal,
    reviews: updatedReviews,
  };

  store[bookId] = updatedStats;
  await saveRatingsStore(store);

  return { stats: updatedStats, store };
}

