import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isOpenRouterConfigured,
  getBotSystemPrompt,
  DEFAULT_OPENROUTER_MODEL,
  PLATFORM_CREATOR_INFO,
} from "../openrouter";
import {
  generateTutorResponse,
  generateDebateTurns,
  PLATFORM_CREATOR_DETAILS,
} from "../assistant-knowledge";

describe("OpenRouter AI Integration & Guardrails (src/lib/openrouter.ts)", () => {
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

  it("doit contenir les informations officielles du créateur", () => {
    expect(PLATFORM_CREATOR_INFO.name).toBe("Ingénieur ICHOLA AKIOSSI");
    expect(PLATFORM_CREATOR_INFO.phone).toBe("+2290148454505");
    expect(PLATFORM_CREATOR_INFO.portfolio).toBe("https://akiossibriceichola.onrender.com/");
  });

  it("doit inclure le créateur, la langue française exclusive et les garde-fous dans le prompt système", () => {
    const prompt = getBotSystemPrompt("assistant");
    expect(prompt).toContain("Ingénieur ICHOLA AKIOSSI");
    expect(prompt).toContain("+229 01 48 45 45 05");
    expect(prompt).toContain("https://akiossibriceichola.onrender.com/");
    expect(prompt).toContain("LANGUE FRANÇAISE EXCLUSIVE");
    expect(prompt).toContain("PÉRIMÈTRE TECHNIQUE STRICT");
    expect(prompt).toContain("ZÉRO HALLUCINATION");
  });

  it("doit générer un prompt système spécialisé pour chaque bot", () => {
    const corePrompt = getBotSystemPrompt("docs-core");
    expect(corePrompt).toContain("DOCS Core");
    expect(corePrompt).toContain("Langage C");

    const modernPrompt = getBotSystemPrompt("docs-modern");
    expect(modernPrompt).toContain("DOCS Modern");
    expect(modernPrompt).toContain("TypeScript");

    const bookCPrompt = getBotSystemPrompt("book-c");
    expect(bookCPrompt).toContain("Apprenez à programmer en C !");

    const bookPhpPrompt = getBotSystemPrompt("book-php");
    expect(bookPhpPrompt).toContain("Concevez votre site web avec PHP et MySQL");
  });

  it("doit intégrer le contexte de livre actif dans le prompt système", () => {
    const prompt = getBotSystemPrompt("assistant", "Architecture ATO 23");
    expect(prompt).toContain("Architecture ATO 23");
  });
});

describe("Assistant Knowledge & Guardrails (src/lib/assistant-knowledge.ts)", () => {
  it("doit répondre avec exactitude aux questions sur le créateur", () => {
    const res = generateTutorResponse("Qui a créé la plateforme DOCS SHOW et quel est son contact ?");
    expect(res.content).toContain(PLATFORM_CREATOR_DETAILS.name);
    expect(res.content).toContain(PLATFORM_CREATOR_DETAILS.phoneDisplay);
    expect(res.content).toContain(PLATFORM_CREATOR_DETAILS.portfolio);
  });

  it("doit poliment décliner les sujets hors périmètre en français", () => {
    const res = generateTutorResponse("Quelle est la météo et qui va gagner les élections politiques ?");
    expect(res.content).toContain("Périmètre d'Intervention Officiel DOCS SHOW");
    expect(res.content).toContain("hors de ce cadre");
  });

  it("doit préconfigurer les 4 débats multi-chatbots", () => {
    const debC = generateDebateTurns("c-vs-modern");
    expect(debC.length).toBeGreaterThanOrEqual(3);
    expect(debC[0].content).toContain("Langage C");

    const debCc = generateDebateTurns("clean-code-vs-pragmatism");
    expect(debCc.length).toBeGreaterThanOrEqual(3);
    expect(debCc[0].content).toContain("Clean Code");

    const debPhp = generateDebateTurns("php8-vs-node");
    expect(debPhp.length).toBeGreaterThanOrEqual(3);
    expect(debPhp[0].content).toContain("PHP 8");

    const debArch = generateDebateTurns("monolith-vs-microservices");
    expect(debArch.length).toBeGreaterThanOrEqual(3);
    expect(debArch[0].content).toContain("Monolithe Modulaire");
  });
});


