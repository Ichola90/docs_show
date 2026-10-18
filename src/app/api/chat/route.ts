import { NextResponse } from "next/server";
import {
  isOpenRouterConfigured,
  callOpenRouterChat,
  getBotSystemPrompt,
  DEFAULT_OPENROUTER_MODEL,
  type OpenRouterChatMessage,
} from "@/lib/openrouter";
import {
  generateTutorResponse,
  generateDebateTurns,
} from "@/lib/assistant-knowledge";

interface ChatRequestBody {
  prompt: string;
  botId?: string;
  bookContextId?: string | null;
  model?: string;
  temperature?: number;
  history?: Array<{
    sender: "user" | "bot";
    content: string;
  }>;
}

interface ParsedDebateTurn {
  role: "bot_core" | "bot_modern" | "synthesis";
  agentName: string;
  badge: string;
  stance?: string;
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const prompt = (body.prompt || "").trim();
    const botId = body.botId || "assistant";
    const bookContextId = body.bookContextId || null;
    const model = body.model || DEFAULT_OPENROUTER_MODEL;
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.7;
    const history = Array.isArray(body.history) ? body.history : [];

    if (!prompt) {
      return NextResponse.json(
        { error: "Le paramètre 'prompt' est obligatoire." },
        { status: 400 }
      );
    }

    const isDebate =
      botId === "debate" ||
      prompt.toLowerCase().includes("débat") ||
      prompt.toLowerCase().includes("debat") ||
      prompt.toLowerCase().includes("vs");

    const openRouterReady = isOpenRouterConfigured();

    // =========================================================================
    // 1. MODE DÉBAT MULTI-CHATBOTS (DOCS Core vs DOCS Modern)
    // =========================================================================
    if (isDebate) {
      if (openRouterReady) {
        try {
          const debateSystemPrompt = `Tu es le moteur de l'Arène de Débat Multi-Chatbots de la plateforme DOCS SHOW.
Tu dois simuler une confrontation technique contradictoire hautement argumentée entre deux chatbots experts de la plateforme, conclue par une synthèse pragmatique.
1. "DOCS Core" : Architecte Systèmes bas-niveau (défend la rigueur matérielle, le C, l'absence de ramasse-miettes, la prévisibilité d'exécution et le contrôle mémoire).
2. "DOCS Modern" : Architecte Cloud & Web (défend la sécurité mémoire par défaut, TypeScript/Next.js, la vitesse d'itération en équipe et la scalabilité distribuée).
3. "Synthèse DOCS SHOW" : Consensus d'ingénierie et recommandations équilibrées pour les développeurs.

Tu DOIS impérativement répondre en JSON STRICT valide contenant un tableau 'turns' :
{
  "turns": [
    {
      "role": "bot_core",
      "agentName": "DOCS Core",
      "badge": "Core-Engine (Systèmes)",
      "stance": "Thèse Systèmes & Maîtrise Matérielle",
      "content": "Argumentaire percutant avec exemples techniques concrets en français..."
    },
    {
      "role": "bot_modern",
      "agentName": "DOCS Modern",
      "badge": "Cloud-Astra (Web)",
      "stance": "Antithèse Cloud & Vélocité d'Équipe",
      "content": "Contre-argumentaire percutant avec exemples de production en français..."
    },
    {
      "role": "synthesis",
      "agentName": "Synthèse DOCS SHOW",
      "badge": "Synthèse Consensus",
      "stance": "Arbitrage Pragmatique",
      "content": "Conseils pratiques pour savoir quel choix faire selon le contexte du projet..."
    }
  ]
}`;

          const debateResponse = await callOpenRouterChat({
            messages: [
              { role: "system", content: debateSystemPrompt },
              { role: "user", content: `Sujet du débat : "${prompt}"` },
            ],
            model,
            temperature: 0.75,
            jsonMode: true,
          });

          const parsed = JSON.parse(debateResponse.content) as { turns: ParsedDebateTurn[] };
          if (Array.isArray(parsed.turns) && parsed.turns.length >= 2) {
            return NextResponse.json({
              success: true,
              isDebate: true,
              source: "openrouter",
              model: debateResponse.model,
              debateTurns: parsed.turns,
            });
          }
        } catch (debateErr) {
          console.warn("Échec génération débat OpenRouter, bascule sur la base locale :", debateErr);
        }
      }

      // Repli local si OpenRouter non configuré ou en erreur
      const localTurns = generateDebateTurns(prompt);
      const formattedLocalTurns: ParsedDebateTurn[] = localTurns.map((t) => {
        const isCore = t.role === "bot_core";
        const isModern = t.role === "bot_modern";
        return {
          role: isCore ? "bot_core" : isModern ? "bot_modern" : "synthesis",
          agentName: t.debateAgent?.name || (isCore ? "DOCS Core" : isModern ? "DOCS Modern" : "Synthèse DOCS SHOW"),
          badge: isCore ? "Core-Engine (Systèmes)" : isModern ? "Cloud-Astra (Web)" : "Synthèse Consensus",
          stance: t.debateAgent?.stance || "Position technique",
          content: t.content,
        };
      });

      return NextResponse.json({
        success: true,
        isDebate: true,
        source: openRouterReady ? "openrouter_fallback" : "local",
        model: "DOCS-Local-Arène",
        debateTurns: formattedLocalTurns,
        note: !openRouterReady ? "Configurez OPEN_ROUTER_API_KEY dans votre fichier .env pour activer la génération de débats IA en direct." : undefined,
      });
    }

    // =========================================================================
    // 2. MODE TUTEUR / ASSISTANT IA STANDARD
    // =========================================================================
    if (openRouterReady) {
      try {
        const systemPrompt = getBotSystemPrompt(botId, bookContextId);

        // Construit le fil de discussion récent pour la mémoire de conversation (jusqu'à 6 derniers messages)
        const chatMessages: OpenRouterChatMessage[] = [{ role: "system", content: systemPrompt }];

        const recentHistory = history.slice(-6);
        for (const item of recentHistory) {
          if (item.content && item.content.trim()) {
            chatMessages.push({
              role: item.sender === "user" ? "user" : "assistant",
              content: item.content,
            });
          }
        }

        // Ajoute la dernière question de l'utilisateur
        chatMessages.push({ role: "user", content: prompt });

        const openRouterResult = await callOpenRouterChat({
          messages: chatMessages,
          model,
          temperature,
        });

        return NextResponse.json({
          success: true,
          isDebate: false,
          source: "openrouter",
          model: openRouterResult.model,
          reply: openRouterResult.content,
          usage: openRouterResult.usage,
        });
      } catch (openRouterErr: unknown) {
        const errorMsg = openRouterErr instanceof Error ? openRouterErr.message : String(openRouterErr);
        console.warn("Erreur lors de l'appel OpenRouter, repli sur la base locale :", errorMsg);

        const fallback = generateTutorResponse(prompt, bookContextId || undefined);
        return NextResponse.json({
          success: true,
          isDebate: false,
          source: "openrouter_fallback",
          model: "DOCS-Knowledge-Base",
          reply: fallback.content,
          warning: `Erreur API OpenRouter (${errorMsg}). Réponse assurée par la base de connaissances locale DOCS SHOW.`,
        });
      }
    }

    // Si OPEN_ROUTER_API_KEY n'est pas encore définie
    const localResult = generateTutorResponse(prompt, bookContextId || undefined);
    return NextResponse.json({
      success: true,
      isDebate: false,
      source: "local",
      model: "DOCS-Knowledge-Base",
      reply: localResult.content,
      note: "Ajoutez OPEN_ROUTER_API_KEY dans votre fichier .env pour activer les réponses génératives en direct d'OpenRouter.",
    });
  } catch (err: unknown) {
    console.error("Erreur générale route /api/chat :", err);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors du traitement du message." },
      { status: 500 }
    );
  }
}
