import { NextResponse } from "next/server";
import { getAllBooksWithCustom } from "@/data/book-content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const books = await getAllBooksWithCustom();
    return NextResponse.json({ success: true, books });
  } catch (error) {
    console.error("Erreur lors de la récupération des livres :", error);
    return NextResponse.json(
      { success: false, error: "Impossible de récupérer les livres." },
      { status: 500 }
    );
  }
}

