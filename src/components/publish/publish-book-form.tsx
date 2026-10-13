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
    subtitle: subtitle.trim() || "Sous-titre et promesse pédagogique",
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
    description: description.trim() || "Le résumé de votre ouvrage s'affichera ici...",
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
    if (selectedFile.size > 20 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: "Le fichier PDF dépasse la taille maximale autorisée (20 Mo)." }));
      return;
    }

    setFile(selectedFile);
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.file;
      return updated;
    });

    // Auto-fill title from filename if title is empty
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
      errs.file = "Veuillez importer le fichier PDF de votre livre.";
    }
    if (!title.trim() || title.trim().length < 2) {
      errs.title = "Le titre doit comporter au moins 2 caractères.";
    }
    if (!author.trim() || author.trim().length < 2) {
      errs.author = "Le nom de l'auteur est obligatoire.";
    }
    if (category === "Autre" && (!customCategory.trim() || customCategory.trim().length < 2)) {
      errs.category = "Veuillez préciser la catégorie de votre livre.";
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

      setUploadStep("Extraction automatique du texte et structuration des pages...");

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
            ? "Le fichier est trop lourd pour le serveur."
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

      setUploadStep("Génération du quiz et publication terminée !");

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
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <span className="publish-success-badge">LIVRE CRÉÉ AVEC SUCCÈS</span>
        <h2>« {createdBook.bookTitle} » est en ligne !</h2>
        <p className="publish-success-intro">
          Le document PDF a été analysé et transformé en livre web interactif.
          La carte a été ajoutée à la bibliothèque, les pages sont prêtes à être lues et le test de connaissances est configuré.
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
          <form onSubmit={handleSubmit} noValidate>
            {globalError && (
              <div className="publish-global-error" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                Fichier PDF du livre <span className="req">*</span>
              </label>

              <div
                className={`publish-dropzone${isDragging ? " is-dragging" : ""}${file ? " has-file" : ""}`}
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
                    <div className="publish-file-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        {(file.size / (1024 * 1024)).toFixed(2)} Mo · PDF prêt pour analyse
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
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p className="publish-dropzone-main">
                      <strong>Glissez-déposez votre fichier PDF</strong> ou <span className="publish-browse-link">parcourez vos fichiers</span>
                    </p>
                    <span className="publish-dropzone-hint">Format PDF uniquement (max 20 Mo)</span>
                  </div>
                )}
              </div>
              {errors.file && <span className="field-error-message">{errors.file}</span>}
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
                  placeholder="ex: Concevez votre API REST moderne"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  className={errors.title ? "input-has-error" : ""}
                />
                {errors.title && <span className="field-error-message">{errors.title}</span>}
              </div>

              <div className="publish-field">
                <label htmlFor="book-author">
                  Nom de l’auteur <span className="req">*</span>
                </label>
                <input
                  id="book-author"
                  type="text"
                  placeholder="ex: Jean Dupont"
                  value={author}
                  onChange={(e) => {
                    setAuthor(e.target.value);
                    if (errors.author) setErrors((prev) => ({ ...prev, author: "" }));
                  }}
                  className={errors.author ? "input-has-error" : ""}
                />
                {errors.author && <span className="field-error-message">{errors.author}</span>}
              </div>
            </div>

            <div className="publish-field">
              <label htmlFor="book-subtitle">
                Sous-titre ou accroche <span className="opt">(optionnel)</span>
              </label>
              <input
                id="book-subtitle"
                type="text"
                placeholder="ex: Les fondamentaux de la conception et du déploiement"
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
                  <option value="Autre">Autre (personnalisé)...</option>
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
                {errors.category && <span className="field-error-message">{errors.category}</span>}
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
                placeholder="Présentez les concepts clés et les acquis pratiques apportés par ce livre..."
                value={description}
                maxLength={400}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                }}
                className={errors.description ? "input-has-error" : ""}
              />
              {errors.description && <span className="field-error-message">{errors.description}</span>}
            </div>

            {/* Boutons d'action centrés */}
            <div className="publish-actions-centered">
              <ActionButton
                type="submit"
                disabled={isSubmitting}
                size="small"
                className="publish-submit-btn"
              >
                {isSubmitting ? "Traitement et génération..." : "Générer la version web"}
              </ActionButton>
              {file && !isSubmitting && (
                <ActionButton
                  type="button"
                  variant="quiet"
                  size="small"
                  onClick={resetForm}
                >
                  Effacer
                </ActionButton>
              )}
            </div>

            {isSubmitting && uploadStep && (
              <div className="publish-progress-block">
                <div className="publish-progress-spinner" />
                <p className="publish-progress-step">{uploadStep}</p>
                <span className="publish-progress-note">
                  Extraction page par page, détection des titres, génération des quiz et sauvegarde.
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
                      <span>{previewBook.category}</span>
                      <div className="rating">
                        <span className="star star-active">★</span>
                        <span className="rating-value">Nouveau</span>
                        <span className="review-count">(0)</span>
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
              Dès la validation, ce livre sera navigable page après page, avec table des matières, mode sombre, quiz interactif et avis des lecteurs.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

