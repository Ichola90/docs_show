# Atelier — bibliothèque de livres tech

Atelier permet d’explorer des livres techniques, de les lire chapitre par chapitre et de tester ses acquis après la lecture.

## Démarrer le projet

Prérequis : Node.js et npm.

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Organisation du code

```text
src/
├── app/
│   ├── (site)/
│   │   ├── layout.tsx                 # Navbar et footer des pages publiques
│   │   ├── page.tsx                   # Accueil composé de sections
│   │   └── bibliotheque/page.tsx      # Catalogue
│   ├── livres/[id]/
│   │   ├── page.tsx                   # Lecture des chapitres
│   │   └── test/page.tsx              # Évaluation du livre
│   ├── layout.tsx                     # Layout racine, langue et métadonnées
│   ├── globals.css                    # Tokens et base visuelle AlloMonRep
│   └── library.css                    # Styles des composants de la bibliothèque
├── components/
│   ├── books/                         # Cartes, couvertures, catalogue et notes partagées
│   ├── home/                          # Sections de la page d’accueil
│   ├── layout/                        # Navbar, footer et bannière partagés
│   ├── reader/                        # Lecteur, chapitres, progression et quiz
│   └── ui/                            # Bouton partagé, icônes et éléments réutilisables
└── data/
    ├── books.ts                       # Types, catalogue et accès aux livres
    ├── book-ratings.ts                # Calcul et stockage JSON des notes
    ├── php-mysql-chapters.json        # Pages et blocs du livre PHP/MySQL
    ├── c-programming-chapters.json    # Pages et blocs du livre de programmation C
    ├── book-content.ts                # Chargement des contenus sur le serveur
    └── book-progress.ts               # Progression de lecture et tentatives de test
```

## Parcours et pages

1. `/` — présentation de la plateforme, livres à la une et méthode.
2. `/bibliotheque` — recherche et filtres par domaine.
3. `/livres/[id]` — lecture du livre et navigation entre ses chapitres.
4. `/livres/[id]/test` — test indépendant lié au livre, avec retour à l’étape de lecture.

Le groupe de routes `(site)` partage la navigation et le pied de page sans ajouter ces éléments au lecteur, qui possède sa propre barre de lecture.
L’accueil et la bibliothèque partagent la bannière carrousel `PlatformBanner`, ses trois visuels locaux et ses commandes accessibles.

## Ajouter un livre

Ajoutez un objet typé au tableau `books` dans `src/data/books.ts`. Fournissez un identifiant unique, les informations du catalogue (dont `rating` et `reviewCount`), les chapitres et le quiz. `getBookById` est l’accès commun aux routes de lecture et d’évaluation. Les couvertures sont dessinées en CSS selon la propriété `cover`.

Les livres « Concevez votre site web avec PHP et MySQL » et « Apprenez à programmer en C ! » conservent leurs pages dans des fichiers JSON dédiés. Les paragraphes, titres et exemples de code sont structurés séparément afin que les lecteurs affichent les exemples dans un éditeur sombre en lecture seule. Le PDF de programmation en C fourni contient 409 pages physiques ; sa pagination imprimée annonce 410 pages.

La progression se conserve dans le stockage local du navigateur. Le lecteur déverrouille les sections uniquement dans l’ordre et ne propose le test qu’après validation de la dernière section. Le nom, les réponses et le résultat du test sont aussi conservés localement ; une tentative terminée ne peut pas être relancée depuis l’interface.

Les appels à l’action utilisent le composant partagé `ActionButton` (`src/components/ui/action-button.tsx`) et ses variantes `primary`, `secondary`, `quiet` et `filter`. Les boutons d’action n’ajoutent pas d’icône flèche ; les contrôles spécifiques au menu et à la navigation des chapitres gardent leur sémantique dédiée.

## Notes des lecteurs

Après avoir terminé la lecture, un lecteur peut attribuer une note de 1 à 5 étoiles. Les avis sont ajoutés aux notes et aux nombres d’avis initiaux du catalogue ; ils ne les remplacent pas. Un identifiant anonyme conservé dans le navigateur permet de mettre à jour une note sans incrémenter plusieurs fois le compteur depuis ce navigateur.

Les notes sont enregistrées dans un fichier JSON, sans base de données. En local, le fichier est créé sous `.data/book-ratings.json`. Pour conserver les notes sur Render :

1. Ajoutez un disque persistant au service web Render, monté sur `/var/data`.
2. Définissez la variable d’environnement `BOOK_RATINGS_FILE` à `/var/data/book-ratings.json`.
3. Gardez une seule instance du service : le fichier JSON n’est pas un stockage partagé entre plusieurs instances.

Le système est volontairement simple et anonyme ; sans compte ni authentification, il ne peut pas garantir qu’une personne ne vote qu’une seule fois depuis plusieurs navigateurs ou appareils.

## Vérifications

```bash
npm run lint
npm run build
```
