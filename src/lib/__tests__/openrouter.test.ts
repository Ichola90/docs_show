import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isOpenRouterConfigured,
  getBotSystemPrompt,
  DEFAULT_OPENROUTER_MODEL,
} from "../openrouter";

describe("OpenRouter AI Integration (src/lib/openrouter.ts)", () => {
  const originalEnv = process.env.OPEN_ROUTER_API_KEY;

  beforeEach(() => {
    delete process.env.OPEN_ROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.OPEN_ROUTER_API_KEY = originalEnv;
    } else {
      delete process.env.OPEN_ROUTER_API_KEY;
      delete process.env.OPENROUTER_API_KEY;
    }
  });

  it("doit renvoyer false si OPEN_ROUTER_API_KEY est absente ou vide", () => {
    expect(isOpenRouterConfigured()).toBe(false);

    process.env.OPEN_ROUTER_API_KEY = "   ";
    expect(isOpenRouterConfigured()).toBe(false);
  });

  it("doit renvoyer true quand OPEN_ROUTER_API_KEY est valide", () => {
    process.env.OPEN_ROUTER_API_KEY = "sk-or-v1-test-key-123456";
    expect(isOpenRouterConfigured()).toBe(true);
  });

  it("doit utiliser openrouter/auto comme modèle par défaut", () => {
    expect(DEFAULT_OPENROUTER_MODEL).toBe("openrouter/auto");
  });

  it("doit générer un prompt système spécialisé pour chaque bot", () => {
    const corePrompt = getBotSystemPrompt("docs-core");
    expect(corePrompt).toContain("DOCS Core");
    expect(corePrompt).toContain("Langage C");

    const modernPrompt = getBotSystemPrompt("docs-modern");
    expect(modernPrompt).toContain("DOCS Modern");
    expect(modernPrompt).toContain("TypeScript");

    const bookCPrompt = getBotSystemPrompt("book-c");
    expect(bookCPrompt).toContain("Le Langage C");

    const bookPhpPrompt = getBotSystemPrompt("book-php");
    expect(bookPhpPrompt).toContain("PHP 7 & MySQL 8");
  });

  it("doit intégrer le contexte de livre actif dans le prompt système", () => {
    const prompt = getBotSystemPrompt("assistant", "Architecture ATO 23");
    expect(prompt).toContain("Architecture ATO 23");
  });
});

