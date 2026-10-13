import { NextResponse } from "next/server";
import {
  kv,
  isKvConfigured,
  RATINGS_VOTES_KEY,
  RATINGS_STARS_KEY,
  type CommunityRatingsMap,
} from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isKvConfigured) {
    return NextResponse.json({
      configured: false,
      ratings: {} as CommunityRatingsMap,
    });
  }

  try {
    const [votesMap, starsMap] = await Promise.all([
      kv.hgetall<Record<string, number>>(RATINGS_VOTES_KEY),
      kv.hgetall<Record<string, number>>(RATINGS_STARS_KEY),
    ]);

    const ratings: CommunityRatingsMap = {};
    if (votesMap) {
      for (const [id, count] of Object.entries(votesMap)) {
        ratings[id] = {
          votesCount: Number(count) || 0,
          starsTotal: Number(starsMap?.[id]) || 0,
        };
      }
    }

    return NextResponse.json({
      configured: true,
      ratings,
    });
  } catch (err) {
    console.error("Vercel KV ratings fetch error:", err);
    return NextResponse.json(
      {
        configured: false,
        ratings: {} as CommunityRatingsMap,
        error: "Erreur lors de la récupération des notes KV",
      },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Requête invalide (JSON attendu)." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("bookId" in body) ||
    !("rating" in body)
  ) {
    return NextResponse.json(
      { error: "Les champs bookId et rating sont requis." },
      { status: 400 }
    );
  }

  const { bookId, rating } = body as { bookId: unknown; rating: unknown };

  if (typeof bookId !== "string" || !bookId.trim()) {
    return NextResponse.json(
      { error: "Identifiant de livre (bookId) invalide." },
      { status: 400 }
    );
  }

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "La note doit être un entier entre 1 et 5." },
      { status: 400 }
    );
  }

  if (!isKvConfigured) {
    return NextResponse.json({
      configured: false,
      bookId,
      rating,
      votesCount: 1,
      starsTotal: rating,
      message: "Vercel KV non configuré. Mode local actif.",
    });
  }

  try {
    const [votesCount, starsTotal] = await Promise.all([
      kv.hincrby(RATINGS_VOTES_KEY, bookId, 1),
      kv.hincrby(RATINGS_STARS_KEY, bookId, rating),
    ]);

    return NextResponse.json({
      configured: true,
      bookId,
      rating,
      votesCount,
      starsTotal,
    });
  } catch (err) {
    console.error("Vercel KV ratings update error:", err);
    return NextResponse.json(
      { error: "Impossible de persister la note sur Vercel KV." },
      { status: 500 }
    );
  }
}

