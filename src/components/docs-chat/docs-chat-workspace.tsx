"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { DocsChatRail } from "./docs-chat-rail";
import { DocsChatDrawer } from "./docs-chat-drawer";
import { DocsChatInput } from "./docs-chat-input";
import { DocsChatMessage } from "./docs-chat-message";
import { DocsShowLogo, IconTheme, IconMenu, IconSidebar } from "./docs-chat-icons";
import { DocsChatMenuOverlay } from "./docs-chat-menu-overlay";
import { getBotById } from "./docs-chat-bots";
import type { BotId, ChatSession, ChatMessage, ChatAttachment } from "./docs-chat-types";
import {
  generateTutorResponse,
  generateDebateTurns,
  DEBATE_TOPICS,
} from "@/lib/assistant-knowledge";
import { DocsChatModal, type ModalActionItem } from "./docs-chat-modal";
import { useTheme } from "@/components/theme/theme-provider";
import "./docs-chat.css";

const STORAGE_KEY = "docsshow_chat_sessions_v3";

const PLATFORM_BOOKS = [
  { id: "apprenez-programmer-c", name: "Le Langage C (Kernighan & Ritchie)", icon: "💻", botId: "book-c" as BotId },
  { id: "concevez-site-web-php-mysql", name: "PHP 7 & MySQL 8", icon: "🐘", botId: "book-php" as BotId },
  { id: "architecture-ordinateur-ato23", name: "Architecture des Ordinateurs & ATO 23", icon: "⚡", botId: "book-cpu" as BotId },
  { id: "clean-code", name: "Clean Code (Robert C. Martin)", icon: "✨", botId: "book-cleancode" as BotId },
  { id: "lean-startup", name: "The Lean Startup (Eric Ries)", icon: "🚀", botId: "assistant" as BotId },
];

const createDefaultSession = (): ChatSession => ({
  id: "session_welcome",
  title: "Nouveau chat",
  activeBotId: "assistant",
  createdAt: 0,
  updatedAt: 0,
  messages: [],
});

export function DocsChatWorkspace() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("session_welcome");
  const [activeBotId, setActiveBotId] = useState<BotId>("assistant");
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedBookContext, setSelectedBookContext] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("openrouter/auto");
  const [selectedTemperature, setSelectedTemperature] = useState<number>(0.7);

  // Tiroirs et Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isDebatesModalOpen, setIsDebatesModalOpen] = useState(false);
  const [isBooksModalOpen, setIsBooksModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAtModalOpen, setIsAtModalOpen] = useState(false);
  const [isMenuOverlayOpen, setIsMenuOverlayOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [bookSearchFilter, setBookSearchFilter] = useState("");
  const [debateSearchFilter, setDebateSearchFilter] = useState("");
  const [settingsSearchFilter, setSettingsSearchFilter] = useState("");
  const [atSearchFilter, setAtSearchFilter] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme: handleToggleTheme } = useTheme();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hydratation localStorage sécurisée React 19
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as ChatSession[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSessions(parsed);
            setActiveSessionId(parsed[0].id);
            setActiveBotId(parsed[0].activeBotId || "assistant");
            return;
          }
        }
      } catch {
        // Fallback
      }
      const initial = createDefaultSession();
      initial.createdAt = Date.now();
      initial.updatedAt = Date.now();
      setSessions([initial]);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const saveSessions = useCallback((updated: ChatSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Fallback
    }
  }, []);

  const currentSession = useMemo(() => {
    return (
      sessions.find((s) => s.id === activeSessionId) ||
      sessions[0] ||
      createDefaultSession()
    );
  }, [sessions, activeSessionId]);

  const activeBot = useMemo(() => {
    return getBotById(activeBotId);
  }, [activeBotId]);

  const messages = useMemo(() => {
    return currentSession.messages || [];
  }, [currentSession]);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (hasMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hasMessages, messages.length]);

  const handleNewChat = useCallback(() => {
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "Nouveau chat",
      activeBotId: activeBotId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    saveSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setInputPrompt("");
    setSelectedBookContext(null);
  }, [activeBotId, saveSessions, sessions]);

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      const filtered = sessions.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const resetSession: ChatSession = {
          id: `session_${Date.now()}`,
          title: "Nouveau chat",
          activeBotId: "assistant",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        };
        saveSessions([resetSession]);
        setActiveSessionId(resetSession.id);
      } else {
        saveSessions(filtered);
        if (activeSessionId === sessionId) {
          setActiveSessionId(filtered[0].id);
          setActiveBotId(filtered[0].activeBotId || "assistant");
        }
      }
    },
    [activeSessionId, saveSessions, sessions]
  );

  const handleSelectBot = useCallback(
    (botId: BotId) => {
      setActiveBotId(botId);
      const updated = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, activeBotId: botId } : s
      );
      saveSessions(updated);
    },
    [activeSessionId, saveSessions, sessions]
  );

  const handleResetAllSessions = useCallback(() => {
    if (confirm("Voulez-vous vraiment effacer toutes les discussions locales ?")) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
      const now = Date.now();
      const initial: ChatSession = {
        id: `session_${now}`,
        title: "Nouveau chat",
        activeBotId: "assistant",
        createdAt: now,
        updatedAt: now,
        messages: [],
      };
      setSessions([initial]);
      setActiveSessionId(initial.id);
      setIsSettingsModalOpen(false);
    }
  }, []);

  const handleExportChat = () => {
    if (messages.length === 0) {
      alert("Aucun message à exporter pour cette discussion.");
      return;
    }
    const md = messages
      .map(
        (m) =>
          `### ${m.sender === "user" ? "Utilisateur" : m.botName || "Bot"}\n\n${m.content}\n`
      )
      .join("\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `discussion-docsshow-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Envoi de message avec gestion des fichiers/photos et enregistrements
  const handleSubmitMessage = useCallback(
    async (promptText?: string, incomingAttachments?: ChatAttachment[]) => {
      const prompt = (promptText !== undefined ? promptText : inputPrompt).trim();
      const currentAttachments = incomingAttachments || [];

      if (!prompt && currentAttachments.length === 0) return;
      if (isLoading) return;

      setInputPrompt("");
      setIsLoading(true);

      const userMsgId = `usr_${Date.now()}`;
      const userMsg: ChatMessage = {
        id: userMsgId,
        sender: "user",
        content: prompt || (currentAttachments.length > 0 ? "Fichier(s) transmis pour analyse" : ""),
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        bookContextId: selectedBookContext || undefined,
        attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
      };

      const newTitle =
        currentSession.messages.length === 0
          ? (prompt || currentAttachments[0]?.name || "Discussion").slice(0, 36)
          : currentSession.title;

      const sessionWithUser = {
        ...currentSession,
        title: newTitle,
        updatedAt: Date.now(),
        messages: [...currentSession.messages, userMsg],
      };

      const updatedSessionsAfterUser = sessions.map((s) =>
        s.id === currentSession.id ? sessionWithUser : s
      );
      saveSessions(updatedSessionsAfterUser);

      // Appel de l'API /api/chat connectée à Groq (avec fallback local résilient)
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            botId: activeBotId,
            bookContextId: selectedBookContext,
            model: selectedModel,
            temperature: selectedTemperature,
            history: sessionWithUser.messages.map((m) => ({
              sender: m.sender,
              content: m.content,
            })),
          }),
        });

        if (res.ok) {
          const data = await res.json();

          // 1. Débat Multi-Chatbots généré par Groq
          if (data.isDebate && Array.isArray(data.debateTurns) && data.debateTurns.length > 0) {
            let currentList = [...sessionWithUser.messages];
            for (let i = 0; i < data.debateTurns.length; i++) {
              if (i > 0) {
                await new Promise((r) => setTimeout(r, 650));
              }
              const turn = data.debateTurns[i];
              const isCore = turn.role === "bot_core";
              const isModern = turn.role === "bot_modern";
              const agentId: BotId = isCore ? "docs-core" : isModern ? "docs-modern" : "assistant";

              const badge =
                turn.badge ||
                (data.source === "openrouter"
                  ? `OpenRouter • ${data.model}`
                  : isCore
                  ? "Core-Engine (Systèmes)"
                  : isModern
                  ? "Cloud-Astra (Web)"
                  : "Synthèse Consensus");

              const botMsg: ChatMessage = {
                id: `bot_debate_${Date.now()}_${i}`,
                sender: "bot",
                botId: agentId,
                botName: turn.agentName,
                modelBadge: badge,
                roleStance: turn.stance,
                content: turn.content,
                timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
              };
              currentList = [...currentList, botMsg];

              const intermediateSession = {
                ...currentSession,
                updatedAt: Date.now(),
                messages: currentList,
              };
              saveSessions(
                sessions.map((s) => (s.id === currentSession.id ? intermediateSession : s))
              );
            }
            setIsLoading(false);
            return;
          }

          // 2. Mode Tuteur / Assistant Standard généré par OpenRouter
          if (data.reply) {
            let finalContent = data.reply;
            if (currentAttachments.length > 0) {
              const names = currentAttachments.map((a) => `\`${a.name}\``).join(", ");
              finalContent = `> 📎 **Analyse du document / photo reçu** (${names}) :\n\n` + finalContent;
            }

            const modelBadge =
              data.source === "openrouter"
                ? `OpenRouter • ${data.model || "Auto"}`
                : activeBot.modelBadge;

            const botResponseMsg: ChatMessage = {
              id: `bot_resp_${Date.now()}`,
              sender: "bot",
              botId: activeBotId,
              botName: activeBot.name,
              modelBadge,
              content: finalContent,
              timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
              bookContextId: selectedBookContext || undefined,
            };

            const finalSession = {
              ...currentSession,
              updatedAt: Date.now(),
              messages: [...sessionWithUser.messages, botResponseMsg],
            };

            saveSessions(
              sessions.map((s) => (s.id === currentSession.id ? finalSession : s))
            );
            setIsLoading(false);
            return;
          }
        }
      } catch (apiErr) {
        console.warn("Erreur réseau /api/chat, utilisation du repli local:", apiErr);
      }

      // Repli local en cas d'absence de réseau ou d'erreur
      const isDebateMode =
        activeBotId === "debate" ||
        prompt.toLowerCase().includes("débat") ||
        prompt.toLowerCase().includes("debat") ||
        prompt.toLowerCase().includes("vs");

      if (isDebateMode) {
        const turns = generateDebateTurns(prompt);

        let currentList = [...sessionWithUser.messages];
        for (let i = 0; i < turns.length; i++) {
          await new Promise((r) => setTimeout(r, 650));
          const turn = turns[i];
          const isCore = turn.role === "bot_core";
          const isModern = turn.role === "bot_modern";
          const agentId: BotId = isCore ? "docs-core" : isModern ? "docs-modern" : "assistant";
          const agentName =
            turn.debateAgent?.name ||
            (isCore ? "DOCS Core" : isModern ? "DOCS Modern" : "Synthèse DOCS SHOW");
          const badge = isCore
            ? "Core-Engine (Systèmes)"
            : isModern
            ? "Cloud-Astra (Web)"
            : "Synthèse Consensus";
          const stance = turn.debateAgent?.stance;

          const botMsg: ChatMessage = {
            id: `bot_debate_${Date.now()}_${i}`,
            sender: "bot",
            botId: agentId,
            botName: agentName,
            modelBadge: badge,
            roleStance: stance,
            content: turn.content,
            timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          };
          currentList = [...currentList, botMsg];

          const intermediateSession = {
            ...currentSession,
            updatedAt: Date.now(),
            messages: currentList,
          };
          saveSessions(
            sessions.map((s) => (s.id === currentSession.id ? intermediateSession : s))
          );
        }
        setIsLoading(false);
        return;
      }

      // Mode Tuteur Standard
      await new Promise((r) => setTimeout(r, 600));
      const tutorResult = generateTutorResponse(prompt, selectedBookContext || undefined);

      let finalContent = tutorResult.content;
      if (currentAttachments.length > 0) {
        const names = currentAttachments.map((a) => `\`${a.name}\``).join(", ");
        finalContent = `> 📎 **Analyse du document / photo reçu** (${names}) :\n\n` + finalContent;
      }

      const botResponseMsg: ChatMessage = {
        id: `bot_resp_${Date.now()}`,
        sender: "bot",
        botId: activeBotId,
        botName: activeBot.name,
        modelBadge: activeBot.modelBadge,
        content: finalContent,
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        bookContextId: selectedBookContext || undefined,
      };

      const finalSession = {
        ...currentSession,
        updatedAt: Date.now(),
        messages: [...sessionWithUser.messages, botResponseMsg],
      };

      saveSessions(
        sessions.map((s) => (s.id === currentSession.id ? finalSession : s))
      );
      setIsLoading(false);
    },
    [
      inputPrompt,
      isLoading,
      selectedBookContext,
      currentSession,
      sessions,
      saveSessions,
      activeBotId,
      activeBot.name,
      activeBot.modelBadge,
      selectedModel,
      selectedTemperature,
    ]
  );

  const handleLaunchDebateTopic = useCallback(
    (topicPrompt: string) => {
      setIsDebatesModalOpen(false);
      setActiveBotId("debate");
      handleSubmitMessage(topicPrompt);
    },
    [handleSubmitMessage]
  );

  // 1. Éléments du modal Explorateur & Commandes (Design exact screenshot media_1792279515533_e33feafc.png)
  const exploreActionItems: ModalActionItem[] = useMemo(() => {
    const items: ModalActionItem[] = [
      {
        id: "library-add",
        icon: "📎",
        title: "Ajouter depuis la bibliothèque",
        description: "Parcourez et associez un cours officiel à la discussion",
        actionLabel: "Parcourir",
        onClick: () => {
          setIsExploreOpen(false);
          setIsBooksModalOpen(true);
        },
      },
      {
        id: "diagram-create",
        icon: "🖼️",
        title: "Diagramme d'architecture",
        description: "Transformez vos concepts en diagrammes de flux et schémas",
        actionLabel: "Créer",
        onClick: () => {
          setIsExploreOpen(false);
          setInputPrompt("Génère un diagramme d'architecture système complet en Mermaid pour illustrer :");
        },
      },
      {
        id: "web-search",
        icon: "🌐",
        title: "Recherche Documentation",
        description: "Trouvez des documentations officielles et syntaxes en temps réel",
        actionLabel: "Rechercher",
        onClick: () => {
          setIsExploreOpen(false);
          setInputPrompt("Recherche dans la documentation officielle de DOCS SHOW les détails sur :");
        },
      },
      {
        id: "deep-search",
        icon: "⚡",
        title: "Recherche approfondie",
        description: "Obtenez un audit technique détaillé avec complexité algorithmique",
        actionLabel: "Analyser",
        onClick: () => {
          setIsExploreOpen(false);
          setInputPrompt("Analyse en détail avec complexité Big-O et gestion mémoire le code suivant :");
        },
      },
      {
        id: "think-mode",
        icon: "🧠",
        title: "Réfléchis (Raisonnement)",
        description: "Pour des explications d'ingénierie avancées et preuves formelles",
        actionLabel: "Activer",
        onClick: () => {
          setIsExploreOpen(false);
          handleSelectBot("assistant");
          setInputPrompt("Avec une rigueur mathématique et d'ingénierie, démontre et explique :");
        },
      },
      {
        id: "bot-core",
        icon: "⚙️",
        title: "DOCS Core • C & Bas-Niveau",
        description: "Pointeurs, mémoire malloc, architecture CPU ATO 23",
        actionLabel: "Sélectionner",
        onClick: () => {
          handleSelectBot("docs-core");
          setIsExploreOpen(false);
        },
      },
      {
        id: "bot-modern",
        icon: "☁️",
        title: "DOCS Modern • Web & Cloud",
        description: "TypeScript, Next.js 16, API REST et architecture distribuée",
        actionLabel: "Sélectionner",
        onClick: () => {
          handleSelectBot("docs-modern");
          setIsExploreOpen(false);
        },
      },
      {
        id: "debates-arena",
        icon: "⚔️",
        title: "Arène des Débats Multi-Chatbots",
        description: "Confrontation directe entre DOCS Core et DOCS Modern",
        actionLabel: "Lancer",
        onClick: () => {
          setIsExploreOpen(false);
          setIsDebatesModalOpen(true);
        },
      },
      {
        id: "creator-info",
        icon: "👨‍💻",
        title: "Concepteur : Ingénieur ICHOLA AKIOSSI",
        description: "Coordonnées directes (+229 01 48 45 45 05) et portfolio officiel",
        actionLabel: "Consulter",
        onClick: () => {
          setIsExploreOpen(false);
          handleSubmitMessage("Qui est le créateur de la plateforme DOCS SHOW et comment le contacter ?");
        },
      },
      {
        id: "books-open",
        icon: "📚",
        title: "Livres & Cours Fondateurs",
        description: "5 ouvrages fondateurs intégrés avec tuteurs spécialisés",
        actionLabel: "Ouvrir",
        onClick: () => {
          setIsExploreOpen(false);
          setIsBooksModalOpen(true);
        },
      },
    ];

    if (!searchFilter.trim()) return items;
    const q = searchFilter.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [searchFilter, handleSelectBot, handleSubmitMessage]);

  // 2. Éléments du modal Bibliothèque de Livres (Design exact screenshot)
  const bookActionItems: ModalActionItem[] = useMemo(() => {
    const items: ModalActionItem[] = PLATFORM_BOOKS.map((bk) => ({
      id: bk.id,
      icon: bk.icon,
      title: bk.name,
      description: `Ancrer les explications et le code sur le cours officiel ${bk.name}`,
      actionLabel: "Ouvrir",
      onClick: () => {
        setSelectedBookContext(bk.name);
        handleSelectBot(bk.botId);
        setIsBooksModalOpen(false);
      },
    }));

    if (!bookSearchFilter.trim()) return items;
    const q = bookSearchFilter.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [bookSearchFilter, handleSelectBot]);

  // 3. Éléments du modal Débats Techniques (Design exact screenshot)
  const debateActionItems: ModalActionItem[] = useMemo(() => {
    const items: ModalActionItem[] = DEBATE_TOPICS.map((topic) => ({
      id: topic.id,
      icon: "⚔️",
      title: topic.title,
      description: topic.description,
      actionLabel: "Lancer",
      onClick: () => {
        setIsDebatesModalOpen(false);
        handleLaunchDebateTopic(topic.initialPrompt);
      },
    }));

    if (!debateSearchFilter.trim()) return items;
    const q = debateSearchFilter.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [debateSearchFilter, handleLaunchDebateTopic]);

  // 4. Éléments du modal Paramètres IA (Design exact screenshot)
  const settingsActionItems: ModalActionItem[] = useMemo(() => {
    const items: ModalActionItem[] = [
      {
        id: "model-openrouter-auto",
        icon: "✨",
        title: "OpenRouter : Auto Router (Recommandé)",
        description: "Sélectionne automatiquement le modèle le plus intelligent et disponible sur OpenRouter",
        actionLabel: selectedModel === "openrouter/auto" ? "✓ Actif" : "Choisir",
        onClick: () => {
          setSelectedModel("openrouter/auto");
          setIsSettingsModalOpen(false);
        },
      },
      {
        id: "model-llama-70b",
        icon: "⚡",
        title: "OpenRouter : Meta Llama 3.3 70B Instruct",
        description: "Raisonnement technique approfondi, architecture logicielle et code C/Web",
        actionLabel: selectedModel === "meta-llama/llama-3.3-70b-instruct" ? "✓ Actif" : "Choisir",
        onClick: () => {
          setSelectedModel("meta-llama/llama-3.3-70b-instruct");
          setIsSettingsModalOpen(false);
        },
      },
      {
        id: "model-deepseek-r1",
        icon: "🧠",
        title: "OpenRouter : DeepSeek R1 (Raisonnement)",
        description: "Modèle de raisonnement logique de pointe pour problèmes complexes et algorithmes",
        actionLabel: selectedModel === "deepseek/deepseek-r1" ? "✓ Actif" : "Choisir",
        onClick: () => {
          setSelectedModel("deepseek/deepseek-r1");
          setIsSettingsModalOpen(false);
        },
      },
      {
        id: "model-free-gemma",
        icon: "🚀",
        title: "OpenRouter : Gemma 26B (Free Tier)",
        description: "Modèle Google rapide disponible sans consommation de crédits payants",
        actionLabel: selectedModel === "google/gemma-4-26b-a4b-it:free" ? "✓ Actif" : "Choisir",
        onClick: () => {
          setSelectedModel("google/gemma-4-26b-a4b-it:free");
          setIsSettingsModalOpen(false);
        },
      },
      {
        id: "setting-precise",
        icon: "🎯",
        title: "Mode Haute Précision (Température 0.2)",
        description: "Optimisé pour la syntaxe C, pointeurs, malloc et algorithmique formelle",
        actionLabel: selectedTemperature === 0.2 ? "✓ Actif" : "Activer",
        onClick: () => {
          setSelectedTemperature(0.2);
          setIsSettingsModalOpen(false);
        },
      },
      {
        id: "setting-balanced",
        icon: "⚖️",
        title: "Mode Équilibré (Température 0.7)",
        description: "Recommandé pour l'apprentissage général et les explications pédagogiques",
        actionLabel: selectedTemperature === 0.7 ? "✓ Actif" : "Activer",
        onClick: () => {
          setSelectedTemperature(0.7);
          setIsSettingsModalOpen(false);
        },
      },
      {
        id: "setting-creative",
        icon: "💡",
        title: "Mode Créatif & Architecture (Température 0.9)",
        description: "Pour la conception de systèmes, scénarios et idées de projets",
        actionLabel: selectedTemperature === 0.9 ? "✓ Actif" : "Activer",
        onClick: () => {
          setSelectedTemperature(0.9);
          setIsSettingsModalOpen(false);
        },
      },
      {
        id: "setting-theme",
        icon: "🌓",
        title: "Thème Visuel de l'Interface",
        description: `Actuellement en mode ${theme === "dark" ? "Sombre" : "Clair"}`,
        actionLabel: theme === "dark" ? "Passer en Clair" : "Passer en Sombre",
        onClick: handleToggleTheme,
      },
      {
        id: "setting-reset",
        icon: "🗑️",
        title: "Réinitialiser toutes les discussions",
        description: "Effacer l'historique local et recommencer à zéro",
        actionLabel: "Effacer",
        onClick: handleResetAllSessions,
      },
    ];

    if (!settingsSearchFilter.trim()) return items;
    const q = settingsSearchFilter.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [
    settingsSearchFilter,
    theme,
    selectedModel,
    selectedTemperature,
    handleToggleTheme,
    handleResetAllSessions,
  ]);

  // 5. Éléments du modal Mentionner un Chatbot ou un Cours (@)
  const atActionItems: ModalActionItem[] = useMemo(() => {
    const items: ModalActionItem[] = [
      {
        id: "at-assistant",
        icon: "🤖",
        title: "Assistant DOCS SHOW",
        description: "Tuteur polyvalent pour l'ensemble des cours et de la documentation",
        actionLabel: "Mentionner",
        onClick: () => {
          handleSelectBot("assistant");
          setInputPrompt((prev) => (prev ? `${prev} @Assistant ` : "@Assistant "));
          setIsAtModalOpen(false);
        },
      },
      {
        id: "at-docs-core",
        icon: "⚙️",
        title: "DOCS Core • C & Systèmes",
        description: "Spécialiste de la mémoire, pointeurs, assembleur et architecture",
        actionLabel: "Mentionner",
        onClick: () => {
          handleSelectBot("docs-core");
          setInputPrompt((prev) => (prev ? `${prev} @DOCS-Core ` : "@DOCS-Core "));
          setIsAtModalOpen(false);
        },
      },
      {
        id: "at-docs-modern",
        icon: "☁️",
        title: "DOCS Modern • Web & Cloud",
        description: "Spécialiste TypeScript, Next.js, APIs REST et microservices",
        actionLabel: "Mentionner",
        onClick: () => {
          handleSelectBot("docs-modern");
          setInputPrompt((prev) => (prev ? `${prev} @DOCS-Modern ` : "@DOCS-Modern "));
          setIsAtModalOpen(false);
        },
      },
      {
        id: "at-debate",
        icon: "⚔️",
        title: "Arène des Débats Multi-Chatbots",
        description: "Confrontation directe contradictoire entre DOCS Core et DOCS Modern",
        actionLabel: "Lancer",
        onClick: () => {
          handleSelectBot("debate");
          setIsAtModalOpen(false);
          setIsDebatesModalOpen(true);
        },
      },
      ...PLATFORM_BOOKS.map((bk) => ({
        id: `at-${bk.id}`,
        icon: bk.icon,
        title: `Tuteur : ${bk.name}`,
        description: `Ancrer directement les explications sur le cours ${bk.name}`,
        actionLabel: "Mentionner",
        onClick: () => {
          setSelectedBookContext(bk.name);
          handleSelectBot(bk.botId);
          setInputPrompt((prev) => (prev ? `${prev} @${bk.name} ` : `@${bk.name} `));
          setIsAtModalOpen(false);
        },
      })),
    ];

    if (!atSearchFilter.trim()) return items;
    const q = atSearchFilter.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [atSearchFilter, handleSelectBot]);

  return (
    <div className="docs-chat-viewport" data-theme={theme}>
      {/* 1. Rail vertical gauche d'icônes avec tooltips haute fidélité */}
      <DocsChatRail
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        onOpenSearch={() => setIsExploreOpen(true)}
        onOpenDebates={() => setIsDebatesModalOpen(true)}
        onOpenBooks={() => setIsBooksModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onExportChat={handleExportChat}
        onNewChat={handleNewChat}
      />

      {/* 2. Tiroir latéral coulissant d'historique */}
      <DocsChatDrawer
        isOpen={isDrawerOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          const found = sessions.find((s) => s.id === id);
          if (found?.activeBotId) setActiveBotId(found.activeBotId);
        }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      {/* Backdrop du tiroir d'historique sur mobile */}
      {isDrawerOpen && (
        <div
          className="docs-chat-drawer-backdrop"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 3. Scène principale */}
      <main className="docs-chat-main">
        {/* Boutons d'action supérieurs en accueil (Thème clair/sombre + Toggle Menu Mobile) */}
        {!hasMessages && (
          <div className="docs-chat-top-actions">
            <button
              type="button"
              className="docs-chat-top-btn"
              onClick={handleToggleTheme}
              aria-label="Changer de thème"
              title={`Passer en mode ${theme === "dark" ? "Clair" : "Sombre"}`}
            >
              <IconTheme />
            </button>
            <button
              type="button"
              className="docs-chat-top-btn docs-chat-top-menu-btn"
              onClick={() => setIsMenuOverlayOpen(true)}
              aria-label="Ouvrir le menu du chatbot"
              title="Menu du Chatbot"
            >
              <IconMenu />
            </button>
          </div>
        )}

        {/* ÉTAT 1 : ACCUEIL HERO DOCS SHOW */}
        {!hasMessages ? (
          <div className="docs-chat-hero">
            {/* Ligne de Titre avec le LOGO OFFICIEL DE DOCS SHOW */}
            <div className="docs-chat-brand-row">
              <DocsShowLogo size={62} />
              <h1 className="brand-text-3d docs-chat-brand-title">DOCS SHOW</h1>
            </div>

            {/* Pilules de sélection des Chatbots & Livres */}
            <div className="docs-chat-pills-row">
              <button
                type="button"
                className={`docs-chat-bot-pill${activeBotId === "assistant" ? " is-active" : ""}`}
                onClick={() => handleSelectBot("assistant")}
              >
                <span className="docs-chat-pill-icon">
                  <DocsShowLogo size={16} />
                </span>
                <span>Assistant</span>
              </button>

              <button
                type="button"
                className={`docs-chat-bot-pill${activeBotId === "docs-core" ? " is-active" : ""}`}
                onClick={() => handleSelectBot("docs-core")}
              >
                <span className="docs-chat-pill-icon">⚙️</span>
                <span>DOCS Core</span>
              </button>

              <button
                type="button"
                className={`docs-chat-bot-pill${activeBotId === "docs-modern" ? " is-active" : ""}`}
                onClick={() => handleSelectBot("docs-modern")}
              >
                <span className="docs-chat-pill-icon">☁️</span>
                <span>DOCS Modern</span>
              </button>

              <button
                type="button"
                className={`docs-chat-bot-pill${activeBotId === "debate" ? " is-active" : ""}`}
                onClick={() => handleSelectBot("debate")}
                aria-label="Débat contradictoire entre DOCS Core et DOCS Modern"
              >
                <span className="docs-chat-pill-icon">⚔️</span>
                <span>Débat Multi-Chatbots</span>
              </button>

              <button
                type="button"
                className="docs-chat-bot-pill"
                onClick={() => setIsBooksModalOpen(true)}
                aria-label="Choisir un cours parmi les livres"
              >
                <span className="docs-chat-pill-icon">📚</span>
                <span>Parcourir les Livres</span>
              </button>
            </div>

            {/* Carte d'entrée flottante centrée */}
            <DocsChatInput
              value={inputPrompt}
              onChange={setInputPrompt}
              onSubmit={handleSubmitMessage}
              isLoading={isLoading}
              selectedBookContext={selectedBookContext}
              onClearBookContext={() => setSelectedBookContext(null)}
              onOpenAtModal={() => setIsAtModalOpen(true)}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            />
          </div>
        ) : (
          /* ÉTAT 2 : CONVERSATION ACTIVE */
          <div className="docs-chat-container">
            <header className="docs-chat-header">
              <div className="docs-chat-header-info">
                {/* Bouton toggle de l'historique */}
                <button
                  type="button"
                  className="docs-chat-header-drawer-btn"
                  onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                  aria-label="Afficher ou masquer l'historique"
                  title="Historique des discussions"
                >
                  <IconSidebar />
                </button>

                <Link
                  href="/"
                  className="docs-chat-header-brand"
                  title="Retourner à l'accueil DOCS SHOW"
                >
                  <DocsShowLogo size={26} />
                  <span className="brand-text-3d docs-chat-header-brand-text">DOCS SHOW</span>
                </Link>
                <span className="docs-chat-header-divider">/</span>
                <div
                  className="docs-chat-header-avatar"
                  style={{ background: activeBot.accentGradient }}
                >
                  {activeBot.iconType === "docs-show" ? (
                    <DocsShowLogo size={18} />
                  ) : activeBot.iconType === "cpu" ? (
                    "⚙️"
                  ) : activeBot.iconType === "cloud" ? (
                    "☁️"
                  ) : activeBot.iconType === "swords" ? (
                    "⚔️"
                  ) : (
                    "📚"
                  )}
                </div>
                <div className="docs-chat-header-titles">
                  <div className="docs-chat-header-name">
                    <span>{activeBot.name}</span>
                    <span className="docs-chat-header-model">{activeBot.modelBadge}</span>
                  </div>
                </div>
              </div>

              {/* Actions de l'entête : Nouveau chat + Thème + Toggle Menu Overlay */}
              <div className="docs-chat-header-actions">
                <button
                  type="button"
                  className="docs-chat-bot-pill docs-chat-header-new-btn"
                  onClick={handleNewChat}
                  title="Démarrer un nouveau chat"
                >
                  <span>+ Nouveau chat</span>
                </button>

                <button
                  type="button"
                  className="docs-chat-header-icon-btn"
                  onClick={handleToggleTheme}
                  aria-label="Changer de thème"
                  title={`Passer en mode ${theme === "dark" ? "Clair" : "Sombre"}`}
                >
                  <IconTheme />
                </button>

                {/* BOUTON TOGGLE MENU OVERLAY CHATBOT */}
                <button
                  type="button"
                  className="docs-chat-menu-toggle-btn"
                  onClick={() => setIsMenuOverlayOpen(true)}
                  aria-label="Ouvrir le menu complet du chatbot"
                  title="Menu du Chatbot"
                >
                  <IconMenu />
                </button>
              </div>
            </header>

            {/* Flux de messages */}
            <div className="docs-chat-scroll">
              <div className="docs-chat-stream">
                {messages.map((msg) => (
                  <DocsChatMessage key={msg.id} message={msg} />
                ))}

                {isLoading && (
                  <div className="docs-chat-bot-row">
                    <div
                      className="docs-chat-bot-avatar"
                      style={{ background: activeBot.accentGradient }}
                    >
                      <DocsShowLogo size={18} />
                    </div>
                    <div className="docs-chat-bot-body">
                      <div className="docs-chat-bot-meta">
                        <span className="docs-chat-bot-name">{activeBot.name}</span>
                        <span style={{ fontSize: "11px", color: "var(--docs-chat-text-muted)" }}>
                          analyse et génère la réponse...
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "4px", padding: "8px 0" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--docs-chat-accent)", animation: "pulseRecordingDot 1s infinite" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Carte d'entrée ancrée en bas */}
            <div className="docs-chat-docked-input">
              <DocsChatInput
                value={inputPrompt}
                onChange={setInputPrompt}
                onSubmit={handleSubmitMessage}
                isLoading={isLoading}
                selectedBookContext={selectedBookContext}
                onClearBookContext={() => setSelectedBookContext(null)}
                onOpenAtModal={() => setIsAtModalOpen(true)}
                onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              />
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1 : EXPLORATEUR D'ACTIONS & OUTILS (Design exact screenshot media_1792279515533_e33feafc.png) */}
      <DocsChatModal
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
        bannerIcon="📎"
        bannerTitle="DOCS SHOW Espace & Quota de Contexte"
        bannerSubtitle="Importation et indexation illimitée pour vos fichiers de code C, assembleur et architecture"
        searchInputPlaceholder="Saisissez du texte pour rechercher des outils, cours ou plugins..."
        searchValue={searchFilter}
        onSearchChange={setSearchFilter}
        items={exploreActionItems}
      />

      {/* MODAL 2 : ARÈNE DES DÉBATS TECHNIQUES (Design exact screenshot) */}
      <DocsChatModal
        isOpen={isDebatesModalOpen}
        onClose={() => setIsDebatesModalOpen(false)}
        bannerIcon="⚔️"
        bannerTitle="Arène des Débats Techniques DOCS SHOW"
        bannerSubtitle="Confrontation contradictoire en temps réel entre DOCS Core et DOCS Modern"
        searchInputPlaceholder="Saisissez du texte pour filtrer les débats..."
        searchValue={debateSearchFilter}
        onSearchChange={setDebateSearchFilter}
        items={debateActionItems}
      />

      {/* MODAL 3 : BIBLIOTHÈQUE DE LIVRES & COURS (Design exact screenshot) */}
      <DocsChatModal
        isOpen={isBooksModalOpen}
        onClose={() => setIsBooksModalOpen(false)}
        bannerIcon="📚"
        bannerTitle="Bibliothèque Officielle DOCS SHOW"
        bannerSubtitle="Ancrez les réponses du chatbot sur l'un de nos 5 cours de référence fondateurs"
        searchInputPlaceholder="Saisissez du texte pour rechercher dans les livres..."
        searchValue={bookSearchFilter}
        onSearchChange={setBookSearchFilter}
        items={bookActionItems}
      />

      {/* MODAL 4 : PARAMÈTRES IA (Design exact screenshot) */}
      <DocsChatModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        bannerIcon="⚙️"
        bannerTitle="Paramètres & Configuration DOCS SHOW"
        bannerSubtitle="Ajustez les moteurs d'inférence, la précision et le thème visuel"
        searchInputPlaceholder="Saisissez du texte pour filtrer les paramètres..."
        searchValue={settingsSearchFilter}
        onSearchChange={setSettingsSearchFilter}
        items={settingsActionItems}
      />

      {/* MODAL 5 : MENTIONNER UN CHATBOT OU UN COURS (@) (Design exact screenshot) */}
      <DocsChatModal
        isOpen={isAtModalOpen}
        onClose={() => setIsAtModalOpen(false)}
        bannerIcon="@"
        bannerTitle="Mentionner un Chatbot ou Tuteur de Cours"
        bannerSubtitle="Associez un modèle spécialisé ou un cours de référence directement dans votre message"
        searchInputPlaceholder="Saisissez @ ou du texte pour filtrer les chatbots et cours..."
        searchValue={atSearchFilter}
        onSearchChange={setAtSearchFilter}
        items={atActionItems}
      />

      {/* MENU OVERLAY ADAPTÉ AU CHATBOT DOCS SHOW */}
      <DocsChatMenuOverlay
        isOpen={isMenuOverlayOpen}
        onClose={() => setIsMenuOverlayOpen(false)}
        activeBotId={activeBotId}
        onSelectBot={handleSelectBot}
        onNewChat={handleNewChat}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenSearch={() => setIsExploreOpen(true)}
        onOpenDebates={() => setIsDebatesModalOpen(true)}
        onOpenBooks={() => setIsBooksModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onExportChat={handleExportChat}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    </div>
  );
}
