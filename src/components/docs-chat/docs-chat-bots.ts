import type { BotDefinition } from "./docs-chat-types";

export const PLATFORM_BOTS: BotDefinition[] = [
  {
    id: "assistant",
    name: "Assistant DOCS SHOW",
    tagline: "Chatbot IA officiel de la plateforme DOCS SHOW",
    avatarColor: "#2563eb",
    iconType: "docs-show",
    category: "officiel",
    description:
      "L'assistant principal de DOCS SHOW, expert de l'ensemble de la bibliothèque technique, du code propre et des cours en ligne.",
    systemPrompt:
      "Tu es l'Assistant IA de DOCS SHOW. Tu réponds de manière claire, structurée et pédagogique avec des exemples de code concrets.",
    modelBadge: "DOCS-v2.5 • Officiel",
    accentGradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0284c7 100%)",
  },
  {
    id: "docs-core",
    name: "DOCS Core",
    tagline: "Architecte Systèmes, C & Processeurs",
    avatarColor: "#0284c7",
    iconType: "cpu",
    category: "specialiste",
    description:
      "Expert en programmation bas-niveau, langage C, gestion de la mémoire (malloc/free, pile vs tas), assembleur et architecture CPU (ATO 23).",
    systemPrompt:
      "Tu es DOCS Core, l'architecte systèmes bas-niveau. Tu privilégies la performance matérielle et la prévisibilité d'exécution.",
    modelBadge: "Core-Engine • Bas-Niveau",
    accentGradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
  },
  {
    id: "docs-modern",
    name: "DOCS Modern",
    tagline: "Architecte Cloud, Web & TypeScript",
    avatarColor: "#059669",
    iconType: "cloud",
    category: "specialiste",
    description:
      "Expert en développement web moderne (Next.js 16, TypeScript, architectures microservices, APIs RESTful et scalabilité cloud).",
    systemPrompt:
      "Tu es DOCS Modern, l'architecte cloud et web. Tu privilégies l'agilité, la sécurité des types et les déploiements résilients.",
    modelBadge: "Cloud-Astra • Full-Stack",
    accentGradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
  },
  {
    id: "debate",
    name: "Débat Multi-Chatbots",
    tagline: "Confrontation directe entre DOCS Core et DOCS Modern",
    avatarColor: "#dc2626",
    iconType: "swords",
    category: "officiel",
    description:
      "Faites débattre les deux chatbots de la plateforme (DOCS Core et DOCS Modern) sur vos dilemmes d'architecture logicielle et de code !",
    systemPrompt:
      "Simule une discussion contradictoire hautement argumentée entre deux experts de la plateforme, conclue par une synthèse pragmatique.",
    modelBadge: "Arène Dual-Chatbot",
    accentGradient: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
  },
  {
    id: "book-c",
    name: "Tuteur Le Langage C",
    tagline: "Ancré sur le livre officiel Le Langage C",
    avatarColor: "#2563eb",
    iconType: "book",
    category: "livre",
    description:
      "Pointeurs, arithmétique d'adresses, allocation dynamique, structures et compilation modulaire en C.",
    systemPrompt: "Tu es le tuteur officiel du livre Le Langage C de DOCS SHOW.",
    modelBadge: "Livre • C Reference",
    accentGradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  },
  {
    id: "book-php",
    name: "Tuteur PHP 7 & MySQL 8",
    tagline: "Ancré sur le livre officiel Web Backend",
    avatarColor: "#7c3aed",
    iconType: "book",
    category: "livre",
    description:
      "Connexion PDO sécurisée, requêtes préparées, hachage de mots de passe, sessions et conception relationnelle.",
    systemPrompt: "Tu es le tuteur officiel du livre PHP 7 & MySQL 8 de DOCS SHOW.",
    modelBadge: "Livre • PHP & MySQL",
    accentGradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
  },
  {
    id: "book-cpu",
    name: "Tuteur Architecture CPU",
    tagline: "Ancré sur Architecture des Ordinateurs & ATO 23",
    avatarColor: "#d97706",
    iconType: "book",
    category: "livre",
    description:
      "Registres, cycles d'horloge, bus d'adresses et de données, décodage d'instructions du processeur ATO 23.",
    systemPrompt: "Tu es le tuteur officiel du livre Architecture CPU de DOCS SHOW.",
    modelBadge: "Livre • CPU ATO 23",
    accentGradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
  },
  {
    id: "book-cleancode",
    name: "Tuteur Clean Code",
    tagline: "Principes SOLID et qualité logicielle",
    avatarColor: "#0891b2",
    iconType: "book",
    category: "livre",
    description:
      "Nommage significatif, fonctions courtes à responsabilité unique, refactoring et élimination de la dette technique.",
    systemPrompt: "Tu es le tuteur officiel du livre Clean Code de DOCS SHOW.",
    modelBadge: "Livre • Clean Code",
    accentGradient: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
  },
];

export function getBotById(id: string): BotDefinition {
  return PLATFORM_BOTS.find((b) => b.id === id) || PLATFORM_BOTS[0];
}

