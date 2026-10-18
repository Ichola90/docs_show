import { describe, it, expect } from "vitest";
import {
  generateAssistantResponse,
  DEBATE_TOPICS,
  PROMPT_SUGGESTIONS,
} from "../assistant-knowledge";

describe("Assistant IA & Moteur de Débat Multi-Chatbots (assistant-knowledge.ts)", () => {
  describe("Constantes de démarrage", () => {
    it("doit exposer au moins 4 sujets de débat complets", () => {
      expect(DEBATE_TOPICS.length).toBeGreaterThanOrEqual(4);
      for (const topic of DEBATE_TOPICS) {
        expect(topic.id).toBeTruthy();
        expect(topic.title).toBeTruthy();
        expect(topic.agentCoreStance).toBeTruthy();
        expect(topic.agentModernStance).toBeTruthy();
        expect(topic.initialPrompt).toBeTruthy();
      }
    });

    it("doit exposer des suggestions de prompts tuteur bien typées", () => {
      expect(PROMPT_SUGGESTIONS.length).toBeGreaterThanOrEqual(4);
      for (const sug of PROMPT_SUGGESTIONS) {
        expect(sug.title).toBeTruthy();
        expect(sug.prompt).toBeTruthy();
        expect(sug.category).toBeTruthy();
        expect(sug.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });
  });

  describe("Mode Tuteur (User <-> Chatbot)", () => {
    it("doit fournir des explications et du code C pour les requêtes sur les pointeurs", async () => {
      const messages = await generateAssistantResponse(
        "Comment fonctionnent les pointeurs et malloc en C ?",
        "apprenez-programmer-c",
        "tutor"
      );

      expect(messages).toHaveLength(1);
      const res = messages[0];
      expect(res.role).toBe("assistant");
      expect(res.content).toContain("pointeur");
      expect(res.content).toContain("```c");
      expect(res.content).toContain("malloc");
      expect(res.content).toContain("free");
    });

    it("doit fournir des recommandations de sécurité PDO pour PHP", async () => {
      const messages = await generateAssistantResponse(
        "Comment sécuriser mes requêtes MySQL avec PDO ?",
        "concevez-site-web-php-mysql",
        "tutor"
      );

      expect(messages).toHaveLength(1);
      const res = messages[0];
      expect(res.role).toBe("assistant");
      expect(res.content).toContain("PDO");
      expect(res.content).toContain("prepare");
      expect(res.content).toContain("htmlspecialchars");
    });

    it("doit contextualiser les explications CPU pour le livre ATO 23", async () => {
      const messages = await generateAssistantResponse(
        "Explique-moi le fonctionnement des registres CPU et du cache",
        "ato-23-kh3jf",
        "tutor"
      );

      expect(messages).toHaveLength(1);
      const res = messages[0];
      expect(res.content).toContain("ATO 23");
      expect(res.content).toContain("ALU");
      expect(res.content).toContain("Cache");
    });
  });

  describe("Mode Débat Multi-Chatbots (Chatbot Core vs Chatbot Modern)", () => {
    it("doit générer une joute verbale entre les deux chatbots avec arguments et synthèse", async () => {
      const messages = await generateAssistantResponse(
        "Débat : C vs langages managés modernes",
        undefined,
        "debate"
      );

      expect(messages.length).toBeGreaterThanOrEqual(3);

      const botCoreTurn = messages.find((m) => m.role === "bot_core");
      const botModernTurn = messages.find((m) => m.role === "bot_modern");
      const synthesisTurn = messages.find((m) => m.role === "assistant");

      expect(botCoreTurn).toBeDefined();
      expect(botCoreTurn?.debateAgent?.name).toContain("DOCS Core");
      expect(botCoreTurn?.debateAgent?.title).toBeTruthy();

      expect(botModernTurn).toBeDefined();
      expect(botModernTurn?.debateAgent?.name).toContain("DOCS Modern");
      expect(botModernTurn?.debateAgent?.stance).toBeTruthy();

      expect(synthesisTurn).toBeDefined();
      expect(synthesisTurn?.content).toContain("Synthèse");
    });
  });
});

