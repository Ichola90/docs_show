export type BookPageBlock = {
  type: "paragraph" | "heading" | "code";
  text: string;
  language?: string;
};

export type BookPage = {
  number: number;
  blocks: BookPageBlock[];
};

export type BookChapter = {
  title: string;
  content?: string[];
  pages?: BookPage[];
  part?: string;
};

export type BookQuizQuestion =
  | {
      type: "choice";
      question: string;
      answers: string[];
      correctAnswer: number;
      explanation: string;
    }
  | {
      type: "text";
      question: string;
      acceptedAnswers: string[];
      explanation: string;
      placeholder?: string;
    };

type BookQuizDefinition =
  | { questions: BookQuizQuestion[] }
  | {
      question: string;
      answers: string[];
      correctAnswer: number;
      explanation: string;
    };

export type Book = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  category: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  duration: string;
  pages: string;
  rating: string;
  reviewCount: number;
  cover: string;
  coverAccent: string;
  coverText: string;
  description: string;
  chapters: BookChapter[];
  quiz: BookQuizDefinition;
};

export function getBookQuizQuestions(book: Book): BookQuizQuestion[] {
  if ("questions" in book.quiz) {
    return book.quiz.questions;
  }

  return [
    {
      type: "choice",
      question: book.quiz.question,
      answers: book.quiz.answers,
      correctAnswer: book.quiz.correctAnswer,
      explanation: book.quiz.explanation,
    },
  ];
}

export const categories = [
  "Tout",
  "Développement",
  "Data & IA",
  "Design produit",
  "Entrepreneuriat",
];

export const books: Book[] = [
  {
    id: "concevez-site-web-php-mysql",
    title: "Concevez votre site web avec PHP et MySQL",
    subtitle: "Les fondamentaux du développement web dynamique",
    author: "M@teo21",
    category: "Développement",
    level: "Débutant",
    duration: "Lecture libre",
    pages: "361 pages",
    rating: "Nouveau",
    reviewCount: 0,
    cover: "code",
    coverAccent: "#d9e6ff",
    coverText: "APPRENDRE PHP\nET MYSQL",
    description:
      "Un parcours complet des bases de PHP aux bases de données MySQL, avec des exemples et des exercices pratiques.",
    chapters: [],
    quiz: {
      questions: [
        {
          type: "choice",
          question: "Quelle classe le livre utilise-t-il pour se connecter à MySQL avec PDO ?",
          answers: [
            "La classe PDO, instanciée avec les paramètres de connexion",
            "La fonction include() avec le nom de la base",
            "La fonction echo() avec une requête SQL",
          ],
          correctAnswer: 0,
          explanation:
            "PDO fournit l’interface utilisée dans le livre pour établir une connexion à la base de données.",
        },
        {
          type: "text",
          question: "Écrivez le nom de la balise qui ouvre un bloc PHP.",
          acceptedAnswers: ["<?php"],
          placeholder: "Saisissez la balise d’ouverture PHP",
          explanation:
            "Un bloc PHP commence avec la balise <?php et se termine avec ?>.",
        },
        {
          type: "choice",
          question: "Quel langage sert à interroger et modifier les données d’une base relationnelle ?",
          answers: ["CSS", "SQL", "XHTML"],
          correctAnswer: 1,
          explanation:
            "SQL est le langage utilisé pour communiquer avec le système de gestion de base de données.",
        },
        {
          type: "text",
          question: "Quel mécanisme PDO permet de transmettre des valeurs à une requête en les séparant du SQL ?",
          acceptedAnswers: ["requête préparée", "requêtes préparées", "requete preparee"],
          placeholder: "Écrivez le nom du mécanisme",
          explanation:
            "Les requêtes préparées séparent la requête SQL des valeurs et évitent de concaténer directement les entrées.",
        },
        {
          type: "choice",
          question: "À quoi sert principalement une session PHP ?",
          answers: [
            "À conserver des informations d’un visiteur entre plusieurs pages",
            "À remplacer le langage SQL",
            "À créer automatiquement une feuille de style",
          ],
          correctAnswer: 0,
          explanation:
            "Une session permet de conserver des informations associées à un visiteur pendant sa navigation.",
        },
        {
          type: "text",
          question: "Quel mot-clé PHP inclut un fichier dans une page ?",
          acceptedAnswers: ["include", "include()"],
          placeholder: "Écrivez le mot-clé PHP",
          explanation:
            "La structure include permet d’insérer le contenu d’un fichier dans un autre.",
        },
        {
          type: "choice",
          question: "Quel est le rôle d’une clé primaire dans une table ?",
          answers: [
            "Identifier de manière unique chaque enregistrement",
            "Chiffrer toutes les colonnes",
            "Trier automatiquement les résultats par date",
          ],
          correctAnswer: 0,
          explanation:
            "Une clé primaire identifie de façon unique chaque entrée d’une table.",
        },
        {
          type: "text",
          question: "Quel mot-clé SQL est utilisé pour filtrer les lignes d’une requête ?",
          acceptedAnswers: ["where"],
          placeholder: "Écrivez le mot-clé SQL",
          explanation:
            "La clause WHERE sélectionne les lignes qui satisfont les critères de la requête.",
        },
        {
          type: "choice",
          question: "Quel risque peut apparaître si une entrée utilisateur est affichée comme du HTML sans protection ?",
          answers: ["Une faille XSS", "Une clé primaire", "Une boucle infinie"],
          correctAnswer: 0,
          explanation:
            "Une donnée non protégée peut injecter du code HTML ou JavaScript et entraîner une faille XSS.",
        },
        {
          type: "text",
          question: "Quel langage décrit la structure et le contenu d’une page web dans les exemples du livre ?",
          acceptedAnswers: ["xhtml", "html"],
          placeholder: "Écrivez le nom du langage",
          explanation:
            "Le livre utilise le XHTML, le langage de balisage qui structure le contenu des pages web.",
        },
      ],
    },
  },
  {
    id: "apprenez-programmer-c",
    title: "Apprenez à programmer en C !",
    subtitle: "Les bases de la programmation en C",
    author: "Mathieu Nebra (M@teo21)",
    category: "Développement",
    level: "Débutant",
    duration: "Lecture libre",
    pages: "409 pages",
    rating: "Nouveau",
    reviewCount: 0,
    cover: "code",
    coverAccent: "#d9e6ff",
    coverText: "APPRENEZ À\nPROGRAMMER EN C",
    description:
      "Un cours progressif pour découvrir la programmation en C, écrire ses premiers programmes et explorer les structures de données.",
    chapters: [],
    quiz: {
      questions: [
        {
          type: "choice",
          question: "Quel langage est au cœur de ce livre ?",
          answers: ["C", "PHP", "JavaScript"],
          correctAnswer: 0,
          explanation:
            "Le livre introduit les bases de la programmation en langage C.",
        },
        {
          type: "text",
          question: "Quelle fonction C est utilisée dans les premiers exemples pour afficher un texte dans la console ?",
          acceptedAnswers: ["printf", "printf()"],
          placeholder: "Écrivez le nom de la fonction",
          explanation:
            "La fonction printf affiche du texte formaté dans la console.",
        },
        {
          type: "choice",
          question: "Quel est le rôle principal d’une variable ?",
          answers: [
            "Stocker une valeur que le programme peut utiliser",
            "Compiler automatiquement le programme",
            "Créer un fichier source",
          ],
          correctAnswer: 0,
          explanation:
            "Une variable désigne une zone de mémoire où le programme stocke une valeur.",
        },
        {
          type: "text",
          question: "Quel mot-clé C permet de déclarer une condition alternative si le test du if est faux ?",
          acceptedAnswers: ["else"],
          placeholder: "Écrivez le mot-clé",
          explanation:
            "Le mot-clé else introduit le bloc exécuté lorsque la condition du if n’est pas vérifiée.",
        },
        {
          type: "choice",
          question: "À quoi sert une boucle dans un programme ?",
          answers: [
            "À répéter une ou plusieurs instructions",
            "À renommer une variable",
            "À arrêter la compilation",
          ],
          correctAnswer: 0,
          explanation:
            "Une boucle répète un bloc d’instructions tant que la condition prévue le permet.",
        },
        {
          type: "text",
          question: "Quel symbole est utilisé dans une déclaration pour obtenir l’adresse d’une variable en C ?",
          acceptedAnswers: ["&"],
          placeholder: "Saisissez le symbole",
          explanation:
            "L’opérateur & permet notamment d’obtenir l’adresse mémoire d’une variable.",
        },
        {
          type: "choice",
          question: "Qu’est-ce qu’un tableau en C ?",
          answers: [
            "Un ensemble d’éléments de même type accessibles par indice",
            "Une fonction qui affiche une fenêtre",
            "Un type de commentaire",
          ],
          correctAnswer: 0,
          explanation:
            "Un tableau regroupe plusieurs valeurs du même type, repérées par leur indice.",
        },
        {
          type: "text",
          question: "Quel mot-clé introduit une définition de structure personnalisée en C ?",
          acceptedAnswers: ["struct"],
          placeholder: "Écrivez le mot-clé",
          explanation:
            "Le mot-clé struct permet de définir un type composé de plusieurs champs.",
        },
        {
          type: "choice",
          question: "Quel est l’intérêt d’une liste chaînée par rapport à un tableau de taille fixe ?",
          answers: [
            "Elle peut évoluer en ajoutant ou supprimant des éléments",
            "Elle ne nécessite jamais de mémoire",
            "Elle trie automatiquement tous les éléments",
          ],
          correctAnswer: 0,
          explanation:
            "Les éléments d’une liste chaînée sont reliés entre eux et la liste peut grandir ou rétrécir dynamiquement.",
        },
        {
          type: "text",
          question: "Quel type de donnée est utilisé pour représenter une valeur entière courante en C ?",
          acceptedAnswers: ["int"],
          placeholder: "Écrivez le nom du type",
          explanation:
            "Le type int sert à représenter des nombres entiers dans les exemples du livre.",
        },
      ],
    },
  },
  {
    id: "clean-code",
    title: "Clean Code",
    subtitle: "Un code propre et durable",
    author: "Robert C. Martin",
    category: "Développement",
    level: "Intermédiaire",
    duration: "6 h",
    pages: "464 pages",
    rating: "4,9",
    reviewCount: 128,
    cover: "code",
    coverAccent: "#baf2d8",
    coverText: "THE CRAFT OF\nREADABLE CODE",
    description:
      "Les principes fondamentaux pour écrire, relire et faire évoluer du code avec confiance.",
    chapters: [
      {
        title: "La lisibilité est une responsabilité",
        content: [
          "Le code est lu bien plus souvent qu’il n’est écrit. À chaque modification, nous devons comprendre ce qui existe avant de pouvoir le faire évoluer. La clarté n’est donc pas un luxe esthétique : elle réduit le coût de chaque changement.",
          "Un nom précis, une fonction courte et une intention explicite font gagner du temps à toute l’équipe. Le meilleur code n’est pas celui qui démontre l’ingéniosité de son auteur, mais celui qu’un autre développeur peut reprendre sans hésiter.",
          "Dans ce chapitre, nous explorons les noms, la structure et les petits choix qui rendent un projet accueillant pour celles et ceux qui le feront grandir demain.",
        ],
      },
      {
        title: "Des fonctions qui font une seule chose",
        content: [
          "Une fonction idéale est facile à nommer parce qu’elle accomplit une tâche cohérente. Si son nom réclame une conjonction — « et », « ou » — c’est souvent le signe qu’elle devrait être divisée.",
          "Réduire la taille ne suffit pas : chaque bloc doit exprimer une intention. Une fonction bien découpée raconte le parcours métier à travers des appels simples, tandis que les détails restent à leur place.",
          "Pour progresser, commencez par écrire le comportement, puis extrayez les étapes nommées. Relisez enfin le résultat comme si vous découvriez le code pour la première fois.",
        ],
      },
      {
        title: "Améliorer sans tout réécrire",
        content: [
          "Le code propre est un effort continu, pas une grande opération de nettoyage réservée à plus tard. De petites améliorations, accompagnées de tests, empêchent la complexité de s’accumuler.",
          "Avant de modifier une zone inconnue, établissez un filet de sécurité : identifiez son comportement et ajoutez un test qui le décrit. Vous pourrez ensuite simplifier en avançant par étapes.",
          "La discipline consiste à laisser le terrain un peu plus propre qu’on ne l’a trouvé, tout en livrant la valeur attendue.",
        ],
      },
    ],
    quiz: {
      question: "Quel est le premier objectif d’un nom de variable bien choisi ?",
      answers: [
        "Réduire le nombre de caractères du fichier",
        "Rendre l’intention compréhensible sans commentaire",
        "Utiliser systématiquement une abréviation",
      ],
      correctAnswer: 1,
      explanation:
        "Un bon nom révèle l’intention et aide à comprendre le code sans devoir déchiffrer son contexte.",
    },
  },
  {
    id: "data-science",
    title: "Data Science de terrain",
    subtitle: "De la donnée à la décision",
    author: "Nadia Benali",
    category: "Data & IA",
    level: "Débutant",
    duration: "4 h",
    pages: "280 pages",
    rating: "4,8",
    reviewCount: 94,
    cover: "data",
    coverAccent: "#c8c4ff",
    coverText: "MAKE DATA\nMATTER",
    description:
      "Une introduction concrète à l’analyse de données, de la bonne question jusqu’au résultat.",
    chapters: [
      {
        title: "Partir d’une vraie question",
        content: [
          "Un projet de données ne commence pas par un algorithme, mais par une décision à éclairer. Quelle action sera différente si nous obtenons une réponse ? Cette question détermine les données utiles et le niveau de précision nécessaire.",
          "Reformulez le besoin avec les personnes concernées. Une mesure facile à calculer n’est pas forcément celle qui représente le mieux le problème. Une bonne définition de départ évite les tableaux de bord qui ne changent aucune décision.",
          "Définissez ensuite une hypothèse vérifiable et une période d’observation. Vous pourrez ainsi comparer vos résultats à une attente concrète.",
        ],
      },
      {
        title: "Comprendre avant de modéliser",
        content: [
          "Avant toute analyse, observez la qualité des données : valeurs manquantes, doublons, formats incohérents et biais de collecte. Cette étape, souvent discrète, conditionne la fiabilité de toutes les conclusions.",
          "Les statistiques descriptives et les visualisations simples révèlent déjà de nombreux motifs. Une distribution inattendue peut signaler une erreur d’import autant qu’un phénomène intéressant.",
          "Documentez vos choix de nettoyage pour que vos résultats restent explicables et reproductibles.",
        ],
      },
    ],
    quiz: {
      question: "Par quoi est-il préférable de commencer un projet de données ?",
      answers: [
        "Par la décision ou la question à éclairer",
        "Par le choix du modèle le plus complexe",
        "Par la création d’un grand tableau de bord",
      ],
      correctAnswer: 0,
      explanation:
        "La question métier guide le choix des données, des indicateurs et de la méthode d’analyse.",
    },
  },
  {
    id: "product-design",
    title: "Penser produit",
    subtitle: "Concevoir pour les usages réels",
    author: "Camille Laurent",
    category: "Design produit",
    level: "Intermédiaire",
    duration: "5 h",
    pages: "312 pages",
    rating: "4,7",
    reviewCount: 76,
    cover: "product",
    coverAccent: "#ffcfb8",
    coverText: "DESIGN FOR\nREAL LIFE",
    description:
      "Une méthode pour observer les besoins, prototyper des idées et concevoir de meilleurs produits.",
    chapters: [
      {
        title: "Observer avant de dessiner",
        content: [
          "Les utilisateurs savent décrire leurs objectifs, mais pas toujours la solution dont ils ont besoin. L’observation des tâches réelles révèle les contournements, les contraintes et les moments de friction invisibles dans un cahier des charges.",
          "Une recherche utile commence par une question précise et un recrutement adapté. Pendant l’entretien, demandez à voir comment la personne agit plutôt que de lui demander ce qu’elle ferait en théorie.",
          "Partagez les enseignements avec l’équipe sous forme de comportements observés et d’opportunités, pas seulement de citations isolées.",
        ],
      },
      {
        title: "Prototyper pour apprendre",
        content: [
          "Un prototype n’est pas une version miniature du produit final. C’est un outil de conversation qui permet de tester une hypothèse avec le minimum de travail nécessaire.",
          "Choisissez une fidélité adaptée à la question : un croquis peut tester un parcours, tandis qu’une maquette interactive aide à évaluer la compréhension d’une interface.",
          "Observez où les personnes hésitent et ce qu’elles comprennent spontanément. Le prototype sert à apprendre, pas à défendre une solution déjà choisie.",
        ],
      },
    ],
    quiz: {
      question: "À quoi sert principalement un prototype de produit ?",
      answers: [
        "À présenter une interface déjà finalisée",
        "À apprendre rapidement en testant une hypothèse",
        "À remplacer les échanges avec les utilisateurs",
      ],
      correctAnswer: 1,
      explanation:
        "Un prototype permet de tester une hypothèse rapidement et d’ajuster la solution à partir des retours observés.",
    },
  },
  {
    id: "startup",
    title: "Lancer sans s’épuiser",
    subtitle: "Les bases d’une startup durable",
    author: "Thomas Girard",
    category: "Entrepreneuriat",
    level: "Débutant",
    duration: "3 h",
    pages: "196 pages",
    rating: "4,8",
    reviewCount: 53,
    cover: "startup",
    coverAccent: "#ffd979",
    coverText: "BUILD\nWHAT MATTERS",
    description:
      "Valider un problème, trouver ses premiers clients et construire une activité qui tient dans le temps.",
    chapters: [
      {
        title: "Valider le problème avant la solution",
        content: [
          "Une idée séduisante n’est pas encore une entreprise. Commencez par vérifier que le problème est fréquent, important et déjà coûteux pour les personnes qui le rencontrent.",
          "Les conversations de découverte cherchent des expériences passées, pas des compliments sur une idée. Demandez comment la personne a géré la situation la dernière fois et ce qu’elle a tenté.",
          "Ces indices vous aident à préciser votre public cible et à décider si le problème mérite un test plus ambitieux.",
        ],
      },
      {
        title: "Apprendre avec un premier service",
        content: [
          "Un produit minimum viable sert à vérifier une hypothèse avec des moyens limités. Il ne s’agit pas de livrer une expérience médiocre, mais de choisir volontairement un périmètre restreint.",
          "Fixez un indicateur observable avant le lancement : inscription, usage répété ou volonté de payer. Les retours qualitatifs expliquent les résultats, tandis que les mesures montrent leur ampleur.",
          "Chaque cycle doit aboutir à une décision : poursuivre, adapter ou arrêter. C’est cette boucle d’apprentissage qui protège l’énergie de l’équipe.",
        ],
      },
    ],
    quiz: {
      question: "Que cherche-t-on à vérifier avant de construire une solution complète ?",
      answers: [
        "Que le problème est réel et important pour un public identifié",
        "Que tous les concurrents ont disparu",
        "Que l’identité visuelle est définitive",
      ],
      correctAnswer: 0,
      explanation:
        "Valider le problème et le public ciblé permet d’investir dans une solution qui répond à un besoin réel.",
    },
  },
  {
    id: "architecture-web",
    title: "Architecture web évolutive",
    subtitle: "Concevoir des applications robustes",
    author: "Équipe éditoriale Atelier",
    category: "Développement",
    level: "Avancé",
    duration: "5 h",
    pages: "336 pages",
    rating: "4,8",
    reviewCount: 67,
    cover: "code",
    coverAccent: "#c7e8ff",
    coverText: "BUILD FOR\nCHANGE",
    description:
      "Des repères concrets pour découper une application, isoler ses responsabilités et la faire évoluer.",
    chapters: [
      {
        title: "Découper par responsabilités",
        content: [
          "Une architecture utile rend visibles les responsabilités d’un système. Elle sépare les règles métier des détails de stockage, d’affichage et de transport afin que chaque partie puisse évoluer sans entraîner toutes les autres.",
          "Commencez par décrire les capacités du produit et les échanges entre elles. Les frontières doivent suivre le langage et les changements métier, pas seulement les dossiers du dépôt.",
          "Le bon découpage n’est pas celui qui multiplie les couches, mais celui qui rend les dépendances compréhensibles et les changements prévisibles.",
        ],
      },
      {
        title: "Protéger les frontières du système",
        content: [
          "Les frontières définissent ce qu’un module promet et ce qu’il garde privé. Des interfaces explicites empêchent les détails techniques de se propager et rendent les tests plus simples à écrire.",
          "Les dépendances doivent pointer vers les règles stables. Une base de données ou un fournisseur externe peut ainsi être remplacé sans réécrire le cœur du domaine.",
          "Documentez les décisions qui engagent le système et vérifiez leur pertinence à mesure que le produit évolue.",
        ],
      },
    ],
    quiz: {
      question: "Quel est l’objectif principal d’une frontière de module ?",
      answers: [
        "Masquer les détails internes derrière une interface claire",
        "Ajouter une couche à chaque fonction",
        "Empêcher toute évolution du module",
      ],
      correctAnswer: 0,
      explanation:
        "Une frontière explicite protège les détails internes et limite l’impact des changements sur le reste du système.",
    },
  },
  {
    id: "typescript-pratique",
    title: "TypeScript en pratique",
    subtitle: "Des types utiles, pas décoratifs",
    author: "Équipe éditoriale Atelier",
    category: "Développement",
    level: "Intermédiaire",
    duration: "4 h",
    pages: "248 pages",
    rating: "4,7",
    reviewCount: 58,
    cover: "code",
    coverAccent: "#d9e6ff",
    coverText: "TYPES THAT\nHELP TEAMS",
    description:
      "Apprenez à modéliser les données et à laisser le compilateur sécuriser les changements.",
    chapters: [
      {
        title: "Modéliser les données du domaine",
        content: [
          "Un type décrit les valeurs qu’un programme accepte et les opérations qui ont du sens pour elles. Un modèle précis rend les cas valides faciles à manipuler et les cas impossibles plus difficiles à représenter.",
          "Préférez les unions discriminées aux ensembles de propriétés optionnelles lorsque plusieurs états s’excluent. Le compilateur peut alors vérifier que chaque variante est traitée.",
          "Un bon système de types exprime une intention métier et accompagne la lecture du code au lieu de simplement répéter sa structure.",
        ],
      },
      {
        title: "Rendre les changements vérifiables",
        content: [
          "Les types sont particulièrement utiles quand une modification traverse plusieurs modules. Une erreur de compilation localise les endroits à adapter avant même l’exécution.",
          "Évitez de contourner ces vérifications avec des assertions systématiques. Validez les données aux frontières et transmettez ensuite des valeurs dont la forme est connue.",
          "Combinez les types avec des tests ciblés : les premiers vérifient les formes et les relations, les seconds les comportements attendus.",
        ],
      },
    ],
    quiz: {
      question: "Pourquoi valider une donnée à la frontière d’une application ?",
      answers: [
        "Pour garantir que les valeurs externes respectent le modèle attendu",
        "Pour supprimer tous les tests",
        "Pour transformer chaque propriété en chaîne de caractères",
      ],
      correctAnswer: 0,
      explanation:
        "Les données externes ne sont pas garanties par les types compilés : il faut les vérifier avant de les utiliser dans le domaine.",
    },
  },
  {
    id: "ia-responsable",
    title: "Comprendre les modèles d’IA",
    subtitle: "Des données aux prédictions",
    author: "Équipe éditoriale Atelier",
    category: "Data & IA",
    level: "Intermédiaire",
    duration: "5 h",
    pages: "304 pages",
    rating: "4,9",
    reviewCount: 82,
    cover: "data",
    coverAccent: "#d4d0ff",
    coverText: "FROM DATA\nTO DECISIONS",
    description:
      "Explorez l’entraînement, l’évaluation et les limites des modèles prédictifs dans des projets réels.",
    chapters: [
      {
        title: "Apprendre à partir d’exemples",
        content: [
          "Un modèle apprend des régularités à partir d’exemples représentatifs. La qualité du résultat dépend autant de la définition de la tâche et des données que de l’algorithme choisi.",
          "Séparez les données d’entraînement de celles qui servent à évaluer le modèle. Cette séparation donne une indication plus honnête de sa capacité à traiter des exemples nouveaux.",
          "Examinez les erreurs selon les groupes et les situations. Une moyenne globale peut masquer des défaillances importantes pour certaines personnes.",
        ],
      },
      {
        title: "Évaluer avant de déployer",
        content: [
          "Une mesure de performance n’a de sens que par rapport à l’usage prévu et au coût de ses erreurs. Précision, rappel et seuil de décision éclairent des compromis différents.",
          "Un modèle peut se dégrader lorsque les données ou les pratiques changent. Suivez son comportement en production et prévoyez une intervention humaine adaptée au risque.",
          "Expliquez les limites connues aux personnes qui s’appuient sur ses résultats et gardez une procédure de révision.",
        ],
      },
    ],
    quiz: {
      question: "Pourquoi réserver des exemples distincts pour évaluer un modèle ?",
      answers: [
        "Pour mesurer son comportement sur des données non utilisées pendant l’entraînement",
        "Pour augmenter artificiellement le nombre de paramètres",
        "Pour garantir qu’aucune erreur ne sera produite",
      ],
      correctAnswer: 0,
      explanation:
        "Un jeu d’évaluation indépendant aide à estimer la capacité du modèle à généraliser à des exemples nouveaux.",
    },
  },
  {
    id: "mesurer-produit",
    title: "Mesurer l’expérience produit",
    subtitle: "Des indicateurs aux décisions",
    author: "Équipe éditoriale Atelier",
    category: "Design produit",
    level: "Débutant",
    duration: "3 h",
    pages: "216 pages",
    rating: "4,8",
    reviewCount: 46,
    cover: "product",
    coverAccent: "#ffe0cf",
    coverText: "MEASURE WHAT\nMATTERS",
    description:
      "Choisissez des mesures utiles et reliez les comportements observés aux besoins des utilisateurs.",
    chapters: [
      {
        title: "Partir d’un objectif utilisateur",
        content: [
          "Une métrique utile décrit un progrès vers un objectif, pas seulement une activité facile à compter. Reliez chaque indicateur à une question produit et à une décision possible.",
          "Les événements doivent être définis de façon cohérente : nom, propriétés, contexte et règles de collecte. Une instrumentation claire rend les analyses comparables dans le temps.",
          "Associez les données quantitatives à des observations qualitatives pour comprendre pourquoi un parcours fonctionne ou échoue.",
        ],
      },
      {
        title: "Éviter les indicateurs trompeurs",
        content: [
          "Un chiffre isolé peut encourager de mauvaises décisions. Une hausse des inscriptions ne signifie pas nécessairement que les personnes trouvent de la valeur ou reviennent.",
          "Suivez des cohortes et des étapes du parcours pour repérer où les expériences diffèrent. Vérifiez aussi la qualité de la collecte avant de tirer des conclusions.",
          "Présentez les limites et l’incertitude des mesures. Les données éclairent un jugement d’équipe, elles ne le remplacent pas.",
        ],
      },
    ],
    quiz: {
      question: "Qu’est-ce qui rend une métrique produit réellement utile ?",
      answers: [
        "Elle est reliée à un objectif utilisateur et à une décision",
        "Elle est aussi élevée que possible",
        "Elle peut être affichée sur un tableau de bord",
      ],
      correctAnswer: 0,
      explanation:
        "Une mesure prend son sens quand elle aide l’équipe à comprendre un résultat utilisateur et à choisir une action.",
    },
  },
];

export function getBookSummaryById(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}
