"use client";

import { useEffect, useRef } from "react";

export interface ModalActionItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onClick: () => void;
}

interface DocsChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  bannerIcon?: React.ReactNode;
  bannerTitle: string;
  bannerSubtitle: string;
  searchInputPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  items: ModalActionItem[];
}

/**
 * Composant Modal officiel DOCS SHOW conforme au design exact demandé :
 * - Bannière supérieure grise d'information / quota de contexte avec icône trombone
 * - Lignes horizontales avec icône, titre en gras, sous-titre inline et bouton d'action à droite
 * - Champ de recherche intégré en bas
 * - Fermeture automatique au clic en dehors du modal (backdrop ou zone extérieure) et sur Échap
 */
export function DocsChatModal({
  isOpen,
  onClose,
  bannerIcon = "📎",
  bannerTitle,
  bannerSubtitle,
  searchInputPlaceholder = "Saisissez du texte pour rechercher...",
  searchValue,
  onSearchChange,
  items,
}: DocsChatModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Fermeture automatique au clic en dehors du modal (souris et tactile)
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Fermeture automatique sur la touche Échap
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="docs-chat-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={cardRef}
        className="docs-chat-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Bannière supérieure style exact screenshot */}
        <div className="docs-chat-modal-banner">
          <div className="docs-chat-modal-banner-icon">{bannerIcon}</div>
          <div className="docs-chat-modal-banner-content">
            <span className="docs-chat-modal-banner-title">{bannerTitle}</span>
            <span className="docs-chat-modal-banner-subtitle">{bannerSubtitle}</span>
          </div>
        </div>

        {/* 2. Liste d'actions / éléments */}
        <div className="docs-chat-modal-list">
          {items.length === 0 ? (
            <div
              style={{
                padding: "24px 12px",
                textAlign: "center",
                color: "var(--docs-chat-text-muted)",
                fontSize: "13px",
              }}
            >
              Aucun résultat pour cette recherche.
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="docs-chat-modal-row"
                onClick={item.onClick}
              >
                <div className="docs-chat-modal-row-left">
                  <div className="docs-chat-modal-row-icon">{item.icon}</div>
                  <div className="docs-chat-modal-row-text">
                    <span className="docs-chat-modal-row-title">{item.title}</span>
                    <span className="docs-chat-modal-row-desc">{item.description}</span>
                  </div>
                </div>
                {item.actionLabel && (
                  <span className="docs-chat-modal-row-action">
                    {item.actionLabel}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* 3. Champ de recherche inférieur style screenshot */}
        <div className="docs-chat-modal-footer">
          <input
            type="text"
            className="docs-chat-modal-search-input"
            placeholder={searchInputPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

