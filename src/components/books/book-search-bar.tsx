"use client";

import { ActionButton } from "@/components/ui/action-button";
import { Reveal } from "@/components/ui/reveal";

type BookSearchBarProps = {
  searchQuery: string;
  filtersVisible: boolean;
  selectedFilterCount: number;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onFilterClick: () => void;
};

export function BookSearchBar({
  searchQuery,
  filtersVisible,
  selectedFilterCount,
  onSearchChange,
  onSearchSubmit,
  onFilterClick,
}: BookSearchBarProps) {
  return (
    <Reveal className="book-search-bar" delay={60}>
      <div className="book-search-inner">
        <div className="filter-toggle-reveal">
          <ActionButton
            className="filter-toggle"
            variant={filtersVisible ? "primary" : "secondary"}
            size="small"
            type="button"
            aria-pressed={filtersVisible}
            aria-controls="book-filters book-filters-mobile"
            onClick={onFilterClick}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M5.5 10h9M8 15h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Filtrer
            {selectedFilterCount > 0 && (
              <span className="filter-count">{selectedFilterCount}</span>
            )}
          </ActionButton>
        </div>
        <div className="search-form-reveal">
          <form
            className="book-search-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit();
            }}
            role="search"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.5" />
              <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <input
              type="search"
              placeholder="Rechercher un livre ou un auteur..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              aria-label="Rechercher un titre, un auteur ou un sujet"
            />
            <button className="book-search-submit" type="submit" aria-label="Rechercher">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.7" />
                <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </Reveal>
  );
}
