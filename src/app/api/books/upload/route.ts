import { NextRequest, NextResponse } from "next/server";
import { parsePdfToBook, type UploadBookPayload } from "@/lib/pdf-book-parser";
import { saveCustomBook } from "@/lib/custom-books-store";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

// Nettoie les caractères de contrôle non imprimables
function sanitizeText(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting : max 5 uploads toutes les 10 minutes par IP
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`upload:${clientIp}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Trop de requêtes. Veuillez patienter ${rateLimit.retryAfterSeconds} secondes avant de retenter un import.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const formData = await request.formData();

    const file = formData.get("pdf") as File | null;
    const rawTitle = (formData.get("title") as string) || "";
    const rawSubtitle = (formData.get("subtitle") as string) || "";
    const rawAuthor = (formData.get("author") as string) || "";
    const rawCategory = (formData.get("category") as string) || "";
    const rawLevel = (formData.get("level") as string) || "";
    const rawDescription = (formData.get("description") as string) || "";
    const rawCoverAccent = (formData.get("coverAccent") as string) || "#6366f1";

    const title = sanitizeText(rawTitle);
    const subtitle = sanitizeText(rawSubtitle);
    const author = sanitizeText(rawAuthor);
    const category = sanitizeText(rawCategory);
    const level = sanitizeText(rawLevel);
    const description = sanitizeText(rawDescription);
    const coverAccent = sanitizeText(rawCoverAccent);

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Veuillez sélectionner un fichier PDF à importer." },
        { status: 400 }
      );
    }

    // 2. Validation d'extension
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Le fichier doit avoir l'extension .pdf." },
        { status: 400 }
      );
    }

    // 3. Limite de taille stricte (4.5 Mo max pour compatibilité Vercel Serverless)
    const MAX_FILE_SIZE = 4.5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Le fichier PDF dépasse la taille maximale autorisée (4.5 Mo pour le déploiement serverless).",
        },
        { status: 400 }
      );
    }

    // 4. Validation stricte des longueurs textuelles
    if (!title || title.length < 2 || title.length > 120) {
      return NextResponse.json(
        { success: false, error: "Le titre doit comporter entre 2 et 120 caractères." },
        { status: 400 }
      );
    }

    if (subtitle.length > 160) {
      return NextResponse.json(
        { success: false, error: "Le sous-titre ne doit pas dépasser 160 caractères." },
        { status: 400 }
      );
    }

    if (!author || author.length < 2 || author.length > 80) {
      return NextResponse.json(
        { success: false, error: "Le nom de l’auteur doit comporter entre 2 et 80 caractères." },
        { status: 400 }
      );
    }

    if (!category || category.length < 2 || category.length > 60) {
      return NextResponse.json(
        { success: false, error: "La catégorie doit comporter entre 2 et 60 caractères." },
        { status: 400 }
      );
    }

    if (!["Débutant", "Intermédiaire", "Avancé"].includes(level)) {
      return NextResponse.json(
        { success: false, error: "Le niveau doit être Débutant, Intermédiaire ou Avancé." },
        { status: 400 }
      );
    }

    if (!description || description.length < 10 || description.length > 400) {
      return NextResponse.json(
        { success: false, error: "Le résumé doit comporter entre 10 et 400 caractères." },
        { status: 400 }
      );
    }

    // Validation du format hexadécimal de couleur
    const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    const safeAccent = hexRegex.test(coverAccent) ? coverAccent : "#6366f1";

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Validation des Magic Bytes (%PDF-)
    if (buffer.length < 5 || buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return NextResponse.json(
        { success: false, error: "Le fichier importé n'est pas un fichier PDF valide (en-tête corrompu)." },
        { status: 400 }
      );
    }

    const payload: UploadBookPayload = {
      title,
      subtitle: subtitle || `Guide complet pour apprendre ${title}`,
      author,
      category,
      level: level as "Débutant" | "Intermédiaire" | "Avancé",
      description,
      coverAccent: safeAccent,
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
