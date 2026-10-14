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

// Cache mémoire
let memoryStore: RatingsStore = {};

/**
 * Déduplique strictement une liste d'avis par ID canonique et par signature sémantique
 */
export function deduplicateReviews(reviews: BookReview[]): BookReview[] {
  const seenIds = new Set<string>();
  const seenSignatures: { sig: string; time: number }[] = [];
  const unique: BookReview[] = [];

  for (const rev of reviews) {
    if (!rev || typeof rev !== "object") continue;

    // 1. Déduplication stricte par ID unique
    if (rev.id && seenIds.has(rev.id)) continue;

    // 2. Déduplication sémantique (même auteur, même note, même commentaire dans une fenêtre de 60s)
    const normalizedName = (rev.name || "").trim().toLowerCase();
    const normalizedComment = (rev.comment || "").trim().toLowerCase();
    const sig = `${normalizedName}|${rev.rating}|${normalizedComment}`;
    const time = new Date(rev.createdAt).getTime() || 0;

    const isDuplicate = seenSignatures.some(
      (s) => s.sig === sig && (Math.abs(s.time - time) < 60000 || time === 0 || s.time === 0)
    );

    if (isDuplicate) continue;

    if (rev.id) seenIds.add(rev.id);
    seenSignatures.push({ sig, time });
    unique.push(rev);
  }

  // Trier par date décroissante (plus récent en tête)
  unique.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || 0;
    const timeB = new Date(b.createdAt).getTime() || 0;
    return timeB - timeA;
  });

  return unique;
}

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

    const combinedReviews = deduplicateReviews([
      ...(incomingStats.reviews || []),
      ...(baseStats.reviews || []),
    ]);

    const calculatedStars = combinedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    const calculatedVotes = combinedReviews.length;

    merged[bookId] = {
      votesCount: calculatedVotes,
      starsTotal: calculatedStars,
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
 * Si un id ou un createdAt est fourni par le client, ils sont préservés pour garantir
 * la concordance stricte entre l'état optimiste et la base de données distante.
 */
export async function addReviewToStore(
  bookId: string,
  newReview: {
    id?: string;
    createdAt?: string;
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

  const reviewId =
    newReview.id && /^rev_[a-zA-Z0-9_-]{5,60}$/.test(newReview.id)
      ? newReview.id
      : `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const reviewCreatedAt =
    newReview.createdAt && !Number.isNaN(new Date(newReview.createdAt).getTime())
      ? newReview.createdAt
      : new Date().toISOString();

  const reviewEntry: BookReview = {
    id: reviewId,
    name: newReview.name.trim(),
    rating: newReview.rating,
    comment: newReview.comment?.trim() || undefined,
    createdAt: reviewCreatedAt,
  };

  // Déduplication immédiate
  const updatedReviews = deduplicateReviews([reviewEntry, ...(current.reviews || [])]);
  const updatedVotesCount = updatedReviews.length;
  const updatedStarsTotal = updatedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);

  const updatedStats: BookRatingStats = {
    votesCount: updatedVotesCount,
    starsTotal: updatedStarsTotal,
    reviews: updatedReviews,
  };

  store[bookId] = updatedStats;
  await saveRatingsStore(store);

  return { stats: updatedStats, store };
}
