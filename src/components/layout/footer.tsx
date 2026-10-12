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
              <Link className="brand footer-brand" href="/" aria-label="Atelier, accueil">
                <BrandMark />
                <span>ATELIER<span className="brand-period">.</span></span>
              </Link>
              <p>La bibliothèque en ligne pour apprendre les technologies, une page à la fois.</p>
            </div>

            <nav className="footer-column" aria-label="Découvrir Atelier">
              <h3>Découvrir</h3>
              <Link href="/">Accueil</Link>
              <Link href="/bibliotheque">Tous les livres</Link>
              <Link href="/#methode">Notre approche</Link>
              <Link href="/#pour-qui">Pour qui ?</Link>
            </nav>

            <nav className="footer-column" aria-label="Livres à la une">
              <h3>À la une</h3>
              <Link href="/livres/concevez-site-web-php-mysql">
                PHP et MySQL
              </Link>
              <Link href="/livres/apprenez-programmer-c">
                Programmation en C
              </Link>
              <Link href="/bibliotheque">Trouver une lecture</Link>
            </nav>

            <div className="footer-note">
              <span className="footer-note-mark" aria-hidden="true">Aa</span>
              <p>Lire, comprendre, pratiquer : faites de chaque lecture une nouvelle compétence.</p>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="footer-copyright">© 2026 Atelier. Tous droits réservés.</span>
            <p className="footer-credit">
              Propulsé avec
              <svg viewBox="0 0 20 20" aria-label="amour" role="img">
                <path d="M10 17s-6.5-3.8-6.5-8.1A3.7 3.7 0 0 1 10 6.8a3.7 3.7 0 0 1 6.5 2.1C16.5 13.2 10 17 10 17Z" />
              </svg>
              par <span>ICHOLA AKIOSSI</span>
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
