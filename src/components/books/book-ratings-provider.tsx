"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type BookReview,
  type BookRatingStats,
  type RatingsStore,
  calculateRatingSummary,
  deduplicateReviews,
  mergeRatingsStores,
  cleanAndSanitizeStore,
} from "@/lib/ratings-utils";

const RATINGS_STORAGE_KEY = "atelier:ratings:v1";
const REVIEWS_STORE_STORAGE_KEY = "docs_show_custom_reviews_store_v1";

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



export function BookRatingsProvider({ children }: { children: ReactNode }) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [store, setStore] = useState<RatingsStore>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Chargement asynchrone du cache local avec déduplication instantanée
  useEffect(() => {
    const timer = setTimeout(() => {
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
            const cleanLocalStore = cleanAndSanitizeStore(parsedStore as RatingsStore);
            setStore(cleanLocalStore);
            // Réécrire la version propre et dédupliquée dans le cache
            try {
              localStorage.setItem(REVIEWS_STORE_STORAGE_KEY, JSON.stringify(cleanLocalStore));
            } catch {}
          }
        }
      } catch (loadError) {
        console.warn("Impossible de charger les avis locaux:", loadError);
        setError("Impossible de charger les avis locaux.");
      } finally {
        setReady(true);
      }
    }, 0);

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
            const merged = mergeRatingsStores(prevStore, data.store || {});
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
      clearTimeout(timer);
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

      // 1. Génération de l'ID canonique unique partagé entre client et serveur
      const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const createdAt = new Date().toISOString();

      const optimisticReview: BookReview = {
        id: reviewId,
        name: trimmedName,
        rating,
        comment: comment?.trim() || undefined,
        createdAt,
      };

      // 2. Mise à jour optimiste locale et déduplication
      let nextStore: RatingsStore = {};
      setStore((prev) => {
        const current = prev[bookId] ?? {
          votesCount: 0,
          starsTotal: 0,
          reviews: [],
        };

        const updatedReviews = deduplicateReviews([optimisticReview, ...(current.reviews || [])]);
        const updatedStats: BookRatingStats = {
          votesCount: updatedReviews.length,
          starsTotal: updatedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0),
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

      // 4. Appel réseau vers l'API serveur avec transmission du reviewId canonique
      try {
        const response = await fetch("/api/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId,
            reviewId,
            createdAt,
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
              // La fusion déduplique automatiquement l'avis optimiste avec l'avis retourné par le serveur
              const merged = mergeRatingsStores(prev, result.store || {});
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
  const summary = calculateRatingSummary(
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
