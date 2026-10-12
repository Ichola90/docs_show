"use client";

import { useEffect, useMemo, useState } from "react";
import { books, categories } from "@/data/books";
import { BookGrid } from "@/components/books/book-grid";
import { BookSearchBar } from "@/components/books/book-search-bar";
import { BookSidebarFilters } from "@/components/books/book-sidebar-filters";
import { ActionButton } from "@/components/ui/action-button";
import { Reveal } from "@/components/ui/reveal";

const levels = ["Débutant", "Intermédiaire", "Avancé"];

export function BookCatalog() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  useEffect(() => {
    const viewportQuery = window.matchMedia("(max-width: 1100px)");
    const updateViewport = () => setIsCompactViewport(viewportQuery.matches);

    updateViewport();
    viewportQuery.addEventListener("change", updateViewport);
    return () => viewportQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileFiltersOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileFiltersOpen]);

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("fr");

    return books.filter((book) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(book.category);
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(book.level);
      const searchableContent = `${book.title} ${book.subtitle} ${book.author} ${book.category}`
        .toLocaleLowerCase("fr");
      return (
        matchesCategory &&
        matchesLevel &&
        (!query || searchableContent.includes(query))
      );
    });
  }, [searchQuery, selectedCategories, selectedLevels]);

  const toggleValue = (
    value: string,
    selectedValues: string[],
    setSelectedValues: (values: string[]) => void,
  ) => {
    setSelectedValues(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value],
    );
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedLevels([]);
  };

  const filterProps = {
    categories: categories.filter((category) => category !== "Tout"),
    levels,
    selectedCategories,
    selectedLevels,
    onCategoryToggle: (category: string) =>
      toggleValue(category, selectedCategories, setSelectedCategories),
    onLevelToggle: (level: string) =>
      toggleValue(level, selectedLevels, setSelectedLevels),
    onReset: resetFilters,
  };

  return (
    <>
      <BookSearchBar
        searchQuery={searchInput}
        filtersVisible={isCompactViewport ? mobileFiltersOpen : filtersVisible}
        selectedFilterCount={selectedCategories.length + selectedLevels.length}
        onSearchChange={(value) => {
          setSearchInput(value);
          setSearchQuery(value);
        }}
        onSearchSubmit={() => setSearchQuery(searchInput)}
        onFilterClick={() => {
          if (window.matchMedia("(max-width: 1100px)").matches) {
            setMobileFiltersOpen(true);
          } else {
            setFiltersVisible((visible) => !visible);
          }
        }}
      />
      <Reveal>
        <section className="catalog-content" aria-label="Résultats de la bibliothèque">
          <div className="catalog-results-header">
            <p aria-live="polite">
              <strong>{filteredBooks.length}</strong>{" "}
              {filteredBooks.length === 1 ? "livre disponible" : "livres disponibles"}
            </p>
            {(searchQuery || selectedCategories.length > 0 || selectedLevels.length > 0) && (
              <ActionButton variant="quiet" size="small" onClick={resetFilters}>
                Tout effacer
              </ActionButton>
            )}
          </div>
          <div className={`catalog-layout${filtersVisible ? "" : " filters-collapsed"}`}>
            {filtersVisible && <BookSidebarFilters {...filterProps} />}
            <div className="catalog-book-results">
              {filteredBooks.length > 0 ? (
                <BookGrid books={filteredBooks} />
              ) : (
                <Reveal>
                  <div className="empty-state" role="status">
                    <svg
                      className="empty-state-icon"
                      viewBox="0 0 48 48"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="21" cy="21" r="12.5" />
                      <path d="m30.5 30.5 9 9M16 21h10M21 16v10" />
                    </svg>
                    <h2>Aucun livre trouvé</h2>
                    <p>
                      Essayez un autre titre, un auteur ou une thématique, ou
                      réinitialisez les filtres.
                    </p>
                    <ActionButton variant="quiet" size="small" onClick={resetFilters}>
                      Réinitialiser la recherche
                    </ActionButton>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      </Reveal>
      {mobileFiltersOpen && (
        <div
          className="mobile-filter-overlay"
          onClick={() => setMobileFiltersOpen(false)}
          role="presentation"
        >
          <div
            className="mobile-filter-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Filtres de la bibliothèque"
            onClick={(event) => event.stopPropagation()}
          >
            <BookSidebarFilters
              {...filterProps}
              mobile
              onClose={() => setMobileFiltersOpen(false)}
            />
            <button
              className="mobile-filter-apply"
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Afficher {filteredBooks.length}{" "}
              {filteredBooks.length > 1 ? "livres" : "livre"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
