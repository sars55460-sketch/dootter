import type { Dictionary } from "../types";

export const fr: Dictionary = {
  locale: "fr",
  htmlLang: "fr",
  brand: "Dootter",
  brandTag: "Convertisseur de documents gratuit",
  meta: {
    converterTitle: "{title} — gratuit, sans envoi de fichier ni filigrane | {brand}",
    legalTitle: "{title} | {brand}",
  },

  nav: {
    home: "Accueil",
    converters: "Convertisseurs",
    how: "Comment ça marche",
    faq: "Questions",
    about: "À propos",
    privacy: "Confidentialité",
    terms: "Conditions",
    contact: "Contact",
    menu: "Menu",
    close: "Fermer",
  },

  hero: {
    eyebrow: "100 % privé — la conversion a lieu dans votre navigateur",
    title: "Convertissez PDF et fichiers Office en quelques secondes",
    subtitle:
      "PDF vers Word, Word vers PDF, Excel vers Word et Word vers Excel. Sans envoi, sans file d'attente, sans filigrane. Vos fichiers ne quittent jamais votre appareil.",
    ctaPrimary: "Choisir un convertisseur",
    ctaSecondary: "Comment ça marche",
    badge1: "Sans inscription",
    badge2: "Sans limite de taille",
    badge3: "Gratuit à vie",
  },

  trust: {
    title: "Pourquoi passer à ce convertisseur",
    items: [
      {
        h: "Les fichiers restent sur votre appareil",
        p: "Chaque conversion s'exécute dans votre navigateur. Rien n'est envoyé : contrats, factures et documents personnels ne touchent aucun serveur.",
      },
      {
        h: "Un résultat modifiable, pas une copie figée",
        p: "Word vers PDF conserve un vrai texte sélectionnable. Excel vers Word produit un vrai tableau Word dont l'en-tête se répète sur chaque page.",
      },
      {
        h: "Fonctionne même quand d'autres sites sont en panne",
        p: "Pas de compte, pas d'e-mail, pas de paiement. Vous ouvrez la page, vous convertissez, vous téléchargez. L'outil continue de fonctionner même avec une connexion lente.",
      },
      {
        h: "Aucun filigrane, aucune limite de pages",
        p: "Beaucoup de convertisseurs gratuits ajoutent un filigrane ou limitent à trois pages. Nous n'en mettons pas : il n'y a pas de limite de pages.",
      },
    ],
  },

  convertersSection: {
    title: "Quatre convertisseurs sur une page",
    subtitle: "Choisissez le sens dont vous avez besoin. Chaque outil est réglé pour ce couple de formats.",
    open: "Ouvrir le convertisseur",
  },

  stepsSection: {
    title: "Comment ça marche",
    subtitle: "Trois étapes, sans compte et sans attendre.",
    steps: [
      {
        h: "1. Déposez votre fichier",
        p: "Glissez un fichier PDF, Word ou Excel sur le convertisseur, ou choisissez-le depuis votre ordinateur ou votre téléphone.",
      },
      {
        h: "2. Conversion locale",
        p: "Votre navigateur lit le fichier et le reconstruit au nouveau format. Cela prend des secondes, pas des minutes.",
      },
      {
        h: "3. Téléchargez le résultat",
        p: "Enregistrez le fichier obtenu et ouvrez-le dans Word, Excel, Google Docs ou tout autre éditeur.",
      },
    ],
  },

  faqSection: {
    title: "Les questions réellement posées",
    subtitle: "Des réponses courtes sur la confidentialité, la qualité et les limites.",
  },

  ctaSection: {
    title: "Prêt quand vous l'êtes",
    subtitle: "Aucun compte requis. Rien n'est envoyé. Il suffit de convertir.",
    button: "Commencer la conversion",
  },

  homeFaq: {
    title: "Questions fréquentes",
    items: [
      {
        q: "Mon fichier est-il envoyé sur un serveur ?",
        a: "Non. Les moteurs de conversion sont des bibliothèques JavaScript qui s'exécutent dans l'onglet de votre navigateur. Le fichier est lu depuis votre disque, converti en mémoire puis vous est rendu en téléchargement. Il ne quitte jamais votre appareil — c'est pourquoi nous pouvons proposer ce service sans limite et sans compte.",
      },
      {
        q: "La mise en page est-elle conservée à l'identique ?",
        a: "Pour Word vers PDF et Excel vers Word, oui : nous reconstruisons de vraies structures de document, avec du vrai texte, de vrais tableaux, des en-têtes répétés et des sauts de page automatiques. Pour PDF vers Word, cela dépend de la source : les PDF contenant une couche de texte convertissent avec une très grande fidélité, tandis qu'un PDF numérisé (image de page) ne contient aucun texte et nécessite une reconnaissance optique — un point que nous signalons au lieu de renvoyer discrètement un fichier vide.",
      },
      {
        q: "Quelle taille de fichier puis-je convertir ?",
        a: "Il n'y a pas de limite serveur puisqu'il n'y a pas de serveur. La mémoire libre de votre appareil est la seule limite et, en pratique, plusieurs centaines de mégaoctets se convertissent sans difficulté sur un ordinateur portable ou un téléphone récent.",
      },
      {
        q: "Le fichier converti aura-t-il un filigrane ou de la publicité ?",
        a: "Non. Le fichier téléchargé est propre : pas de filigrane, pas de limite de pages, pas de texte publicitaire et pas d'inscription forcée.",
      },
      {
        q: "Conservez-vous une copie de mes documents ?",
        a: "Il n'y a rien à conserver. Le fichier est traité dans la mémoire du navigateur et disparaît dès que vous fermez ou rechargez la page. Nous ne pourrions pas y accéder même si nous le voulions.",
      },
      {
        q: "Puis-je convertir un fichier protégé par mot de passe ?",
        a: "Un PDF chiffré ou un Word protégé doit d'abord être déverrouillé, car le contenu ne peut pas être lu tant qu'il est chiffré. Retirez le mot de passe dans le programme d'origine, puis déposez le fichier ici.",
      },
      {
        q: "Est-ce que ça fonctionne hors ligne ?",
        a: "Oui, une fois la page chargée. La conversion elle-même n'a besoin d'aucune connexion : vous pouvez travailler en avion ou là où il n'y a pas de réseau.",
      },
      {
        q: "Dans quelles langues l'interface est-elle disponible ?",
        a: "Anglais, russe, espagnol, allemand et français. Le site retient la langue choisie et le contenu de vos fichiers n'est jamais traduit ni modifié.",
      },
    ],
  },

  converters: {
    pdfToWord: {
      id: "pdfToWord",
      slug: "pdf-to-word",
      title: "Convertisseur PDF vers Word",
      short: "Transforme un PDF en .docx modifiable avec paragraphes, titres et vrais tableaux.",
      long:
        "Ce convertisseur PDF vers Word reconstruit votre document comme un vrai fichier Word modifiable. Les titres restent des titres, les paragraphes restent des paragraphes, et les tableaux sont restaurés en tant que vrais tableaux Word avec bordures — pas comme des images de tableaux. Le texte reste sélectionnable et consultable, vous pouvez donc modifier, copier et réutiliser chaque ligne. La conversion s'effectue entièrement dans votre navigateur : le document n'est envoyé nulle part.",
      dropzoneTitle: "Déposez votre PDF ici",
      dropzoneHint: "ou cliquez pour choisir un fichier — .pdf, toute taille",
      convertButton: "Convertir en Word",
      sourceExt: "PDF",
      targetExt: "DOCX",
      howTitle: "Comment convertir un PDF en Word",
      howSteps: [
        "Ouvrez le convertisseur PDF vers Word sur cette page.",
        "Déposez votre fichier .pdf dans la zone d'upload, ou cliquez pour le parcourir.",
        "Patientez quelques secondes pendant que votre navigateur convertit les pages localement.",
        "Téléchargez le .docx obtenu et ouvrez-le dans Word, Google Docs ou LibreOffice.",
      ],
      whyTitle: "Ce que vous obtenez",
      whyItems: [
        "Un fichier .docx modifiable, pas une image dans un document",
        "Titres, listes et paragraphes détectés à partir de la mise en page",
        "Tableaux restaurés en tableaux Word natifs avec bordures et cellules fusionnées",
        "Texte sélectionnable et consultable, idéal pour réutiliser votre propre contenu",
        "Tout est traité sur votre appareil, rien n'est envoyé",
      ],
      faqTitle: "Questions PDF vers Word",
      faq: [
        {
          q: "Pourquoi mon PDF numérisé sort-il vide ?",
          a: "Un scan est une image de page : le fichier ne contient donc aucun texte sélectionnable que le convertisseur puisse lire. Quand nous le détectons, nous vous le disons explicitement au lieu de renvoyer un fichier cassé. Passez d'abord le PDF par une reconnaissance optique, ou saisissez le document directement dans Word.",
        },
        {
          q: "Quel est le niveau de fidélité de la mise en page ?",
          a: "Pour un PDF issu de Word ou d'Excel, le résultat est très proche : mêmes paragraphes, même ordre de lecture, mêmes tableaux. Pour des mises en page exotiques — doubles pages de magazine, dépliants multi-colonnes, formulaires avec zones de texte flottantes — quelques retouches manuelles peuvent être nécessaires.",
        },
        {
          q: "Les images du PDF sont-elles conservées ?",
          a: "Le texte et la structure sont prioritaires. Les images intégrées restent là où elles se trouvent dans le flux de texte, tandis que les graphiques purement décoratifs et les fonds peuvent être omis.",
        },
        {
          q: "Puis-je convertir plusieurs PDF à la fois ?",
          a: "Si vous voulez un document continu, fusionnez-les d'abord en un seul PDF, puis convertissez le résultat en une seule fois.",
        },
      ],
      keywords: [
        "pdf en word",
        "convertir pdf en docx",
        "pdf vers word gratuit",
        "convertir pdf en word modifiable",
        "pdf en docx sans envoi de fichier",
        "convertisseur pdf word",
      ],
    },

    wordToPdf: {
      id: "wordToPdf",
      slug: "word-to-pdf",
      title: "Convertisseur Word vers PDF",
      short: "Enregistre n'importe quel .doc ou .docx en PDF propre, identique sur tous les appareils.",
      long:
        "Convertissez un document Word en PDF sans perdre l'essentiel. Les titres gardent leur taille, les paragraphes leur espacement, les images restent nettes, et chaque tableau est redessiné en vrai tableau PDF dont l'en-tête se répète sur chaque nouvelle page. Le texte du PDF obtenu est du vrai texte sélectionnable : il reste donc consultable et copiable. Rien n'est envoyé : le document est converti dans votre navigateur.",
      dropzoneTitle: "Déposez votre fichier Word ici",
      dropzoneHint: "ou cliquez pour choisir un fichier — .docx ou .doc",
      convertButton: "Convertir en PDF",
      sourceExt: "DOCX",
      targetExt: "PDF",
      howTitle: "Comment convertir Word en PDF",
      howSteps: [
        "Ouvrez le convertisseur Word vers PDF sur cette page.",
        "Déposez votre fichier .docx ou .doc dans la zone d'upload.",
        "Votre navigateur le reconstruit en PDF paginé avec du vrai texte.",
        "Téléchargez le PDF et envoyez-le : il s'ouvre partout de la même façon.",
      ],
      whyTitle: "Ce que vous obtenez",
      whyItems: [
        "Du vrai texte sélectionnable dans le PDF, pas une capture d'écran de page",
        "Sauts de page automatiques : rien n'est coupé au bord de la page",
        "En-têtes de tableau répétés automatiquement lorsqu'un tableau dépasse une page",
        "Images et mise en forme de base conservées",
        "Cyrillique, grec et autres alphabets correctement rendus",
      ],
      faqTitle: "Questions Word vers PDF",
      faq: [
        {
          q: "Pourquoi ici le texte est-il sélectionnable et pas chez les autres convertisseurs ?",
          a: "Les autres convertisseurs impriment votre document sous forme d'image et emballent cette image dans un PDF, ce qui empêche toute recherche ou copie. Nous construisons du vrai texte : le PDF est donc plus léger, plus net au zoom et lisible par les lecteurs d'écran.",
        },
        {
          q: "Comment les sauts de page sont-ils décidés ?",
          a: "Nous mettons en page comme Word le fait : marges haute et basse, hauteur de ligne selon l'espacement d'origine, et une nouvelle page dès que la ligne suivante dépasserait la marge basse. Si un tableau ne tient plus dans l'espace restant, il passe à la page suivante en répétant son en-tête.",
        },
        {
          q: "Que se passe-t-il avec un tableau très large ?",
          a: "Les tableaux larges sont réduits à la largeur imprimable de la page et, si cela ne suffit pas, la page passe en orientation paysage. Si le tableau ne tient réellement sur aucune page, une note est ajoutée indiquant que le tableau est trop grand.",
        },
        {
          q: "Puis-je réunir plusieurs documents en un seul PDF ?",
          a: "Convertissez-les un par un puis fusionnez les PDF, ou placez d'abord tous les documents dans un seul fichier Word si vous voulez un résultat continu.",
        },
      ],
      keywords: [
        "word en pdf",
        "docx en pdf",
        "convertir word en pdf en ligne",
        "word vers pdf gratuit",
        "convertir doc en pdf sans envoi",
        "docx en pdf avec texte sélectionnable",
      ],
    },

    excelToWord: {
      id: "excelToWord",
      slug: "excel-to-word",
      title: "Convertisseur Excel vers Word",
      short: "Transforme une feuille de calcul en vrai tableau Word qui se comporte comme un tableau.",
      long:
        "Ce convertisseur Excel vers Word ne colle pas votre feuille en texte brut ni en image. Il crée un vrai tableau Word : cellules, bordures, alignement, ligne d'en-tête en gras et largeurs de colonnes mesurées d'après vos données. L'en-tête se répète automatiquement sur chaque page et, quand le tableau est trop grand pour tenir sur la page, il est réparti sur plusieurs pages au lieu d'être coupé en deux. Si un tableau ne peut pas être ajusté, le document le dit explicitement au lieu de masquer le problème.",
      dropzoneTitle: "Déposez votre fichier Excel ici",
      dropzoneHint: "ou cliquez pour choisir un fichier — .xlsx, .xls ou .csv",
      convertButton: "Convertir en Word",
      sourceExt: "XLSX",
      targetExt: "DOCX",
      howTitle: "Comment convertir Excel en Word",
      howSteps: [
        "Ouvrez le convertisseur Excel vers Word sur cette page.",
        "Déposez votre fichier .xlsx, .xls ou .csv dans la zone d'upload.",
        "Choisissez portrait ou paysage si votre feuille est large.",
        "Téléchargez le .docx — si le tableau est grand, il sera réparti sur plusieurs pages avec en-tête répété.",
      ],
      whyTitle: "Ce que vous obtenez",
      whyItems: [
        "Un vrai tableau Word, pas du texte ni une capture d'écran",
        "Ligne d'en-tête en gras qui se répète automatiquement sur chaque page",
        "Largeurs de colonnes calculées à partir du contenu réel des cellules",
        "Page portrait ou paysage, pour que les feuilles larges restent lisibles",
        "Une note claire dans le document quand un tableau est trop grand",
      ],
      faqTitle: "Questions Excel vers Word",
      faq: [
        {
          q: "Que se passe-t-il si mon tableau ne tient pas sur une page ?",
          a: "Nous essayons d'abord de l'ajuster : les largeurs de colonnes sont réduites à la largeur imprimable et la page peut passer en paysage. Si le tableau reste plus haut qu'une page, Word le découpe lui-même et répète l'en-tête sur chaque partie. La mention « tableau trop grand » n'apparaît que lorsqu'aucun ajustement n'est possible, par exemple avec des dizaines de colonnes. Vous voyez donc la situation dans le document au lieu d'une troncature silencieuse.",
        },
        {
          q: "Les formules et la mise en forme sont-elles conservées ?",
          a: "Les formules sont remplacées par leurs valeurs calculées, ce qui est généralement ce qu'on veut dans un document. Formats numériques, gras, italique, couleurs, cellules fusionnées et alignement sont repris.",
        },
        {
          q: "Puis-je convertir une seule feuille ?",
          a: "Par défaut, toutes les feuilles sont converties, chacune sur sa propre page avec son nom en titre. Supprimez ou videz celles dont vous n'avez pas besoin avant de convertir.",
        },
        {
          q: "Et les feuilles très longues ?",
          a: "Elles sont réparties sur autant de pages que nécessaire, avec en-tête répété : une feuille de 5 000 lignes reste donc lisible et imprimable.",
        },
      ],
      keywords: [
        "excel en word",
        "xlsx en docx",
        "tableau excel vers word",
        "convertir excel en word en ligne",
        "feuille de calcul vers word",
        "excel en docx avec en-tête répété",
      ],
    },

    wordToExcel: {
      id: "wordToExcel",
      slug: "word-to-excel",
      title: "Convertisseur Word vers Excel",
      short: "Amène chaque tableau Word dans un classeur propre avec de vrais nombres et de vraies dates.",
      long:
        "Transforme les tableaux d'un document Word en un vrai classeur Excel. Chaque tableau devient sa propre feuille, la première ligne est détectée comme en-tête, les cellules fusionnées sont développées, et les valeurs qui ressemblent à des nombres, des pourcentages, des devises ou des dates sont écrites comme de vraies valeurs Excel plutôt que comme du texte. La mise en forme du texte, les en-têtes en gras, l'alignement et la largeur des cellules sont repris : le résultat s'ouvre dans Excel et Google Sheets, prêt à calculer.",
      dropzoneTitle: "Déposez votre fichier Word ici",
      dropzoneHint: "ou cliquez pour choisir un fichier — .docx ou .doc",
      convertButton: "Convertir en Excel",
      sourceExt: "DOCX",
      targetExt: "XLSX",
      howTitle: "Comment convertir Word en Excel",
      howSteps: [
        "Ouvrez le convertisseur Word vers Excel sur cette page.",
        "Déposez votre fichier .docx ou .doc dans la zone d'upload.",
        "Chaque tableau du document devient une feuille distincte du classeur.",
        "Téléchargez le .xlsx et ouvrez-le dans Excel, Numbers ou Google Sheets.",
      ],
      whyTitle: "Ce que vous obtenez",
      whyItems: [
        "Une feuille par tableau Word, avec un nom explicite",
        "La première ligne détectée comme en-tête et figée dans la feuille",
        "Nombres, pourcentages, devises et dates enregistrés comme valeurs réelles",
        "Cellules fusionnées développées, lignes vides et paragraphes parasites supprimés",
        "Largeurs de colonnes ajustées au contenu pour voir les données d'un coup d'œil",
      ],
      faqTitle: "Questions Word vers Excel",
      faq: [
        {
          q: "Comment les nombres sont-ils reconnus ?",
          a: "Le texte de la cellule est analysé selon les conventions locales : 1 234,56, 12 %, −45 €, 1.234,56 et des dates comme le 12/03/2026 deviennent des cellules numériques ou de date, tandis que ce qui est ambigu reste du texte. Vous ne perdez donc jamais d'information sur une mauvaise supposition.",
        },
        {
          q: "Mon tableau Word contient des cellules fusionnées. Est-ce un problème ?",
          a: "Non. Les fusions horizontales deviennent la valeur répétée dans chaque ligne concernée et les fusions verticales sont complétées vers le bas : toutes les lignes gardent la même longueur et les données restent utilisables dans des formules et des tris.",
        },
        {
          q: "Que deviennent les textes situés en dehors des tableaux ?",
          a: "Titres et paragraphes sont ajoutés dans une feuille de notes afin que rien ne disparaisse discrètement. Si le document ne contient aucun tableau, l'outil vous le signale au lieu de vous remettre un classeur vide.",
        },
        {
          q: "La mise en forme d'origine est-elle conservée ?",
          a: "En-têtes en gras, bordures, alignement et largeur de cellule sont reproduits approximativement, la feuille paraît donc familière. Excel ne sait pas copier la mise en forme de Word à l'identique : les polices sont normalisées sur celles du tableur.",
        },
      ],
      keywords: [
        "word en excel",
        "docx en xlsx",
        "tableau word vers excel",
        "convertir word en excel en ligne",
        "word en excel avec tableaux",
        "tableau word vers feuille de calcul",
      ],
    },
  },

  ui: {
    theme: "Thème",
    themeLight: "Clair",
    themeDark: "Sombre",
    themeSystem: "Système",
    language: "Langue",
    switchToDark: "Passer au thème sombre",
    switchToLight: "Passer au thème clair",
    drop: "Déposez un fichier ici",
    browse: "parcourir",
    remove: "Retirer",
    convert: "Convertir",
    converting: "Conversion en cours",
    print: "Imprimer",
    download: "Télécharger",
    downloadAgain: "Télécharger à nouveau",
    convertingFile: "Conversion en cours",
    startOver: "Convertir un autre fichier",
    errorTitle: "Une erreur est survenue",
    unsupportedFile: "Cet outil n'accepte que les fichiers {ext}.",
    tooLarge: "Ce fichier est trop volumineux pour la mémoire de l'appareil. Essayez un fichier plus petit.",
    emptyFile: "Ce fichier semble vide, il n'y a rien à convertir.",
    encryptedPdf: "Ce fichier est protégé par mot de passe. Retirez le mot de passe et réessayez.",
    scannedPdf: "PDF numérisé détecté",
    scannedPdfHint:
      "Les pages sont des images : il n'y a donc aucune couche de texte à convertir. Passez le fichier par une reconnaissance optique, puis convertissez le résultat.",
    noTextPdf: "Aucun texte sélectionnable n'a été trouvé dans ce PDF.",
    noTables: "Aucun tableau n'a été trouvé dans ce document, le classeur serait vide.",
    tooLargeNotice: "La mise en page était plus large que la page : elle a été réduite pour tenir.",
    tableTooLargeNotice: "Ce tableau comporte {n} colonnes et ne tient pas sur une seule page.",
    tableWillSplit: "Le tableau se poursuit sur {n} page(s) de plus, avec la ligne d'en-tête répétée.",
    resultReady: "Votre fichier est prêt",
    resultSize: "Taille",
    processingLocally: "Traité sur votre appareil",
    privacyNote: "Votre fichier est traité dans cet onglet et n'est jamais envoyé.",
    copyLink: "Copier le lien",
    linkCopied: "Lien copié",
    optional: "facultatif",
    orientation: "Orientation de la page",
    orientationAuto: "Automatique",
    orientationPortrait: "Portrait",
    orientationLandscape: "Paysage",
    sheetsIncluded: "{n} feuille(s) incluse(s)",
    from: "De",
    to: "Vers",
  },

  footer: {
    blurb: "Un convertisseur de documents gratuit et privé. Les fichiers sont traités dans votre navigateur et ne sont jamais envoyés.",
    product: "Produit",
    company: "Projet",
    legal: "Mentions légales",
    rights: "Tous droits réservés.",
    madeWith: "Fait pour ceux qui veulent simplement que le fichier fonctionne.",
  },

  pages: {
    about: {
      title: "À propos de Dootter",
      intro:
        "Dootter est un convertisseur de documents qui fait une seule chose et refuse de faire quoi que ce soit de douteux avec vos fichiers.",
      sections: [
        {
          h: "Pourquoi nous l'avons créé",
          p: "Les convertisseurs gratuits en ligne fonctionnent presque toujours pareil : vous envoyez un fichier, attendez dans une file, puis téléchargez quelque chose avec un filigrane en page trois. Certains gardent en plus une copie de votre document, ce qui devient un vrai problème quand le document est un contrat, un dossier médical ou une déclaration de impôts.",
        },
        {
          h: "Ce qui change chez nous",
          p: "Nous livrons les moteurs de conversion à votre navigateur au lieu de les exécuter sur un serveur. Les bibliothèques qui construisent le fichier sont téléchargées sur votre appareil, lisent le fichier localement et produisent le résultat en mémoire. Cette seule décision supprime le temps d'envoi, supprime la file d'attente, supprime le plafond de taille et fait de la confidentialité une propriété de l'architecture plutôt qu'une promesse de politique de confidentialité.",
        },
        {
          h: "Ce que cela nous coûte",
          p: "Un convertisseur qui s'exécute sur l'appareil de l'utilisateur ne peut pas monétiser vos données ; il se finance donc par la simplicité et la fiabilité. L'outil reste gratuit, sans publicité et sans inscription. Nous gardons aussi visibles les limites honnêtes : un PDF numérisé n'a pas de couche de texte et ne peut pas être converti sans reconnaissance optique, et nous le disons au lieu de renvoyer discrètement un fichier vide.",
        },
        {
          h: "À qui cela s'adresse",
          p: "Aux étudiants qui mettent en page un mémoire, aux comptables qui passent un grand livre dans Word, aux freelances qui envoient un PDF au lieu d'un tableur, et à quiconque a déjà eu besoin de convertir un document avant le déjeuner. Si l'objectif est de faire passer un fichier de A à B sans le confier à un inconnu, ce site est pour vous.",
        },
      ],
    },
    privacy: {
      title: "Politique de confidentialité",
      intro:
        "En bref : nous ne recevons jamais vos fichiers, nous ne pouvons donc ni les perdre, ni les vendre, ni les divulguer.",
      sections: [
        {
          h: "Les fichiers restent sur votre appareil",
          p: "Ce sont des scripts JavaScript exécutés dans votre navigateur qui convertissent les documents. Le fichier est lu depuis votre disque local, traité en mémoire puis enregistré à nouveau sur votre appareil. Il n'est jamais transmis ni à nous ni à un tiers, et nous n'avons aucun serveur capable de le recevoir.",
        },
        {
          h: "Ce qui est traité sur nos serveurs",
          p: "En général, rien qui vous identifie. Si votre hébergeur conserve des journaux de serveur standard, ceux-ci contiennent des données techniques comme l'adresse IP, le type de navigateur et l'URL demandée, et relèvent de la politique de cet hébergeur.",
        },
        {
          h: "Cookies et stockage local",
          p: "Nous enregistrons votre choix de thème (clair ou sombre) et de langue dans le stockage local de votre navigateur. Ces données restent sur votre appareil, ne nous sont jamais envoyées et servent uniquement à ce que le site ressemble à ce que vous avez laissé. Nous n'utilisons ni cookies publicitaires ni cookies de pistage entre sites.",
        },
        {
          h: "Services tiers",
          p: "Les liens sortants vers d'autres sites sont signalés comme tels. Dès que vous en suivez un, la politique de confidentialité de ce site s'applique. Nous n'intégrons aucun traqueur, widget de chat ou réseau publicitaire tiers.",
        },
        {
          h: "Enfants",
          p: "Le service est un outil généraliste de traitement de fichiers, il ne s'adresse pas aux enfants. Nous ne collectons sciemment aucune donnée personnelle, de personne, quel que soit son âge.",
        },
        {
          h: "Contact",
          p: "Les questions sur la confidentialité peuvent être envoyées via la page de contact. Comme nous ne détenons aucun document d'utilisateur, il n'y a pas de données à exporter, corriger ou supprimer — la suppression la plus respectueuse est celle qui n'a jamais eu lieu.",
        },
      ],
    },
    terms: {
      title: "Conditions d'utilisation",
      intro:
        "Des conditions en langage clair. Si vous utilisez le site normalement, vous ne vous y heurterez pas.",
      sections: [
        {
          h: "Le service",
          p: "Dootter convertit des documents sur votre propre appareil et est fourni gratuitement, sans garantie d'aucune sorte et sans promesse de disponibilité. Nous pouvons modifier, suspendre ou interrompre le service à tout moment.",
        },
        {
          h: "Usage acceptable",
          p: "N'utilisez le service qu'avec des fichiers qui vous appartiennent ou que vous êtes autorisé à traiter, et uniquement à des fins licites. N'utilisez pas le site pour convertir un contenu dont vous n'avez pas le droit, et n'essayez pas de perturber le service ou de contourner ses limites.",
        },
        {
          h: "Votre contenu",
          p: "Vous conservez tous les droits que vous aviez sur vos fichiers. La conversion étant locale, nous ne revendiquons aucun droit sur vos documents et n'en recevons aucune copie.",
        },
        {
          h: "Absence de garantie",
          p: "Les formats de documents sont complexes et la conversion automatique n'est pas toujours parfaite. Conservez toujours l'original et vérifiez le résultat avant de vous y fier pour quelque chose d'important. Nous ne sommes pas responsables de la perte de données, du manque à gagner ni d'un quelconque dommage indirect lié à l'utilisation du service.",
        },
        {
          h: "Limitation de responsabilité",
          p: "Dans la limite maximale autorisée par la loi, notre responsabilité totale au titre d'une réclamation liée au service est limitée au montant le plus élevé entre ce que vous avez payé pour le service — soit zéro — et le minimum exigé par la loi.",
        },
        {
          h: "Modifications",
          p: "Nous pouvons mettre à jour ces conditions. La version publiée sur cette page est la version applicable. Continuer à utiliser le service après une modification vaut acceptation des conditions mises à jour.",
        },
      ],
    },
    contact: {
      title: "Nous contacter",
      intro:
        "Un bug trouvé, un fichier étrange, ou besoin d'une conversion que nous n'avons pas encore ? Dites-le-nous.",
      sections: [
        {
          h: "Avant d'écrire",
          p: "Le moyen le plus rapide de débloquer une conversion qui échoue est souvent un autre fichier : un PDF numérisé, un document protégé ou un fichier qui est en réalité un .doc renommé peuvent donner des résultats étranges. Si le problème persiste, nous voulons le savoir.",
        },
        {
          h: "Que nous écrire",
          p: "Décrivez la conversion tentée, ce que vous attendiez et ce qui s'est produit à la place. Indiquez votre navigateur et votre système d'exploitation. Merci de ne pas joindre le document : puisque nous ne recevons jamais vos fichiers, une description nous suffit, et vos données restent hors d'un fil d'e-mails.",
        },
        {
          h: "Demandes de conversion",
          p: "Nous sommes ouverts à l'ajout de conversions comme PDF vers Excel, image vers PDF ou PDF vers texte brut. Les demandes qui reviennent de plusieurs personnes sont traitées en premier.",
        },
        {
          h: "Délai de réponse",
          p: "Nous cherchons à répondre aux rapports de bogues en quelques jours ouvrés. Ce site est un projet indépendant de petite taille, le week-end la réponse peut prendre plus de temps.",
        },
      ],
    },
  },
};
