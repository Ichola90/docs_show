"use client";

import { useEffect, useMemo, useState } from "react";
import { books } from "@/data/books";
import { BookGrid } from "@/components/books/book-grid";
import { BookSearchBar } from "@/components/books/book-search-bar";
import { BookSidebarFilters } from "@/components/books/book-sidebar-filters";
import { ActionButton } from "@/components/ui/action-button";

function matchesSearch(book: (typeof books)[number], query: string) {
  const searchableContent =
    `${book.title} ${book.subtitle} ${book.author} ${book.category}`.toLocaleLowerCase("fr");

  return !query || searchableContent.includes(query);
}

export function BookCatalog({ initialBooks }: { initialBooks?: (typeof books) } = {}) {
  const [allBooks, setAllBooks] = useState<typeof books>(initialBooks ?? books);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  useEffect(() => {
    let active = true;

    const frameId = window.requestAnimationFrame(() => {
      if (!active) return;

      // 1. Lire immédiatement depuis localStorage pour afficher sans aucun délai le livre que l'auteur vient d'uploader
      try {
        const localListRaw = localStorage.getItem("docs_show_custom_books_list");
        if (localListRaw) {
          const localList = JSON.parse(localListRaw);
          if (Array.isArray(localList) && localList.length > 0) {
            setAllBooks((prev) => {
              const existingIds = new Set(prev.map((b) => b.id));
              const newLocalBooks = localList.filter((b) => !existingIds.has(b.id));
              return [...newLocalBooks, ...prev];
            });
          }
        }
      } catch {}

      // 2. Charger les livres de l'API et fusionner avec le cache local
      fetch("/api/books")
        .then((res) => res.json())
        .then((data) => {
          if (!active) return;
          if (data.success && Array.isArray(data.books)) {
            try {
              const localListRaw = localStorage.getItem("docs_show_custom_books_list");
              if (localListRaw) {
                const localList = JSON.parse(localListRaw);
                if (Array.isArray(localList)) {
                  const apiIds = new Set(data.books.map((b: { id: string }) => b.id));
                  const localOnly = localList.filter((b: { id: string }) => !apiIds.has(b.id));
                  setAllBooks([...localOnly, ...data.books]);
                  return;
                }
              }
            } catch {}
            setAllBooks(data.books);
          }
        })
        .catch(() => {});
    });

    return () => {
      active = false;
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const activeCategories = useMemo(
    () => [
      "Tout",
      ...new Set(allBooks.map((book) => book.category)),
    ],
    [allBooks]
  );

  const activeLevels = useMemo(
    () => [...new Set(allBooks.map((book) => book.level))],
    [allBooks]
  );

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

  const query = searchQuery.trim().toLocaleLowerCase("fr");
  const booksMatchingSearch = useMemo(
    () => allBooks.filter((book) => matchesSearch(book, query)),
    [allBooks, query],
  );
  const booksMatchingCategoryFilters = useMemo(
    () =>
      booksMatchingSearch.filter(
        (book) =>
          selectedCategories.length === 0 ||
          selectedCategories.includes(book.category),
      ),
    [booksMatchingSearch, selectedCategories],
  );
  const booksMatchingLevelFilters = useMemo(
    () =>
      booksMatchingSearch.filter(
        (book) =>
          selectedLevels.length === 0 || selectedLevels.includes(book.level),
      ),
    [booksMatchingSearch, selectedLevels],
  );
  const filteredBooks = useMemo(
    () =>
      booksMatchingCategoryFilters.filter(
        (book) =>
          selectedLevels.length === 0 || selectedLevels.includes(book.level),
      ),
    [booksMatchingCategoryFilters, selectedLevels],
  );
  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        activeCategories
          .filter((category) => category !== "Tout")
          .map((category) => [
            category,
            booksMatchingLevelFilters.filter((book) => book.category === category)
              .length,
          ]),
      ),
    [activeCategories, booksMatchingLevelFilters],
  );
  const levelCounts = useMemo(
    () =>
      Object.fromEntries(
        activeLevels.map((level) => [
          level,
          booksMatchingCategoryFilters.filter((book) => book.level === level)
            .length,
        ]),
      ),
    [activeLevels, booksMatchingCategoryFilters],
  );

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
    categories: activeCategories.filter((category) => category !== "Tout"),
    levels: activeLevels,
    categoryCounts,
    levelCounts,
    totalCategoriesCount: booksMatchingLevelFilters.length,
    totalLevelsCount: booksMatchingCategoryFilters.length,
    selectedCategories,
    selectedLevels,
    onCategoryToggle: (category: string) =>
      toggleValue(category, selectedCategories, setSelectedCategories),
    onLevelToggle: (level: string) =>
      toggleValue(level, selectedLevels, setSelectedLevels),
    onCategoryClear: () => setSelectedCategories([]),
    onLevelClear: () => setSelectedLevels([]),
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
              )}
            </div>
          </div>
        </section>
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
