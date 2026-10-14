import { NextResponse } from "next/server";
import {
  getRatingsStore,
  addReviewToStore,
} from "@/lib/json-ratings-store";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

// Nettoie les caractères de contrôle non imprimables
function sanitizeText(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

export async function GET() {
  try {
    const store = await getRatingsStore();
    return NextResponse.json(
      {
        success: true,
        store,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err) {
    console.error("Erreur lors de la lecture du fichier JSON:", err);
    return NextResponse.json(
      {
        success: false,
        store: {},
        error: "Impossible de charger le fichier JSON des avis.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

export async function POST(request: Request) {
  // 1. Rate limiting : max 30 avis par minute par IP
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`rating:${clientIp}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Trop de requêtes. Veuillez patienter ${rateLimit.retryAfterSeconds} secondes.` },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }


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

  const { bookId, reviewId, createdAt, name, rating, comment } = body as {
    bookId: unknown;
    reviewId?: unknown;
    createdAt?: unknown;
    name?: unknown;
    rating: unknown;
    comment?: unknown;
  };

  // 2. Validation stricte du bookId (anti-pollution de prototype et injection)
  if (
    typeof bookId !== "string" ||
    !/^[a-zA-Z0-9_-]{2,80}$/.test(bookId) ||
    ["__proto__", "constructor", "prototype"].includes(bookId)
  ) {
    return NextResponse.json(
      { error: "Identifiant de livre (bookId) invalide." },
      { status: 400 }
    );
  }

  // Validation optionnelle du reviewId (pour synchronisation optimiste sans doublon)
  let validReviewId: string | undefined = undefined;
  if (typeof reviewId === "string" && /^rev_[a-zA-Z0-9_-]{5,60}$/.test(reviewId)) {
    validReviewId = reviewId;
  }

  // Validation optionnelle de la date de création
  let validCreatedAt: string | undefined = undefined;
  if (typeof createdAt === "string" && !Number.isNaN(new Date(createdAt).getTime())) {
    validCreatedAt = createdAt;
  }

  // 3. Validation et limitation du nom de l'auteur
  let reviewerName = "Lecteur passionné";
  if (typeof name === "string") {
    const cleaned = sanitizeText(name);
    if (cleaned.length > 0) {
      if (cleaned.length > 60) {
        return NextResponse.json(
          { error: "Le nom ne doit pas dépasser 60 caractères." },
          { status: 400 }
        );
      }
      reviewerName = cleaned;
    }
  }

  // 4. Validation de la note
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "La note doit être un nombre entier compris entre 1 et 5." },
      { status: 400 }
    );
  }

  // 5. Validation et limitation du commentaire (max 200 caractères)
  let reviewComment: string | undefined = undefined;
  if (typeof comment === "string") {
    const cleaned = sanitizeText(comment);
    if (cleaned.length > 0) {
      if (cleaned.length > 200) {
        return NextResponse.json(
          { error: "La description ne doit pas dépasser 200 caractères." },
          { status: 400 }
        );
      }
      reviewComment = cleaned;
    }
  }

  try {
    const { stats, store } = await addReviewToStore(bookId, {
      id: validReviewId,
      createdAt: validCreatedAt,
      name: reviewerName,
      rating,
      comment: reviewComment,
    });

    return NextResponse.json(
      {
        success: true,
        bookId,
        stats,
        store,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Erreur d'enregistrement dans le JSON:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de l'avis dans le fichier JSON." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
