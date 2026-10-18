"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DocsShowLogo,
  IconClose,
  IconPlus,
  IconSidebar,
  IconSearch,
  IconTrending,
  IconBook,
  IconSettings,
  IconDownload,
  IconTheme,
  IconHome,
} from "./docs-chat-icons";
import type { BotId } from "./docs-chat-types";
import { getBotById } from "./docs-chat-bots";

interface DocsChatMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeBotId: BotId;
  onSelectBot: (botId: BotId) => void;
  onNewChat: () => void;
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
  onOpenDebates: () => void;
  onOpenBooks: () => void;
  onOpenSettings: () => void;
  onExportChat: () => void;
  theme: string;
  onToggleTheme: () => void;
}

export function DocsChatMenuOverlay({
  isOpen,
  onClose,
  activeBotId,
  onSelectBot,
  onNewChat,
  onOpenDrawer,
  onOpenSearch,
  onOpenDebates,
  onOpenBooks,
  onOpenSettings,
  onExportChat,
  theme,
  onToggleTheme,
}: DocsChatMenuOverlayProps) {
  const activeBot = getBotById(activeBotId);

  // Fermeture par touche Echap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="docs-chat-menu-overlay-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Menu du Chatbot DOCS SHOW"
    >
      <div
        className="docs-chat-menu-overlay-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Entête du menu */}
        <div className="docs-chat-menu-overlay-header">
          <div className="docs-chat-menu-overlay-brand">
            <DocsShowLogo size={32} />
            <div>
              <span className="brand-text-3d docs-chat-menu-brand-title">DOCS SHOW</span>
              <span className="docs-chat-menu-subtitle">Menu & Actions du Chat</span>
            </div>
          </div>
          <button
            type="button"
            className="docs-chat-menu-close-btn"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <IconClose />
          </button>
        </div>

        {/* Section Chatbot Actif & Sélecteur Rapide */}
        <div className="docs-chat-menu-section">
          <div className="docs-chat-menu-section-label">Chatbot Actif</div>
          <div
            className="docs-chat-menu-current-bot"
            style={{
              borderColor: activeBot.id === "debate" ? "#f59e0b" : "var(--docs-chat-border)",
            }}
          >
            <div
              className="docs-chat-menu-bot-avatar"
              style={{ background: activeBot.accentGradient }}
            >
              {activeBot.iconType === "docs-show" ? (
                <DocsShowLogo size={22} />
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
            <div className="docs-chat-menu-bot-info">
              <div className="docs-chat-menu-bot-name">
                {activeBot.name}
                <span className="docs-chat-menu-bot-badge">{activeBot.modelBadge}</span>
              </div>
              <div className="docs-chat-menu-bot-desc">{activeBot.description}</div>
            </div>
          </div>

          {/* Grille de sélection des modes */}
          <div className="docs-chat-menu-bot-grid">
            <button
              type="button"
              className={`docs-chat-menu-bot-chip${activeBotId === "assistant" ? " is-active" : ""}`}
              onClick={() => {
                onSelectBot("assistant");
                onClose();
              }}
            >
              <span>🤖</span>
              <span>Assistant</span>
            </button>
            <button
              type="button"
              className={`docs-chat-menu-bot-chip${activeBotId === "docs-core" ? " is-active" : ""}`}
              onClick={() => {
                onSelectBot("docs-core");
                onClose();
              }}
            >
              <span>⚙️</span>
              <span>DOCS Core</span>
            </button>
            <button
              type="button"
              className={`docs-chat-menu-bot-chip${activeBotId === "docs-modern" ? " is-active" : ""}`}
              onClick={() => {
                onSelectBot("docs-modern");
                onClose();
              }}
            >
              <span>☁️</span>
              <span>DOCS Modern</span>
            </button>
            <button
              type="button"
              className={`docs-chat-menu-bot-chip${activeBotId === "debate" ? " is-active" : ""}`}
              onClick={() => {
                onSelectBot("debate");
                onClose();
              }}
            >
              <span>⚔️</span>
              <span>Débat IA</span>
            </button>
          </div>
        </div>

        {/* Section Actions Principales */}
        <div className="docs-chat-menu-section">
          <div className="docs-chat-menu-section-label">Actions de Conversation</div>
          <div className="docs-chat-menu-actions-list">
            <button
              type="button"
              className="docs-chat-menu-action-item"
              onClick={() => {
                onClose();
                onNewChat();
              }}
            >
              <span className="docs-chat-menu-action-icon">
                <IconPlus />
              </span>
              <div className="docs-chat-menu-action-content">
                <span className="docs-chat-menu-action-title">Nouveau chat</span>
                <span className="docs-chat-menu-action-sub">Démarrer une nouvelle discussion propre</span>
              </div>
            </button>

            <button
              type="button"
              className="docs-chat-menu-action-item"
              onClick={() => {
                onClose();
                onOpenDrawer();
              }}
            >
              <span className="docs-chat-menu-action-icon">
                <IconSidebar />
              </span>
              <div className="docs-chat-menu-action-content">
                <span className="docs-chat-menu-action-title">Historique des discussions</span>
                <span className="docs-chat-menu-action-sub">Retrouver et gérer vos sessions précédentes</span>
              </div>
            </button>

            <button
              type="button"
              className="docs-chat-menu-action-item"
              onClick={() => {
                onClose();
                onOpenDebates();
              }}
            >
              <span className="docs-chat-menu-action-icon">
                <IconTrending />
              </span>
              <div className="docs-chat-menu-action-content">
                <span className="docs-chat-menu-action-title">Arène des Débats techniques</span>
                <span className="docs-chat-menu-action-sub">Confrontation contradictoire C vs Web Moderne</span>
              </div>
            </button>

            <button
              type="button"
              className="docs-chat-menu-action-item"
              onClick={() => {
                onClose();
                onOpenBooks();
              }}
            >
              <span className="docs-chat-menu-action-icon">
                <IconBook />
              </span>
              <div className="docs-chat-menu-action-content">
                <span className="docs-chat-menu-action-title">Bibliothèque de cours</span>
                <span className="docs-chat-menu-action-sub">Ancrer les réponses sur un cours officiel</span>
              </div>
            </button>

            <button
              type="button"
              className="docs-chat-menu-action-item"
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
            >
              <span className="docs-chat-menu-action-icon">
                <IconSearch />
              </span>
              <div className="docs-chat-menu-action-content">
                <span className="docs-chat-menu-action-title">Recherche & Commandes (/)</span>
                <span className="docs-chat-menu-action-sub">Explorateur et raccourcis de commande</span>
              </div>
            </button>

            <button
              type="button"
              className="docs-chat-menu-action-item"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
            >
              <span className="docs-chat-menu-action-icon">
                <IconSettings />
              </span>
              <div className="docs-chat-menu-action-content">
                <span className="docs-chat-menu-action-title">Paramètres IA & Modèles</span>
                <span className="docs-chat-menu-action-sub">Sélection OpenRouter, température et précision</span>
              </div>
            </button>

            <button
              type="button"
              className="docs-chat-menu-action-item"
              onClick={() => {
                onClose();
                onExportChat();
              }}
            >
              <span className="docs-chat-menu-action-icon">
                <IconDownload />
              </span>
              <div className="docs-chat-menu-action-content">
                <span className="docs-chat-menu-action-title">Exporter la discussion</span>
                <span className="docs-chat-menu-action-sub">Télécharger les messages en Markdown (.md)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Section Préférences & Navigation Plateforme */}
        <div className="docs-chat-menu-section">
          <div className="docs-chat-menu-section-label">Options & Navigation</div>
          <div className="docs-chat-menu-actions-list">
            <button
              type="button"
              className="docs-chat-menu-action-item"
              onClick={onToggleTheme}
            >
              <span className="docs-chat-menu-action-icon">
                <IconTheme />
              </span>
              <div className="docs-chat-menu-action-content">
                <span className="docs-chat-menu-action-title">
                  Thème : {theme === "dark" ? "Mode Sombre" : "Mode Clair"}
                </span>
                <span className="docs-chat-menu-action-sub">
                  Basculer en thème {theme === "dark" ? "Clair" : "Sombre"}
                </span>
              </div>
              <span className="docs-chat-menu-pill-tag">
                {theme === "dark" ? "🌙 Sombre" : "☀️ Clair"}
              </span>
            </button>

            <Link
              href="/"
              className="docs-chat-menu-action-item"
              onClick={onClose}
            >
              <span className="docs-chat-menu-action-icon">
                <IconHome />
              </span>
              <div className="docs-chat-menu-action-content">
                <span className="docs-chat-menu-action-title">Retour à l&apos;accueil DOCS SHOW</span>
                <span className="docs-chat-menu-action-sub">Quitter le chat et explorer la bibliothèque</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer officiel du créateur */}
        <div className="docs-chat-menu-overlay-footer">
          <p>
            Plateforme conçue par <strong>Ingénieur ICHOLA AKIOSSI</strong>
          </p>
          <div className="docs-chat-menu-footer-links">
            <a
              href="https://akiossibriceichola.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Portfolio officiel ↗
            </a>
            <span>•</span>
            <a href="tel:+2290148454505">+229 01 48 45 45 05</a>
          </div>
        </div>
      </div>
    </div>
  );
}
