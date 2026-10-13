import type { Metadata } from "next";
import { PublishBookForm } from "@/components/publish/publish-book-form";
import { PlatformBanner } from "@/components/layout/platform-banner";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Publier un livre (PDF)",
  description:
    "Importez le PDF de votre livre. Notre plateforme génère automatiquement sa carte de bibliothèque, son lecteur web interactif, ses quiz et son espace d'avis.",
  path: "/publier/",
});

export default function PublishPage() {
  return (
    <main className="site-shell" id="contenu-principal">
      <PlatformBanner />

      <section className="publish-hero-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ESPACE AUTEURS & CRÉATEURS</p>
            <h1>Publier un livre<span>.</span></h1>
          </div>
          <p className="section-intro">
            Importez le fichier PDF de votre ouvrage technique. Notre moteur extrait les textes et le code, découpe les chapitres, crée le test d’évaluation et publie instantanément votre livre sur la plateforme.
          </p>
        </div>

        <PublishBookForm />
      </section>
    </main>
  );
}

