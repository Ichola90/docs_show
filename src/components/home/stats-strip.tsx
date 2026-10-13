import { books, categories } from "@/data/books";

export function StatsStrip() {
  return (
    <section className="stats-strip" aria-label="La bibliothèque en chiffres">
      <div className="stats-item-reveal">
        <div><strong>{books.length}</strong><span>livres pour apprendre</span></div>
      </div>
      <div className="stats-item-reveal">
        <div><strong>{categories.length - 1}</strong><span>grands domaines tech</span></div>
      </div>
      <div className="stats-item-reveal">
        <div><strong>100<span>%</span></strong><span>à votre propre rythme</span></div>
      </div>
      <p>La curiosité est un<br /><em>excellent point de départ.</em></p>
    </section>
  );
}
