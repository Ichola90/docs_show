"use client";

import { Reveal } from "@/components/ui/reveal";

type BookSidebarFiltersProps = {
  categories: string[];
  levels: string[];
  selectedCategories: string[];
  selectedLevels: string[];
  onCategoryToggle: (category: string) => void;
  onLevelToggle: (level: string) => void;
  onReset: () => void;
  onClose?: () => void;
  mobile?: boolean;
};

function FilterOption({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="book-filter-option">
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <span className={`filter-checkbox${checked ? " is-checked" : ""}`} aria-hidden="true">
        {checked && (
          <svg viewBox="0 0 16 16" fill="none">
            <path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </label>
  );
}

export function BookSidebarFilters({
  categories,
  levels,
  selectedCategories,
  selectedLevels,
  onCategoryToggle,
  onLevelToggle,
  onReset,
  onClose,
  mobile = false,
}: BookSidebarFiltersProps) {
  return (
    <aside
      id={mobile ? "book-filters-mobile" : "book-filters"}
      className={`book-sidebar-filters${mobile ? " mobile-filters" : ""}`}
      aria-label="Filtres de la bibliothèque"
    >
      <div className="book-sidebar-content">
        <div className="book-filter-heading">
          <h2>Affiner la sélection</h2>
          {mobile && onClose && (
            <button
              className="book-filter-close"
              type="button"
              aria-label="Fermer les filtres"
              onClick={onClose}
            >
              <span />
              <span />
            </button>
          )}
        </div>
        <Reveal>
          <section className="book-filter-group" aria-labelledby={mobile ? "mobile-domain-heading" : "domain-heading"}>
            <h3 id={mobile ? "mobile-domain-heading" : "domain-heading"}>Thématiques</h3>
            <div className="book-filter-options">
              {categories.map((category, index) => (
                <Reveal key={category} delay={(index % 4) * 55}>
                  <FilterOption
                    label={category}
                    checked={selectedCategories.includes(category)}
                    onToggle={() => onCategoryToggle(category)}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>
        <div className="book-filter-divider" />
        <Reveal delay={80}>
          <section className="book-filter-group" aria-labelledby={mobile ? "mobile-level-heading" : "level-heading"}>
            <h3 id={mobile ? "mobile-level-heading" : "level-heading"}>Niveau</h3>
            <div className="book-filter-options">
              {levels.map((level, index) => (
                <Reveal key={level} delay={(index % 4) * 55}>
                  <FilterOption
                    label={level}
                    checked={selectedLevels.includes(level)}
                    onToggle={() => onLevelToggle(level)}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>
        <Reveal delay={140}>
          <button className="book-filter-reset" type="button" onClick={onReset}>
            Réinitialiser
          </button>
        </Reveal>
      </div>
    </aside>
  );
}
