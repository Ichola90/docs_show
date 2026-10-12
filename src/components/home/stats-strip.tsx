import { books, categories } from "@/data/books";
import { Reveal } from "@/components/ui/reveal";

export function StatsStrip() {
  return (
    <Reveal>
      <section className="stats-strip" aria-label="La bibliothèque en chiffres">
        <Reveal className="stats-item-reveal" delay={0}>
          <div><strong>{books.length}</strong><span>livres pour apprendre</span></div>
        </Reveal>
        <Reveal className="stats-item-reveal" delay={70}>
          <div><strong>{categories.length - 1}</strong><span>grands domaines tech</span></div>
        </Reveal>
        <Reveal className="stats-item-reveal" delay={140}>
          <div><strong>100<span>%</span></strong><span>à votre propre rythme</span></div>
        </Reveal>
        <Reveal className="stats-item-reveal" delay={210}>
          <p>La curiosité est un<br /><em>excellent point de départ.</em></p>
        </Reveal>
      </section>
    </Reveal>
  );
}
