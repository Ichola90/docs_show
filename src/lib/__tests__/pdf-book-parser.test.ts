import { describe, it, expect } from "vitest";
import {
  isBulletLine,
  preprocessPdfText,
  getCoverType,
} from "../pdf-book-parser";

describe("Analyse et découpage de documents PDF (PDF Book Parser)", () => {
  describe("isBulletLine", () => {
    it("reconnaît les puces spéciales comme ❖, •, ●, ■", () => {
      expect(isBulletLine("❖ Décrire l'organisation générale d'un ordinateur")).toBe(true);
      expect(isBulletLine("• Point clé de l'algorithme")).toBe(true);
      expect(isBulletLine("● Architecture mémoire")).toBe(true);
      expect(isBulletLine("■ Détail d'implémentation")).toBe(true);
      expect(isBulletLine("► Étape suivante")).toBe(true);
    });

    it("reconnaît les tirets suivis d'espaces", () => {
      expect(isBulletLine("- Premier point")).toBe(true);
      expect(isBulletLine("– Deuxième point")).toBe(true);
      expect(isBulletLine("— Troisième point")).toBe(true);
    });

    it("reconnaît les listes numérotées ou alphabétiques", () => {
      expect(isBulletLine("1) Définition des variables")).toBe(true);
      expect(isBulletLine("2. Allocation dynamique")).toBe(true);
      expect(isBulletLine("a) Initialisation du pointeur")).toBe(true);
    });

    it("ne considère pas une phrase normale comme une puce", () => {
      expect(isBulletLine("Ceci est un paragraphe normal sur l'informatique.")).toBe(false);
      expect(isBulletLine("Le processeur exécute les instructions à chaque cycle d'horloge.")).toBe(false);
    });
  });

  describe("preprocessPdfText — Découpage intelligent et gestion de ❖", () => {
    it("force systématiquement un saut de ligne à chaque occurrence de ❖", () => {
      const input =
        "A l’issue de cette UE, les étudiants sont capables de ❖ Décrire l’organisation générale d'un ordinateur ❖ Expliquer le fonctionnement d'un microprocesseur ❖ Expliquer les mécanismes des échanges entre le processeur et la mémoire";

      const lines = preprocessPdfText(input);

      expect(lines).toHaveLength(4);
      expect(lines[0]).toBe("A l’issue de cette UE, les étudiants sont capables de");
      expect(lines[1]).toBe("❖ Décrire l’organisation générale d'un ordinateur");
      expect(lines[2]).toBe("❖ Expliquer le fonctionnement d'un microprocesseur");
      expect(lines[3]).toBe(
        "❖ Expliquer les mécanismes des échanges entre le processeur et la mémoire"
      );
    });

    it("scinde les puces standards (•, ●) collées au milieu du texte", () => {
      const input = "Compétences clés: • Algorithmique • Structures de données • Complexité";
      const lines = preprocessPdfText(input);

      expect(lines.length).toBeGreaterThanOrEqual(4);
      expect(lines[1]).toContain("• Algorithmique");
      expect(lines[2]).toContain("• Structures de données");
      expect(lines[3]).toContain("• Complexité");
    });

    it("scinde les listes numérotées inline", () => {
      const input = "Procédure d'installation: 1) Télécharger l'archive 2) Extraire le binaire";
      const lines = preprocessPdfText(input);

      expect(lines.length).toBe(3);
      expect(lines[0]).toBe("Procédure d'installation:");
      expect(lines[1]).toBe("1) Télécharger l'archive");
      expect(lines[2]).toBe("2) Extraire le binaire");
    });

    it("retourne un tableau vide si le texte est vide ou non défini", () => {
      expect(preprocessPdfText("")).toEqual([]);
      expect(preprocessPdfText("   \n\n   ")).toEqual([]);
    });
  });

  describe("getCoverType — Attribution du style graphique selon la catégorie", () => {
    it("attribue 'system' aux catégories de bas niveau, C ou embarqué", () => {
      expect(getCoverType("Systèmes & Bas niveau")).toBe("system");
      expect(getCoverType("Programmation C et C++")).toBe("system");
      expect(getCoverType("Systèmes embarqués")).toBe("system");
    });

    it("attribue 'architecture' aux catégories cloud, microservices ou devops", () => {
      expect(getCoverType("Architecture Web & Microservices")).toBe("architecture");
      expect(getCoverType("Cloud Computing & DevOps")).toBe("architecture");
    });

    it("attribue 'data' aux catégories data, intelligence artificielle ou big data", () => {
      expect(getCoverType("Intelligence Artificielle & LLM")).toBe("data");
      expect(getCoverType("Data Engineering")).toBe("data");
      expect(getCoverType("Bases de données relationnelles")).toBe("data");
    });

    it("attribue 'code' par défaut aux autres catégories", () => {
      expect(getCoverType("Développement Frontend")).toBe("code");
      expect(getCoverType("Algorithmique")).toBe("code");
      expect(getCoverType("Clean Code")).toBe("code");
    });
  });
});

