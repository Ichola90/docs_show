"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Reveal } from "@/components/ui/reveal";

const SLIDES = [
  {
    id: "web-dev",
    kicker: "MANUELS TECHNIQUES · 100% LIBRE ACCÈS",
    title: "Le savoir tech, à votre rythme.",
    description:
      "Explorez des manuels complets, progressez chapitre après chapitre et maîtrisez le développement web et logiciel.",
    ctaLabel: "Explorer les livres",
    ctaHref: "/bibliotheque",
    themeClass: "slide-theme-blue",
    visualType: "books" as const,
  },
  {
    id: "systems",
    kicker: "FONDATIONS & ALGORITHMIQUE · BAS NIVEAU",
    title: "Comprendre les fondations du code.",
    description:
      "Langage C, gestion mémoire, Clean Code et architectures éprouvées : bâtissez un socle d'ingénieur solide.",
    ctaLabel: "Découvrir le manuel C",
    ctaHref: "/livres/apprenez-programmer-c",
    themeClass: "slide-theme-cyan",
    visualType: "code" as const,
  },
  {
    id: "tests",
    kicker: "VALIDATION ACTIVE · TEST DE MAÎTRISE",
    title: "Lire, comprendre, valider.",
    description:
      "Chaque livre se conclut par un quiz interactif : mettez directement vos connaissances à l'épreuve et mesurez vos progrès.",
    ctaLabel: "Tester vos compétences",
    ctaHref: "/bibliotheque",
    themeClass: "slide-theme-amber",
    visualType: "quiz" as const,
  },
];

const SLIDE_DURATION_MS = 5000;

export function PlatformBanner() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);

    return () => window.clearInterval(interval);
  }, []);

  const showSlide = (index: number) => {
    setActiveSlide((index + SLIDES.length) % SLIDES.length);
  };

  const currentSlide = SLIDES[activeSlide];

  return (
    <Reveal>
      <section
        className={`platform-banner ${currentSlide.themeClass}`}
        aria-roledescription="carrousel"
        aria-label="Présentation de la plateforme DOCS SHOW"
      >
        <div className="platform-banner-ambient" aria-hidden="true" />
        <div className="platform-banner-grid-overlay" aria-hidden="true" />

        <div className="platform-banner-inner">
          <div className="platform-banner-content" key={`content-${activeSlide}`}>
            <p className="platform-banner-kicker">{currentSlide.kicker}</p>
            <h1 className="platform-banner-title">{currentSlide.title}</h1>
            <p className="platform-banner-description">
              {currentSlide.description}
            </p>
            <ActionButton href={currentSlide.ctaHref} variant="secondary" className="platform-banner-cta">
              {currentSlide.ctaLabel}
            </ActionButton>
          </div>

          <div className="platform-banner-visual-wrapper" key={`visual-${activeSlide}`}>
            {currentSlide.visualType === "books" && (
              <div className="banner-visual-books">
                <div className="banner-book-mockup banner-book-primary">
                  <div className="banner-book-spine" />
                  <div className="banner-book-cover">
                    <span className="banner-book-tag">WEB & BASE DE DONNÉES</span>
                    <h4>PHP & MySQL</h4>
                    <p>Développement de sites dynamiques</p>
                    <div className="banner-book-meta">
                      <span>350 pages</span>
                      <span className="banner-book-pill">12 chapitres</span>
                    </div>
                  </div>
                </div>

                <div className="banner-book-mockup banner-book-secondary">
                  <div className="banner-book-spine" />
                  <div className="banner-book-cover">
                    <span className="banner-book-tag">BONNES PRATIQUES</span>
                    <h4>Clean Code</h4>
                    <p>Qualité & maintenabilité</p>
                    <div className="banner-book-meta">
                      <span>280 pages</span>
                    </div>
                  </div>
                </div>

                <div className="banner-floating-badge">
                  <span className="pulse-dot" />
                  <span>10 manuels complets & gratuits</span>
                </div>
              </div>
            )}

            {currentSlide.visualType === "code" && (
              <div className="banner-visual-terminal">
                <div className="banner-terminal-header">
                  <div className="banner-terminal-dots">
                    <span className="dot-red" />
                    <span className="dot-yellow" />
                    <span className="dot-green" />
                  </div>
                  <span className="banner-terminal-title">main.c — DOCS SHOW IDE</span>
                  <span className="banner-terminal-lang">C99</span>
                </div>
                <pre className="banner-terminal-code">
                  <code>
                    <span className="code-dim">1</span> <span className="code-keyword">#include</span> <span className="code-string">&lt;stdio.h&gt;</span>{"\n"}
                    <span className="code-dim">2</span> <span className="code-keyword">#include</span> <span className="code-string">&lt;stdlib.h&gt;</span>{"\n"}
                    <span className="code-dim">3</span> {"\n"}
                    <span className="code-dim">4</span> <span className="code-type">int</span> <span className="code-func">main</span>(<span className="code-type">void</span>) {"{"}{"\n"}
                    <span className="code-dim">5</span>     <span className="code-type">char</span>* <span className="code-var">skill</span> = <span className="code-string">&quot;DOCS SHOW&quot;</span>;{"\n"}
                    <span className="code-dim">6</span>     <span className="code-func">printf</span>(<span className="code-string">&quot;Maîtrise : %s\n&quot;</span>, <span className="code-var">skill</span>);{"\n"}
                    <span className="code-dim">7</span>     <span className="code-keyword">return</span> <span className="code-num">0</span>;{"\n"}
                    <span className="code-dim">8</span> {"}"}
                  </code>
                </pre>
                <div className="banner-terminal-status">
                  <span className="status-success">● Build réussi (0 erreur)</span>
                  <span className="status-meta">GCC Compiler · Clean Code</span>
                </div>
              </div>
            )}

            {currentSlide.visualType === "quiz" && (
              <div className="banner-visual-quiz">
                <div className="banner-quiz-header">
                  <span className="banner-quiz-badge">TEST DE CONNAISSANCES</span>
                  <span className="banner-quiz-score">Score 10/10 ✓</span>
                </div>
                <p className="banner-quiz-q">Quelle fonction alloue dynamiquement de la mémoire en C ?</p>
                <div className="banner-quiz-options">
                  <div className="banner-quiz-opt is-correct">
                    <span className="quiz-opt-marker">A</span>
                    <span className="quiz-opt-text">malloc()</span>
                    <span className="quiz-opt-check">✓ Validé</span>
                  </div>
                  <div className="banner-quiz-opt">
                    <span className="quiz-opt-marker">B</span>
                    <span className="quiz-opt-text">alloc()</span>
                  </div>
                </div>
                <div className="banner-quiz-progress">
                  <div className="banner-quiz-bar">
                    <div className="banner-quiz-fill" style={{ width: "100%" }} />
                  </div>
                  <span className="banner-quiz-status">Validation des acquis enregistrée localement</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="platform-banner-controls" aria-label="Indicateurs des diapositives">
          <div className="platform-banner-dots">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                className={`platform-banner-dot${index === activeSlide ? " is-active" : ""}`}
                type="button"
                aria-label={`Afficher la diapositive ${index + 1}`}
                aria-current={index === activeSlide ? "true" : undefined}
                onClick={() => showSlide(index)}
              />
            ))}
          </div>
        </div>

        <Link className="platform-banner-skip" href="#contenu-principal">
          Passer la bannière
        </Link>
      </section>
    </Reveal>
  );
}
