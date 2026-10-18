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
  const normalized = normalizedParam || prompt.toLowerCase();
  const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // 1. Thématique Langage C & Pointeurs
  if (normalized.includes("pointeur") || normalized.includes("malloc") || normalized.includes("langage c") || normalized.includes("en c") || bookContextId === "apprenez-programmer-c") {
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
  if (normalized.includes("php") || normalized.includes("mysql") || normalized.includes("pdo") || normalized.includes("injection sql") || normalized.includes("xss") || bookContextId === "concevez-site-web-php-mysql") {
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
  if (normalized.includes("cpu") || normalized.includes("registre") || normalized.includes("ato") || normalized.includes("processeur") || normalized.includes("cache") || bookContextId === "ato-23-kh3jf") {
    return {
      id,
      role: "assistant",
      timestamp,
      content: `### Architecture CPU et Hiérarchie Mémoire (Livre ATO 23)

Dans le manuel *« ATO 23 (Architecture et Technologies des Ordinateurs) »*, le fonctionnement d'un processeur moderne s'articule autour de la collaboration entre l'**Unité de Commande**, l'**Unité Arithmétique et Logique (ALU)** et la **hiérarchie des mémoires**.

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

  // 4. Thématique Lean Startup & Produit
  if (normalized.includes("lean") || normalized.includes("startup") || normalized.includes("mvp") || normalized.includes("eric ries") || bookContextId === "lean-startup-xxqd") {
    return {
      id,
      role: "assistant",
      timestamp,
      content: `### Méthode Lean Startup : Construire, Mesurer, Apprendre

Selon le livre *« Lean Startup »*, la principale cause d'échec des projets numériques n'est pas l'incapacité technique à coder, mais le fait de **construire parfaitement quelque chose dont personne ne veut**.

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

  // 5. Réponse pédagogique généraliste basée sur le catalogue
  return {
    id,
    role: "assistant",
    timestamp,
    content: `### Analyse et Recommandation DOCS SHOW

Merci pour votre question ! En me basant sur la bibliothèque technique de **DOCS SHOW**, voici une synthèse opérationnelle :

#### Points clés à retenir :
1. **Compréhension des fondations** : Que vous développiez en C, en PHP ou en architecture web, maîtrisez toujours le cycle de vie des données et le modèle d'exécution.
2. **Simplicité et robustesse** : Écrivez du code explicite, facile à tester et sans effets de bord masqués.
3. **Vérification active** : Après chaque lecture d'un chapitre sur la plateforme, validez systématiquement votre compréhension grâce aux quiz interactifs disponibles sur l'onglet test.

\`\`\`typescript
// Exemple de bonne pratique : fonctions pures et typage strict
export function calculerProgression(chapitresLus: number, totalChapitres: number): number {
  if (totalChapitres <= 0) return 0;
  return Math.min(100, Math.round((chapitresLus / totalChapitres) * 100));
}
\`\`\`

*💡 **Astuce** : Vous pouvez également activer le mode **« Débat Multi-Chatbots »** dans la barre supérieure pour voir deux intelligences artificielles confronter leurs points de vue sur ce sujet !*`,
  };
}

/**
 * Génère une séquence de débat contradictoire entre 2 Chatbots experts de la plateforme
 */
export function generateDebateTurns(prompt: string, normalizedParam?: string): ChatMessage[] {
  const normalized = normalizedParam || prompt.toLowerCase();
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const isMemoryTopic =
    normalized.includes("c") ||
    normalized.includes("mémoire") ||
    normalized.includes("rust") ||
    normalized.includes("pointeur");

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
1. **Prévisibilité temporelle absolue** : Aucun ramasse-miettes (*Garbage Collector*) ne vient figer aléatoirement l'application pour nettoyer la mémoire (pas de pauses *Stop-the-World* inacceptables dans les systèmes temps réel ou les moteurs de base de données).
2. **Empreinte mémoire minimale** : Un programme C ne consomme que ce qu'il alloue strictement.
3. **Pédagogie et maîtrise** : Comprendre le C, c'est comprendre comment un CPU fonctionne réellement (la pile, le tas, les registres, les bus mémoire décrits dans *ATO 23*). Sans cette maîtrise, un développeur subit la technologie au lieu de la dominer.`,
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
        content: `### 🎯 Synthèse du Débat pour le Développeur

La complémentarité des deux visions illustre l'équilibre recommandé dans l'ingénierie moderne :
* **Apprenez et pratiquez le C** pour forger votre rigueur technique, comprendre les structures de données réelles et optimiser vos cœurs applicatifs critiques.
* **Utilisez les environnements de plus haut niveau** (PHP, TypeScript, Go) pour bâtir rapidement vos interfaces web, vos API REST et vos produits à forte vélocité.`,
      },
    ];
  }

  // Sujet Architecture ou général
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
      content: `### 🎯 Recommandation d'Ingénierie DOCS SHOW

1. **Commencez toujours par un Monolithe Modulaire propre** : Délimitez bien vos domaines métiers avec des interfaces claires.
2. **N'extrayez en microservice** qu'une partie spécifique du système lorsqu'elle a des besoins de ressources très atypiques (ex: traitement lourd de calcul ou conversion de documents) ou lorsqu'une équipe dédiée en prend la responsabilité exclusive.`,
    },
  ];
}

