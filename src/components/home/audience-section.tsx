import { Reveal } from "@/components/ui/reveal";

const audiences = [
  {
    number: "01 / ÉTUDIANTS",
    title: "Apprenez au-delà du cours.",
    description: "Explorez les idées, les outils et les méthodes qui complètent votre formation.",
  },
  {
    number: "02 / CHERCHEURS",
    title: "Faites des ponts entre les disciplines.",
    description: "Accédez à des perspectives nouvelles et partagez des connaissances solides.",
  },
  {
    number: "03 / ENTREPRENEURS",
    title: "Faites avancer vos projets.",
    description: "Des ressources pratiques pour décider, construire et faire évoluer vos idées.",
  },
];

export function AudienceSection() {
  return (
    <Reveal>
      <section className="audience-section" id="pour-qui">
        <Reveal>
          <div className="audience-heading">
            <p className="eyebrow">LE SAVOIR EST FAIT POUR CIRCULER</p>
            <h2>Pour celles et ceux qui<br />veulent <em>aller plus loin.</em></h2>
          </div>
        </Reveal>
        <div className="audience-grid">
          {audiences.map((audience, index) => (
            <Reveal key={audience.number} delay={index * 90}>
              <article>
                <span>{audience.number}</span>
                <h3>{audience.title}</h3>
                <p>{audience.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
