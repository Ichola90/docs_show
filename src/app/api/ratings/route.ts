import { NextResponse } from "next/server";
import { getBookSummaryById } from "@/data/books";
import {
  getBookRatingSummaries,
  saveBookRating,
} from "@/data/book-ratings";

export async function GET() {
  try {
    return NextResponse.json(await getBookRatingSummaries(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to load book ratings.", error);
    return NextResponse.json(
      { error: "Les évaluations ne peuvent pas être chargées pour le moment." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "La demande d’évaluation est invalide." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("bookId" in body) ||
    typeof body.bookId !== "string" ||
    !("clientId" in body) ||
    typeof body.clientId !== "string" ||
    !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
      body.clientId,
    ) ||
    !("rating" in body) ||
    typeof body.rating !== "number" ||
    !Number.isInteger(body.rating) ||
    body.rating < 1 ||
    body.rating > 5
  ) {
    return NextResponse.json(
      { error: "Choisissez une note de 1 à 5 étoiles." },
      { status: 400 },
    );
  }

  const book = getBookSummaryById(body.bookId);
  if (!book) {
    return NextResponse.json(
      { error: "Ce livre n’existe pas dans le catalogue." },
      { status: 404 },
    );
  }

  try {
    const summary = await saveBookRating(book, body.clientId, body.rating);
    return NextResponse.json(summary);
  } catch (error) {
    console.error(`Failed to save a rating for book "${book.id}".`, error);
    return NextResponse.json(
      { error: "Votre note n’a pas pu être enregistrée." },
      { status: 500 },
    );
  }
}
