import { ActionButton } from "@/components/ui/action-button";
import { Reveal } from "@/components/ui/reveal";

const learningSteps = [
  {
    title: "Choisissez votre sujet",
    description: "Développement, data, design ou entrepreneuriat : suivez ce qui vous intrigue.",
  },
  {
    title: "Lisez à votre rythme",
    description: "Des chapitres courts, une lecture claire, et votre progression toujours visible.",
  },
  {
    title: "Testez vos acquis",
    description: "À la fin de votre lecture, quelques questions pour ancrer les idées essentielles.",
  },
];

export function LearningMethod() {
  return (
    <Reveal>
      <section className="method-section" id="methode">
        <Reveal>
          <div className="method-intro">
            <p className="eyebrow">UNE AUTRE FAÇON DE LIRE</p>
            <h2>Lire, c’est bien.<br /><em>Comprendre, c’est mieux.</em></h2>
            <p>Un bon livre ouvre une porte. Notre parcours vous aide à la franchir, une page après l’autre.</p>
            <ActionButton href="/bibliotheque" variant="secondary">
              À vous de découvrir
            </ActionButton>
          </div>
        </Reveal>
        <div className="method-steps">
          {learningSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 90}>
              <article>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{step.title}</h3><p>{step.description}</p></div>
                <span className="step-mark">↗</span>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
