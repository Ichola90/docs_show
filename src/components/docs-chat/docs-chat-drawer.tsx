"use client";

import Link from "next/link";
import type { ChatSession } from "./docs-chat-types";
import { IconPlus, DocsShowLogo } from "./docs-chat-icons";

interface DocsChatDrawerProps {
  isOpen: boolean;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export function DocsChatDrawer({
  isOpen,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: DocsChatDrawerProps) {
  return (
    <div
      className={`docs-chat-drawer${isOpen ? "" : " is-collapsed"}`}
      aria-hidden={!isOpen}
    >
      <div className="docs-chat-drawer-header">
        <Link href="/" className="docs-chat-drawer-brand" aria-label="DOCS SHOW, accueil">
          <DocsShowLogo size={28} />
          <span className="brand-text-3d docs-chat-drawer-brand-text">DOCS SHOW</span>
        </Link>
        <button
          type="button"
          className="docs-chat-new-btn"
          onClick={onNewChat}
        >
          <IconPlus />
          <span>Commencer un nouveau chat</span>
        </button>
      </div>

      <div className="docs-chat-drawer-content">
        <div className="docs-chat-section-title">Discussions Récentes</div>
        <div className="docs-chat-session-list">
          {sessions.length === 0 ? (
            <div style={{ padding: "12px 10px", fontSize: "12.5px", color: "var(--docs-chat-text-muted)" }}>
              Aucune discussion pour l&apos;instant. Posez une question au chatbot !
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  className={`docs-chat-session-item${isActive ? " is-active" : ""}`}
                  onClick={() => onSelectSession(session.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectSession(session.id);
                    }
                  }}
                >
                  <span className="docs-chat-session-title" title={session.title}>
                    {session.title || "Nouvelle conversation"}
                  </span>
                  <button
                    type="button"
                    className="docs-chat-session-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    title="Supprimer cette discussion"
                    aria-label={`Supprimer ${session.title}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="docs-chat-drawer-footer">
        <Link href="/" className="docs-chat-drawer-link">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Retour à l&apos;Accueil DOCS SHOW</span>
        </Link>
        <Link href="/bibliotheque" className="docs-chat-drawer-link">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>Bibliothèque de Livres</span>
        </Link>
      </div>
    </div>
  );
}

