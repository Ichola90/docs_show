"use client";

import { useEffect, useState } from "react";
import type { Book } from "@/data/books";
import { BookReader } from "@/components/reader/book-reader";
import { ActionButton } from "@/components/ui/action-button";

export function ClientBookReaderFallback({ bookId }: { bookId: string }) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const frameId = window.requestAnimationFrame(() => {
      if (!active) return;

      // 1. Recherche dans le cache local (localStorage)
      try {
        const stored = localStorage.getItem(`docs_show_custom_book_${bookId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id === bookId) {
            setBook(parsed);
            setLoading(false);
            return;
          }
        }

        const listRaw = localStorage.getItem("docs_show_custom_books_list");
        if (listRaw) {
          const list = JSON.parse(listRaw);
          if (Array.isArray(list)) {
            const found = list.find((b: { id: string }) => b.id === bookId);
            if (found) {
              setBook(found);
              setLoading(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Erreur lecture cache local:", e);
      }

      // 2. Recherche via l'API /api/books
      fetch("/api/books")
        .then((res) => res.json())
        .then((data) => {
          if (!active) return;
          if (data.success && Array.isArray(data.books)) {
            const found = data.books.find((b: { id: string }) => b.id === bookId);
            if (found) {
              setBook(found);
              try {
                localStorage.setItem(`docs_show_custom_book_${bookId}`, JSON.stringify(found));
              } catch {}
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    return () => {
      active = false;
      window.cancelAnimationFrame(frameId);
    };
  }, [bookId]);

  if (loading) {
    return <div className="reader-loading" aria-label="Chargement du livre" />;
  }

  if (!book) {
    return (
      <div
        className="reader-not-found"
        style={{
          textAlign: "center",
          padding: "100px 24px",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "750", color: "#0f172a", marginBottom: "12px" }}>
          Livre introuvable ou en attente de synchronisation
        </h2>
        <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.6", marginBottom: "28px" }}>
          Ce livre n’est pas disponible sur ce serveur ou sa publication vient tout juste d’avoir lieu.
        </p>
        <ActionButton href="/bibliotheque" size="small">
          Explorer la bibliothèque
        </ActionButton>
      </div>
    );
  }

  return <BookReader book={book} />;
}
