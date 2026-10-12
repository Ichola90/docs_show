"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const RATINGS_STORAGE_KEY = "atelier:ratings:v1";

type BookRatingSummary = {
  rating: string | null;
  count: number;
};

type BookRatingsContextValue = {
  ratings: Record<string, number>;
  ready: boolean;
  error: string | null;
  submitRating: (
    bookId: string,
    rating: number,
  ) => Promise<void>;
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
  userRating?: number,
): BookRatingSummary {
  if (userRating === undefined) {
    return {
      rating: initialCount > 0 ? initialRating : null,
      count: initialCount,
    };
  }

  const parsedInitialRating = Number.parseFloat(initialRating.replace(",", "."));
  const validInitialRating =
    initialCount > 0 && Number.isFinite(parsedInitialRating)
      ? parsedInitialRating
      : 0;
  const count = initialCount + 1;
  const totalRating = validInitialRating * initialCount + userRating;

  return {
    rating: (totalRating / count).toFixed(1).replace(".", ","),
    count,
  };
}

export function BookRatingsProvider({ children }: { children: ReactNode }) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      try {
        const storedRatings = localStorage.getItem(RATINGS_STORAGE_KEY);
        if (storedRatings !== null) {
          const parsed: unknown = JSON.parse(storedRatings);
          if (!isStoredRatings(parsed)) {
            throw new Error("Les évaluations locales ont un format invalide.");
          }
          setRatings(parsed);
        }
      } catch (loadError) {
        console.error("Failed to load local book ratings.", loadError);
        setError(
          "Les évaluations locales ne sont pas accessibles dans ce navigateur.",
        );
      } finally {
        setReady(true);
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const submitRating = useCallback(
    async (bookId: string, rating: number) => {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Choisissez une note de 1 à 5 étoiles.");
      }

      const updatedRatings = { ...ratings, [bookId]: rating };
      try {
        localStorage.setItem(
          RATINGS_STORAGE_KEY,
          JSON.stringify(updatedRatings),
        );
      } catch (saveError) {
        console.error(`Failed to save a local rating for "${bookId}".`, saveError);
        throw new Error(
          "Votre note n’a pas pu être enregistrée dans ce navigateur.",
        );
      }

      setRatings(updatedRatings);
    },
    [ratings],
  );

  return (
    <BookRatingsContext.Provider
      value={{ ratings, ready, error, submitRating }}
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
  const summary = summarizeRating(initialRating, initialCount, userRating);

  return {
    rating: summary.rating ?? initialRating,
    count: summary.count,
    userRating,
    ready: context?.ready ?? false,
    submitRating: context?.submitRating,
  };
}
