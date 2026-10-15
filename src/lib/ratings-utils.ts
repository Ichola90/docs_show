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

export type BookRatingSummary = {
  rating: string | null;
  count: number;
};

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
 * Nettoie et recalcule les métriques d'un store local
 */
export function cleanAndSanitizeStore(store: RatingsStore): RatingsStore {
  const sanitized: RatingsStore = {};
  for (const [bookId, stats] of Object.entries(store)) {
    if (!stats || typeof stats !== "object") continue;
    const cleanReviews = deduplicateReviews(stats.reviews || []);
    sanitized[bookId] = {
      votesCount: cleanReviews.length,
      starsTotal: cleanReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0),
      reviews: cleanReviews,
    };
  }
  return sanitized;
}

/**
 * Calcule la note moyenne et le nombre total d'avis agrégés
 */
export function calculateRatingSummary(
  initialRating: string,
  initialCount: number,
  stats?: BookRatingStats
): BookRatingSummary {
  const parsedInitialRating = Number.parseFloat(
    initialRating.replace(",", ".")
  );
  const validInitialRating =
    initialCount > 0 && Number.isFinite(parsedInitialRating)
      ? parsedInitialRating
      : 0;

  const addedVotes = stats?.votesCount ?? 0;
  const addedStars = stats?.starsTotal ?? 0;

  const totalVotes = initialCount + addedVotes;
  const totalStars = validInitialRating * initialCount + addedStars;

  if (totalVotes === 0) {
    return {
      rating: null,
      count: 0,
    };
  }

  const average = totalStars / totalVotes;
  return {
    rating: average.toFixed(1).replace(".", ","),
    count: totalVotes,
  };
}

