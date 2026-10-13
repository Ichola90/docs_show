"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    id: "web-dev",
    image: "/images/slide-web-dev.jpg",
    alt: "Illustration développement web et code moderne",
  },
  {
    id: "systems",
    image: "/images/slide-systems-prog.jpg",
    alt: "Illustration programmation système et architectures informatiques",
  },
  {
    id: "tests",
    image: "/images/slide-interactive-test.jpg",
    alt: "Illustration validation active des compétences et quiz",
  },
  {
    id: "team",
    image: "/images/team-collaboration.jpg",
    alt: "Illustration travail d'équipe et collaboration technologique",
  },
  {
    id: "data",
    image: "/images/data-insights.jpg",
    alt: "Illustration analyse de données et systèmes cloud",
  },
  {
    id: "learning",
    image: "/images/tech-learning.jpg",
    alt: "Illustration apprentissage continu et manuels ouverts",
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
      aria-label="Galerie visuelle de la plateforme DOCS SHOW"
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
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="platform-banner-img"
                />
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
              aria-label={`Afficher l'image ${index + 1}`}
              aria-current={index === activeSlide ? "true" : undefined}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
