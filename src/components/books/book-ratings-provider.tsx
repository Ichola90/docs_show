"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { BookReview, BookRatingStats, RatingsStore } from "@/lib/json-ratings-store";

const RATINGS_STORAGE_KEY = "atelier:ratings:v1";
const REVIEWS_STORE_STORAGE_KEY = "docs_show_custom_reviews_store_v1";

type BookRatingSummary = {
  rating: string | null;
  count: number;
};

type SubmitReviewPayload = {
  name: string;
  rating: number;
  comment?: string;
};

type BookRatingsContextValue = {
  ratings: Record<string, number>;
  store: RatingsStore;
  ready: boolean;
  error: string | null;
  submitReview: (bookId: string, payload: SubmitReviewPayload) => Promise<void>;
  submitRating: (bookId: string, rating: number) => Promise<void>;
};

const BookRatingsContext = createContext<BookRatingsContextValue | null>(null);

function isStoredRatings(value: unknown): value is Record<string, number> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every(
      (rating) =>
        typeof rating === "number" &&
        Number.isInteger(rating) &&
        rating >= 1 &&
        rating <= 5,
    )
  );
}

/**
 * Fusionne deux stores d'avis et notes sans doublons
 */
function mergeClientStores(base: RatingsStore, incoming: RatingsStore): RatingsStore {
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

    // Priorité aux avis récents (incoming puis base)
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

    const calculatedStars = combinedReviews.reduce(
      (sum, r) => sum + (Number(r.rating) || 0),
      0
    );
    const calculatedVotes = combinedReviews.length;

    merged[bookId] = {
      votesCount: Math.max(calculatedVotes, incomingStats.votesCount ?? 0, baseStats.votesCount ?? 0),
      starsTotal: Math.max(calculatedStars, incomingStats.starsTotal ?? 0, baseStats.starsTotal ?? 0),
      reviews: combinedReviews,
    };
  }

  return merged;
}

function summarizeRating(
  initialRating: string,
  initialCount: number,
  stats?: BookRatingStats,
): BookRatingSummary {
  const parsedInitialRating = Number.parseFloat(
    initialRating.replace(",", "."),
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

export function BookRatingsProvider({ children }: { children: ReactNode }) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [store, setStore] = useState<RatingsStore>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Chargement immédiat du cache local (comme pour les livres !)
  // Permet à l'utilisateur de retrouver immédiatement ses avis dès l'actualisation de la page
  useEffect(() => {
    let localStoreSnapshot: RatingsStore = {};

    try {
      // Notes personnelles de vote
      const storedRatings = localStorage.getItem(RATINGS_STORAGE_KEY);
      if (storedRatings !== null) {
        const parsed: unknown = JSON.parse(storedRatings);
        if (isStoredRatings(parsed)) {
          setRatings(parsed);
        }
      }

      // Store complet des avis et commentaires
      const storedReviewsStore = localStorage.getItem(REVIEWS_STORE_STORAGE_KEY);
      if (storedReviewsStore !== null) {
        const parsedStore: unknown = JSON.parse(storedReviewsStore);
        if (parsedStore && typeof parsedStore === "object") {
          localStoreSnapshot = parsedStore as RatingsStore;
          setStore(localStoreSnapshot);
        }
      }
    } catch (loadError) {
      console.warn("Impossible de charger les avis locaux:", loadError);
    } finally {
      setReady(true);
    }

    // 2. Synchronisation avec le store distant (/api/ratings)
    let isCancelled = false;

    async function fetchJsonStore() {
      try {
        const response = await fetch("/api/ratings", {
          cache: "no-store",
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
          },
        });
        if (!response.ok) return;

        const data: {
          success?: boolean;
          store?: RatingsStore;
        } = await response.json();

        if (isCancelled) return;

        if (data.store && typeof data.store === "object") {
          setStore((prevStore) => {
            const merged = mergeClientStores(prevStore, data.store || {});
            try {
              localStorage.setItem(REVIEWS_STORE_STORAGE_KEY, JSON.stringify(merged));
            } catch (err) {
              console.warn("Erreur sauvegarde reviews dans localStorage:", err);
            }
            return merged;
          });
        }
      } catch (fetchErr) {
        console.info("Mode de secours local actif pour les avis.", fetchErr);
      }
    }

    void fetchJsonStore();

    return () => {
      isCancelled = true;
    };
  }, []);

  const submitReview = useCallback(
    async (bookId: string, payload: SubmitReviewPayload) => {
      const { name, rating, comment } = payload;
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Choisissez une note entre 1 et 5 étoiles.");
      }

      const trimmedName = name.trim() || "Lecteur";

      // 1. Création de l'avis avec identifiant unique et horodatage ISO
      const optimisticReview: BookReview = {
        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: trimmedName,
        rating,
        comment: comment?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      // 2. Mise à jour optimiste de l'état ET sauvegarde immédiate dans localStorage (Résilience absolue F5 / refresh)
      let nextStore: RatingsStore = {};
      setStore((prev) => {
        const current = prev[bookId] ?? {
          votesCount: 0,
          starsTotal: 0,
          reviews: [],
        };
        const updatedReviews = [optimisticReview, ...(current.reviews || [])];
        const updatedStats: BookRatingStats = {
          votesCount: (current.votesCount || 0) + 1,
          starsTotal: (current.starsTotal || 0) + rating,
          reviews: updatedReviews,
        };

        nextStore = {
          ...prev,
          [bookId]: updatedStats,
        };

        try {
          localStorage.setItem(REVIEWS_STORE_STORAGE_KEY, JSON.stringify(nextStore));
        } catch (saveErr) {
          console.warn("Erreur écriture reviews dans localStorage:", saveErr);
        }

        return nextStore;
      });

      // 3. Enregistrement du vote personnel dans localStorage
      const updatedRatings = { ...ratings, [bookId]: rating };
      try {
        localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(updatedRatings));
      } catch (saveError) {
        console.warn("Erreur sauvegarde note perso locale:", saveError);
      }
      setRatings(updatedRatings);

      // 4. Appel réseau vers l'API serveur pour persistance Cloud / tmp / Gist
      try {
        const response = await fetch("/api/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId,
            name: trimmedName,
            rating,
            comment,
          }),
        });

        if (response.ok) {
          const result: {
            success?: boolean;
            store?: RatingsStore;
          } = await response.json();

          if (result.store && typeof result.store === "object") {
            setStore((prev) => {
              const merged = mergeClientStores(prev, result.store || {});
              try {
                localStorage.setItem(REVIEWS_STORE_STORAGE_KEY, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      } catch (apiError) {
        console.warn("Persistance serveur différée (avis conservé localement):", apiError);
      }
    },
    [ratings],
  );

  const submitRating = useCallback(
    async (bookId: string, rating: number) => {
      return submitReview(bookId, {
        name: "Lecteur",
        rating,
      });
    },
    [submitReview],
  );

  return (
    <BookRatingsContext.Provider
      value={{
        ratings,
        store,
        ready,
        error,
        submitReview,
        submitRating,
      }}
    >
      {error && (
        <p className="ratings-load-error" role="status">
          {error}
        </p>
      )}
      {children}
    </BookRatingsContext.Provider>
  );
}

export function useBookRating(
  bookId: string,
  initialRating: string,
  initialCount: number,
) {
  const context = useContext(BookRatingsContext);
  const userRating = context?.ratings[bookId];
  const bookStats = context?.store[bookId];
  const summary = summarizeRating(
    initialRating,
    initialCount,
    bookStats,
  );

  return {
    rating: summary.rating ?? initialRating,
    count: summary.count,
    userRating,
    reviews: bookStats?.reviews ?? [],
    ready: context?.ready ?? false,
    submitReview: context?.submitReview,
    submitRating: context?.submitRating,
  };
}
