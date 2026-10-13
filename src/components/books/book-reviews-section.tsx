"use client";

import { useState } from "react";
import type { Book } from "@/data/books";
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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const currentDisplayRating = hoverRating || selectedRating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || !submitReview || isSubmitting) return;

    if (selectedRating < 1 || selectedRating > 5) {
      setError("Veuillez sélectionner une note entre 1 et 5 étoiles.");
      return;
    }

    if (!name.trim()) {
      setError("Veuillez renseigner votre nom ou pseudonyme.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitReview(book.id, {
        name: name.trim(),
        rating: selectedRating,
        comment: comment.trim() || undefined,
      });

      setSuccessMessage(
        "Merci pour votre contribution ! Votre avis a été enregistré dans le fichier partagé.",
      );
      setName("");
      setSelectedRating(0);
      setComment("");
      setShowForm(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Une erreur est survenue lors de l'enregistrement de l'avis.",
      );
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
          <span className="reviews-eyebrow">COMMUNAUTÉ DE LECTEURS</span>
          <h2 id="reviews-section-title">Avis et retours d’expérience</h2>
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
                  : "Aucune évaluation pour le moment"}
              </span>
            </div>
          </div>
          <p className="reviews-explanation">
            Tous les avis sont conservés dans le store JSON partagé et
            accessibles à chaque lecteur.
          </p>
        </div>

        <div className="reviews-cta-block">
          <button
            type="button"
            className="reviews-action-btn"
            onClick={() => {
              setShowForm((prev) => !prev);
              setSuccessMessage(null);
              setError(null);
            }}
            aria-expanded={showForm}
          >
            {showForm ? "Masquer le formulaire" : "★ Laisser un avis sur ce livre"}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="reviews-alert-success" role="status">
          <span className="alert-icon">✓</span>
          <div>
            <strong>Avis publié avec succès !</strong>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {showForm && (
        <form className="reviews-form-card" onSubmit={handleSubmit}>
          <div className="reviews-form-header">
            <h3>Partager mon avis sur ce livre</h3>
            <p>
              Votre avis sera visible publiquement par l&apos;ensemble des
              développeurs et lecteurs.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="reviewer-name">
              Votre nom ou pseudo <span className="required-star">*</span>
            </label>
            <input
              id="reviewer-name"
              type="text"
              className="form-input"
              placeholder="Ex: Alexandre D., Développeur React"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label id="rating-picker-label">
              Votre note sur 5 étoiles <span className="required-star">*</span>
            </label>
            <div
              className="reviews-stars-picker"
              role="group"
              aria-labelledby="rating-picker-label"
            >
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isLit = starValue <= currentDisplayRating;
                return (
                  <button
                    key={starValue}
                    type="button"
                    className={`star-pick-btn ${isLit ? "is-lit" : ""}`}
                    onClick={() => setSelectedRating(starValue)}
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
              <span className="rating-descriptor">
                {currentDisplayRating > 0
                  ? RATING_LABELS[currentDisplayRating]
                  : "Cliquez pour noter"}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reviewer-comment">
              Votre description ou retour de lecture{" "}
              <span className="optional-tag">(optionnel)</span>
            </label>
            <textarea
              id="reviewer-comment"
              className="form-textarea"
              rows={3}
              placeholder="Qu’avez-vous pensé de ce livre ? Les explications étaient-elles claires et applicables ?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="reviews-form-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit-review"
              disabled={isSubmitting || selectedRating === 0 || !name.trim()}
            >
              {isSubmitting ? "Publication en cours…" : "Publier mon avis"}
            </button>
            <button
              type="button"
              className="btn-cancel-review"
              onClick={() => setShowForm(false)}
              disabled={isSubmitting}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="reviews-list-container">
        <h3 className="reviews-list-title">
          Commentaires des lecteurs ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="reviews-empty-state">
            <span className="empty-icon">📖</span>
            <h4>Aucun commentaire rédigé pour le moment</h4>
            <p>
              Soyez le tout premier lecteur à partager votre retour sur cet
              ouvrage !
            </p>
            {!showForm && (
              <button
                type="button"
                className="reviews-empty-cta"
                onClick={() => setShowForm(true)}
              >
                Rédiger le premier avis
              </button>
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

