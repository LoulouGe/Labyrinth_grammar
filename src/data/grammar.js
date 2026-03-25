export const questions = [
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
