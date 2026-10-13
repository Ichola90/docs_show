"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    id: "web-architecture",
    image: "/images/banner-3d-web-architecture.jpg",
    alt: "Architecture web moderne et ingénierie logicielle 3D",
  },
  {
    id: "computer-systems",
    image: "/images/banner-3d-computer-systems.jpg",
    alt: "Architecture des ordinateurs, microprocesseurs et systèmes 3D",
  },
  {
    id: "interactive-testing",
    image: "/images/banner-3d-interactive-testing.jpg",
    alt: "Validation active des compétences et quiz interactifs 3D",
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
      aria-label="Galerie visuelle 3D de la plateforme DOCS SHOW"
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
              aria-label={`Afficher l'image 3D ${index + 1}`}
              aria-current={index === activeSlide ? "true" : undefined}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
