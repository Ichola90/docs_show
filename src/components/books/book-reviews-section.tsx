"use client";

import { useEffect, useState } from "react";
import type { Book } from "@/data/books";
import { ActionButton } from "@/components/ui/action-button";
import { useBookRating } from "@/components/books/book-ratings-provider";

type BookReviewsSectionProps = {
  book: Book;
};

const RATING_LABELS: Record<number, string> = {
  1: "1/5 · À améliorer",
  2: "2/5 · Moyen",
  3: "3/5 · Bon ouvrage",
  4: "4/5 · Très enrichissant",
  5: "5/5 · Coup de cœur / Indispensable ⭐",
};

function formatReviewDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "Récemment";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "Récemment";
  }
}

export function BookReviewsSection({ book }: BookReviewsSectionProps) {
  const { rating, count, reviews, ready, submitReview } = useBookRating(
    book.id,
    book.rating,
    book.reviewCount,
  );

  const [name, setName] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    rating?: string;
    comment?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const currentDisplayRating = hoverRating || selectedRating;

  // Auto-dismiss de la notification de succès sur la liste après 6s
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || !submitReview || isSubmitting) return;

    const newErrors: { name?: string; rating?: string; comment?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Veuillez renseigner votre nom ou pseudo.";
    }

    if (selectedRating < 1 || selectedRating > 5) {
      newErrors.rating = "Veuillez choisir une note sur 5 étoiles.";
    }

    if (comment.length > 200) {
      newErrors.comment = "La description ne doit pas dépasser 200 caractères.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await submitReview(book.id, {
        name: name.trim(),
        rating: selectedRating,
        comment: comment.trim() || undefined,
      });

      // Affichage du message de succès directement sur la liste des avis
      setSuccessMessage("Avis ajouté avec succès !");
      setName("");
      setSelectedRating(0);
      setComment("");
      setShowForm(false);
    } catch (submitError) {
      setErrors({
        name:
          submitError instanceof Error
            ? submitError.message
            : "Une erreur est survenue lors de l'enregistrement de l'avis.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="avis-lecteurs"
      className="book-reviews-section"
      aria-labelledby="reviews-section-title"
    >
      <div className="reviews-header-card">
        <div className="reviews-score-block">
          <span className="reviews-eyebrow">COMMUNAUTÉ DOCS SHOW</span>
          <h2 id="reviews-section-title">Avis et retours de lecture</h2>
          <div className="reviews-score-hero">
            <span className="reviews-big-number">
              {rating !== "Nouveau" ? rating : "—"}
            </span>
            <div className="reviews-score-meta">
              <div
                className="reviews-stars-static"
                aria-label={`Note moyenne : ${rating} sur 5`}
              >
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const numericRating =
                    Number.parseFloat(rating.replace(",", ".")) || 0;
                  const isFilled = starIndex <= Math.round(numericRating);
                  return (
                    <span
                      key={starIndex}
                      className={isFilled ? "star-active" : "star-inactive"}
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  );
                })}
              </div>
              <span className="reviews-count-badge">
                {count > 0
                  ? `${count} évaluation${count > 1 ? "s" : ""} au total`
                  : "Soyez le premier à noter cet ouvrage"}
              </span>
            </div>
          </div>
          <p className="reviews-explanation">
            Chaque avis contribue à guider la communauté de développeurs. Vous
            pouvez noter et laisser un retour en toute liberté.
          </p>
        </div>

        <div className="reviews-cta-block">
          <ActionButton
            type="button"
            variant={showForm ? "secondary" : "primary"}
            size="small"
            onClick={() => {
              setShowForm((prev) => !prev);
              setErrors({});
            }}
            aria-expanded={showForm}
          >
            {showForm ? "Masquer le formulaire" : "★ Laisser un avis"}
          </ActionButton>
        </div>
      </div>

      {showForm && (
        <form className="reviews-form-card" onSubmit={handleSubmit} noValidate>
          <div className="reviews-form-accent-bar" aria-hidden="true" />
          <div className="reviews-form-header">
            <div className="reviews-form-header-badge-row">
              <span className="reviews-form-badge">VOTRE EXPÉRIENCE COMPTE</span>
              <button
                type="button"
                className="reviews-form-close-btn"
                onClick={() => {
                  setShowForm(false);
                  setErrors({});
                }}
                title="Fermer le formulaire"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <h3>Partagez votre avis sur cet ouvrage</h3>
            <p>
              Renseignez votre nom, attribuez une note et partagez vos remarques
              avec les futurs lecteurs.
            </p>
          </div>

          <div className="reviews-form-grid">
            {/* CHAMP NOM */}
            <div className="form-group">
              <label htmlFor="reviewer-name">
                Votre nom ou pseudo <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <svg
                  className="input-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                <input
                  id="reviewer-name"
                  type="text"
                  className={`form-input ${errors.name ? "has-error" : ""}`}
                  placeholder="Ex: Thomas D., Développeur Web"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {errors.name && (
                <p className="field-error-text" role="alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* SÉLECTEUR D'ÉTOILES */}
            <div className="form-group">
              <label id="rating-picker-label">
                Votre note sur 5 étoiles <span className="required-star">*</span>
              </label>
              <div
                className="reviews-stars-picker"
                role="group"
                aria-labelledby="rating-picker-label"
              >
                <div className="stars-cluster">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isLit = starValue <= currentDisplayRating;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        className={`star-pick-btn ${isLit ? "is-lit" : ""}`}
                        onClick={() => {
                          setSelectedRating(starValue);
                          if (errors.rating) {
                            setErrors((prev) => ({
                              ...prev,
                              rating: undefined,
                            }));
                          }
                        }}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`${starValue} étoile${starValue > 1 ? "s" : ""}`}
                        aria-pressed={selectedRating === starValue}
                        disabled={isSubmitting}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
                <div
                  className={`rating-descriptor-pill ${currentDisplayRating > 0 ? "is-active" : ""}`}
                >
                  {currentDisplayRating > 0
                    ? RATING_LABELS[currentDisplayRating]
                    : "Touchez une étoile pour évaluer"}
                </div>
              </div>
              {errors.rating && (
                <p className="field-error-text" role="alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errors.rating}</span>
                </p>
              )}
            </div>
          </div>

          {/* CHAMP DESCRIPTION (MAX 200 CARACTÈRES) */}
          <div className="form-group">
            <div className="label-with-hint">
              <label htmlFor="reviewer-comment">
                Votre description ou retour de lecture{" "}
                <span className="optional-tag">(optionnel, max 200 caractères)</span>
              </label>
              <span
                className={`char-count ${comment.length >= 200 ? "char-limit-reached" : ""}`}
              >
                {comment.length} / 200
              </span>
            </div>
            <textarea
              id="reviewer-comment"
              className={`form-textarea ${errors.comment ? "has-error" : ""}`}
              rows={3}
              maxLength={200}
              placeholder="Qu’avez-vous pensé de ce livre ? Partagez vos impressions en 200 caractères max..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (errors.comment && e.target.value.length <= 200) {
                  setErrors((prev) => ({ ...prev, comment: undefined }));
                }
              }}
              disabled={isSubmitting}
            />
            {errors.comment && (
              <p className="field-error-text" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errors.comment}</span>
              </p>
            )}
          </div>

          <div className="form-actions">
            <ActionButton
              type="submit"
              variant="primary"
              size="small"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  Publication…
                </>
              ) : (
                "Publier mon avis"
              )}
            </ActionButton>
            <ActionButton
              type="button"
              variant="secondary"
              size="small"
              onClick={() => {
                setShowForm(false);
                setErrors({});
              }}
              disabled={isSubmitting}
            >
              Annuler
            </ActionButton>
          </div>
        </form>
      )}

      {/* LISTE DES COMMENTAIRES LECTEURS */}
      <div className="reviews-list-container">
        {/* MESSAGE DE SUCCÈS SUR LA LISTE */}
        {successMessage && (
          <div className="reviews-success-banner" role="status">
            <span className="success-icon-badge" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <div className="success-content">
              <span className="success-title">{successMessage}</span>
              <span className="success-subtitle">
                Votre avis a été enregistré et s’affiche désormais pour l&apos;ensemble des lecteurs.
              </span>
            </div>
            <button
              type="button"
              className="success-close-btn"
              onClick={() => setSuccessMessage(null)}
              aria-label="Fermer la notification"
            >
              ✕
            </button>
          </div>
        )}

        <h3 className="reviews-list-title">
          Commentaires des lecteurs ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="reviews-empty-state">
            <span className="empty-icon" aria-hidden="true">
              📖
            </span>
            <h4>Aucun commentaire rédigé pour le moment</h4>
            <p>
              Soyez le tout premier lecteur à partager votre retour sur cet
              ouvrage !
            </p>
            {!showForm && (
              <ActionButton
                type="button"
                variant="primary"
                size="small"
                onClick={() => setShowForm(true)}
              >
                Rédiger le premier avis
              </ActionButton>
            )}
          </div>
        ) : (
          <div className="reviews-cards-grid">
            {reviews.map((rev) => (
              <article key={rev.id} className="reader-review-item">
                <div className="review-item-header">
                  <div className="review-avatar">
                    {rev.name ? rev.name.charAt(0).toUpperCase() : "L"}
                  </div>
                  <div className="review-author-info">
                    <span className="review-author-name">{rev.name}</span>
                    <span className="review-date">
                      {formatReviewDate(rev.createdAt)}
                    </span>
                  </div>
                  <div
                    className="review-stars-badge"
                    aria-label={`Note : ${rev.rating} sur 5`}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={
                          s <= rev.rating ? "star-gold" : "star-muted"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p className="review-item-body">{rev.comment}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
