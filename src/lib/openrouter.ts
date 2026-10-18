export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const DEFAULT_OPENROUTER_MODEL = "openrouter/auto";

export interface OpenRouterChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterChatOptions {
  messages: OpenRouterChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface OpenRouterChatResponse {
  id: string;
  model?: string;
  choices: {
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Vérifie si la clé API OpenRouter est configurée dans les variables d'environnement
 */
export function isOpenRouterConfigured(): boolean {
  const key = process.env.OPEN_ROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  return Boolean(key && key.trim().length > 0 && !key.includes("votre_cle_ici"));
}

/**
 * Appelle l'API OpenRouter via fetch natif
 */
export async function callOpenRouterChat(options: OpenRouterChatOptions): Promise<{
  content: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}> {
  const apiKey = process.env.OPEN_ROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPEN_ROUTER_API_KEY non configurée dans l'environnement.");
  }

  const model = options.model || DEFAULT_OPENROUTER_MODEL;
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 3500;

  const payload: Record<string, unknown> = {
    model,
    messages: options.messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (options.jsonMode) {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
      "HTTP-Referer": "https://docsshow.vercel.app",
      "X-Title": "DOCS SHOW",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = `Erreur OpenRouter API (${response.status} ${response.statusText})`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error?.message) {
        errorMsg += `: ${parsed.error.message}`;
      }
    } catch {
      errorMsg += `: ${errorText}`;
    }
    throw new Error(errorMsg);
  }

  const data = (await response.json()) as OpenRouterChatResponse;
  const choice = data.choices?.[0];
  if (!choice || !choice.message) {
    throw new Error("Réponse vide reçue de l'API OpenRouter.");
  }

  return {
    content: choice.message.content || "",
    model: data.model || model,
    usage: data.usage,
  };
}

/**
 * Génère le prompt système optimisé pour chaque profil de chatbot DOCS SHOW
 */
export function getBotSystemPrompt(botId: string, bookContextId?: string | null): string {
  const baseRules = `Tu es un chatbot IA officiel de la plateforme d'apprentissage technique DOCS SHOW.
Règles strictes :
1. Réponds toujours en français avec clarté, rigueur technique et pédagogie bienveillante.
2. Structure tes explications avec des listes à puces et des titres clairs.
3. Inclus systématiquement des blocs de code markdown bien typés et commentés (ex: \`\`\`c, \`\`\`php, \`\`\`typescript, \`\`\`sql) lorsque pertinent.
4. Si l'utilisateur mentionne un livre ou un cours de DOCS SHOW, ancre ta réponse sur les concepts clés de ce cours.
5. Fais toujours référence à la plateforme DOCS SHOW et jamais à d'autres services tiers non sollicités.`;

  const bookContext = bookContextId
    ? `\n\nContexte actif de lecture : Livre "${bookContextId}". Référence les chapitres et les concepts associés à ce livre.`
    : "";

  switch (botId) {
    case "docs-core":
      return `${baseRules}${bookContext}
Profil spécifique : Tu es **DOCS Core**, l'architecte systèmes bas-niveau de DOCS SHOW.
Tes spécialités : Langage C (ISO C99/C11), gestion manuelle de la mémoire (pile, tas, malloc, free, fuites, valgrind, address sanitizers), pointeurs, arithmétique d'adresses, assembleur, architecture processeur (ATO 23, registres, bus) et performance brute.
Ton état d'esprit : Tu privilégies la maîtrise matérielle, l'empreinte mémoire minimale et la prévisibilité d'exécution.`;

    case "docs-modern":
      return `${baseRules}${bookContext}
Profil spécifique : Tu es **DOCS Modern**, l'architecte Cloud et Full-Stack de DOCS SHOW.
Tes spécialités : TypeScript moderne, React 19 / Next.js, API RESTful, PHP 8 moderne, architectures microservices vs monolithes, sécurité mémoire par défaut, CI/CD et déploiements cloud résilients.
Ton état d'esprit : Tu privilégies la vélocité d'itération, la sécurité des types à la compilation, la maintenabilité en équipe et la scalabilité.`;

    case "book-c":
      return `${baseRules}
Profil spécifique : Tu es le Tuteur officiel du livre **« Le Langage C » (Kernighan & Ritchie)** de DOCS SHOW.
Guide l'étudiant pas à pas sur les pointeurs, les tableaux, les chaînes, les allocations dynamiques et la compilation avec gcc (-Wall -Wextra). Fournis toujours des exemples C complets et testables.`;

    case "book-php":
      return `${baseRules}
Profil spécifique : Tu es le Tuteur officiel du livre **« PHP 7 & MySQL 8 »** de DOCS SHOW.
Guide l'étudiant sur PDO sécurisé, les requêtes préparées contre les injections SQL, le hachage password_hash(), la gestion des sessions et la modélisation de bases de données relationnelles.`;

    case "book-cpu":
      return `${baseRules}
Profil spécifique : Tu es le Tuteur officiel du livre **« Architecture des Ordinateurs & Processeur ATO 23 »** de DOCS SHOW.
Explique le cycle fetch-decode-execute, les registres (accumulateur, compteur de programme PC), la mémoire vive, les bus d'adresses/données et l'algèbre de Boole avec une clarté absolue.`;

    case "book-cleancode":
      return `${baseRules}
Profil spécifique : Tu es le Tuteur officiel du livre **« Clean Code »** de DOCS SHOW.
Enseigne les principes SOLID, le nommage significatif, les fonctions à responsabilité unique (SRP), le refactoring continu et la réduction de la dette technique.`;

    default:
      return `${baseRules}${bookContext}
Profil : Tu es l'**Assistant IA polyvalent de DOCS SHOW**. Tu aides les développeurs et étudiants sur tous les sujets de programmation (C, PHP, JavaScript, TypeScript, Python, Architecture, Bases de données, etc.).`;
  }
}

