const rawQuestions = [
  // Homophones lexicaux et grammaticaux
  { question: "a ou à ? 'Il ___ pris la fuite.'", options: ["a", "à"], answer: 0 },
  { question: "a ou à ? 'Je mange ___ l'ombre.'", options: ["a", "à"], answer: 1 },
  { question: "son ou sont ? 'Où ___ les enfants ?'", options: ["son", "sont"], answer: 1 },
  { question: "son ou sont ? 'C'est ___ chat.'", options: ["son", "sont"], answer: 0 },
  { question: "et ou est ? 'Il ___ le premier.'", options: ["et", "est"], answer: 1 },
  { question: "et ou est ? 'Bleu ___ rouge.'", options: ["et", "est"], answer: 0 },
  { question: "ou ou où ? 'Ici ___ là ?'", options: ["ou", "où"], answer: 0 },
  { question: "ou ou où ? 'Le pays ___ je vis.'", options: ["ou", "où"], answer: 1 },
  { question: "se ou ce ? 'Il ___ lève tôt.'", options: ["se", "ce"], answer: 0 },
  { question: "se ou ce ? 'Prends ___ sac.'", options: ["se", "ce"], answer: 1 },
  { question: "s'est ou c'est ? 'Il ___ blessé.'", options: ["s'est", "c'est"], answer: 0 },
  { question: "s'est ou c'est ? 'Oui, ___ lui !'", options: ["s'est", "c'est"], answer: 1 },
  { question: "ses ou ces ? 'Range ___ affaires !'", options: ["ses", "ces"], answer: 0 },
  { question: "ses ou ces ? 'Regarde ___ oiseaux.'", options: ["ses", "ces"], answer: 1 },
  { question: "leur ou leurs ? 'Je ___ ai dit.'", options: ["leur", "leurs"], answer: 0 },
  { question: "leur ou leurs ? 'Je regarde ___ livres.'", options: ["leur", "leurs"], answer: 1 },
  { question: "ça ou sa ? 'Prends ___ tout de suite !'", options: ["ça", "sa"], answer: 0 },
  { question: "ça ou sa ? 'Il prend ___ veste.'", options: ["ça", "sa"], answer: 1 },

  // Conjugaison - Présent
  { question: "Il (manger) ___ une pomme.", options: ["mange", "manges", "mangent"], answer: 0 },
  { question: "Tu (jouer) ___ dehors.", options: ["joues", "joue", "jouent"], answer: 0 },
  { question: "Nous (finir) ___ bientôt.", options: ["finisons", "finissons", "finissent"], answer: 1 },
  { question: "Vous (faire) ___ du bruit.", options: ["faisez", "faites", "faîtes"], answer: 1 },
  { question: "Ils (aller) ___ au cinéma.", options: ["allent", "vas", "vont"], answer: 2 },
  { question: "Je (prendre) ___ mon temps.", options: ["prends", "prend", "prennent"], answer: 0 },
  { question: "Elle (pouvoir) ___ venir.", options: ["peut", "peux", "peuve"], answer: 0 },
  { question: "Tu (savoir) ___ nager.", options: ["sait", "sais", "saves"], answer: 1 },
  { question: "Elles (venir) ___ demain.", options: ["viens", "viennent", "vienent"], answer: 1 },
  { question: "Nous (dire) ___ la vérité.", options: ["disons", "dissons", "dites"], answer: 0 },

  // Imparfait et Passé Composé
  { question: "Hier, tu (chanter) ___.", options: ["chantas", "chantais", "chantait"], answer: 1 },
  { question: "Ils (voir) ___ le film.", options: ["voyaient", "voyaient", "voyent"], answer: 0 },
  { question: "Nous (avoir) ___ peur.", options: ["avions", "avion", "avaient"], answer: 0 },
  { question: "J'___ (ouvrir) la porte.", options: ["ai ouvert", "ai ouvrit", "suis ouvert"], answer: 0 },
  { question: "Ils sont ___ (partir).", options: ["parti", "partis", "parties"], answer: 1 },
  { question: "Elle est ___ (rester).", options: ["restée", "resté", "restées"], answer: 0 },

  // Accord du participe passé avec être/avoir
  { question: "Les fleurs que j'ai ___.", options: ["cueilli", "cueillis", "cueillies"], answer: 2 },
  { question: "La lettre qu'il a ___.", options: ["écrit", "écrite", "écritent"], answer: 1 },
  { question: "Ils ont ___ leur repas.", options: ["terminé", "terminés", "terminées"], answer: 0 },
  { question: "Elles se sont ___.", options: ["lavé", "lavées", "lavés"], answer: 1 },
  { question: "Il a ___ la vérité.", options: ["dit", "dite", "dis"], answer: 0 },

  // Infinitif ou participe passé (-er ou -é)
  { question: "Je veux ___ (manger).", options: ["manger", "mangé", "mangez"], answer: 0 },
  { question: "J'ai ___ (manger) une pomme.", options: ["manger", "mangé", "mangez"], answer: 1 },
  { question: "Il doit ___ (aller) dormir.", options: ["aller", "allé", "allez"], answer: 0 },
  { question: "Tu es ___ (aller) tôt.", options: ["aller", "allé", "allez"], answer: 1 },
  { question: "Vous venez ___ (chanter).", options: ["chanter", "chanté", "chantez"], answer: 0 },

  // Subjonctif, conditionnel, futur
  { question: "Il faut que tu ___ (venir).", options: ["viens", "viennes", "viendra"], answer: 1 },
  { question: "Je crains qu'il ne ___ (partir).", options: ["part", "parte", "partes"], answer: 1 },
  { question: "Si je pouvais, je ___ (faire).", options: ["ferais", "ferai", "faisais"], answer: 0 },
  { question: "Demain, il ___ (pleuvoir).", options: ["pleuvra", "pleuvrait", "pleut"], answer: 0 },
  { question: "Je pense qu'elle ___ (réussir).", options: ["réussisse", "réussira", "réussi"], answer: 1 },

  // Accords variés (Adjectifs, Noms pluriels)
  { question: "Des vêtements ___.", options: ["bleus clairs", "bleu clair", "bleus clair"], answer: 1 },
  { question: "Des robes ___.", options: ["orange", "oranges", "orangees"], answer: 0 }, // orange est invariable
  { question: "Les yeux ___.", options: ["marron", "marrons", "marrones"], answer: 0 }, // marron invariable
  { question: "Un ___ bien malin.", options: ["chacal", "chacaux", "chacals"], answer: 0 },
  { question: "Des ___ bleus.", options: ["vitraux", "vitrails", "vitrailles"], answer: 0 },
  { question: "Deux ___ magnifiques.", options: ["chevaux", "chevals", "cheveaux"], answer: 0 },
  { question: "Je vois de belles ___.", options: ["hibous", "hiboux"], answer: 1 },
  { question: "Ce gâteau est ___.", options: ["excellent", "exelent", "éxcellent"], answer: 0 },

  // Erreurs courantes, confusions lexicales
  { question: "Quoique ou quoi que ? '___ tu fasses.'", options: ["Quoique", "Quoi que"], answer: 1 },
  { question: "Quoique ou quoi que ? '___ fatigué, il a fini.'", options: ["Quoique", "Quoi que"], answer: 0 },
  { question: "Peut-être ou peut être ? 'Il ___ là.'", options: ["peut-être", "peut être"], answer: 1 },
  { question: "Peut-être ou peut être ? 'Il va ___ venir.'", options: ["peut-être", "peut être"], answer: 0 },
  { question: "Davantage ou d'avantage ? 'J'en veux ___.'", options: ["davantage", "d'avantage"], answer: 0 },
  { question: "Tâche ou tâche ? 'C'est une dure ___.'", options: ["tache", "tâche"], answer: 1 },
  { question: "Tâche ou tâche ? 'Une vilaine ___.'", options: ["tache", "tâche"], answer: 0 },
  
  // Syntaxe
  { question: "Où est le sujet ? 'Soudain tomba la pluie.'", options: ["Soudain", "tomba", "la pluie"], answer: 2 },
  { question: "Fonction de 'rouge' dans : 'La voiture est rouge.'", options: ["Sujet", "Complément d'objet", "Attribut du sujet"], answer: 2 },
  { question: "Trouve l'intrus (nature) :", options: ["Toujours", "Hier", "Cheval", "Bientôt"], answer: 2 },
  
  // Pluriel des noms composés
  { question: "Des ___.", options: ["arc-en-ciels", "arcs-en-ciel", "arcs-en-ciels"], answer: 1 },
  { question: "Des ___.", options: ["choux-fleurs", "chou-fleurs", "choux-fleur"], answer: 0 },
  { question: "Des ___.", options: ["porte-feuilles", "portes-feuilles", "porte-feuille"], answer: 0 },
  { question: "Des ___.", options: ["grands-pères", "grand-pères", "grands-père"], answer: 0 },

  // HOMOPHONES 2
  { question: "La ou là ? 'Pose le ___.'", options: ["la", "là", "l'a"], answer: 1 },
  { question: "Quant à ou Quand a ? '___ moi, je refuse.'", options: ["Quant à", "Quand à", "Qu'en à"], answer: 0 },
  { question: "Quel ou Qu'elle ? '___ belle journée !'", options: ["Quel", "Quelle", "Qu'elle"], answer: 1 },
  { question: "Quel ou Qu'elle ? 'Je sais ___ viendra.'", options: ["quel", "quelle", "qu'elle"], answer: 2 },
  { question: "Plutôt ou Plus tôt ? 'Je viendrai ___.'", options: ["plutôt", "plus tôt"], answer: 1 },
  { question: "Près ou Prêt ? 'Il est ___ à tout.'", options: ["près", "prêt"], answer: 1 },
  { question: "Peu ou Peuvent ? 'Ils ___ le faire.'", options: ["peu", "peux", "peuvent"], answer: 2 },

  // FEMININS ET PLURIELS
  { question: "Le féminin de 'favori' :", options: ["favorite", "favorie", "favoris"], answer: 0 },
  { question: "Le féminin de 'malin' :", options: ["maligne", "maline", "malinge"], answer: 0 },
  { question: "Un ___ de travail.", options: ["créneaux", "créneau", "creneau"], answer: 1 },
  { question: "Des ___ bleus.", options: ["détails", "détailx", "détaux"], answer: 0 },
  { question: "Des documents ___.", options: ["originaux", "originals"], answer: 0 },
  { question: "Des ___ enflammés.", options: ["pneus", "pneux", "pneusx"], answer: 0 },

  // CONJUGAISONS COMPLEXES
  { question: "Demain, il ___ chaud.", options: ["ferra", "fera", "feraie"], answer: 1 },
  { question: "J'aimerais qu'ils ___ (vouloir).", options: ["veulent", "veuillent", "vouent"], answer: 1 },
  { question: "Je ne crois pas qu'il ___ (être).", options: ["est", "sois", "soit"], answer: 2 },
  { question: "Nous ___ le faire (vouloir, cond).", options: ["voulons", "voudrions", "vouerions"], answer: 1 },
  { question: "___ tes devoirs ! (faire)", options: ["fais", "fait", "faies"], answer: 0 },
  { question: "Ils (peindre) ___ le mur.", options: ["peindrent", "peignent", "peindent"], answer: 1 },

  // PARTICIPE VS ADJECTIF
  { question: "Un travail ___.", options: ["fatigant", "fatiguant"], answer: 0 },
  { question: "En se ___, il a réussi.", options: ["fatigant", "fatiguant"], answer: 1 },
  { question: "Un comportement ___.", options: ["provoquant", "provocant"], answer: 1 },

  // ORTHOGRAPHE
  { question: "Comment ça s'écrit ?", options: ["cauchemard", "cauchemar", "cauchemarre"], answer: 1 },
  { question: "Trouve la bonne orthographe :", options: ["langage", "langadge", "language"], answer: 0 },
  { question: "C'est un véritable ___.", options: ["dileme", "dilemme", "dilème"], answer: 1 },
  { question: "Il a marché ___ deux heures.", options: ["pendant", "pendent"], answer: 0 },
  { question: "Par ___, j'ai tout vu.", options: ["hasard", "hazard", "hassard"], answer: 0 },
  { question: "Trouver la forme correcte :", options: ["malgrès que", "bien que", "malgré que"], answer: 1 },
  { question: "Elle n'a ___ de patience.", options: ["guère", "guerre"], answer: 0 },
  { question: "Agir à bon ___.", options: ["esscient", "écient", "escient"], answer: 2 }
];

const SUBJECTS = [
  { label: 'Je', index: 0 },
  { label: 'Tu', index: 1 },
  { label: 'Il', index: 2 },
  { label: 'Nous', index: 3 },
  { label: 'Vous', index: 4 },
  { label: 'Ils', index: 5 },
];

const REGULAR_VERBS = [
  { infinitive: 'chanter', group: 'er', complements: ['dans la salle.', 'avec enthousiasme.'] },
  { infinitive: 'jouer', group: 'er', complements: ['dans la cour.', 'avec ses amis.'] },
  { infinitive: 'parler', group: 'er', complements: ['très calmement.', 'devant la classe.'] },
  { infinitive: 'regarder', group: 'er', complements: ['par la fenêtre.', 'le paysage.'] },
  { infinitive: 'marcher', group: 'er', complements: ['dans le parc.', 'vers la maison.'] },
  { infinitive: 'travailler', group: 'er', complements: ['avec soin.', 'en silence.'] },
  { infinitive: 'penser', group: 'er', complements: ['à la solution.', 'à son projet.'] },
  { infinitive: 'aider', group: 'er', complements: ['son voisin.', 'toute l équipe.'] },
  { infinitive: 'préparer', group: 'er', complements: ['le repas.', 'sa valise.'] },
  { infinitive: 'visiter', group: 'er', complements: ['le musée.', 'la ville.'] },
  { infinitive: 'dessiner', group: 'er', complements: ['un animal.', 'sur son cahier.'] },
  { infinitive: 'porter', group: 'er', complements: ['son sac.', 'une veste chaude.'] },
  { infinitive: 'trouver', group: 'er', complements: ['la réponse.', 'une idée utile.'] },
  { infinitive: 'garder', group: 'er', complements: ['le secret.', 'son calme.'] },
  { infinitive: 'laver', group: 'er', complements: ['la voiture.', 'ses mains.'] },
  { infinitive: 'couper', group: 'er', complements: ['le papier.', 'les légumes.'] },
  { infinitive: 'sauter', group: 'er', complements: ['par-dessus la flaque.', 'très haut.'] },
  { infinitive: 'tomber', group: 'er', complements: ['dans la boue.', 'par terre.'] },
  { infinitive: 'demander', group: 'er', complements: ['de l aide.', 'un conseil.'] },
  { infinitive: 'raconter', group: 'er', complements: ['une histoire.', 'sa journée.'] },
  { infinitive: 'fermer', group: 'er', complements: ['la porte.', 'les volets.'] },
  { infinitive: 'choisir', group: 'ir', complements: ['un livre.', 'la bonne route.'] },
  { infinitive: 'finir', group: 'ir', complements: ['son travail.', 'le parcours.'] },
  { infinitive: 'grandir', group: 'ir', complements: ['très vite.', 'dans ce quartier.'] },
  { infinitive: 'rougir', group: 'ir', complements: ['de honte.', 'en classe.'] },
  { infinitive: 'applaudir', group: 'ir', complements: ['le spectacle.', 'les vainqueurs.'] },
  { infinitive: 'remplir', group: 'ir', complements: ['le verre.', 'son cahier.'] },
  { infinitive: 'réfléchir', group: 'ir', complements: ['avant de répondre.', 'longuement.'] },
  { infinitive: 'obéir', group: 'ir', complements: ['à la règle.', 'au panneau.'] },
  { infinitive: 'réussir', group: 'ir', complements: ['ce défi.', 'son examen.'] },
  { infinitive: 'punir', group: 'ir', complements: ['les fautes graves.', 'ce comportement.'] },
  { infinitive: 'vendre', group: 're', complements: ['sa voiture.', 'des fruits.'] },
  { infinitive: 'attendre', group: 're', complements: ['le bus.', 'la réponse.'] },
  { infinitive: 'perdre', group: 're', complements: ['ses clés.', 'un pari.'] },
  { infinitive: 'rendre', group: 're', complements: ['le livre.', 'service.'] },
  { infinitive: 'défendre', group: 're', complements: ['son idée.', 'ses droits.'] },
  { infinitive: 'descendre', group: 're', complements: ['l escalier.', 'à la cave.'] },
];

const AGREEMENT_NOUNS = [
  { article: 'un', singular: 'chat', plural: 'chats', gender: 'm' },
  { article: 'un', singular: 'livre', plural: 'livres', gender: 'm' },
  { article: 'un', singular: 'garçon', plural: 'garçons', gender: 'm' },
  { article: 'un', singular: 'oiseau', plural: 'oiseaux', gender: 'm' },
  { article: 'un', singular: 'cheval', plural: 'chevaux', gender: 'm' },
  { article: 'un', singular: 'jardin', plural: 'jardins', gender: 'm' },
  { article: 'une', singular: 'robe', plural: 'robes', gender: 'f' },
  { article: 'une', singular: 'fleur', plural: 'fleurs', gender: 'f' },
  { article: 'une', singular: 'maison', plural: 'maisons', gender: 'f' },
  { article: 'une', singular: 'route', plural: 'routes', gender: 'f' },
  { article: 'une', singular: 'voiture', plural: 'voitures', gender: 'f' },
  { article: 'une', singular: 'lampe', plural: 'lampes', gender: 'f' },
  { article: 'un', singular: 'bureau', plural: 'bureaux', gender: 'm' },
  { article: 'une', singular: 'montagne', plural: 'montagnes', gender: 'f' },
  { article: 'un', singular: 'ballon', plural: 'ballons', gender: 'm' },
];

const AGREEMENT_ADJECTIVES = [
  { m: 'grand', f: 'grande', mp: 'grands', fp: 'grandes' },
  { m: 'petit', f: 'petite', mp: 'petits', fp: 'petites' },
  { m: 'rapide', f: 'rapide', mp: 'rapides', fp: 'rapides' },
  { m: 'joyeux', f: 'joyeuse', mp: 'joyeux', fp: 'joyeuses' },
  { m: 'brillant', f: 'brillante', mp: 'brillants', fp: 'brillantes' },
  { m: 'calme', f: 'calme', mp: 'calmes', fp: 'calmes' },
  { m: 'lourd', f: 'lourde', mp: 'lourds', fp: 'lourdes' },
  { m: 'ancien', f: 'ancienne', mp: 'anciens', fp: 'anciennes' },
];

const HOMOPHONE_BANKS = [
  {
    prompt: "a ou à ?",
    options: ['a', 'à'],
    examples: [
      { text: "Elle ___ oublié son cahier.", answer: 0 },
      { text: "Nous allons ___ l école.", answer: 1 },
      { text: "Il ___ compris la leçon.", answer: 0 },
      { text: "Tu es assis ___ côté de moi.", answer: 1 },
      { text: "Le train ___ quitté la gare.", answer: 0 },
      { text: "Ils jouent ___ la récréation.", answer: 1 },
      { text: "Mon frère ___ fini tôt.", answer: 0 },
      { text: "Je pense ___ demain.", answer: 1 },
      { text: "L élève ___ rendu sa copie.", answer: 0 },
      { text: "Nous parlons ___ voix basse.", answer: 1 },
    ],
  },
  {
    prompt: "son ou sont ?",
    options: ['son', 'sont'],
    examples: [
      { text: "Ils ___ déjà partis.", answer: 1 },
      { text: "Elle range ___ manteau.", answer: 0 },
      { text: "Mes amis ___ prêts.", answer: 1 },
      { text: "Il a perdu ___ stylo.", answer: 0 },
      { text: "Les enfants ___ dans la cour.", answer: 1 },
      { text: "Léo cherche ___ ballon.", answer: 0 },
      { text: "Nos voisins ___ arrivés.", answer: 1 },
      { text: "Le musicien accorde ___ violon.", answer: 0 },
      { text: "Ces exercices ___ difficiles.", answer: 1 },
      { text: "Julie termine ___ dessin.", answer: 0 },
    ],
  },
  {
    prompt: "et ou est ?",
    options: ['et', 'est'],
    examples: [
      { text: "Le ciel ___ gris.", answer: 1 },
      { text: "Paul ___ Léa arrivent.", answer: 0 },
      { text: "Cette réponse ___ juste.", answer: 1 },
      { text: "Du pain ___ du fromage.", answer: 0 },
      { text: "Ma classe ___ calme.", answer: 1 },
      { text: "Le chat ___ le chien dorment.", answer: 0 },
      { text: "La route ___ longue.", answer: 1 },
      { text: "Il prend son cahier ___ son livre.", answer: 0 },
      { text: "Le musée ___ fermé.", answer: 1 },
      { text: "Le maître parle ___ les élèves écrivent.", answer: 0 },
    ],
  },
  {
    prompt: "ou ou où ?",
    options: ['ou', 'où'],
    examples: [
      { text: "Veux-tu du thé ___ du jus ?", answer: 0 },
      { text: "La maison ___ j habite est ancienne.", answer: 1 },
      { text: "Nous irons à pied ___ en vélo.", answer: 0 },
      { text: "Le village ___ ils vivent est calme.", answer: 1 },
      { text: "Tu viens demain ___ samedi ?", answer: 0 },
      { text: "Voici le parc ___ nous jouons.", answer: 1 },
      { text: "Prends le cahier rouge ___ bleu.", answer: 0 },
      { text: "L endroit ___ tu attends est ici.", answer: 1 },
      { text: "Faut-il tourner à gauche ___ à droite ?", answer: 0 },
      { text: "Je sais ___ tu caches ce trésor.", answer: 1 },
    ],
  },
  {
    prompt: "se ou ce ?",
    options: ['se', 'ce'],
    examples: [
      { text: "Il ___ prépare rapidement.", answer: 0 },
      { text: "Regarde ___ paysage.", answer: 1 },
      { text: "Elle ___ repose après l effort.", answer: 0 },
      { text: "___ matin, il pleut.", answer: 1 },
      { text: "Ils ___ parlent souvent.", answer: 0 },
      { text: "___ film dure longtemps.", answer: 1 },
      { text: "La porte ___ ferme mal.", answer: 0 },
      { text: "___ dessin est réussi.", answer: 1 },
      { text: "Il ___ cache derrière l arbre.", answer: 0 },
      { text: "___ bruit me surprend.", answer: 1 },
    ],
  },
  {
    prompt: "ses ou ces ?",
    options: ['ses', 'ces'],
    examples: [
      { text: "Il a perdu ___ gants.", answer: 0 },
      { text: "___ fleurs sentent bon.", answer: 1 },
      { text: "Marie lave ___ chaussures.", answer: 0 },
      { text: "___ maisons sont neuves.", answer: 1 },
      { text: "Le maître relit ___ notes.", answer: 0 },
      { text: "___ oiseaux chantent tôt.", answer: 1 },
      { text: "Julie oublie souvent ___ clés.", answer: 0 },
      { text: "___ exercices sont courts.", answer: 1 },
      { text: "Le joueur range ___ cartes.", answer: 0 },
      { text: "___ montagnes sont hautes.", answer: 1 },
    ],
  },
  {
    prompt: "leur ou leurs ?",
    options: ['leur', 'leurs'],
    examples: [
      { text: "Je ___ parle demain.", answer: 0 },
      { text: "Ils rangent ___ cahiers.", answer: 1 },
      { text: "Le voisin ___ explique la règle.", answer: 0 },
      { text: "Les enfants prennent ___ vélos.", answer: 1 },
      { text: "Nous ___ donnons rendez-vous.", answer: 0 },
      { text: "Elles ouvrent ___ cadeaux.", answer: 1 },
      { text: "On ___ écrit souvent.", answer: 0 },
      { text: "Les élèves relisent ___ leçons.", answer: 1 },
      { text: "Je ___ réponds vite.", answer: 0 },
      { text: "Ils retrouvent ___ affaires.", answer: 1 },
    ],
  },
  {
    prompt: "ça ou sa ?",
    options: ['ça', 'sa'],
    examples: [
      { text: "___ me paraît étrange.", answer: 0 },
      { text: "Elle a perdu ___ montre.", answer: 1 },
      { text: "___ commence mal.", answer: 0 },
      { text: "Il range ___ chambre.", answer: 1 },
      { text: "___ ne sert à rien.", answer: 0 },
      { text: "Le chanteur ajuste ___ guitare.", answer: 1 },
      { text: "___ fait beaucoup de bruit.", answer: 0 },
      { text: "Nina ferme ___ trousse.", answer: 1 },
      { text: "___ risque de tomber.", answer: 0 },
      { text: "Léo a oublié ___ veste.", answer: 1 },
    ],
  },
];

const ORTHOGRAPHY_WORDS = [
  ['cauchemar', 'cauchemard', 'cauchemarre'],
  ['langage', 'langadge', 'language'],
  ['dilemme', 'dileme', 'dilème'],
  ['hasard', 'hazard', 'hassard'],
  ['guère', 'guerre', 'guèrre'],
  ['escient', 'esscient', 'écient'],
  ['adresse', 'adrese', 'addresse'],
  ['chaussure', 'chausure', 'chausssure'],
  ['souffrance', 'soufrance', 'souffrence'],
  ['silhouette', 'silouhette', 'sillouette'],
  ['accueil', 'acceuil', 'acueil'],
  ['appareil', 'apareil', 'appereil'],
  ['aventure', 'aventurre', 'aventuree'],
  ['bibliothèque', 'bibliotèque', 'bibliothèquee'],
  ['courageux', 'courrageux', 'couraigeux'],
  ['délicieux', 'delicieu', 'délicieus'],
  ['effort', 'éffort', 'efforre'],
  ['horizon', 'orizzon', 'horyzon'],
  ['imaginaire', 'imaginère', 'imaginairee'],
  ['journée', 'journé', 'journee'],
  ['kilomètre', 'kilométre', 'kilometre'],
  ['lumière', 'lumière', 'lummière'],
  ['mélodie', 'méloddie', 'melodie'],
  ['nécessaire', 'nécéssaire', 'necesssaire'],
  ['occasion', 'ocasion', 'occazion'],
  ['papillon', 'pappillon', 'papilon'],
  ['questionnaire', 'questionaire', 'questonnaire'],
  ['respiration', 'réspiration', 'respiraition'],
  ['sincère', 'sinçère', 'sincerre'],
  ['tranquille', 'tranquile', 'tranquillee'],
  ['univers', 'univert', 'universs'],
  ['voisinage', 'voisinnage', 'voizinnage'],
  ['week-end', 'wek-end', 'weekendd'],
  ['xylophone', 'xilophone', 'xylophonne'],
  ['yogourt', 'yaogourt', 'yogourth'],
  ['zébrure', 'zebrure', 'zébrurre'],
  ['bruyant', 'bruiyant', 'bruiant'],
  ['cascade', 'cascadde', 'cascadee'],
  ['distraire', 'distrère', 'distrair'],
  ['fantaisie', 'fantaisie', 'fantaisye'],
];

function hashValue(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function buildChoices(correct, distractors, key, optionCount = 3) {
  const uniqueDistractors = distractors.filter((candidate, index) => (
    candidate && candidate !== correct && distractors.indexOf(candidate) === index
  ));
  const choices = new Array(optionCount).fill(null);
  const answer = hashValue(key) % optionCount;
  choices[answer] = correct;

  let distractorIndex = 0;
  for (let optionIndex = 0; optionIndex < optionCount; optionIndex += 1) {
    if (choices[optionIndex] !== null) continue;

    const fallback = uniqueDistractors[distractorIndex] ?? `${correct}${optionIndex}`;
    choices[optionIndex] = fallback;
    distractorIndex += 1;
  }

  return { options: choices, answer };
}

function conjugatePresent(verb, personIndex) {
  const stem = verb.group === 're'
    ? verb.infinitive.slice(0, -2)
    : verb.infinitive.slice(0, -2);

  if (verb.group === 'er') {
    const endings = ['e', 'es', 'e', 'ons', 'ez', 'ent'];
    return stem + endings[personIndex];
  }

  if (verb.group === 'ir') {
    const endings = ['is', 'is', 'it', 'issons', 'issez', 'issent'];
    return stem + endings[personIndex];
  }

  const endings = ['s', 's', '', 'ons', 'ez', 'ent'];
  return stem + endings[personIndex];
}

function getImparfaitStem(verb) {
  const nousForm = conjugatePresent(verb, 3);
  return nousForm.slice(0, -3);
}

function conjugateImparfait(verb, personIndex) {
  const stem = getImparfaitStem(verb);
  const endings = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
  return stem + endings[personIndex];
}

function getFutureStem(verb) {
  return verb.group === 're'
    ? verb.infinitive.slice(0, -1)
    : verb.infinitive;
}

function conjugateFuture(verb, personIndex) {
  const stem = getFutureStem(verb);
  const endings = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];
  return stem + endings[personIndex];
}

function conjugateConditionnel(verb, personIndex) {
  const stem = getFutureStem(verb);
  const endings = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
  return stem + endings[personIndex];
}

function generateConjugationQuestions() {
  const tenses = [
    { label: 'présent', conjugate: conjugatePresent },
    { label: 'imparfait', conjugate: conjugateImparfait },
    { label: 'futur simple', conjugate: conjugateFuture },
    { label: 'conditionnel présent', conjugate: conjugateConditionnel },
  ];

  const generated = [];

  REGULAR_VERBS.forEach((verb) => {
    tenses.forEach((tense) => {
      SUBJECTS.forEach((subject) => {
        verb.complements.forEach((complement, complementIndex) => {
          const forms = SUBJECTS.map((candidateSubject) => tense.conjugate(verb, candidateSubject.index));
          const correct = forms[subject.index];
          const distractors = [
            forms[(subject.index + 1) % forms.length],
            forms[(subject.index + 2) % forms.length],
            verb.infinitive,
          ];
          const key = `${tense.label}-${verb.infinitive}-${subject.label}-${complementIndex}`;
          const choices = buildChoices(
            correct,
            distractors,
            key,
            3,
          );

          generated.push({
            question: `Au ${tense.label}, ${subject.label} (${verb.infinitive}) ___ ${complement}`,
            options: choices.options,
            answer: choices.answer,
          });
        });
      });
    });
  });

  return generated;
}

function generateAgreementQuestions() {
  const generated = [];

  AGREEMENT_NOUNS.forEach((noun) => {
    AGREEMENT_ADJECTIVES.forEach((adjective) => {
      const singularCorrect = noun.gender === 'f' ? adjective.f : adjective.m;
      const pluralCorrect = noun.gender === 'f' ? adjective.fp : adjective.mp;

      generated.push({
        question: `Choisis la forme correcte : '${noun.article} ${noun.singular} ___.'`,
        ...buildChoices(
          singularCorrect,
          [adjective.m, adjective.f, adjective.mp, adjective.fp],
          `${noun.singular}-${adjective.m}-singular`,
        ),
      });

      generated.push({
        question: `Choisis la forme correcte : 'Des ${noun.plural} ___.'`,
        ...buildChoices(
          pluralCorrect,
          [adjective.m, adjective.f, adjective.mp, adjective.fp],
          `${noun.plural}-${adjective.m}-plural`,
        ),
      });
    });
  });

  return generated;
}

function generateHomophoneQuestions() {
  return HOMOPHONE_BANKS.flatMap((bank) => (
    bank.examples.map((example, index) => ({
      question: `${bank.prompt} '${example.text}'`,
      options: [...bank.options],
      answer: example.answer,
      id: `generated-homophone-${bank.prompt}-${index}`,
    }))
  ));
}

function generateOrthographyQuestions() {
  return ORTHOGRAPHY_WORDS.map(([correct, wrongA, wrongB], index) => ({
    question: `Trouve la bonne orthographe : '${correct}'`,
    ...buildChoices(correct, [wrongA, wrongB], `orthography-${index}`),
  }));
}

const generatedQuestions = [
  ...generateHomophoneQuestions(),
  ...generateConjugationQuestions(),
  ...generateAgreementQuestions(),
  ...generateOrthographyQuestions(),
];

function inferCategory(questionText) {
  if (/a ou à|son ou sont|et ou est|ou ou où|se ou ce|s'est ou c'est|ses ou ces|leur ou leurs|ça ou sa|La ou là|Quant à ou Quand a|Quel ou Qu'elle|Plutôt ou Plus tôt|Près ou Prêt|Peu ou Peuvent/i.test(questionText)) {
    return 'Homophones';
  }

  if (/\([^)]+\)|Il faut que|Je crains|Si je pouvais|Demain, il|J'aimerais|Je ne crois pas|___ tes devoirs/i.test(questionText)) {
    return 'Conjugaison';
  }

  if (/fleurs|lettre|Des |Le féminin|originaux|pneus|travail|composés|grands-pères|arc-en-ciel|porte-feuilles|choux-fleurs|fatigant|provocant|vêtements|robes|yeux|chevaux|hiboux/i.test(questionText)) {
    return 'Accords';
  }

  if (/s'écrit|orthographe|véritable|hasard|guère|escient|langage|cauchemar|dilemme|bien que/i.test(questionText)) {
    return 'Orthographe';
  }

  return 'Syntaxe';
}

function inferDifficulty(questionText, options, category) {
  if (/subjonctif|conditionnel|qu'il ne|Je ne crois pas|J'aimerais|noms composés|porte-feuilles|arc-en-ciel|escient|malgré que|originaux|grands-pères/i.test(questionText)) {
    return 'hard';
  }

  if (category === 'Homophones' && options.length <= 2) {
    return 'easy';
  }

  if (/présent|manger|jouer|prendre|venir|faire|savoir|ouvrir|partir|rester|fatigant|provoquant|orthographe|Quel ou Qu'elle/i.test(questionText)) {
    return 'normal';
  }

  if (category === 'Conjugaison' || category === 'Accords' || category === 'Orthographe') {
    return 'normal';
  }

  return 'easy';
}

function buildExplanation(category) {
  if (category === 'Homophones') {
    return "Repère la fonction du mot dans la phrase avant de choisir: même son, mais pas le même rôle grammatical.";
  }

  if (category === 'Conjugaison') {
    return "Identifie d'abord le sujet et le temps, puis vérifie la terminaison qui correspond vraiment au verbe.";
  }

  if (category === 'Accords') {
    return "Cherche le mot qui commande l'accord, puis applique le bon genre et le bon nombre sans te fier seulement à l'oreille.";
  }

  if (category === 'Orthographe') {
    return "Ici, il faut reconnaître la graphie correcte: ce sont souvent des formes à mémoriser et à comparer visuellement.";
  }

  return "Observe la fonction du mot ou du groupe de mots dans la phrase pour repérer la bonne réponse.";
}

export const questions = [...rawQuestions, ...generatedQuestions].map((question, index) => {
  const category = inferCategory(question.question);
  const difficultyTier = inferDifficulty(question.question, question.options, category);

  return {
    ...question,
    id: `grammar-${index}`,
    category,
    difficultyTier,
    explanation: buildExplanation(category),
  };
});
