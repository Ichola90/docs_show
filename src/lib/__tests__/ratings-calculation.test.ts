import { describe, it, expect } from "vitest";
import {
  deduplicateReviews,
  mergeRatingsStores,
  calculateRatingSummary,
  type BookReview,
  type RatingsStore,
} from "../ratings-utils";

describe("Gestion des avis et calculs de notes (Ratings Engine)", () => {
  describe("deduplicateReviews", () => {
    it("doit éliminer les doublons stricts par ID unique", () => {
      const reviews: BookReview[] = [
        { id: "rev_1", name: "Alice", rating: 5, comment: "Superbe !", createdAt: "2026-10-10T10:00:00Z" },
        { id: "rev_1", name: "Alice", rating: 5, comment: "Superbe !", createdAt: "2026-10-10T10:00:00Z" },
        { id: "rev_2", name: "Bob", rating: 4, comment: "Très bon livre.", createdAt: "2026-10-10T11:00:00Z" },
      ];

      const result = deduplicateReviews(reviews);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(["rev_2", "rev_1"]); // trié par date descendante
    });

    it("doit éliminer les doublons sémantiques (même nom, note et commentaire dans une fenêtre de 60s)", () => {
      const reviews: BookReview[] = [
        { id: "rev_a", name: "Marc", rating: 5, comment: "Génial", createdAt: "2026-10-12T14:00:00Z" },
        { id: "rev_b", name: "marc", rating: 5, comment: "Génial", createdAt: "2026-10-12T14:00:20Z" }, // 20s plus tard
        { id: "rev_c", name: "Marc", rating: 5, comment: "Un autre avis pertinent", createdAt: "2026-10-12T14:00:30Z" },
      ];

      const result = deduplicateReviews(reviews);
      expect(result).toHaveLength(2);
      expect(result.some((r) => r.id === "rev_a")).toBe(true);
      expect(result.some((r) => r.id === "rev_c")).toBe(true);
    });

    it("doit trier les avis du plus récent au plus ancien", () => {
      const reviews: BookReview[] = [
        { id: "r1", name: "A", rating: 5, createdAt: "2026-10-01T10:00:00Z" },
        { id: "r2", name: "B", rating: 4, createdAt: "2026-10-14T10:00:00Z" },
        { id: "r3", name: "C", rating: 3, createdAt: "2026-10-08T10:00:00Z" },
      ];

      const result = deduplicateReviews(reviews);
      expect(result[0].id).toBe("r2");
      expect(result[1].id).toBe("r3");
      expect(result[2].id).toBe("r1");
    });
  });

  describe("mergeRatingsStores", () => {
    it("fusionne deux stores et recalcule le nombre de votes et total d'étoiles", () => {
      const base: RatingsStore = {
        "livre-1": {
          votesCount: 1,
          starsTotal: 5,
          reviews: [
            { id: "r1", name: "Alice", rating: 5, createdAt: "2026-10-01T10:00:00Z" },
          ],
        },
      };

      const incoming: RatingsStore = {
        "livre-1": {
          votesCount: 1,
          starsTotal: 4,
          reviews: [
            { id: "r2", name: "Bob", rating: 4, createdAt: "2026-10-02T10:00:00Z" },
          ],
        },
      };

      const merged = mergeRatingsStores(base, incoming);
      expect(merged["livre-1"].votesCount).toBe(2);
      expect(merged["livre-1"].starsTotal).toBe(9);
      expect(merged["livre-1"].reviews).toHaveLength(2);
    });
  });

  describe("calculateRatingSummary", () => {
    it("retourne la note initiale si aucun avis supplémentaire n'est stocké", () => {
      const summary = calculateRatingSummary("4,8", 120);
      expect(summary.rating).toBe("4,8");
      expect(summary.count).toBe(120);
    });

    it("gère le format avec point décimal ou virgule", () => {
      const summary = calculateRatingSummary("4.5", 10);
      expect(summary.rating).toBe("4,5");
      expect(summary.count).toBe(10);
    });

    it("calcule correctement la moyenne pondérée avec les avis ajoutés", () => {
      // Livre avec note initiale 4.0 pour 1 vote (4 étoiles)
      // + 1 avis utilisateur à 5 étoiles -> total: 9 étoiles pour 2 votes -> moyenne 4.5
      const summary = calculateRatingSummary("4,0", 1, {
        votesCount: 1,
        starsTotal: 5,
        reviews: [{ id: "r_1", name: "Tester", rating: 5, createdAt: "2026-10-10" }],
      });

      expect(summary.rating).toBe("4,5");
      expect(summary.count).toBe(2);
    });

    it("retourne null pour la note si le nombre total de votes est 0", () => {
      const summary = calculateRatingSummary("Nouveau", 0);
      expect(summary.rating).toBeNull();
      expect(summary.count).toBe(0);
    });
  });
});

