"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Reveal } from "@/components/ui/reveal";

const SLIDES = [
  {
    image: "/images/tech-learning.jpg",
    alt: "Personne qui apprend et travaille sur un ordinateur portable",
    title: "Le savoir tech, à votre rythme.",
    description:
      "Explorez des livres pratiques, avancez chapitre par chapitre et mettez vos acquis à l’épreuve.",
  },
  {
    image: "/images/data-insights.jpg",
    alt: "Visualisation de données et graphiques sur un écran",
    title: "Comprendre les idées derrière la technologie.",
    description:
      "Développement, data, intelligence artificielle et design produit : apprenez avec des ressources ciblées.",
  },
  {
    image: "/images/team-collaboration.jpg",
    alt: "Équipe qui collabore autour d’un projet numérique",
    title: "Apprendre aujourd’hui, construire demain.",
    description:
      "Des lectures accessibles pour transformer la curiosité en compétences concrètes.",
  },
];

const SLIDE_DURATION_MS = 1000;

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

  return (
    <Reveal>
      <section
        className="platform-banner"
        aria-roledescription="carrousel"
        aria-label="Découvrir la plateforme DOCS SHOW"
      >
        {SLIDES.map((slide, index) => (
          <div
            className={`platform-banner-slide${index === activeSlide ? " is-active" : ""}`}
            key={slide.image}
            aria-hidden={index !== activeSlide}
          >
            <Image
              className="platform-banner-image"
              src={slide.image}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
            />
            <div className="platform-banner-shade" />
          </div>
        ))}

        <Reveal className="platform-banner-content-reveal" delay={90} distance={20}>
          <div className="platform-banner-content" aria-live="off">
            <p className="platform-banner-kicker">DOCS SHOW · APPRENDRE, UN CHAPITRE À LA FOIS</p>
            <h1 key={`title-${activeSlide}`}>{SLIDES[activeSlide].title}</h1>
            <p className="platform-banner-description" key={`description-${activeSlide}`}>
              {SLIDES[activeSlide].description}
            </p>
            <ActionButton href="/bibliotheque" variant="secondary" className="platform-banner-cta">
              Explorer les livres
            </ActionButton>
          </div>
        </Reveal>

        <Reveal className="platform-banner-controls-reveal" delay={180} distance={16}>
          <div className="platform-banner-controls" aria-label="Navigation des diapositives">
          <button
            className="platform-banner-arrow"
            type="button"
            aria-label="Diapositive précédente"
            onClick={() => showSlide(activeSlide - 1)}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m12.5 4.5-5.5 5.5 5.5 5.5" />
            </svg>
          </button>
          <div className="platform-banner-dots">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.image}
                className={`platform-banner-dot${index === activeSlide ? " is-active" : ""}`}
                type="button"
                aria-label={`Afficher la diapositive ${index + 1}`}
                aria-current={index === activeSlide ? "true" : undefined}
                onClick={() => showSlide(index)}
              />
            ))}
          </div>
          <button
            className="platform-banner-arrow"
            type="button"
            aria-label="Diapositive suivante"
            onClick={() => showSlide(activeSlide + 1)}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m7.5 4.5 5.5 5.5-5.5 5.5" />
            </svg>
          </button>
        </div>
        </Reveal>
        <Link className="platform-banner-skip" href="#contenu-principal">
          Passer la bannière
        </Link>
      </section>
    </Reveal>
  );
}
