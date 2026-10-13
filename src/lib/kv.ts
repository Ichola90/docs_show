import { kv } from "@vercel/kv";

export const isKvConfigured = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

export type CommunityRating = {
  votesCount: number;
  starsTotal: number;
};

export type CommunityRatingsMap = Record<string, CommunityRating>;

export const RATINGS_VOTES_KEY = "docs_show:ratings:votes";
export const RATINGS_STARS_KEY = "docs_show:ratings:stars";

export { kv };

