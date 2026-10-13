import { NextRequest, NextResponse } from "next/server";
import { parsePdfToBook, type UploadBookPayload } from "@/lib/pdf-book-parser";
import { saveCustomBook } from "@/lib/custom-books-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("pdf") as File | null;
    const title = (formData.get("title") as string)?.trim();
    const subtitle = (formData.get("subtitle") as string)?.trim() || "";
    const author = (formData.get("author") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const level = (formData.get("level") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const coverAccent = (formData.get("coverAccent") as string)?.trim() || "#6366f1";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Veuillez sélectionner un fichier PDF à importer." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Le fichier doit être au format .pdf valide." },
        { status: 400 }
      );
    }

    // Limite de taille à 25 Mo pour préserver la mémoire du serveur
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Le fichier PDF dépasse la taille maximale autorisée (25 Mo)." },
        { status: 400 }
      );
    }

    if (!title || title.length < 2) {
      return NextResponse.json(
        { success: false, error: "Le titre du livre est obligatoire (au moins 2 caractères)." },
        { status: 400 }
      );
    }

    if (!author || author.length < 2) {
      return NextResponse.json(
        { success: false, error: "Le nom de l’auteur est obligatoire." },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Veuillez renseigner un domaine / une catégorie." },
        { status: 400 }
      );
    }

    if (!level || !["Débutant", "Intermédiaire", "Avancé"].includes(level)) {
      return NextResponse.json(
        { success: false, error: "Le niveau doit être Débutant, Intermédiaire ou Avancé." },
        { status: 400 }
      );
    }

    if (!description || description.length < 10) {
      return NextResponse.json(
        { success: false, error: "Veuillez fournir un résumé d'au moins 10 caractères." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const payload: UploadBookPayload = {
      title,
      subtitle: subtitle || `Guide complet pour apprendre ${title}`,
      author,
      category,
      level: level as "Débutant" | "Intermédiaire" | "Avancé",
      description,
      coverAccent,
    };

    const book = await parsePdfToBook(buffer, payload);
    await saveCustomBook(book);

    return NextResponse.json({
      success: true,
      message: "Livre généré et publié avec succès !",
      bookId: book.id,
      bookTitle: book.title,
      pagesCount: book.pages,
      chaptersCount: book.chapters.length,
    });
  } catch (error) {
    console.error("Erreur lors de l'analyse ou de la création du livre PDF :", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Une erreur inattendue est survenue lors de l'analyse du PDF.",
      },
      { status: 500 }
    );
  }
}

