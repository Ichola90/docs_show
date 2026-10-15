"use client";

import { useState, useRef, useTransition, type DragEvent, type ChangeEvent } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { BookCover } from "@/components/books/book-cover";
import type { Book } from "@/data/books";

const POPULAR_CATEGORIES = [
  "Développement",
  "Systèmes & Bas niveau",
  "Architecture & Cloud",
  "Intelligence Artificielle",
  "Data & Bases de données",
  "DevOps & Sécurité",
  "Produit & Management",
];

const ACCENT_COLORS = [
  { label: "Bleu ciel", value: "#d9e6ff" },
  { label: "Indigo", value: "#e0e7ff" },
  { label: "Violet", value: "#ede9fe" },
  { label: "Émeraude", value: "#dcfce7" },
  { label: "Ambre", value: "#fef3c7" },
  { label: "Corail", value: "#ffe4e6" },
];

export function PublishBookForm() {
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState(POPULAR_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [level, setLevel] = useState<"Débutant" | "Intermédiaire" | "Avancé">("Débutant");
  const [coverAccent, setCoverAccent] = useState(ACCENT_COLORS[0].value);
  const [description, setDescription] = useState("");

  // UI / validation states
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Result state
  const [createdBook, setCreatedBook] = useState<{
    bookId: string;
    bookTitle: string;
    pagesCount: string;
    chaptersCount: number;
  } | null>(null);

  const effectiveCategory = category === "Autre" ? customCategory.trim() || "Général" : category;

  // Mock Book preview object
  const previewBook: Book = {
    id: "preview-book",
    title: title.trim() || "Titre de votre livre",
    subtitle: subtitle.trim() || "Sous-titre et promesse pédagogique de l'ouvrage",
    author: author.trim() || "Nom de l'auteur",
    category: effectiveCategory,
    level,
    duration: file ? `~${Math.max(15, Math.round(file.size / (1024 * 50)))} min` : "~45 min",
    pages: file ? "Extraction..." : "0 pages",
    rating: "Nouveau",
    reviewCount: 0,
    cover: effectiveCategory.toLowerCase().includes("système")
      ? "system"
      : effectiveCategory.toLowerCase().includes("data")
      ? "data"
      : "code",
    coverAccent,
    coverText: (title.trim() || "MON LIVRE TECH").toUpperCase().split(" ").slice(0, 3).join("\n"),
    description: description.trim() || "Le résumé de votre ouvrage technique apparaîtra ici avec ses principaux points d'apprentissage...",
    chapters: [],
    hasReader: true,
    quiz: { questions: [] },
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setErrors((prev) => ({ ...prev, file: "Le fichier doit être au format PDF (.pdf)." }));
      return;
    }
    const MAX_ALLOWED_BYTES = 4.5 * 1024 * 1024;
    if (selectedFile.size > MAX_ALLOWED_BYTES) {
      const fileSizeMb = (selectedFile.size / (1024 * 1024)).toFixed(1);
      setErrors((prev) => ({
        ...prev,
        file: `Le fichier sélectionné fait ${fileSizeMb} Mo. La taille maximale autorisée sur le serveur est de 4.5 Mo (vous pouvez compresser votre PDF en quelques secondes via un outil gratuit comme iLovePDF ou Smallpdf).`,
      }));
      return;
    }

    setFile(selectedFile);
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.file;
      return updated;
    });

    // Pré-remplissage intelligent du titre à partir du nom du fichier
    if (!title) {
      const cleanName = selectedFile.name
        .replace(/\.pdf$/i, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
      setTitle(cleanName);
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!file) {
      errs.file = "Veuillez sélectionner un fichier PDF à importer.";
    }
    if (!title.trim() || title.trim().length < 2) {
      errs.title = "Le titre doit comporter au moins 2 caractères.";
    } else if (title.trim().length > 120) {
      errs.title = "Le titre ne doit pas dépasser 120 caractères.";
    }
    if (!author.trim() || author.trim().length < 2) {
      errs.author = "Le nom de l'auteur est obligatoire (min 2 caractères).";
    }
    if (category === "Autre" && (!customCategory.trim() || customCategory.trim().length < 2)) {
      errs.category = "Veuillez préciser la thématique de votre ouvrage.";
    }
    if (!description.trim() || description.trim().length < 10) {
      errs.description = "Le résumé doit comporter au moins 10 caractères.";
    } else if (description.trim().length > 400) {
      errs.description = "Le résumé ne doit pas dépasser 400 caractères.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validateForm()) return;
    if (!file) return;

    setIsSubmitting(true);
    setUploadStep("Préparation du document et envoi...");

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("title", title.trim());
      formData.append("subtitle", subtitle.trim());
      formData.append("author", author.trim());
      formData.append("category", effectiveCategory);
      formData.append("level", level);
      formData.append("coverAccent", coverAccent);
      formData.append("description", description.trim());

      setUploadStep("Extraction automatique du texte et structuration des chapitres...");

      const response = await fetch("/api/books/upload", {
        method: "POST",
        body: formData,
      });

      let data: {
        success?: boolean;
        error?: string;
        bookId: string;
        bookTitle: string;
        pagesCount: string;
        chaptersCount: number;
        book?: Book;
      } | null = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          response.status === 413
            ? "Le fichier est trop volumineux pour le serveur (limite de 4.5 Mo sur Vercel). Veuillez compresser votre PDF (ex: via iLovePDF ou Smallpdf) pour qu'il pèse moins de 4.5 Mo avant de l'importer."
            : `Erreur inattendue du serveur (${response.status}).`
        );
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Une erreur est survenue lors de la création du livre.");
      }

      // Sauvegarde immédiate dans localStorage pour affichage instantané et résilience Vercel serverless
      if (data.book) {
        try {
          localStorage.setItem(`docs_show_custom_book_${data.bookId}`, JSON.stringify(data.book));
          const existingListRaw = localStorage.getItem("docs_show_custom_books_list");
          let existingList: Book[] = [];
          if (existingListRaw) {
            try {
              existingList = JSON.parse(existingListRaw);
            } catch {
              existingList = [];
            }
          }
          const filtered = existingList.filter((b) => b.id !== data.bookId);
          filtered.unshift(data.book);
          localStorage.setItem("docs_show_custom_books_list", JSON.stringify(filtered));
        } catch (storageErr) {
          console.warn("Erreur de mise en cache locale:", storageErr);
        }
      }

      setUploadStep("Génération des quiz interactifs et publication terminée !");

      startTransition(() => {
        setCreatedBook({
          bookId: data.bookId,
          bookTitle: data.bookTitle,
          pagesCount: data.pagesCount,
          chaptersCount: data.chaptersCount,
        });
      });
    } catch (err) {
      console.error(err);
      setGlobalError(err instanceof Error ? err.message : "Erreur inattendue lors de l'import.");
    } finally {
      setIsSubmitting(false);
      setUploadStep(null);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setSubtitle("");
    setAuthor("");
    setCategory(POPULAR_CATEGORIES[0]);
    setCustomCategory("");
    setLevel("Débutant");
    setCoverAccent(ACCENT_COLORS[0].value);
    setDescription("");
    setErrors({});
    setGlobalError(null);
    setCreatedBook(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (createdBook) {
    return (
      <div className="publish-success-card">
        <div className="publish-success-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <span className="publish-success-badge">LIVRE PUBLIÉ AVEC SUCCÈS</span>
        <h2>« {createdBook.bookTitle} » est en ligne !</h2>
        <p className="publish-success-intro">
          Le document PDF a été analysé, structuré et transformé en livre web interactif.
          La carte est active dans la bibliothèque, les pages sont prêtes à être lues et le test d’évaluation est configuré.
        </p>

        <div className="publish-success-stats">
          <div className="publish-stat-pill">
            <strong>{createdBook.pagesCount}</strong>
            <span>Pages extraites</span>
          </div>
          <div className="publish-stat-pill">
            <strong>{createdBook.chaptersCount}</strong>
            <span>Chapitres structurés</span>
          </div>
          <div className="publish-stat-pill">
            <strong>Interactif</strong>
            <span>Quiz & Avis activés</span>
          </div>
        </div>

        <div className="publish-success-actions">
          <ActionButton href={`/livres/${createdBook.bookId}`} size="small">
            Découvrir et lire le livre
          </ActionButton>
          <ActionButton href={`/livres/${createdBook.bookId}/test`} variant="secondary" size="small">
            Passer le test
          </ActionButton>
          <ActionButton href="/bibliotheque" variant="quiet" size="small">
            Voir dans la bibliothèque
          </ActionButton>
          <button
            type="button"
            className="publish-another-button"
            onClick={resetForm}
          >
            + Publier un autre livre
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="publish-container">
      <div className="publish-layout">
        {/* Colonne Formulaire */}
        <div className="publish-form-card">
          {/* En-tête de carte style Allomonrep */}
          <div className="publish-card-header">
            <div className="publish-card-header-left">
              <div className="publish-card-header-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                  <path d="m9 16 2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="publish-card-header-title">Fiche de publication du livre</h2>
                <p className="publish-card-header-desc">
                  Renseignez les détails pour générer la version web interactive et le quiz.
                </p>
              </div>
            </div>

            <span className="publish-card-header-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
              </svg>
              Génération automatique
            </span>
          </div>

          {/* Bannière de conseil / aide */}
          <div className="publish-card-callout">
            <svg className="publish-card-callout-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <strong>Conseil de publication :</strong> Importez un document PDF propre et structuré. Notre algorithme identifie les chapitres, isole les blocs de code avec coloration syntaxique et conçoit un questionnaire d’évaluation adapté.
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {globalError && (
              <div className="publish-global-error" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{globalError}</span>
              </div>
            )}

            {/* Section 1: Dropzone PDF */}
            <div className="publish-section-block">
              <label className="publish-block-label">
                Fichier PDF source <span className="req">*</span>
              </label>

              <div
                className={`publish-dropzone${isDragging ? " is-dragging" : ""}${file ? " has-file" : ""}${errors.file ? " is-error" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !file) {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="publish-file-input"
                  onChange={handleFileChange}
                />

                {file ? (
                  <div className="publish-file-preview">
                    <div className="publish-file-icon" aria-hidden="true">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <div className="publish-file-info">
                      <span className="publish-file-name">{file.name}</span>
                      <span className="publish-file-size">
                        ✓ {(file.size / (1024 * 1024)).toFixed(2)} Mo · PDF valide, prêt pour l’analyse
                      </span>
                    </div>
                    <button
                      type="button"
                      className="publish-file-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      title="Supprimer et choisir un autre fichier"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="publish-dropzone-prompt">
                    <div className="publish-upload-icon" aria-hidden="true">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p className="publish-dropzone-main">
                      <strong>Glissez-déposez votre fichier PDF</strong> ou <span className="publish-browse-link">parcourez vos fichiers</span>
                    </p>
                    <span className="publish-dropzone-hint">Document PDF technique (taille maximale : 4.5 Mo)</span>
                  </div>
                )}
              </div>
              {errors.file && (
                <p className="publish-field-error" role="alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.file}
                </p>
              )}
            </div>

            {/* Section 2: Métadonnées */}
            <div className="publish-fields-grid">
              <div className="publish-field">
                <label htmlFor="book-title">
                  Titre du livre <span className="req">*</span>
                </label>
                <input
                  id="book-title"
                  type="text"
                  placeholder="ex: Architecture Web & Cloud Moderne"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  className={errors.title ? "input-has-error" : ""}
                />
                {errors.title && (
                  <p className="publish-field-error" role="alert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="publish-field">
                <label htmlFor="book-author">
                  Nom de l’auteur <span className="req">*</span>
                </label>
                <input
                  id="book-author"
                  type="text"
                  placeholder="ex: Sarah Connor, Ingénieure Systèmes"
                  value={author}
                  onChange={(e) => {
                    setAuthor(e.target.value);
                    if (errors.author) setErrors((prev) => ({ ...prev, author: "" }));
                  }}
                  className={errors.author ? "input-has-error" : ""}
                />
                {errors.author && (
                  <p className="publish-field-error" role="alert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.author}
                  </p>
                )}
              </div>
            </div>

            <div className="publish-field">
              <label htmlFor="book-subtitle">
                Sous-titre ou accroche pédagogique <span className="opt">(optionnel)</span>
              </label>
              <input
                id="book-subtitle"
                type="text"
                placeholder="ex: Concevoir des microservices scalables et résilients en production"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            <div className="publish-fields-grid">
              <div className="publish-field">
                <label htmlFor="book-category">
                  Catégorie / Thématique <span className="req">*</span>
                </label>
                <select
                  id="book-category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                >
                  {POPULAR_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Autre">Autre (préciser)...</option>
                </select>
                {category === "Autre" && (
                  <input
                    type="text"
                    placeholder="Précisez votre thématique..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{ marginTop: "8px" }}
                    className={errors.category ? "input-has-error" : ""}
                  />
                )}
                {errors.category && (
                  <p className="publish-field-error" role="alert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="publish-field">
                <label>Niveau cible <span className="req">*</span></label>
                <div className="publish-level-pills" role="radiogroup" aria-label="Niveau du livre">
                  {(["Débutant", "Intermédiaire", "Avancé"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      role="radio"
                      aria-checked={level === lvl}
                      className={`publish-level-pill${level === lvl ? " is-selected" : ""}`}
                      onClick={() => setLevel(lvl)}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Couleurs de couverture */}
            <div className="publish-field">
              <label>Teinte de la couverture</label>
              <div className="publish-color-palette" role="radiogroup" aria-label="Couleur de couverture">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={coverAccent === c.value}
                    className={`publish-color-swatch${coverAccent === c.value ? " is-selected" : ""}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setCoverAccent(c.value)}
                    title={c.label}
                  >
                    {coverAccent === c.value && <span className="swatch-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Résumé */}
            <div className="publish-field">
              <div className="publish-field-header">
                <label htmlFor="book-description">
                  Résumé du livre <span className="req">*</span>
                </label>
                <span className={`publish-char-counter${description.length > 400 ? " is-over" : ""}`}>
                  {description.length} / 400
                </span>
              </div>
              <textarea
                id="book-description"
                rows={3}
                placeholder="Présentez les acquis pratiques, les technologies abordées et les cas d’usage concrets développés dans cet ouvrage..."
                value={description}
                maxLength={400}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                }}
                className={errors.description ? "input-has-error" : ""}
              />
              {errors.description && (
                <p className="publish-field-error" role="alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Boutons d'action centrés (style Allomonrep & reader next) */}
            <div className="publish-actions-centered">
              <ActionButton
                type="submit"
                disabled={isSubmitting}
                size="small"
                className="publish-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    Traitement et génération en cours…
                  </>
                ) : (
                  "Générer et publier le livre"
                )}
              </ActionButton>
              {file && !isSubmitting && (
                <button
                  type="button"
                  className="publish-reset-btn"
                  onClick={resetForm}
                >
                  Effacer
                </button>
              )}
            </div>

            {isSubmitting && uploadStep && (
              <div className="publish-progress-block">
                <div className="publish-progress-spinner" />
                <p className="publish-progress-step">{uploadStep}</p>
                <span className="publish-progress-note">
                  Extraction page par page, identification des titres, découpage du code et création des quiz.
                </span>
              </div>
            )}
          </form>
        </div>

        {/* Colonne Aperçu en direct */}
        <aside className="publish-preview-column" aria-label="Aperçu en direct de la carte">
          <div className="publish-preview-sticky">
            <div className="publish-preview-header">
              <span className="publish-preview-badge">APERÇU EN DIRECT</span>
              <h3>Affichage dans la bibliothèque</h3>
            </div>

            <div className="publish-mock-card">
              <article className="book-card">
                <div className="book-card-cover-reveal">
                  <div className="cover-button">
                    <BookCover book={previewBook} />
                  </div>
                </div>
                <div className="book-card-info-reveal">
                  <div className="book-card-info">
                    <div className="book-card-meta">
                      <span className="book-card-category">{previewBook.category}</span>
                      <div className="rating">
                        <span className="star star-active">★</span>
                        <span className="rating-score">Nouveau</span>
                      </div>
                    </div>
                    <div className="book-card-heading">
                      <h3>{previewBook.title}</h3>
                    </div>
                    <div className="book-card-description">
                      <p className="book-subtitle">{previewBook.subtitle}</p>
                      <p className="book-description">{previewBook.description}</p>
                    </div>
                    <div className="book-card-footer">
                      <span>{previewBook.level}</span>
                      <span>{previewBook.pages} · {previewBook.duration}</span>
                    </div>
                    <ActionButton
                      className="text-link"
                      variant="quiet"
                      size="small"
                      disabled
                    >
                      Découvrir le livre
                    </ActionButton>
                  </div>
                </div>
              </article>
            </div>

            <p className="publish-preview-explainer">
              Cette carte interactive sera visible immédiatement dans la bibliothèque après génération.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
