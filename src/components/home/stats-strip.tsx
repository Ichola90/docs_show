import { getAllBooksWithCustom } from "@/data/book-content";

export async function StatsStrip() {
  const allBooks = await getAllBooksWithCustom();
  const categoriesCount = new Set(allBooks.map((b) => b.category)).size;

  return (
    <section className="stats-strip" aria-label="La bibliothèque en chiffres">
      <div className="stats-item-reveal">
        <div><strong>{allBooks.length}</strong><span>livres pour apprendre</span></div>
      </div>
      <div className="stats-item-reveal">
        <div><strong>{categoriesCount}</strong><span>grands domaines tech</span></div>
      </div>
      <div className="stats-item-reveal">
        <div><strong>100<span>%</span></strong><span>à votre propre rythme</span></div>
      </div>
      <p>La curiosité est un<br /><em>excellent point de départ.</em></p>
    </section>
  );
}
