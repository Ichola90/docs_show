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

  // 1. Charger les votes locaux de la machine
  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      try {
        const storedRatings = localStorage.getItem(RATINGS_STORAGE_KEY);
        if (storedRatings !== null) {
          const parsed: unknown = JSON.parse(storedRatings);
          if (isStoredRatings(parsed)) {
            setRatings(parsed);
          }
        }
      } catch (loadError) {
        console.error("Impossible de charger les notes locales:", loadError);
      } finally {
        setReady(true);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  // 2. Charger le store JSON global depuis l'API
  useEffect(() => {
    let isCancelled = false;

    async function fetchJsonStore() {
      try {
        const response = await fetch("/api/ratings");
        if (!response.ok) return;

        const data: {
          success?: boolean;
          store?: RatingsStore;
        } = await response.json();

        if (isCancelled) return;

        if (data.store && typeof data.store === "object") {
          setStore(data.store);
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

      // 1. Mise à jour optimiste du store local
      const optimisticReview: BookReview = {
        id: `temp_${Date.now()}`,
        name: trimmedName,
        rating,
        comment: comment?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      setStore((prev) => {
        const current = prev[bookId] ?? {
          votesCount: 0,
          starsTotal: 0,
          reviews: [],
        };
        return {
          ...prev,
          [bookId]: {
            votesCount: current.votesCount + 1,
            starsTotal: current.starsTotal + rating,
            reviews: [optimisticReview, ...(current.reviews || [])],
          },
        };
      });

      // 2. Enregistrement du vote local dans le navigateur
      const updatedRatings = { ...ratings, [bookId]: rating };
      try {
        localStorage.setItem(
          RATINGS_STORAGE_KEY,
          JSON.stringify(updatedRatings),
        );
      } catch (saveError) {
        console.warn("Erreur sauvegarde locale:", saveError);
      }
      setRatings(updatedRatings);

      // 3. Appel de l'API pour persister dans le fichier JSON
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
            setStore(result.store);
          }
        }
      } catch (apiError) {
        console.error("Erreur de synchronisation avec le fichier JSON:", apiError);
        setError("Votre avis a été enregistré localement.");
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
