"use client";

import { useState } from "react";
import type { ChatMessage } from "./docs-chat-types";
import { getBotById } from "./docs-chat-bots";
import { DocsShowLogo } from "./docs-chat-icons";

interface DocsChatMessageProps {
  message: ChatMessage;
}

export function DocsChatMessage({ message }: DocsChatMessageProps) {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const isUser = message.sender === "user";
  const botDef = message.botId ? getBotById(message.botId) : null;

  const handleCopyCode = async (code: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(code);
      const key = `${message.id}_${blockIndex}`;
      setCopiedCodeId(key);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleToggleAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const cleanText = message.content.replace(/```[\s\S]*?```/g, "Code source omis.");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "fr-FR";
    utterance.rate = 1.05;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const renderInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            style={{
              background: "var(--docs-chat-border-light)",
              padding: "2px 5px",
              borderRadius: "4px",
              fontSize: "0.9em",
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const renderContent = (content: string) => {
    const segments: (string | { type: "code"; language: string; code: string })[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        segments.push(content.substring(lastIndex, match.index));
      }
      segments.push({
        type: "code",
        language: match[1] || "code",
        code: match[2].trim(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      segments.push(content.substring(lastIndex));
    }

    return segments.map((seg, idx) => {
      if (typeof seg !== "string") {
        const isCopied = copiedCodeId === `${message.id}_${idx}`;
        return (
          <div key={`code_${idx}`} className="docs-chat-code-block">
            <div className="docs-chat-code-header">
              <span>{seg.language}</span>
              <button
                type="button"
                className="docs-chat-code-copy-btn"
                onClick={() => handleCopyCode(seg.code, idx)}
              >
                {isCopied ? "✓ Copié !" : "Copier"}
              </button>
            </div>
            <pre className="docs-chat-code-content">
              <code>{seg.code}</code>
            </pre>
          </div>
        );
      }

      const lines = seg.split("\n");
      return (
        <div key={`text_${idx}`}>
          {lines.map((line: string, lIdx: number) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lIdx} style={{ height: "0.5rem" }} />;

            if (trimmed.startsWith("### ")) {
              return <h3 key={lIdx}>{trimmed.replace("### ", "")}</h3>;
            }
            if (trimmed.startsWith("#### ")) {
              return <h4 key={lIdx}>{trimmed.replace("#### ", "")}</h4>;
            }
            if (trimmed.startsWith("> ")) {
              return <blockquote key={lIdx}>{trimmed.replace("> ", "")}</blockquote>;
            }
            if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
              return (
                <ul key={lIdx}>
                  <li>{renderInlineStyles(trimmed.substring(2))}</li>
                </ul>
              );
            }

            return <p key={lIdx}>{renderInlineStyles(line)}</p>;
          })}
        </div>
      );
    });
  };

  if (isUser) {
    return (
      <div className="docs-chat-user-row">
        <div className="docs-chat-user-bubble">
          {message.attachments && message.attachments.length > 0 && (
            <div className="docs-chat-msg-attachments">
              {message.attachments.map((att) => (
                <div key={att.id} className="docs-chat-msg-attachment-item">
                  {att.isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="docs-chat-msg-photo"
                      onClick={() => window.open(att.dataUrl, "_blank")}
                      title="Cliquer pour agrandir la photo"
                    />
                  ) : att.type?.startsWith("audio/") || att.name.endsWith(".webm") || att.name.endsWith(".mp3") || att.name.endsWith(".ogg") ? (
                    <div className="docs-chat-msg-audio">
                      <div className="docs-chat-msg-audio-header">
                        <span>🎙️</span>
                        <span>{att.name}</span>
                      </div>
                      <audio controls src={att.dataUrl} className="docs-chat-msg-audio-player" />
                    </div>
                  ) : (
                    <a
                      href={att.dataUrl}
                      download={att.name}
                      className="docs-chat-msg-file"
                      title="Télécharger le fichier joint"
                    >
                      <span style={{ fontSize: "15px" }}>📄</span>
                      <span className="docs-chat-msg-file-name">{att.name}</span>
                      <span className="docs-chat-msg-file-size">
                        ({(att.size / 1024).toFixed(0)} Ko)
                      </span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          {message.content && <div>{message.content}</div>}
        </div>
      </div>
    );
  }

  const stanceStyle =
    message.roleStance?.includes("Systèmes") || message.roleStance?.includes("Core")
      ? { background: "rgba(2, 132, 199, 0.12)", color: "#0284c7" }
      : message.roleStance?.includes("Cloud") || message.roleStance?.includes("Modern")
      ? { background: "rgba(5, 150, 105, 0.12)", color: "#059669" }
      : { background: "rgba(37, 99, 235, 0.1)", color: "#2563eb" };

  return (
    <div className="docs-chat-bot-row">
      <div
        className="docs-chat-bot-avatar"
        style={{
          background: botDef?.accentGradient || "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
        }}
      >
        {botDef?.iconType === "docs-show" ? (
          <DocsShowLogo size={22} />
        ) : botDef?.iconType === "cpu" ? (
          "⚙️"
        ) : botDef?.iconType === "cloud" ? (
          "☁️"
        ) : botDef?.iconType === "swords" ? (
          "⚔️"
        ) : botDef?.iconType === "book" ? (
          "📚"
        ) : (
          "🤖"
        )}
      </div>

      <div className="docs-chat-bot-body">
        <div className="docs-chat-bot-meta">
          <span className="docs-chat-bot-name">
            {message.botName || botDef?.name || "Assistant DOCS SHOW"}
          </span>
          {message.roleStance && (
            <span className="docs-chat-stance-badge" style={stanceStyle}>
              {message.roleStance}
            </span>
          )}
          {message.modelBadge && (
            <span style={{ fontSize: "11px", color: "var(--docs-chat-text-muted)" }}>
              • {message.modelBadge}
            </span>
          )}
        </div>

        <div className="docs-chat-bot-bubble">
          {renderContent(message.content)}
        </div>

        <div className="docs-chat-bot-actions">
          <button
            type="button"
            className="docs-chat-action-btn"
            onClick={() => navigator.clipboard.writeText(message.content)}
            title="Copier la réponse"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copier</span>
          </button>

          <button
            type="button"
            className={`docs-chat-action-btn${isPlayingAudio ? " is-active" : ""}`}
            onClick={handleToggleAudio}
            title={isPlayingAudio ? "Arrêter la lecture" : "Écouter la synthèse vocale"}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <span>{isPlayingAudio ? "Lecture..." : "Écouter"}</span>
          </button>

          <button
            type="button"
            className={`docs-chat-action-btn${feedback === "up" ? " is-active" : ""}`}
            onClick={() => setFeedback(feedback === "up" ? null : "up")}
            title="Réponse utile"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </button>

          <button
            type="button"
            className={`docs-chat-action-btn${feedback === "down" ? " is-active" : ""}`}
            onClick={() => setFeedback(feedback === "down" ? null : "down")}
            title="Réponse imprécise"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

