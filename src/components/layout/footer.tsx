import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { Reveal } from "@/components/ui/reveal";

export function Footer() {
  return (
    <Reveal className="footer-reveal">
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-columns">
            <div className="footer-about">
              <Link className="brand footer-brand" href="/" aria-label="DOCS SHOW, accueil">
                <BrandMark />
                <span className="brand-text-3d">DOCS SHOW</span>
              </Link>
              <p className="footer-tagline">
                La bibliothèque en ligne pour apprendre les technologies du web et du logiciel, une page et un test à la fois.
              </p>
            </div>

            <nav className="footer-column footer-platform-column" aria-label="Navigation principale">
              <h3 className="footer-heading">
                <span className="footer-heading-3d">Plateforme</span>
              </h3>
              <ul className="footer-links">
                <li><Link href="/">Accueil</Link></li>
                <li><Link href="/bibliotheque">Tous les livres</Link></li>
                <li><Link href="/#methode">Notre approche</Link></li>
                <li><Link href="/#pour-qui">Pour qui ?</Link></li>
              </ul>
            </nav>

            <nav className="footer-column footer-featured-column" aria-label="Lectures à la une">
              <h3 className="footer-heading">
                <span className="footer-heading-3d">À la une</span>
              </h3>
              <ul className="footer-links">
                <li><Link href="/livres/concevez-site-web-php-mysql">PHP et MySQL</Link></li>
                <li><Link href="/livres/apprenez-programmer-c">Programmation en C</Link></li>
                <li><Link href="/bibliotheque">Catalogue complet</Link></li>
                <li><Link href="/publier">Publier un livre (PDF)</Link></li>
              </ul>
            </nav>

            <div className="footer-column footer-note-column">
              <h3 className="footer-heading">
                <span className="footer-heading-3d">Approche</span>
              </h3>
              <p className="footer-note-text">
                Chaque manuel est structuré pour une assimilation progressive : lisez l’essentiel, pratiquez immédiatement et validez vos acquis avec des tests interactifs.
              </p>
              <Link className="footer-note-link" href="/bibliotheque">
                Explorer les manuels <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="footer-copyright">© 2026 DOCS SHOW — Tous droits réservés</span>

            <p className="footer-credit">
              Propulsé avec
              <svg className="footer-heart" viewBox="0 0 20 20" aria-label="amour" role="img">
                <path d="M10 17s-6.5-3.8-6.5-8.1A3.7 3.7 0 0 1 10 6.8a3.7 3.7 0 0 1 6.5 2.1C16.5 13.2 10 17 10 17Z" />
              </svg>
              par <span className="footer-author">ICHOLA AKIOSSI</span>
            </p>

            <Link className="footer-back-top" href="#top" aria-label="Retour en haut de page">
              Haut de page <span aria-hidden="true">↑</span>
            </Link>
          </div>
        </div>
      </footer>
    </Reveal>
  );
}
