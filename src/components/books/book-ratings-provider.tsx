"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { BookRatingSummary } from "@/data/book-ratings";

type BookRatingsContextValue = {
  ratings: Record<string, BookRatingSummary>;
  error: string | null;
  submitRating: (
    bookId: string,
    rating: number,
    clientId: string,
  ) => Promise<BookRatingSummary>;
};

const BookRatingsContext = createContext<BookRatingsContextValue | null>(null);

function isRatingSummary(value: unknown): value is BookRatingSummary {
  return (
    typeof value === "object" &&
    value !== null &&
    "rating" in value &&
    (typeof value.rating === "string" || value.rating === null) &&
    "count" in value &&
    typeof value.count === "number" &&
    Number.isInteger(value.count) &&
    value.count >= 0
  );
}

export function BookRatingsProvider({ children }: { children: ReactNode }) {
  const [ratings, setRatings] = useState<
    Record<string, BookRatingSummary>
  >({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRatings() {
      try {
        const response = await fetch("/api/ratings", { cache: "no-store" });
        const result: unknown = await response.json();

        if (!response.ok || typeof result !== "object" || result === null) {
          throw new Error("Les notes partagées sont indisponibles.");
        }

        const validRatings = Object.fromEntries(
          Object.entries(result).filter((entry): entry is [string, BookRatingSummary] =>
            isRatingSummary(entry[1]),
          ),
        );

        if (active) {
          setRatings(validRatings);
          setError(null);
        }
      } catch {
        if (active) {
          setError("Les notes partagées n’ont pas pu être actualisées.");
        }
      }
    }

    void loadRatings();
    return () => {
      active = false;
    };
  }, []);

  const submitRating = useCallback(
    async (bookId: string, rating: number, clientId: string) => {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, rating, clientId }),
      });
      const result: unknown = await response.json();

      if (!response.ok || !isRatingSummary(result)) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Votre note n’a pas pu être enregistrée.";
        throw new Error(message);
      }

      setRatings((currentRatings) => ({
        ...currentRatings,
        [bookId]: result,
      }));
      setError(null);
      return result;
    },
    [],
  );

  return (
    <BookRatingsContext.Provider value={{ ratings, error, submitRating }}>
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
  const sharedRating = context?.ratings[bookId];

  return {
    rating: sharedRating?.rating ?? initialRating,
    count: sharedRating?.count ?? initialCount,
    submitRating: context?.submitRating,
  };
}
