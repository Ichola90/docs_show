import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

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

const TMP_RATINGS_FILE = path.join(
  os.tmpdir(),
  "docs_show_ratings_store.json"
);

// Fallback in-memory cache
let memoryStore: RatingsStore = {};

/**
 * Fusionne intelligemment deux stores d'évaluation en dédupliquant les avis
 */
export function mergeRatingsStores(base: RatingsStore, incoming: RatingsStore): RatingsStore {
  const merged: RatingsStore = { ...base };

  for (const [bookId, incomingStats] of Object.entries(incoming)) {
    if (!incomingStats || typeof incomingStats !== "object") continue;

    const baseStats = merged[bookId] ?? {
      votesCount: 0,
      starsTotal: 0,
      reviews: [],
    };

    const seen = new Set<string>();
    const combinedReviews: BookReview[] = [];

    const allCandidateReviews = [
      ...(incomingStats.reviews || []),
      ...(baseStats.reviews || []),
    ];

    for (const rev of allCandidateReviews) {
      if (!rev || typeof rev !== "object") continue;
      const signature = rev.id || `${rev.name}_${rev.createdAt}_${rev.rating}`;
      if (!seen.has(signature)) {
        seen.add(signature);
        combinedReviews.push(rev);
      }
    }

    combinedReviews.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });

    const calculatedStars = combinedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    const calculatedVotes = combinedReviews.length;

    merged[bookId] = {
      votesCount: Math.max(calculatedVotes, incomingStats.votesCount ?? 0, baseStats.votesCount ?? 0),
      starsTotal: Math.max(calculatedStars, incomingStats.starsTotal ?? 0, baseStats.starsTotal ?? 0),
      reviews: combinedReviews,
    };
  }

  return merged;
}

/**
 * Lit le fichier JSON des évaluations et avis.
 * Priorités :
 * 1. GitHub Gist (si GITHUB_GIST_ID & GITHUB_TOKEN configurés)
 * 2. Fichier temporaire /tmp (persistant sur Vercel serverless pendant la durée du conteneur)
 * 3. Fichier JSON local embarqué (src/data/ratings-store.json)
 * 4. Cache mémoire
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
          "User-Agent": "docs-show-app",
        },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const ratingFile = data.files?.["ratings.json"];
        let fileContent = ratingFile?.content;

        // Si le contenu est volumineux (> 300 Ko), GitHub fournit raw_url
        if (!fileContent && ratingFile?.raw_url) {
          try {
            const rawRes = await fetch(ratingFile.raw_url, {
              headers: {
                Authorization: `Bearer ${gistToken}`,
                "User-Agent": "docs-show-app",
              },
              cache: "no-store",
            });
            if (rawRes.ok) {
              fileContent = await rawRes.text();
            }
          } catch (rawErr) {
            console.warn("Erreur téléchargement raw_url Gist ratings:", rawErr);
          }
        }

        if (fileContent) {
          const parsed = JSON.parse(fileContent);
          if (parsed && typeof parsed === "object") {
            memoryStore = mergeRatingsStores(memoryStore, parsed);
          }
        }
      }
    } catch (err: unknown) {
      const isDynamic = err && typeof err === "object" && ("digest" in err || (err as Error).message?.includes("Dynamic server usage"));
      if (!isDynamic) {
        console.warn("Erreur lecture GitHub Gist ratings:", err);
      }
    }
  }

  // 2. Fichier temporaire /tmp (persistant sur Vercel)
  try {
    const rawTmp = await fs.readFile(TMP_RATINGS_FILE, "utf-8");
    const parsedTmp = JSON.parse(rawTmp);
    if (parsedTmp && typeof parsedTmp === "object") {
      memoryStore = mergeRatingsStores(memoryStore, parsedTmp);
    }
  } catch {
    // Pas de fichier /tmp
  }

  // 3. Fichier JSON local (src/data/ratings-store.json)
  try {
    const rawLocal = await fs.readFile(LOCAL_STORE_FILE, "utf-8");
    const parsedLocal = JSON.parse(rawLocal);
    if (parsedLocal && typeof parsedLocal === "object") {
      memoryStore = mergeRatingsStores(memoryStore, parsedLocal);
    }
  } catch {
    // Pas de fichier local
  }

  // 4. Fallback JSONBin
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
        if (data.record && typeof data.record === "object") {
          memoryStore = mergeRatingsStores(memoryStore, data.record);
        }
      }
    } catch (err) {
      console.warn("Erreur lecture JSONBin:", err);
    }
  }

  return memoryStore;
}

/**
 * Sauvegarde le store JSON à travers tous les niveaux de persistance.
 */
export async function saveRatingsStore(store: RatingsStore): Promise<void> {
  memoryStore = store;

  // 1. Sauvegarde dans /tmp (critique pour la persistance Vercel serverless)
  try {
    await fs.writeFile(
      TMP_RATINGS_FILE,
      JSON.stringify(store, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.warn("Écriture /tmp non disponible:", err);
  }

  // 2. Sauvegarde sur disque local si disponible (environnement local dev)
  try {
    await fs.writeFile(LOCAL_STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // Vercel read-only
  }

  // 3. Sauvegarde sur GitHub Gist si configuré
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
          "User-Agent": "docs-show-app",
        },
        body: JSON.stringify({
          files: {
            "ratings.json": {
              content: JSON.stringify(store, null, 2),
            },
          },
        }),
      });
      if (!res.ok) {
        console.warn(`Erreur PATCH Gist ratings.json: ${res.status}`);
      }
    } catch (err) {
      console.warn("Erreur écriture GitHub Gist pour les ratings:", err);
    }
  }

  // 4. JSONBin fallback
  const jsonBinId = process.env.JSONBIN_BIN_ID;
  const jsonBinKey = process.env.JSONBIN_API_KEY;

  if (jsonBinId && jsonBinKey) {
    try {
      await fetch(`https://api.jsonbin.io/v3/b/${jsonBinId}`, {
        method: "PUT",
        headers: {
          "X-Master-Key": jsonBinKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(store),
      });
    } catch (err) {
      console.warn("Erreur écriture JSONBin:", err);
    }
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
  const updatedVotesCount = (current.votesCount || 0) + 1;
  const updatedStarsTotal = (current.starsTotal || 0) + newReview.rating;

  const updatedStats: BookRatingStats = {
    votesCount: updatedVotesCount,
    starsTotal: updatedStarsTotal,
    reviews: updatedReviews,
  };

  store[bookId] = updatedStats;
  await saveRatingsStore(store);

  return { stats: updatedStats, store };
}
