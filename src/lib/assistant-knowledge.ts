export type ChatRole = "user" | "assistant" | "bot_core" | "bot_modern";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  bookContextId?: string;
  codeBlocks?: {
    language: string;
    code: string;
  }[];
  debateAgent?: {
    name: string;
    avatar: string;
    title: string;
    stance: string;
    accentColor: string;
  };
};

export type ConversationSession = {
  id: string;
  title: string;
  mode: "tutor" | "debate";
  bookContextId?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export type DebateTopic = {
  id: string;
  title: string;
  category: string;
  description: string;
  agentCoreStance: string;
  agentModernStance: string;
  initialPrompt: string;
};

export const DEBATE_TOPICS: DebateTopic[] = [
  {
    id: "c-vs-modern",
    title: "Langage C & Maîtrise mémoire vs Runtimes managés modernes",
    category: "Systèmes & Architecture",
    description: "Le contrôle absolu de la mémoire face à la productivité et la sécurité mémoire des langages modernes.",
    agentCoreStance: "Défend la maîtrise bas niveau, la prévisibilité d'exécution, l'efficacité matérielle et l'apprentissage fondamental.",
    agentModernStance: "Défend la vélocité de livraison, la sécurité mémoire par défaut, la réduction des failles critiques et l'outillage moderne.",
    initialPrompt: "Lancer un débat contradictoire : Le langage C reste-t-il indispensable face aux langages modernes à ramasse-miettes et borrow checkers ?",
  },
  {
    id: "monolith-vs-microservices",
    title: "Monolithe Modulaire vs Architecture Microservices",
    category: "Architecture Logicielle",
    description: "Simplicité opérationnelle et cohérence transactionnelle vs découplage d'équipes et scalabilité granulaire.",
    agentCoreStance: "Privilégie le monolithe modulaire robuste, la latence minimale (in-process) et la simplicité de déploiement.",
    agentModernStance: "Privilégie l'indépendance de déploiement, la tolérance aux pannes distribuée et l'évolutivité par domaine.",
    initialPrompt: "Confrontez vos visions : Quand faut-il vraiment abandonner le monolithe pour des microservices dans un projet tech ?",
  },
  {
    id: "clean-code-vs-pragmatism",
    title: "Pureté Clean Code & SOLID vs Pragmatisme et Rapidité MVP",
    category: "Ingénierie & Produit",
    description: "L'investissement dans l'abstraction préventive vs la vitesse d'itération et l'adéquation au besoin réel.",
    agentCoreStance: "Prône la conception durable, la testabilité unitaire rigoureuse et la prévention de la dette technique.",
    agentModernStance: "Prône l'itération rapide (Lean Startup), le refus de la sur-ingénierie prématurée et l'adaptation au retour utilisateur.",
    initialPrompt: "Débat : L'application stricte des principes SOLID et Clean Code ralentit-elle trop les projets émergents ?",
  },
  {
    id: "php8-vs-node-fullstack",
    title: "PHP 8 Moderne & Synchrone vs Node.js & Événementiel",
    category: "Développement Web",
    description: "Modèle share-nothing prévisible et performances JIT vs boucle d'événements non bloquante et écosystème unifié.",
    agentCoreStance: "Démontre la robustesse du cycle de vie isolé de PHP 8, la gestion d'erreurs prévisible et l'absence de fuites d'état global.",
    agentModernStance: "Met en avant l'isomorphisme TypeScript/JS, les WebSockets natifs et les architectures en temps réel sans rechargement.",
    initialPrompt: "Comparez PHP 8 et Node.js pour concevoir une application web moderne en 2026.",
  },
];

export const PROMPT_SUGGESTIONS = [
  {
    title: "Pointeurs et allocation en C",
    prompt: "Explique-moi le fonctionnement des pointeurs et de malloc en C avec un schéma textuel et un exemple de code commenté.",
    category: "Systèmes (C)",
    icon: "code",
    color: "#2563eb",
  },
  {
    title: "Requêtes préparées PDO & Sécurité",
    prompt: "Comment sécuriser un formulaire PHP contre les injections SQL et les failles XSS avec PDO et des requêtes préparées ?",
    category: "Web (PHP & MySQL)",
    icon: "shield",
    color: "#0284c7",
  },
  {
    title: "Architecture CPU & Registres",
    prompt: "Comment les registres CPU et la mémoire cache L1/L2/L3 interagissent-ils lors de l'exécution d'une instruction (livre ATO 23) ?",
    category: "Matériel & Processeurs",
    icon: "cpu",
    color: "#f59e0b",
  },
  {
    title: "Boucle Lean Startup : MVP & Métriques",
    prompt: "Quelle est la méthode exacte pour concevoir un MVP et valider des métriques actionnables selon Eric Ries ?",
    category: "Produit & Stratégie",
    icon: "rocket",
    color: "#10b981",
  },
];

export const PLATFORM_CREATOR_DETAILS = {
  name: "Ingénieur ICHOLA AKIOSSI",
  title: "Ingénieur Concepteur & Architecte Logiciel",
  phone: "+2290148454505",
  phoneDisplay: "+229 01 48 45 45 05",
  portfolio: "https://akiossibriceichola.onrender.com/",
  platform: "DOCS SHOW",
};

/**
 * Générateur de réponses intelligentes pour le mode Tuteur et le mode Débat Multi-Chatbots
 */
export async function generateAssistantResponse(
  userPrompt: string,
  bookContextId?: string,
  mode: "tutor" | "debate" = "tutor"
): Promise<ChatMessage[]> {
  const normalized = userPrompt.toLowerCase();

  if (mode === "debate") {
    return generateDebateTurns(userPrompt, normalized);
  }

  return [generateTutorResponse(userPrompt, bookContextId, normalized)];
}

export function generateTutorResponse(
  prompt: string,
  bookContextId?: string,
  normalizedParam?: string
): ChatMessage {
  const normalized = (normalizedParam || prompt.toLowerCase()).trim();
  const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  // 0. Questions sur le Créateur et Concepteur de la plateforme DOCS SHOW
  const isCreatorQuery =
    normalized.includes("createur") ||
    normalized.includes("créateur") ||
    normalized.includes("auteur") ||
    normalized.includes("ichola") ||
    normalized.includes("akiossi") ||
    normalized.includes("fondateur") ||
    normalized.includes("qui t'a fait") ||
    normalized.includes("qui t'a créé") ||
    normalized.includes("qui t'a cree") ||
    normalized.includes("qui a fait") ||
    normalized.includes("qui a créé") ||
    normalized.includes("qui a cree") ||
    normalized.includes("qui t'a conçu") ||
    normalized.includes("qui t'a concu") ||
    normalized.includes("qui a conçu") ||
    normalized.includes("qui a concu") ||
    normalized.includes("contact") ||
    normalized.includes("portfolio") ||
    normalized.includes("telephone") ||
    normalized.includes("téléphone") ||
    normalized.includes("numero") ||
    normalized.includes("numéro") ||
    normalized.includes("developpeur") ||
    normalized.includes("développeur") ||
    normalized.includes("ingenieur") ||
    normalized.includes("ingénieur");

  if (isCreatorQuery) {
    return {
      id,
      role: "assistant",
      timestamp,
      content: `### 👨‍💻 Créateur et Concepteur Officiel : Ingénieur ICHOLA AKIOSSI

La plateforme **DOCS SHOW** a été conçue, développée et architecturée par l'**${PLATFORM_CREATOR_DETAILS.name}**.

#### Coordonnées officielles du Concepteur :
* **Ingénieur Concepteur** : **${PLATFORM_CREATOR_DETAILS.name}**
* **Téléphone & WhatsApp direct** : [${PLATFORM_CREATOR_DETAILS.phoneDisplay}](tel:${PLATFORM_CREATOR_DETAILS.phone})
* **Portfolio en ligne officiel** : [${PLATFORM_CREATOR_DETAILS.portfolio}](${PLATFORM_CREATOR_DETAILS.portfolio})
* **Plateforme** : **${PLATFORM_CREATOR_DETAILS.platform}**

#### Vision & Mission de DOCS SHOW :
L'**Ingénieur ICHOLA AKIOSSI** a conçu DOCS SHOW comme un écosystème pédagogique de pointe dédié aux développeurs et étudiants passionnés d'informatique :
1. **Compréhension en profondeur** : De l'architecture matérielle (processeur ATO 23, registres, mémoire) et la programmation système en C jusqu'au Web moderne (PHP 8, MySQL, TypeScript, Next.js).
2. **Double intelligence contradictoire** : Une arène de débats multi-chatbots confrontant l'approche systèmes bas-niveau (**DOCS Core**) et l'approche cloud distribuée (**DOCS Modern**).
3. **Validation interactive** : Des quiz rigoureux et tests interactifs pour certifier les compétences acquises sur chaque cours fondateur.

Pour toute collaboration technique, mission d'ingénierie logicielle ou échange académique, vous pouvez joindre directement l'Ingénieur sur son numéro **${PLATFORM_CREATOR_DETAILS.phoneDisplay}** ou consulter ses projets sur son **[portfolio officiel](${PLATFORM_CREATOR_DETAILS.portfolio})**.`,
    };
  }

  // 0-bis. Guardrails : Sujets strictement hors périmètre (politique, médecine, sport général, ragots, etc.)
  const isOffTopic =
    normalized.includes("politique") ||
    normalized.includes("president") ||
    normalized.includes("président") ||
    normalized.includes("election") ||
    normalized.includes("élection") ||
    normalized.includes("gouvernement") ||
    normalized.includes("médical") ||
    normalized.includes("medical") ||
    normalized.includes("médicament") ||
    normalized.includes("medicament") ||
    normalized.includes("maladie") ||
    normalized.includes("football") ||
    normalized.includes("match de foot") ||
    normalized.includes("recette de cuisine") ||
    normalized.includes("horoscope") ||
    normalized.includes("astrologie") ||
    normalized.includes("paris sportif") ||
    normalized.includes("loterie") ||
    normalized.includes("guerre");

  if (isOffTopic) {
    return {
      id,
      role: "assistant",
      timestamp,
      content: `### 🛡️ Périmètre d'Intervention Officiel DOCS SHOW

En tant qu'assistant officiel de la plateforme technique **DOCS SHOW**, ma mission est exclusivement dédiée à l'apprentissage de la programmation, à l'ingénierie logicielle et aux technologies de la plateforme :

* **Programmation Système** : Langage C (ISO C99/C11, gestion mémoire sur le tas et la pile, pointeurs, malloc/free, GCC, Valgrind).
* **Architecture Matérielle** : Processeur ATO 23, registres CPU, ALU, cycle d'instruction fetch-decode-execute et hiérarchie mémoire.
* **Développement Web Backend & Données** : PHP 7/8 moderne, PDO sécurisé, requêtes préparées contre injections SQL, XSS et MySQL 8.
* **Développement Web Frontend & Cloud** : TypeScript, JavaScript moderne, React, Next.js et architectures logicielles.
* **Bonnes Pratiques d'Ingénierie** : Clean Code (Robert C. Martin), principes SOLID, refactoring et méthodologie Lean Startup (Eric Ries).
* **Informations officielles** : La plateforme DOCS SHOW et son concepteur l'**Ingénieur ICHOLA AKIOSSI**.

Je ne suis pas habilité à traiter des sujets hors de ce cadre (politique, conseils médicaux ou juridiques, divertissement général, devoirs scolaires non informatiques).

👉 **N'hésitez pas à me poser une question technique sur l'un de nos cours ou à sélectionner un sujet dans la barre de navigation !**`,
    };
  }

  // 1. Thématique Langage C, Pointeurs, Malloc & Mémoire
  if (
    normalized.includes("pointeur") ||
    normalized.includes("malloc") ||
    normalized.includes("langage c") ||
    normalized.includes("en c") ||
    normalized.includes("valgrind") ||
    normalized.includes("mémoire") ||
    normalized.includes("memoire") ||
    bookContextId === "apprenez-programmer-c"
  ) {
    return {
      id,
      role: "assistant",
      timestamp,
      content: `### Comprendre les pointeurs et la gestion mémoire en C

Un **pointeur** est une variable spéciale qui ne stocke pas une valeur directe, mais **l'adresse mémoire** où réside une autre donnée. Dans le livre *« Apprenez à programmer en C ! »*, ce concept est la clé de voûte de la programmation système.

#### 1. Schéma conceptuel de la mémoire
\`\`\`text
Adresse mémoire :   0x7ffe0010       0x7ffe0014
Contenu :          [    42    ] <-- [ 0x7ffe0010 ]
Variable :            nombre             ptr
\`\`\`

* \`&nombre\` donne **l'adresse** de la variable \`nombre\`.
* \`*ptr\` permet d'accéder au **contenu** pointé par \`ptr\` (déréférencement).

#### 2. Exemple pratique avec allocation dynamique
Voici un exemple sûr illustrant l'allocation sur le tas (*Heap*) avec vérification et libération obligatoire :

\`\`\`c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int taille = 5;
    
    // 1. Allocation dynamique de 5 entiers
    int *tableau = malloc(taille * sizeof(int));
    if (tableau == NULL) {
        fprintf(stderr, "Erreur : échec d'allocation mémoire.\\n");
        return EXIT_FAILURE;
    }

    // 2. Remplissage et lecture
    for (int i = 0; i < taille; i++) {
        tableau[i] = (i + 1) * 10;
        printf("Index %d -> Valeur : %d (adresse : %p)\\n", i, tableau[i], (void*)&tableau[i]);
    }

    // 3. Libération impérative pour éviter les fuites (Memory Leaks)
    free(tableau);
    tableau = NULL; // Bonne pratique : neutraliser le pointeur pendant

    return EXIT_SUCCESS;
}
\`\`\`

> **Règle d'or DOCS SHOW** : À chaque appel de \`malloc()\` ou \`calloc()\`, vérifiez toujours que le retour n'est pas \`NULL\`, et libérez systématiquement la mémoire allouée avec \`free()\` dès que vous n'en avez plus besoin.`,
    };
  }

  // 2. Thématique PHP, MySQL, PDO et Sécurité
  if (
    normalized.includes("php") ||
    normalized.includes("mysql") ||
    normalized.includes("pdo") ||
    normalized.includes("injection sql") ||
    normalized.includes("xss") ||
    normalized.includes("requête préparée") ||
    normalized.includes("requete preparee") ||
    bookContextId === "concevez-site-web-php-mysql"
  ) {
    return {
      id,
      role: "assistant",
      timestamp,
      content: `### Sécuriser PHP et MySQL avec PDO (Requêtes préparées & XSS)

Dans le livre *« Concevez votre site web avec PHP et MySQL »*, la sécurité repose sur deux piliers fondamentaux : **les requêtes préparées** (contre les injections SQL) et **l'échappement des sorties** (contre les attaques Cross-Site Scripting).

#### 1. Pourquoi la concaténation directe est dangereuse
\`\`\`php
// À PROSCRIRE ABSOLUMENT (Vulnérable aux injections SQL) :
$sql = "SELECT * FROM users WHERE email = '" . $_POST['email'] . "'";
\`\`\`
Si un attaquant soumet \`' OR '1'='1\`, la logique de la requête est détournée.

#### 2. La solution propre avec PDO et paramètres liés
Les requêtes préparées séparent l'instruction SQL des données transmises par le client. Le serveur de base de données compile d'abord la structure, puis injecte les paramètres en tant que simples chaînes de caractères.

\`\`\`php
<?php
declare(strict_types=1);

try {
    $db = new PDO(
        'mysql:host=localhost;dbname=docs_show;charset=utf8mb4',
        'utilisateur_db',
        'mot_de_passe_securise',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false, // Utiliser les vraies requêtes préparées du SGBD
        ]
    );

    // 1. Requête préparée avec marqueurs nommés
    $stmt = $db->prepare('
        SELECT id, nom, email, role 
        FROM utilisateurs 
        WHERE email = :email AND actif = 1
    ');

    // 2. Exécution sécurisée
    $stmt->execute(['email' => trim($_POST['email'] ?? '')]);
    $user = $stmt->fetch();

    if ($user) {
        // 3. Protection XSS à l'affichage avec htmlspecialchars()
        echo 'Bienvenue, ' . htmlspecialchars($user['nom'], ENT_QUOTES, 'UTF-8') . ' !';
    } else {
        echo 'Identifiants introuvables.';
    }

} catch (PDOException $e) {
    // Ne jamais afficher les messages bruts de la base en production
    error_log($e->getMessage());
    echo 'Une erreur technique est survenue.';
}
\`\`\`

> **Synthèse sécurité** :
> 1. Utilisez toujours \`prepare()\` et \`execute()\`.
> 2. Activez le jeu de caractères \`utf8mb4\`.
> 3. Échappez chaque donnée dynamique envoyée au navigateur via \`htmlspecialchars(..., ENT_QUOTES, 'UTF-8')\`.`,
    };
  }

  // 3. Thématique Architecture Ordinateurs & CPU (ATO 23)
  if (
    normalized.includes("cpu") ||
    normalized.includes("registre") ||
    normalized.includes("ato") ||
    normalized.includes("processeur") ||
    normalized.includes("cache") ||
    normalized.includes("fetch") ||
    bookContextId === "ato-23-kh3jf" ||
    bookContextId === "architecture-ordinateur-ato23"
  ) {
    return {
      id,
      role: "assistant",
      timestamp,
      content: `### Architecture CPU et Hiérarchie Mémoire (Livre ATO 23)

Dans le manuel *« Architecture et Technologies des Ordinateurs (ATO 23) »*, le fonctionnement d'un processeur moderne s'articule autour de la collaboration entre l'**Unité de Commande**, l'**Unité Arithmétique et Logique (ALU)** et la **hiérarchie des mémoires**.

#### 1. La Pyramide des Vitesses et Capacités
\`\`\`text
[ Registres CPU ]         ~ 0.5 ns   |  Moins de 2 Ko  |  Dans le processeur
    [ Cache L1 ]          ~ 1 - 2 ns |  32 à 64 Ko     |  Ultra-rapide, par cœur
    [ Cache L2 ]          ~ 4 - 7 ns |  512 Ko à 1 Mo  |  Rapide, par cœur
    [ Cache L3 ]          ~ 10-20 ns |  8 à 64 Mo      |  Partagé entre les cœurs
    [ RAM (DDR5) ]        ~ 60-80 ns |  16 à 64 Go     |  Mémoire principale
    [ SSD NVMe ]          ~ 10-50 µs |  500 Go à 4 To  |  Stockage persistant
\`\`\`

#### 2. Le Cycle d'Exécution d'une Instruction (Fetch-Decode-Execute)
1. **Fetch (Recherche)** : Le processeur lit l'instruction pointée par le registre compteur de programme (\`PC\` ou \`RIP\` en x86-64) depuis le cache L1 d'instructions.
2. **Decode (Décodage)** : L'unité de contrôle traduit l'instruction binaire en micro-opérations et identifie les registres opérandes nécessaires.
3. **Execute (Exécution)** : L'ALU effectue l'opération (addition, comparaison, opération binaire).
4. **Write-back (Écriture)** : Le résultat est réinjecté dans le registre de destination ou dirigé vers le cache de données.

> **Point clé** : Quand une donnée n'est pas dans le cache (*Cache Miss*), le CPU doit patienter des dizaines de cycles d'horloge (*Pipeline Stall*). C'est pourquoi un code pensé pour la localité spatiale et temporelle s'exécute jusqu'à 10 fois plus rapidement.`,
    };
  }

  // 4. Thématique Clean Code & Principes SOLID
  if (
    normalized.includes("clean code") ||
    normalized.includes("solid") ||
    normalized.includes("refactor") ||
    normalized.includes("dette technique") ||
    normalized.includes("robert c. martin") ||
    bookContextId === "clean-code"
  ) {
    return {
      id,
      role: "assistant",
      timestamp,
      content: `### Principes Clean Code & SOLID (Robert C. Martin)

Dans le livre *« Clean Code »*, un code propre n'est pas seulement un code qui fonctionne : c'est un code **lisible, prédictible et maintenable** pour l'ensemble d'une équipe.

#### Les 5 Principes SOLID essentiels :
1. **S - Single Responsibility Principle (SRP)** : Une classe ou une fonction ne doit avoir qu'une seule raison de changer.
2. **O - Open/Closed Principle (OCP)** : Une entité doit être ouverte à l'extension, mais fermée à la modification directe.
3. **L - Liskov Substitution Principle (LSP)** : Les sous-types doivent pouvoir remplacer leurs types de base sans altérer la cohérence du programme.
4. **I - Interface Segregation Principle (ISP)** : Préférez plusieurs interfaces fines et spécialisées à une interface monolithique fourre-tout.
5. **D - Dependency Inversion Principle (DIP)** : Dépendez des abstractions (interfaces), jamais des implémentations concrètes.

\`\`\`typescript
// Exemple de fonction respectant SRP et typage strict
export interface UserVerificationResult {
  isValid: boolean;
  reason?: string;
}

export function verifyUserEligibility(age: number, hasConsented: boolean): UserVerificationResult {
  if (age < 18) {
    return { isValid: false, reason: "Âge minimum requis non atteint." };
  }
  if (!hasConsented) {
    return { isValid: false, reason: "Le consentement utilisateur est obligatoire." };
  }
  return { isValid: true };
}
\`\`\`

> **Règle du Boy-Scout** : *« Laissez toujours le code dans un état plus propre que celui dans lequel vous l'avez trouvé. »*`,
    };
  }

  // 5. Thématique Lean Startup & Produit
  if (
    normalized.includes("lean") ||
    normalized.includes("startup") ||
    normalized.includes("mvp") ||
    normalized.includes("eric ries") ||
    bookContextId === "lean-startup" ||
    bookContextId === "lean-startup-xxqd"
  ) {
    return {
      id,
      role: "assistant",
      timestamp,
      content: `### Méthode Lean Startup : Construire, Mesurer, Apprendre

Selon le livre *« The Lean Startup »* d'Eric Ries, la principale cause d'échec des projets numériques n'est pas l'incapacité technique à coder, mais le fait de **construire parfaitement quelque chose dont personne ne veut**.

#### 1. La boucle d'itération fondamentale
\`\`\`text
       [ 1. IDÉE ]
            │ (Construire)
            ▼
       [ 2. PRODUIT / MVP ]
            │ (Mesurer)
            ▼
       [ 3. DONNÉES ]
            │ (Apprendre)
            ▼
      (Persévérer ou Pivoter ?)
\`\`\`

#### 2. Les 3 règles pour un MVP efficace :
* **Définir l'hypothèse de valeur** : Quel est le problème réel que vous résolvez ?
* **Éliminer le superflu** : Ne développez que le minimum nécessaire pour confronter votre solution à de vrais utilisateurs.
* **Privilégier les métriques actionnables** : Bannissez les *vanity metrics* (simples nombres de visites) et mesurez la rétention, le taux d'engagement et le taux de conversion.

> **Conclusion** : Un MVP réussi est celui qui vous permet d'apprendre le maximum avec le minimum d'effort d'ingénierie.`,
    };
  }

  // 6. Présentation générale de la plateforme DOCS SHOW
  if (
    normalized.includes("plateforme") ||
    normalized.includes("docsshow") ||
    normalized.includes("docs show") ||
    normalized.includes("comment ça marche") ||
    normalized.includes("comment ca marche")
  ) {
    return {
      id,
      role: "assistant",
      timestamp,
      content: `### Bienvenue sur la plateforme DOCS SHOW !

**DOCS SHOW** est la plateforme francophone d'apprentissage technique et d'ingénierie logicielle conçue par l'**${PLATFORM_CREATOR_DETAILS.name}**.

#### Nos 3 piliers d'apprentissage :
1. **La Bibliothèque de Cours Fondateurs** : Des livres techniques complets allant du C et de l'architecture processeur ATO 23 jusqu'à PHP/MySQL, TypeScript et Clean Code.
2. **L'Arène des Débats Multi-Chatbots** : Une confrontation technique en direct entre deux modèles experts (**DOCS Core** pour les systèmes matériels et **DOCS Modern** pour les architectures web & cloud).
3. **Les Quiz Interactifs de Certification** : Validez votre niveau chapitre par chapitre avec notation instantanée et corrigés détaillés.

*Pour toute question sur la plateforme, n'hésitez pas à demander ou à contacter son concepteur au **${PLATFORM_CREATOR_DETAILS.phoneDisplay}**.*`,
    };
  }

  // 7. Réponse pédagogique généraliste basée sur le catalogue officiel
  return {
    id,
    role: "assistant",
    timestamp,
    content: `### Analyse et Recommandation DOCS SHOW

Merci pour votre question ! En me basant sur la bibliothèque technique officielle de **DOCS SHOW** conçue par l'**${PLATFORM_CREATOR_DETAILS.name}**, voici une synthèse opérationnelle :

#### Points clés à retenir :
1. **Compréhension des fondations** : Que vous développiez en C, en PHP ou en architecture web, maîtrisez toujours le cycle de vie des données et le modèle d'exécution.
2. **Simplicité et robustesse** : Écrivez du code explicite, facile à tester et sans effets de bord masqués (principes Clean Code & SOLID).
3. **Vérification active** : Après chaque lecture d'un chapitre sur la plateforme, validez systématiquement votre compréhension grâce aux quiz interactifs disponibles sur l'onglet test.

\`\`\`typescript
// Exemple de bonne pratique : fonctions pures et typage strict
export function calculerProgression(chapitresLus: number, totalChapitres: number): number {
  if (totalChapitres <= 0) return 0;
  return Math.min(100, Math.round((chapitresLus / totalChapitres) * 100));
}
\`\`\`

*💡 **Astuce** : Vous pouvez également activer le mode **« Débat Multi-Chatbots »** dans la barre supérieure pour voir deux intelligences artificielles confronter leurs visions d'ingénierie sur ce sujet !*`,
  };
}

/**
 * Génère une séquence de débat contradictoire entre 2 Chatbots experts de la plateforme
 * Préconfiguré avec une argumentation technique poussée pour chacun des 4 débats officiels.
 */
export function generateDebateTurns(prompt: string, normalizedParam?: string): ChatMessage[] {
  const normalized = normalizedParam || prompt.toLowerCase();
  const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  // 1. Débat : C & Maîtrise mémoire vs Runtimes managés modernes
  const isMemoryTopic =
    normalized.includes("c-vs-modern") ||
    normalized.includes("c reste-t-il indispensable") ||
    normalized.includes("ramasse-miette") ||
    normalized.includes("borrow checker") ||
    (normalized.includes("c") && (normalized.includes("mémoire") || normalized.includes("rust") || normalized.includes("pointeur")));

  if (isMemoryTopic) {
    return [
      {
        id: `deb_1_${Date.now()}`,
        role: "bot_core",
        timestamp: time,
        debateAgent: {
          name: "DOCS Core (Chatbot 1)",
          avatar: "⚡",
          title: "Architecte Systèmes & Bas Niveau",
          stance: "Performance native, contrôle total et prévisibilité matérielle",
          accentColor: "#2563eb",
        },
        content: `**Point de vue : Le contrôle matériel est irremplaçable.**

Quand on programme en **Langage C**, rien ne s'interpose entre l'intention du développeur et le matériel :
1. **Prévisibilité temporelle absolue** : Aucun ramasse-miettes (*Garbage Collector*) ne vient figer aléatoirement l'application pour nettoyer la mémoire (pas de pauses *Stop-the-World* inacceptables dans les systèmes temps réel, moteurs de bases de données ou microcontrôleurs).
2. **Empreinte mémoire minimale** : Un programme C ne consomme que ce qu'il alloue strictement.
3. **Pédagogie et maîtrise** : Comprendre le C, c'est comprendre comment un CPU fonctionne réellement (la pile, le tas, les registres, les bus mémoire décrits dans le livre *ATO 23*). Sans cette maîtrise, un développeur subit la technologie au lieu de la dominer.`,
      },
      {
        id: `deb_2_${Date.now() + 1}`,
        role: "bot_modern",
        timestamp: time,
        debateAgent: {
          name: "DOCS Modern (Chatbot 2)",
          avatar: "🌐",
          title: "Ingénieur Full-Stack & Cloud Native",
          stance: "Sécurité mémoire par défaut, vélocité d'équipe et résilience",
          accentColor: "#0284c7",
        },
        content: `**Contre-argument : L'erreur humaine en C a un coût colossal pour l'industrie.**

Je respecte la rigueur du bas niveau, mais regardons la réalité de l'ingénierie logicielle contemporaine :
* **70 % des failles de sécurité critiques** (rapports annuels de Microsoft Security Response Center et de Google Chromium) proviennent de bogues de gestion mémoire (*buffer overflows*, *use-after-free*, fuites mémoire).
* Les langages modernes (Rust avec son modèle d'appartenance à coût nul, ou des environnements managés comme TypeScript, Go ou PHP 8) garantissent la **sécurité mémoire par conception**, sans sacrifier les performances réelles en production.
* Dans une entreprise, la **vitesse d'itération et la maintenabilité d'une équipe de 20 développeurs** valent bien plus que l'économie de quelques microsecondes sur une boucle d'instruction.`,
      },
      {
        id: `deb_3_${Date.now() + 2}`,
        role: "bot_core",
        timestamp: time,
        debateAgent: {
          name: "DOCS Core (Chatbot 1)",
          avatar: "⚡",
          title: "Architecte Systèmes & Bas Niveau",
          stance: "La réponse technique : la rigueur et l'outillage",
          accentColor: "#2563eb",
        },
        content: `**Réplique technique : L'outillage moderne du C a résolu ces dérives.**

Avec les analyseurs statiques, les *AddressSanitizers (ASan)* et les directives strictes de compilation (\`-Wall -Wextra -Werror -pedantic\`), un code C moderne écrit par des ingénieurs formés est d'une robustesse inégalée.

C'est précisément grâce aux systèmes écrits en C que vos runtimes managés (le moteur V8 de Node.js, l'interpréteur Zend de PHP 8, le noyau Linux de vos conteneurs Docker) peuvent exister et fonctionner à cette vitesse !`,
      },
      {
        id: `deb_4_${Date.now() + 3}`,
        role: "assistant",
        timestamp: time,
        content: `### 🎯 Synthèse du Débat DOCS SHOW pour le Développeur

La complémentarité des deux visions illustre l'équilibre recommandé dans l'ingénierie moderne :
* **Apprenez et pratiquez le C** pour forger votre rigueur technique, comprendre les structures de données réelles et optimiser vos cœurs applicatifs critiques.
* **Utilisez les environnements de plus haut niveau** (PHP, TypeScript, Go) pour bâtir rapidement vos interfaces web, vos API REST et vos produits à forte vélocité.`,
      },
    ];
  }

  // 2. Débat : Clean Code vs Pragmatisme MVP
  const isCleanCodeTopic =
    normalized.includes("clean-code-vs-pragmatism") ||
    normalized.includes("solid") ||
    normalized.includes("pureté clean code") ||
    normalized.includes("pragmatisme");

  if (isCleanCodeTopic) {
    return [
      {
        id: `deb_cc_1_${Date.now()}`,
        role: "bot_core",
        timestamp: time,
        debateAgent: {
          name: "DOCS Core (Chatbot 1)",
          avatar: "⚡",
          title: "Architecte Clean Code & Qualité",
          stance: "Conception durable, testabilité et réduction de la dette",
          accentColor: "#2563eb",
        },
        content: `**Thèse : La dette technique accumulée au départ finit toujours par tuer le projet.**

Négliger la rigueur Clean Code sous prétexte de « faire un MVP » est une illusion coûteuse :
1. **L'exponentielle de la dette technique** : Dès que l'on commence à court-circuiter les responsabilités uniques (SRP) et les abstractions, chaque nouvelle fonctionnalité prend deux fois plus de temps à être codée et testée.
2. **Le coût des régressions** : Un code sans architecture claire rend les tests unitaires impossibles. Tout changement casse silencieusement une autre partie de l'application.
3. **Le professionnalisme** : Comme l'explique Robert C. Martin, « La seule façon d'aller vite, c'est d'aller bien ».`,
      },
      {
        id: `deb_cc_2_${Date.now() + 1}`,
        role: "bot_modern",
        timestamp: time,
        debateAgent: {
          name: "DOCS Modern (Chatbot 2)",
          avatar: "🌐",
          title: "Ingénieur Produit & Lean Startup",
          stance: "Vélocité MVP, confrontation marché et refus de la sur-ingénierie",
          accentColor: "#0284c7",
        },
        content: `**Antithèse : Un code propre dans un produit dont personne ne veut ne sert à rien.**

Le piège classique de l'ingénieur est de tomber amoureux de son code plutôt que du problème de l'utilisateur :
* **Sur-ingénierie prématurée** : Créer 15 interfaces, 4 factories et des abstractions complexes pour un besoin qui sera supprimé ou pivoté dans 2 semaines est une pure perte de capital.
* **Lean Startup (Eric Ries)** : L'objectif d'un produit émergent est l'apprentissage validé, pas la pureté architecturale d'un musée du code.
* Le pragmatisme consiste à écrire un code lisible et simple, sans créer des couches d'indirection préventives qui ralentissent la livraison.`,
      },
      {
        id: `deb_cc_3_${Date.now() + 2}`,
        role: "assistant",
        timestamp: time,
        content: `### 🎯 Synthèse et Recommandation d'Ingénierie DOCS SHOW

1. **Règle des 3 itérations** : Écrivez du code simple et lisible au départ. Ne créez une abstraction que lorsque le même motif apparaît pour la troisième fois (*Rule of Three*).
2. **Modularité avant abstraction** : Isolez vos domaines métiers dans des modules étanches. Ainsi, même si le code interne d'un module est rapidement réécrit pour tester une hypothèse, le reste du système reste sain et stable.`,
      },
    ];
  }

  // 3. Débat : PHP 8 Moderne vs Node.js Fullstack
  const isPhpVsNodeTopic =
    normalized.includes("php8-vs-node") ||
    normalized.includes("php 8") ||
    normalized.includes("node.js") ||
    (normalized.includes("php") && normalized.includes("node"));

  if (isPhpVsNodeTopic) {
    return [
      {
        id: `deb_php_1_${Date.now()}`,
        role: "bot_core",
        timestamp: time,
        debateAgent: {
          name: "DOCS Core (Chatbot 1)",
          avatar: "🐘",
          title: "Architecte PHP 8 & Systèmes",
          stance: "Modèle Share-Nothing, isolation des requêtes et stabilité",
          accentColor: "#2563eb",
        },
        content: `**Thèse : Le modèle Share-Nothing de PHP 8 reste le plus robuste du Web.**

PHP 8 moderne (avec typage strict, JIT, attributes, match expressions et PDO sécurisé) est un monstre d'efficacité :
1. **Zéro fuite d'état entre requêtes** : En PHP, chaque requête HTTP naît, s'exécute dans un espace isolé et meurt. Impossible d'avoir une variable globale qui fuite d'un utilisateur à un autre (contrairement aux serveurs Node persistants à état partagé).
2. **Débogage prévisible** : Le flux synchrone élimine le risque d'*Uncaught Exception* qui fait crasher tout le processus de votre serveur Node.js.
3. **Simplicité opérationnelle** : Déployer et faire tourner PHP-FPM avec Nginx ou Caddy consomme une fraction de la RAM nécessaire aux clusters Node.`,
      },
      {
        id: `deb_php_2_${Date.now() + 1}`,
        role: "bot_modern",
        timestamp: time,
        debateAgent: {
          name: "DOCS Modern (Chatbot 2)",
          avatar: "🌐",
          title: "Ingénieur Full-Stack & Temps Réel",
          stance: "Isomorphisme TypeScript, WebSockets natifs et écosystème unifié",
          accentColor: "#0284c7",
        },
        content: `**Antithèse : TypeScript partagé entre front et back transforme la productivité.**

PHP 8 est respectable, mais l'écosystème Node / Next.js offre des avantages organisationnels majeurs :
* **Un seul langage (TypeScript) de bout en bout** : Partagez vos types, vos schémas de validation (Zod) et vos modèles de données entre votre interface React et votre backend API sans aucune duplication.
* **Temps réel et streaming natifs** : Node.js gère des dizaines de milliers de connexions WebSockets et Server-Sent Events (SSE) simultanées sur une seule instance sans épuiser les processus du serveur.
* **Server Components & Edge** : Next.js exécute le rendu au plus proche des utilisateurs sur les réseaux CDN globaux.`,
      },
      {
        id: `deb_php_3_${Date.now() + 2}`,
        role: "assistant",
        timestamp: time,
        content: `### 🎯 Synthèse et Recommandation d'Ingénierie DOCS SHOW

* **Choisissez PHP 8 & MySQL** pour les applications de gestion, SaaS d'entreprise, intranets, sites e-commerce et API CRUD robustes où la simplicité de maintenance et l'isolation des transactions sont prioritaires.
* **Choisissez Node.js & TypeScript** pour les applications temps réel (chat, streaming, dashboards interactifs collaboratifs) et pour unifier l'outillage de l'équipe autour d'un contrat de types commun.`,
      },
    ];
  }

  // 4. Débat : Monolithe Modulaire vs Microservices (Par défaut pour Architecture)
  return [
    {
      id: `deb_arch_1_${Date.now()}`,
      role: "bot_core",
      timestamp: time,
      debateAgent: {
        name: "DOCS Core (Chatbot 1)",
        avatar: "⚡",
        title: "Architecte Systèmes & Monolithes",
        stance: "Simplicité opérationnelle et cohérence transactionnelle",
        accentColor: "#2563eb",
      },
      content: `**Thèse : Le Monolithe Modulaire est la solution la plus saine pour 95 % des projets.**

Avant de multiplier les conteneurs et les microservices :
* Un monolithe bien architecturé offre des **transactions ACID fiables**, un refactoring TypeScript immédiat sur tout le projet et **zéro latence réseau inter-services**.
* Déployer un seul binaire ou une seule application Next.js/PHP réduit drastiquement les coûts d'infrastructure et les risques de pannes en cascade.`,
    },
    {
      id: `deb_arch_2_${Date.now() + 1}`,
      role: "bot_modern",
      timestamp: time,
      debateAgent: {
        name: "DOCS Modern (Chatbot 2)",
        avatar: "🌐",
        title: "Ingénieur Cloud & Systèmes Distribués",
        stance: "Découplage d'équipes et scalabilité granulaire",
        accentColor: "#0284c7",
      },
      content: `**Antithèse : Le microservice s'impose quand l'organisation humaine grandit.**

Le microservice n'est pas qu'un choix technique, c'est l'application de la **loi de Conway** :
* Quand vous avez 50 développeurs travaillant sur la même base de code, les conflits de fusion, les files d'attente CI/CD et les déploiements géants deviennent un goulot d'étranglement mortel.
* Les microservices permettent à chaque équipe d'être propriétaire de son cycle de vie, de scaler individuellement un service sollicité (ex: l'analyse PDF) sans sur-dimensionner tout le reste.`,
    },
    {
      id: `deb_arch_3_${Date.now() + 2}`,
      role: "assistant",
      timestamp: time,
      content: `### 🎯 Synthèse et Recommandation d'Ingénierie DOCS SHOW

1. **Commencez toujours par un Monolithe Modulaire propre** : Délimitez bien vos domaines métiers avec des interfaces claires.
2. **N'extrayez en microservice** qu'une partie spécifique du système lorsqu'elle a des besoins de ressources très atypiques (ex: traitement lourd de calcul ou conversion de documents) ou lorsqu'une équipe dédiée en prend la responsabilité exclusive.`,
    },
  ];
}


