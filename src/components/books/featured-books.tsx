import { getAllBooksWithCustom } from "@/data/book-content";
import { BookGrid } from "@/components/books/book-grid";
import { ActionButton } from "@/components/ui/action-button";
import { Reveal } from "@/components/ui/reveal";

export async function FeaturedBooks() {
  const allBooks = await getAllBooksWithCustom();

  return (
    <section className="library-section" aria-labelledby="featured-books-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">VOTRE PROCHAINE BONNE IDÉE</p>
          <h2 id="featured-books-title">À la une<span>.</span></h2>
        </div>
        <p className="section-intro">
          Des livres choisis pour leur clarté, leur profondeur et leur utilité dans la vraie vie.
        </p>
      </div>
      <BookGrid books={allBooks.slice(0, 8)} />
      <Reveal delay={120}>
        <ActionButton href="/bibliotheque" variant="secondary" className="load-more">
          Explorer toute la bibliothèque
        </ActionButton>
      </Reveal>
    </section>
  );
}
