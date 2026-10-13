"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";

const SLIDES = [
  {
    id: "web-dev",
    image: "/images/slide-web-dev.jpg",
    kicker: "MANUELS TECHNIQUES · DÉVELOPPEMENT WEB",
    title: "Le savoir tech, à votre rythme",
    description:
      "Apprenez le web moderne, l'architecture logicielle et les bonnes pratiques avec du code source ouvert.",
    ctaLabel: "Explorer les livres",
    ctaHref: "/bibliotheque",
  },
  {
    id: "systems",
    image: "/images/slide-systems-prog.jpg",
    kicker: "FONDATIONS & ALGORITHMIQUE · BAS NIVEAU",
    title: "Comprendre les fondations du code",
    description:
      "Langage C, gestion mémoire et pointeurs : maîtrisez le bas niveau pour bâtir un socle d'ingénieur solide.",
    ctaLabel: "Découvrir le manuel C",
    ctaHref: "/livres/apprenez-programmer-c",
  },
  {
    id: "tests",
    image: "/images/slide-interactive-test.jpg",
    kicker: "VALIDATION ACTIVE · TESTS INTERACTIFS",
    title: "Lire, coder, valider en direct",
    description:
      "Mettez directement vos compétences à l'épreuve avec nos quiz interactifs et mesurez vos progrès.",
    ctaLabel: "Tester vos compétences",
    ctaHref: "/bibliotheque",
  },
];

const SLIDE_DURATION_MS = 3000;

export function PlatformBanner() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);

    return () => clearInterval(timer);
  }, [activeSlide]);

  return (
    <section
      className="platform-banner"
      aria-roledescription="carrousel"
      aria-label="Présentation de la plateforme DOCS SHOW"
    >
        <div className="platform-banner-slides">
          {SLIDES.map((slide, index) => {
            const isActive = index === activeSlide;
            return (
              <div
                key={slide.id}
                className={`platform-banner-slide${isActive ? " is-active" : ""}`}
                aria-hidden={!isActive}
              >
                <div className="platform-banner-image-wrap">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="platform-banner-img"
                  />
                  <div className="platform-banner-scrim" />
                </div>

                <div className="platform-banner-inner">
                  <div className="platform-banner-content">
                    <p className="platform-banner-kicker">{slide.kicker}</p>
                    <h2 className="platform-banner-title">{slide.title}</h2>
                    <p className="platform-banner-description">
                      {slide.description}
                    </p>
                    <ActionButton
                      href={slide.ctaHref}
                      variant="secondary"
                      className="platform-banner-cta"
                    >
                      {slide.ctaLabel} <span aria-hidden="true">→</span>
                    </ActionButton>
                  </div>
                </div>
              </div>
            );
          })}
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
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </div>

        <Link className="platform-banner-skip" href="#contenu-principal">
          Passer la bannière
        </Link>
      </section>
  );
}
