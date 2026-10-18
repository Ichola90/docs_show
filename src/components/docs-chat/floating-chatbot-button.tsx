"use client";

import Link from "next/link";
import { DocsChatbotIcon } from "./docs-chat-icons";
import "./docs-chat.css";

/**
 * Bouton flottant officiel de chat inspiré des grandes plateformes SaaS (Intercom, Zendesk, Crisp)
 * Aucun tooltip disgracieux, design circulaire épuré avec indicateur de présence "En ligne".
 */
export function FloatingChatbotButton() {
  return (
    <div className="docs-chat-fab-container" aria-label="Chatbot IA DOCS SHOW">
      <Link
        href="/assistant"
        className="docs-chat-fab-btn"
        aria-label="Discuter avec le Chatbot IA DOCS SHOW"
      >
        <span className="docs-chat-fab-icon-wrap">
          <DocsChatbotIcon size={28} />
          {/* Badge de statut actif "En ligne" comme sur les grandes plateformes */}
          <span className="docs-chat-fab-status" aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
