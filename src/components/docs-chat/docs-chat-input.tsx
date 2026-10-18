"use client";

import { useRef, useEffect, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ChangeEvent } from "react";
import {
  IconPlus,
  IconAt,
  IconSliders,
  IconSend,
  IconPaperclip,
} from "./docs-chat-icons";
import type { ChatAttachment } from "./docs-chat-types";

interface DocsChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (prompt: string, attachments: ChatAttachment[]) => void;
  isLoading: boolean;
  selectedBookContext: string | null;
  onClearBookContext: () => void;
  onOpenAtModal: () => void;
  onOpenSettingsModal: () => void;
}

export function DocsChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  selectedBookContext,
  onClearBookContext,
  onOpenAtModal,
  onOpenSettingsModal,
}: DocsChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);

  // Auto-ajustement dynamique de la hauteur du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [value]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || attachments.length > 0) && !isLoading) {
        onSubmit(value, attachments);
        setAttachments([]);
      }
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);

    if (val.endsWith("@")) {
      onOpenAtModal();
    }
  };

  // =========================================================================
  // GESTION DES FICHIERS ET PHOTOS (PC & SMARTPHONE)
  // =========================================================================
  const handleOpenNativeFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith("image/");
      const reader = new FileReader();

      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        const newAttachment: ChatAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          dataUrl,
          isImage: isImg,
        };

        setAttachments((prev) => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
    });

    // Réinitialise la valeur pour pouvoir resélectionner le même fichier si besoin
    e.target.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const hasContent = value.trim().length > 0 || attachments.length > 0;

  return (
    <div ref={containerRef} className="docs-chat-input-card">
      {/* Input de sélection native de fichiers et photos (PC / Téléphone) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.c,.php,.js,.ts,.json,.py,.doc,.docx"
        onChange={handleFilesSelected}
        style={{ display: "none" }}
        aria-hidden="true"
      />

      {/* Badges de contexte (si un livre est attaché) */}
      {selectedBookContext && (
        <div className="docs-chat-context-bar">
          <span className="docs-chat-context-tag">
            <span>📚 Contexte : {selectedBookContext}</span>
            <button
              type="button"
              className="docs-chat-context-close"
              onClick={onClearBookContext}
              aria-label="Retirer ce livre"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* Prévisualisation des photos et fichiers joints (PC & Smartphone) */}
      {attachments.length > 0 && (
        <div className="docs-chat-attachment-bar">
          {attachments.map((att) => (
            <div key={att.id} className="docs-chat-attachment-pill">
              {att.isImage ? (
                /* Miniature photo */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  className="docs-chat-attachment-thumb"
                />
              ) : (
                <IconPaperclip />
              )}
              <span className="docs-chat-attachment-name" title={att.name}>
                {att.name}
              </span>
              <span className="docs-chat-attachment-size">
                ({(att.size / 1024).toFixed(0)} Ko)
              </span>
              <button
                type="button"
                className="docs-chat-attachment-del"
                onClick={() => handleRemoveAttachment(att.id)}
                aria-label={`Supprimer ${att.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zone de saisie principale */}
      <div className="docs-chat-textarea-wrap">
        <textarea
          ref={textareaRef}
          rows={1}
          className="docs-chat-textarea"
          placeholder="Commencer un nouveau chat"
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      </div>

      {/* Barre d'actions inférieure */}
      <div className="docs-chat-actions-row">
        {/* Actions gauches : + (Fichiers & Photos), @ (Débat/Chatbot), Paramètres */}
        <div className="docs-chat-actions-left">
          {/* BOUTON + : Ouvre directement l'explorateur de fichiers / photos du PC ou téléphone */}
          <button
            type="button"
            className="docs-chat-icon-btn"
            onClick={handleOpenNativeFilePicker}
            aria-label="Prendre des photos ou joindre des fichiers de votre appareil"
            title="Joindre des fichiers ou photos"
          >
            <IconPlus />
          </button>

          {/* Bouton @ : Mention de chatbot ou tuteur conforme */}
          <button
            type="button"
            className="docs-chat-icon-btn"
            onClick={onOpenAtModal}
            aria-label="Mentionner un chatbot ou tuteur spécialisé"
            title="Mentionner (@)"
          >
            <IconAt />
          </button>

          {/* Bouton Sliders : Paramètres IA conforme */}
          <button
            type="button"
            className="docs-chat-icon-btn"
            onClick={onOpenSettingsModal}
            aria-label="Paramètres de génération et précision"
            title="Paramètres du modèle"
          >
            <IconSliders />
          </button>
        </div>

        {/* Action droite : Bouton d'envoi du message */}
        <div className="docs-chat-actions-right">
          <button
            type="button"
            className={`docs-chat-send-btn${hasContent ? " has-content" : ""}`}
            onClick={() => {
              if (hasContent && !isLoading) {
                onSubmit(value, attachments);
                setAttachments([]);
              }
            }}
            disabled={!hasContent || isLoading}
            aria-label="Envoyer le message"
          >
            <IconSend />
          </button>
        </div>
      </div>
    </div>
  );
}
