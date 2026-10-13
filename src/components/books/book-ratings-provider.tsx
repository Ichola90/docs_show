"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CommunityRating, CommunityRatingsMap } from "@/lib/kv";

const RATINGS_STORAGE_KEY = "atelier:ratings:v1";

type BookRatingSummary = {
  rating: string | null;
  count: number;
};

type BookRatingsContextValue = {
  ratings: Record<string, number>;
  communityRatings: CommunityRatingsMap;
  isLive: boolean;
  ready: boolean;
  error: string | null;
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
  community?: CommunityRating,
  userRating?: number,
): BookRatingSummary {
  const parsedInitialRating = Number.parseFloat(
    initialRating.replace(",", "."),
  );
  const validInitialRating =
    initialCount > 0 && Number.isFinite(parsedInitialRating)
      ? parsedInitialRating
      : 0;

  const communityVotes = community?.votesCount ?? 0;
  const communityStars = community?.starsTotal ?? 0;

  let totalVotes = initialCount + communityVotes;
  let totalStars = validInitialRating * initialCount + communityStars;

  // Fallback if KV is not active and no community votes recorded yet, but user voted locally
  if (communityVotes === 0 && userRating !== undefined) {
    totalVotes += 1;
    totalStars += userRating;
  }

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
  const [communityRatings, setCommunityRatings] = useState<CommunityRatingsMap>(
    {},
  );
  const [isLive, setIsLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Initialise local stored votes
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

  // 2. Fetch live community ratings from /api/ratings (backed by Vercel KV)
  useEffect(() => {
    let isCancelled = false;

    async function fetchCommunityRatings() {
      try {
        const response = await fetch("/api/ratings");
        if (!response.ok) return;

        const data: {
          configured?: boolean;
          ratings?: CommunityRatingsMap;
        } = await response.json();

        if (isCancelled) return;

        if (data.configured) {
          setIsLive(true);
        }
        if (data.ratings && typeof data.ratings === "object") {
          setCommunityRatings(data.ratings);
        }
      } catch (fetchErr) {
        // Silently degrade to local storage without disrupting UI
        console.info("Using local ratings mode (API sync inactive).", fetchErr);
      }
    }

    void fetchCommunityRatings();

    return () => {
      isCancelled = true;
    };
  }, []);

  const submitRating = useCallback(
    async (bookId: string, rating: number) => {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Choisissez une note de 1 à 5 étoiles.");
      }

      // Update local storage so user cannot vote twice in the current browser
      const updatedRatings = { ...ratings, [bookId]: rating };
      try {
        localStorage.setItem(
          RATINGS_STORAGE_KEY,
          JSON.stringify(updatedRatings),
        );
      } catch (saveError) {
        console.error(
          `Failed to save a local rating for "${bookId}".`,
          saveError,
        );
      }
      setRatings(updatedRatings);

      // Optimistic update of community ratings
      setCommunityRatings((prev) => {
        const current = prev[bookId] ?? { votesCount: 0, starsTotal: 0 };
        return {
          ...prev,
          [bookId]: {
            votesCount: current.votesCount + 1,
            starsTotal: current.starsTotal + rating,
          },
        };
      });

      // Persist to Vercel KV via API
      try {
        const response = await fetch("/api/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId, rating }),
        });

        if (response.ok) {
          const result: {
            configured?: boolean;
            votesCount?: number;
            starsTotal?: number;
          } = await response.json();

          if (result.configured && typeof result.votesCount === "number") {
            setCommunityRatings((prev) => ({
              ...prev,
              [bookId]: {
                votesCount: result.votesCount!,
                starsTotal: result.starsTotal ?? 0,
              },
            }));
          }
        }
      } catch (remoteError) {
        console.warn("Could not synchronize vote to Vercel KV:", remoteError);
      }
    },
    [ratings],
  );

  return (
    <BookRatingsContext.Provider
      value={{
        ratings,
        communityRatings,
        isLive,
        ready,
        error,
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
  const community = context?.communityRatings[bookId];
  const summary = summarizeRating(
    initialRating,
    initialCount,
    community,
    userRating,
  );

  return {
    rating: summary.rating ?? initialRating,
    count: summary.count,
    userRating,
    isLive: context?.isLive ?? false,
    ready: context?.ready ?? false,
    submitRating: context?.submitRating,
  };
}
