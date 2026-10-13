import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { PDFParse } from "pdf-parse";
import type { Book, BookChapter, BookPage, BookPageBlock } from "@/data/books";

let workerInitialized = false;

function ensurePdfWorker() {
  if (workerInitialized) return;

  const candidatePaths = [
    path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs"),
    path.join(process.cwd(), "node_modules", "pdf-parse", "dist", "pdf-parse", "cjs", "pdf.worker.mjs"),
    path.join(process.cwd(), "node_modules", "pdf-parse", "dist", "worker", "pdf.worker.mjs"),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
      try {
        const fileUrl = pathToFileURL(candidate).href;
        PDFParse.setWorker(fileUrl);
        workerInitialized = true;
        break;
      } catch {
        // continue
      }
    }
  }
}

export type UploadBookPayload = {
  title: string;
  subtitle: string;
  author: string;
  category: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  description: string;
  coverAccent?: string;
};

function getCoverType(category: string): "code" | "system" | "architecture" | "data" {
  const c = category.toLowerCase();
  if (c.includes("système") || c.includes("c") || c.includes("embarqué")) return "system";
  if (c.includes("archi") || c.includes("cloud") || c.includes("devops")) return "architecture";
  if (c.includes("data") || c.includes("ia") || c.includes("données")) return "data";
  return "code";
}

export async function parsePdfToBook(
  pdfBuffer: Buffer,
  meta: UploadBookPayload
): Promise<Book> {
  ensurePdfWorker();
  const parser = new PDFParse({ data: pdfBuffer });
  const textResult = await parser.getText();
  await parser.destroy();

  const rawPages = textResult.pages || [];
  const totalPagesCount = textResult.total || rawPages.length || 1;

  if (totalPagesCount > 500) {
    throw new Error("Le document PDF dépasse la limite de 500 pages autorisées.");
  }

  // 1. Découpage et structuration page par page
  const structuredPages: BookPage[] = rawPages.map((p) => {
    const rawLines = (p.text || "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const blocks: BookPageBlock[] = [];
    let currentParagraph: string[] = [];

    for (const line of rawLines) {
      const isHeading =
        line.length < 80 &&
        (/^(chapitre|partie|module|section|annexe|\d+\.|\bintroduction\b|\bconclusion\b|\bsommaire\b)/i.test(line) ||
          (line === line.toUpperCase() && line.length > 3 && line.length < 60));

      const isCode =
        line.startsWith("    ") ||
        line.startsWith("\t") ||
        /^(const |let |var |function |class |import |export |def |public |private |int |void |#include|<\?php|SELECT |FROM |WHERE |UPDATE |INSERT )/.test(line);

      if (isHeading) {
        if (currentParagraph.length > 0) {
          blocks.push({ type: "paragraph", text: currentParagraph.join(" ") });
          currentParagraph = [];
        }
        blocks.push({ type: "heading", text: line });
      } else if (isCode) {
        if (currentParagraph.length > 0) {
          blocks.push({ type: "paragraph", text: currentParagraph.join(" ") });
          currentParagraph = [];
        }
        blocks.push({ type: "code", text: line });
      } else {
        currentParagraph.push(line);
      }
    }

    if (currentParagraph.length > 0) {
      blocks.push({ type: "paragraph", text: currentParagraph.join(" ") });
    }

    return {
      number: p.num,
      blocks: blocks.length > 0 ? blocks : [{ type: "paragraph", text: p.text || "Page sans texte." }],
    };
  });

  // 2. Découpage intelligent en Chapitres
  const chapters: BookChapter[] = [];
  let currentChapter: BookChapter = {
    title: "Introduction",
    part: meta.category,
    pages: [],
  };

  // Taille maximale de pages par chapitre par défaut
  const pagesPerChapter = Math.max(3, Math.ceil(structuredPages.length / 8));

  for (let i = 0; i < structuredPages.length; i++) {
    const page = structuredPages[i];
    const firstHeading = page.blocks.find((b) => b.type === "heading");

    const shouldStartNewChapter =
      (firstHeading &&
        firstHeading.text.length < 60 &&
        /^(chapitre|partie|module|section|\bintroduction\b|\bsommaire\b)/i.test(firstHeading.text)) ||
      (currentChapter.pages && currentChapter.pages.length >= pagesPerChapter);

    if (shouldStartNewChapter && currentChapter.pages && currentChapter.pages.length > 0) {
      chapters.push(currentChapter);
      const title = firstHeading ? firstHeading.text : `Section ${chapters.length + 1}`;
      currentChapter = {
        title,
        part: `Étape ${String(chapters.length + 1).padStart(2, "0")}`,
        pages: [page],
      };
    } else {
      if (!currentChapter.pages) currentChapter.pages = [];
      currentChapter.pages.push(page);
    }
  }

  if (currentChapter.pages && currentChapter.pages.length > 0) {
    chapters.push(currentChapter);
  }

  // 3. Génération de l'identifiant URL (slug)
  const baseSlug = meta.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const safeSlug = (baseSlug.length > 0 ? baseSlug : "livre").slice(0, 50);
  const id = `${safeSlug}-${Math.random().toString(36).substring(2, 7)}`;

  // 4. Texte de la couverture
  const words = meta.title.toUpperCase().split(" ");
  const coverText = words.slice(0, 3).join("\n");

  // 5. Quiz interactif automatique
  const book: Book = {
    id,
    title: meta.title.trim(),
    subtitle: meta.subtitle.trim(),
    author: meta.author.trim(),
    category: meta.category.trim(),
    level: meta.level,
    duration: `~${Math.ceil(totalPagesCount * 1.5)} min`,
    pages: `${totalPagesCount} pages`,
    rating: "Nouveau",
    reviewCount: 0,
    cover: getCoverType(meta.category),
    coverAccent: meta.coverAccent || "#d9e6ff",
    coverText,
    description: meta.description.trim(),
    chapters,
    hasReader: true,
    quiz: {
      questions: [
        {
          type: "choice",
          question: `Quel est l'objectif central abordé dans « ${meta.title} » ?`,
          answers: [
            meta.subtitle || `Maîtriser les principes clés de ${meta.category}`,
            "Remplacer les concepts sans méthodologie",
            "Mémoriser du code sans mise en application",
          ],
          correctAnswer: 0,
          explanation: `L'ouvrage propose un parcours structuré rédigé par ${meta.author} pour comprendre et appliquer ${meta.category}.`,
        },
        {
          type: "choice",
          question: `À quel public ce livre s'adresse-t-il en priorité ?`,
          answers: [
            `Profil ${meta.level}`,
            meta.level === "Débutant" ? "Uniquement aux experts de 10 ans d'expérience" : "Aux personnes sans aucune base tech",
            "Aucun profil ciblé",
          ],
          correctAnswer: 0,
          explanation: `Le contenu et les exercices ont été adaptés pour un niveau ${meta.level}.`,
        },
        {
          type: "text",
          question: "Quel est le nom de l'auteur de ce livre ?",
          acceptedAnswers: [meta.author.toLowerCase(), meta.author],
          placeholder: "Nom de l'auteur",
          explanation: `Ce livre est écrit par ${meta.author}.`,
        },
      ],
    },
  };

  return book;
}
