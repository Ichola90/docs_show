"use client";

import { Reveal } from "@/components/ui/reveal";

type BookSidebarFiltersProps = {
  categories: string[];
  levels: string[];
  categoryCounts: Record<string, number>;
  levelCounts: Record<string, number>;
  totalCategoriesCount: number;
  totalLevelsCount: number;
  selectedCategories: string[];
  selectedLevels: string[];
  onCategoryToggle: (category: string) => void;
  onLevelToggle: (level: string) => void;
  onCategoryClear: () => void;
  onLevelClear: () => void;
  onReset: () => void;
  onClose?: () => void;
  mobile?: boolean;
};

function FilterOption({
  label,
  count,
  selected,
  onSelect,
  disabled = false,
}: {
  label: string;
  count: number;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={`book-filter-option${selected ? " is-selected" : ""}`}
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="filter-option-label">{label}</span>
      <span
        className="filter-option-count"
        aria-label={`${count} ${count === 1 ? "livre" : "livres"}`}
      >
        {count}
      </span>
    </button>
  );
}

export function BookSidebarFilters({
  categories,
  levels,
  categoryCounts,
  levelCounts,
  totalCategoriesCount,
  totalLevelsCount,
  selectedCategories,
  selectedLevels,
  onCategoryToggle,
  onLevelToggle,
  onCategoryClear,
  onLevelClear,
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
            <div className="book-filter-options" role="group" aria-label="Filtrer par thématique">
              <Reveal>
                <FilterOption
                  label="Tous les domaines"
                  count={totalCategoriesCount}
                  selected={selectedCategories.length === 0}
                  onSelect={onCategoryClear}
                />
              </Reveal>
              {categories.map((category, index) => (
                <Reveal key={category} delay={(index % 4) * 55}>
                  <FilterOption
                    label={category}
                    count={categoryCounts[category] ?? 0}
                    selected={selectedCategories.includes(category)}
                    disabled={
                      categoryCounts[category] === 0 &&
                      !selectedCategories.includes(category)
                    }
                    onSelect={() => onCategoryToggle(category)}
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
            <div className="book-filter-options" role="group" aria-label="Filtrer par niveau">
              <Reveal>
                <FilterOption
                  label="Tous les niveaux"
                  count={totalLevelsCount}
                  selected={selectedLevels.length === 0}
                  onSelect={onLevelClear}
                />
              </Reveal>
              {levels.map((level, index) => (
                <Reveal key={level} delay={(index % 4) * 55}>
                  <FilterOption
                    label={level}
                    count={levelCounts[level] ?? 0}
                    selected={selectedLevels.includes(level)}
                    disabled={
                      levelCounts[level] === 0 &&
                      !selectedLevels.includes(level)
                    }
                    onSelect={() => onLevelToggle(level)}
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
