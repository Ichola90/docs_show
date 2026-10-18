export type BotId =
  | "assistant"
  | "docs-core"
  | "docs-modern"
  | "debate"
  | "book-c"
  | "book-php"
  | "book-cpu"
  | "book-cleancode";

export interface BotDefinition {
  id: BotId;
  name: string;
  tagline: string;
  avatarColor: string;
  iconType: "docs-show" | "cpu" | "cloud" | "swords" | "book";
  category: "officiel" | "specialiste" | "livre";
  description: string;
  systemPrompt: string;
  modelBadge: string;
  accentGradient: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  isImage: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  botId?: BotId;
  botName?: string;
  modelBadge?: string;
  roleStance?: string;
  content: string;
  timestamp: string;
  bookContextId?: string;
  attachments?: ChatAttachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  activeBotId: BotId;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  pinned?: boolean;
}

export interface GenerationSettings {
  temperature: number;
  creativityMode: "precise" | "balanced" | "creative";
  streamResponse: boolean;
  includeCodeExamples: boolean;
}
