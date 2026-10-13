import { NextResponse } from "next/server";
import {
  getRatingsStore,
  addReviewToStore,
} from "@/lib/json-ratings-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await getRatingsStore();
    return NextResponse.json({
      success: true,
      store,
    });
  } catch (err) {
    console.error("Erreur lors de la lecture du fichier JSON:", err);
    return NextResponse.json(
      {
        success: false,
        store: {},
        error: "Impossible de charger le fichier JSON des avis.",
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

  const { bookId, name, rating, comment } = body as {
    bookId: unknown;
    name?: unknown;
    rating: unknown;
    comment?: unknown;
  };

  if (typeof bookId !== "string" || !bookId.trim()) {
    return NextResponse.json(
      { error: "Identifiant de livre (bookId) invalide." },
      { status: 400 }
    );
  }

  const reviewerName =
    typeof name === "string" && name.trim().length > 0
      ? name.trim()
      : "Lecteur passionné";

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

  const reviewComment =
    typeof comment === "string" && comment.trim().length > 0
      ? comment.trim()
      : undefined;

  try {
    const { stats, store } = await addReviewToStore(bookId, {
      name: reviewerName,
      rating,
      comment: reviewComment,
    });

    return NextResponse.json({
      success: true,
      bookId,
      stats,
      store,
    });
  } catch (err) {
    console.error("Erreur d'enregistrement dans le JSON:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de l'avis dans le fichier JSON." },
      { status: 500 }
    );
  }
}
