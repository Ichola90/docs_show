# DOCS SHOW — La bibliothèque des livres tech & de programmation

[![CI](https://github.com/Ichola90/docs_show/actions/workflows/ci.yml/badge.svg)](https://github.com/Ichola90/docs_show/actions/workflows/ci.yml)
[![Production](https://img.shields.io/badge/Production-docsshow.vercel.app-2563eb)](https://docsshow.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-6e9f18)](https://vitest.dev/)

**DOCS SHOW** est une plateforme web moderne conçue pour transformer la lecture d'ouvrages techniques et de documentation en une **expérience d'apprentissage interactive, progressive et engageante**.

🔗 **Application en ligne** : [https://docsshow.vercel.app/](https://docsshow.vercel.app/)

---

## 🌟 Fonctionnalités Clés

* 📖 **Lecteur de Code & Chapitres Pas à Pas** : Navigation séquentielle fluide entre les chapitres, blocs de code syntaxiques lisibles, barre de progression interactive.
* 🎯 **Quiz d'Évaluation Instantanés** : Chaque livre intègre son propre quiz interactif (QCM et réponses rédigées) avec explications détaillées et calcul de score.
* ⭐ **Système d'Avis & Notations Multi-Niveaux** : Note sur 5 étoiles, avis textuels récents, déduplication sémantique en temps réel et synchronisation optimiste.
* 📄 **Générateur Assisté de Livres (Import PDF)** : Découpage intelligent de PDF techniques jusqu'à 500 pages, reconnaissance automatique des grandes lignes (dont les puces `❖`, `•`, etc.), extraction de code et génération automatique de quiz.
* 📱 **Design Mobile-First Haute Définition** : Rendu responsive soigné sur tous les écrans (de 320px à l'ultra-large), badges de notation anti-clipping, illustrations tech 3D sans surcharge visuelle.
* 🌐 **SEO & OpenGraph Avancés** : Bannières dynamiques 1200×630px adaptées pour WhatsApp, X (Twitter Cards), LinkedIn, Facebook, et balisage Schema.org JSON-LD.

---

## 🛠️ Stack Technique & Architecture

* **Framework** : [Next.js 16 (App Router)](https://nextjs.org/) avec compilation [Turbopack](https://turbo.build/).
* **Interface & Rendu** : [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) & Design System personnalisé.
* **Moteur d'Analyse PDF** : `pdf-parse` avec worker adapté aux environnements serverless.
* **Persistance & Données** :
  * Livres officiels statiques intégrés dans `src/data/`.
  * Livres personnalisés et avis persistés via l'API GitHub Gist (serveur distant) avec fallback mémoire et `localStorage` client résilient.
* **Tests Automatisés** : [Vitest](https://vitest.dev/) avec alias de modules et environnement Node.
* **CI / CD & Hébergement** : GitHub Actions (Lint, Tests, Build) et déploiement continu sur [Vercel](https://vercel.com/).

---

## 📂 Structure du Projet

```text
web_from_zero/
├── .github/
│   └── workflows/
│       └── ci.yml                     # Pipeline d'intégration continue (Lint + Tests + Build)
├── public/
│   ├── images/                        # Bannières 3D et illustrations de la plateforme
│   ├── opengraph-image.png            # Image OpenGraph officielle (1200x630)
│   ├── logo.png / icon.svg            # Emblème et favicon
│   └── manifest.json                  # Métadonnées PWA
├── scripts/
│   └── generate-og.js                 # Générateur Sharp pour les bannières OpenGraph
├── src/
│   ├── app/
│   │   ├── (site)/                    # Pages publiques avec Navbar & Footer
│   │   │   ├── bibliotheque/page.tsx  # Catalogue des livres et recherche
│   │   │   ├── publier/page.tsx       # Formulaire d'importation PDF
│   │   │   └── page.tsx               # Page d'accueil
│   │   ├── api/
│   │   │   ├── books/                 # Endpoints livres & upload PDF
│   │   │   └── ratings/               # Endpoint d'enregistrement des avis
│   │   ├── livres/[id]/
│   │   │   ├── page.tsx               # Lecteur web du livre
│   │   │   └── test/page.tsx          # Évaluation interactive
│   │   ├── globals.css                # Variables de design et normalisation
│   │   ├── library.css                # Feuilles de styles des cartes et du lecteur
│   │   ├── robots.ts / sitemap.ts     # Indexation pour les moteurs de recherche
│   │   └── layout.tsx                 # Layout racine, Provider d'avis et SEO
│   ├── components/
│   │   ├── books/                     # Cartes de livres, catalogue, notations
│   │   ├── home/                      # Sections de l'accueil et statistiques
│   │   ├── layout/                    # Navbar, Footer et Bannière carrousel
│   │   ├── publish/                   # Composants d'upload PDF et aperçu en direct
│   │   └── reader/                    # Lecteur, sommmaire, chapitres et quiz
│   ├── data/                          # Contenus des livres officiels (PHP/MySQL, C, etc.)
│   └── lib/
│       ├── __tests__/                 # Tests unitaires Vitest (parser, calculs d'avis)
│       ├── custom-books-store.ts      # Gestionnaire des livres téléversés
│       ├── json-ratings-store.ts      # Gestionnaire d'avis et déduplication
│       ├── pdf-book-parser.ts         # Moteur d'extraction et structuration PDF
│       ├── rate-limiter.ts            # Protection contre le spam par IP
│       └── seo.ts                     # Fabrique de métadonnées OpenGraph et Twitter
├── package.json
├── tsconfig.json
└── vitest.config.mts
```

---

## 🚀 Démarrage Rapide

### Prérequis
* [Node.js](https://nodejs.org/) version **20.x** ou supérieure (Node 22 recommandé).
* Gestionnaire de paquets `npm`.

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/Ichola90/docs_show.git
cd docs_show

# 2. Installer les dépendances
npm install
```

### Variables d'Environnement

Créez un fichier `.env.local` à la racine :

```env
# URL publique canonique du site (sans slash final)
NEXT_PUBLIC_SITE_URL=https://docsshow.vercel.app

# Identifiants optionnels pour la persistance distante GitHub Gist
GITHUB_GIST_ID=votre_gist_id_ici
GITHUB_TOKEN=votre_github_personal_access_token_ici
```

> **Note** : Même sans `GITHUB_GIST_ID`, l'application fonctionne parfaitement en local grâce au fallback `localStorage` et mémoire.

### Lancement en Développement

```bash
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 🧪 Commandes & Scripts Disponibles

| Commande | Action |
| :--- | :--- |
| `npm run dev` | Lance le serveur Next.js en mode développement avec rechargement à chaud. |
| `npm run build` | Compile l'application pour la production avec Next.js et Turbopack. |
| `npm start` | Démarre le serveur de production localement. |
| `npm test` | Exécute la suite complète de tests unitaires avec **Vitest**. |
| `npm run test:watch` | Lance Vitest en mode interactif (*watch mode*). |
| `npm run lint` | Analyse le code avec **ESLint**. |
| `node scripts/generate-og.js` | Régénère les bannières OpenGraph 1200×630px en haute définition via Sharp. |

---

## 🛡️ Intégration Continue (CI)

Chaque modification poussée sur la branche `main` ou proposée via une Pull Request déclenche automatiquement la GitHub Action [`.github/workflows/ci.yml`](.github/workflows/ci.yml) :
1. Installation stricte des dépendances (`npm ci`).
2. Vérification ESLint (`npm run lint`).
3. Exécution des tests unitaires (`npm test`).
4. Validation du build de production (`npm run build`).

---

## 👨‍💻 Auteur & Licence

Développé par **ICHOLA AKIOSSI** dans le cadre du projet **DOCS SHOW**.  
Tous droits réservés.
