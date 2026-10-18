"use client";

import Link from "next/link";
import {
  DocsShowLogo,
  IconSidebar,
  IconSearch,
  IconTrending,
  IconBook,
  IconSettings,
  IconDownload,
  IconHome,
} from "./docs-chat-icons";

interface DocsChatRailProps {
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onOpenSearch: () => void;
  onOpenDebates: () => void;
  onOpenBooks: () => void;
  onOpenSettings: () => void;
  onExportChat: () => void;
  onNewChat: () => void;
}

export function DocsChatRail({
  isDrawerOpen,
  onToggleDrawer,
  onOpenSearch,
  onOpenDebates,
  onOpenBooks,
  onOpenSettings,
  onExportChat,
  onNewChat,
}: DocsChatRailProps) {
  return (
    <aside className="docs-chat-rail" aria-label="Navigation latérale DOCS SHOW">
      <div className="docs-chat-rail-top">
        {/* Logo officiel DOCS SHOW */}
        <div className="docs-chat-rail-item">
          <button
            type="button"
            onClick={onNewChat}
            className="docs-chat-rail-logo"
            aria-label="DOCS SHOW — Démarrer un nouveau chat"
          >
            <DocsShowLogo size={36} />
          </button>
          <div className="docs-chat-rail-tooltip" role="tooltip">
            Nouveau chat
          </div>
        </div>

        {/* Boutons d'action utiles et dédiés à la plateforme */}
        <div className="docs-chat-rail-icons">
          {/* 1. Historique */}
          <div className="docs-chat-rail-item">
            <button
              type="button"
              className={`docs-chat-rail-btn${isDrawerOpen ? " is-active" : ""}`}
              onClick={onToggleDrawer}
              aria-label="Afficher ou masquer l'historique des discussions"
            >
              <IconSidebar />
            </button>
            <div className="docs-chat-rail-tooltip" role="tooltip">
              Historique des discussions
            </div>
          </div>

          {/* 2. Recherche */}
          <div className="docs-chat-rail-item">
            <button
              type="button"
              className="docs-chat-rail-btn"
              onClick={onOpenSearch}
              aria-label="Rechercher des cours et tuteurs"
            >
              <IconSearch />
            </button>
            <div className="docs-chat-rail-tooltip" role="tooltip">
              Recherche & Outils
            </div>
          </div>

          {/* 3. Arène des Débats (DOCS Core vs DOCS Modern) */}
          <div className="docs-chat-rail-item">
            <button
              type="button"
              className="docs-chat-rail-btn"
              onClick={onOpenDebates}
              aria-label="Arène des Débats d'Ingénierie"
            >
              <IconTrending />
            </button>
            <div className="docs-chat-rail-tooltip" role="tooltip">
              Arène des Débats
            </div>
          </div>

          {/* 4. Bibliothèque de Livres */}
          <div className="docs-chat-rail-item">
            <button
              type="button"
              className="docs-chat-rail-btn"
              onClick={onOpenBooks}
              aria-label="Livres et cours de la bibliothèque"
            >
              <IconBook />
            </button>
            <div className="docs-chat-rail-tooltip" role="tooltip">
              Bibliothèque de cours
            </div>
          </div>

          {/* 5. Paramètres IA */}
          <div className="docs-chat-rail-item">
            <button
              type="button"
              className="docs-chat-rail-btn"
              onClick={onOpenSettings}
              aria-label="Paramètres de génération du chatbot"
            >
              <IconSettings />
            </button>
            <div className="docs-chat-rail-tooltip" role="tooltip">
              Paramètres IA
            </div>
          </div>
        </div>
      </div>

      <div className="docs-chat-rail-bottom">
        {/* 6. Exporter la discussion */}
        <div className="docs-chat-rail-item">
          <button
            type="button"
            className="docs-chat-rail-btn"
            onClick={onExportChat}
            aria-label="Exporter la discussion en Markdown"
          >
            <IconDownload />
          </button>
          <div className="docs-chat-rail-tooltip" role="tooltip">
            Exporter la discussion
          </div>
        </div>

        {/* 7. Retour au site web principal */}
        <div className="docs-chat-rail-item">
          <Link
            href="/"
            className="docs-chat-rail-btn"
            aria-label="Retourner au site principal DOCS SHOW"
          >
            <IconHome />
          </Link>
          <div className="docs-chat-rail-tooltip" role="tooltip">
            Retour à l&apos;accueil
          </div>
        </div>
      </div>
    </aside>
  );
}
