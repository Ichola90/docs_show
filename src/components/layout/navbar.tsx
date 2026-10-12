"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { ActionButton } from "@/components/ui/action-button";
import { BrandMark } from "@/components/ui/brand-mark";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/bibliotheque", label: "Bibliothèque" },
  { href: "/#methode", label: "Notre approche" },
  { href: "/#pour-qui", label: "Pour qui ?" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 8);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !mobilePanelRef.current) return;
      const focusableElements = mobilePanelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/bibliotheque") return pathname.startsWith("/bibliotheque");
    return false;
  };

  return (
    <header id="top" className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
      <div className="navbar-inner">
        <div className="navbar-start">
          <Link className="brand" href="/" aria-label="DOCS SHOW, accueil">
            <BrandMark />
            <span>DOCS SHOW<span className="brand-period">.</span></span>
          </Link>

          <nav className="main-nav" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => {
              const isActive = isLinkActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive ? "nav-current" : ""}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <ActionButton href="/bibliotheque" className="header-cta">
          Explorer les livres
        </ActionButton>

        <button
          ref={menuButtonRef}
          type="button"
          className={`mobile-menu-toggle${mobileMenuOpen ? " is-open" : ""}`}
          onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <button
        type="button"
        className={`mobile-menu-overlay${mobileMenuOpen ? " is-visible" : ""}`}
        onClick={closeMobileMenu}
        aria-label="Fermer le menu"
        tabIndex={mobileMenuOpen ? 0 : -1}
        aria-hidden={!mobileMenuOpen}
      />

      <aside
        ref={mobilePanelRef}
        id="mobile-navigation"
        className={`mobile-nav-panel${mobileMenuOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
      >
        <div className="mobile-panel-header">
          <Link className="brand" href="/" onClick={closeMobileMenu} aria-label="DOCS SHOW, accueil">
            <BrandMark />
            <span>DOCS SHOW<span className="brand-period">.</span></span>
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            className="mobile-menu-close"
            onClick={closeMobileMenu}
            aria-label="Fermer le menu"
          >
            <span />
            <span />
          </button>
        </div>
        <p className="mobile-panel-kicker">VOTRE ESPACE DE LECTURE</p>
        <nav className="mobile-nav-links" aria-label="Navigation mobile">
          {NAV_LINKS.map((link, index) => {
            const isActive = isLinkActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? "nav-current" : ""}
                aria-current={isActive ? "page" : undefined}
                style={{ "--link-index": index } as CSSProperties}
                onClick={closeMobileMenu}
              >
                <span className="mobile-link-number">{String(index + 1).padStart(2, "0")}</span>
                <span>{link.label}</span>
                <ArrowIcon />
              </Link>
            );
          })}
        </nav>
        <ActionButton
          className="mobile-panel-cta"
          href="/bibliotheque"
          onClick={closeMobileMenu}
        >
          Trouver mon prochain livre
        </ActionButton>
        <p className="mobile-panel-note">Le savoir, page après page.</p>
      </aside>
    </header>
  );
}
