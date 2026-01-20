// ============================================
// ALIGN.AI - Interview Prep Prompts (Sections 13-14)
// Story 7.10: Checklists & Notes Template
// ============================================

// ==================== STORY 7.10: SECTION 13 - PRE-INTERVIEW CHECKLISTS ====================

/**
 * Task 1.1-1.4, Task 2.1-2.4: Generate Section 13 - Pre-Interview Checklists prompt
 * Generates day-before and day-of checklists including:
 * - Day-before (J-1): preparation, research, logistics, mental prep
 * - Day-of (Jour J): morning routine, documents, arrival, mindset
 *
 * Task 4.1-4.3: Adapted by interview type (technical/hr/manager)
 * Task 4.4: Generates LaTeX with checkbox formatting (\item[$\square$])
 */
export function getInterviewPrepSection13Prompt(
  jobOffer: { title: string | null; company: string | null },
  interviewType: "technical" | "hr" | "manager",
  interviewDate?: Date
): string {
  const typeSpecificItems = {
    technical: {
      dayBefore: [
        "Verifier que le laptop est charge et fonctionne",
        "Preparer l'environnement de dev si live coding prevu",
        "Revoir les projets GitHub/portfolio a presenter",
        "Tester la webcam/micro si entretien remote",
        "Revoir les algorithmes et structures de donnees cles",
      ],
      dayOf: [
        "Avoir le laptop pret avec IDE ouvert sur un projet propre",
        "Fermer les notifications et applications inutiles",
        "Preparer un bloc-notes (physique ou digital) pour le whiteboard",
        "Avoir un verre d'eau a portee de main",
      ],
    },
    hr: {
      dayBefore: [
        "Relire les histoires STAR preparees dans ce document",
        "Revoir les valeurs et la culture de l'entreprise",
        "Preparer des anecdotes sur la collaboration et le travail d'equipe",
        "Revoir votre parcours et les transitions de carriere",
      ],
      dayOf: [
        "Se mettre dans un etat d'esprit positif et ouvert",
        "Sourire - ca s'entend meme au telephone",
        "Preparer mentalement vos motivations pour ce poste",
        "Avoir des exemples concrets en tete pour illustrer vos qualites",
      ],
    },
    manager: {
      dayBefore: [
        "Revoir les chiffres cles et metriques de vos realisations",
        "Preparer des exemples de decisions difficiles que vous avez prises",
        "Rechercher le profil LinkedIn de l'intervieweur si possible",
        "Revoir la strategie et les objectifs de l'entreprise",
        "Preparer des questions strategiques sur la vision de l'equipe",
      ],
      dayOf: [
        "Avoir des questions strategiques en tete sur la roadmap",
        "Etre pret a parler vision, objectifs et leadership",
        "Preparer des exemples de gestion de conflits ou crises",
        "Avoir en tete votre vision pour les 90 premiers jours",
      ],
    },
  };

  const specific = typeSpecificItems[interviewType];
  const dateInfo = interviewDate
    ? `Date de l'entretien: ${interviewDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`
    : "Date: A confirmer";

  const typeLabel = {
    technical: "Technique",
    hr: "RH / Fit culturel",
    manager: "Manager / Leadership",
  };

  const dayBeforeSpecific = specific.dayBefore
    .map((i) => `\\item[$\\square$] ${i}`)
    .join("\n  ");
  const dayOfSpecific = specific.dayOf
    .map((i) => `\\item[$\\square$] ${i}`)
    .join("\n  ");

  return `Tu es un coach en preparation d'entretien expert en organisation et gestion du stress.

## ENTRETIEN
Poste: ${jobOffer.title || "Non specifie"}
Entreprise: ${jobOffer.company || "Non specifiee"}
${dateInfo}
Type: ${typeLabel[interviewType]}

## ITEMS SPECIFIQUES AU TYPE D'ENTRETIEN ${interviewType.toUpperCase()}

### La veille (specifiques)
${specific.dayBefore.map((i) => `- ${i}`).join("\n")}

### Le jour J (specifiques)
${specific.dayOf.map((i) => `- ${i}`).join("\n")}

## MISSION
Genere la Section 13 "Checklists Pre-Entretien" avec des checklists completes et imprimables.

## FORMAT LATEX ATTENDU

\\section{Checklists Pre-Entretien}

\\textit{Checklists pratiques a imprimer et cocher. Adaptees pour un entretien ${typeLabel[interviewType].toLowerCase()}.}

\\subsection{Checklist J-1 (La Veille)}

\\subsubsection{Preparation Generale}
\\begin{itemize}
  \\item[$\\square$] Relire ce document de preparation en entier
  \\item[$\\square$] Revoir les points cles du CV envoye a l'entreprise
  \\item[$\\square$] Verifier les dernieres actualites de ${jobOffer.company || "l'entreprise"}
  \\item[$\\square$] Preparer une liste de questions a poser
  \\item[$\\square$] Revoir les sections importantes: pitch, STAR, gaps
\\end{itemize}

\\subsubsection{Logistique}
\\begin{itemize}
  \\item[$\\square$] Verifier l'adresse exacte ou le lien de visioconference
  \\item[$\\square$] Planifier le trajet (objectif: arriver 10-15 min en avance)
  \\item[$\\square$] Preparer la tenue (professionnelle et confortable)
  \\item[$\\square$] Imprimer: CV (2 exemplaires), lettre de motivation, ce document
  \\item[$\\square$] Charger le telephone et le laptop
\\end{itemize}

\\subsubsection{Mental}
\\begin{itemize}
  \\item[$\\square$] Se coucher tot (8h de sommeil minimum)
  \\item[$\\square$] Visualiser l'entretien se derouler positivement
  \\item[$\\square$] Preparer une activite relaxante pour le soir (lecture, musique, marche)
  \\item[$\\square$] Eviter l'alcool et les repas trop lourds
\\end{itemize}

\\subsubsection{Specifique ${typeLabel[interviewType]}}
\\begin{itemize}
  ${dayBeforeSpecific}
\\end{itemize}

\\subsection{Checklist Jour J}

\\subsubsection{Matin}
\\begin{itemize}
  \\item[$\\square$] Petit-dejeuner equilibre (proteines, pas trop de sucre)
  \\item[$\\square$] Douche et preparation soignee
  \\item[$\\square$] Relecture rapide des points cles (10-15 min max)
  \\item[$\\square$] Verification du materiel et des documents
  \\item[$\\square$] Exercices de respiration si stress
\\end{itemize}

\\subsubsection{Avant de Partir}
\\begin{itemize}
  \\item[$\\square$] Documents imprimes dans un porte-documents ou sac professionnel
  \\item[$\\square$] Telephone en mode silencieux (pas vibration)
  \\item[$\\square$] Stylo et carnet pour prendre des notes
  \\item[$\\square$] Bouteille d'eau (rester hydrate)
  \\item[$\\square$] Mouchoirs et pastilles pour la gorge (au cas ou)
\\end{itemize}

\\subsubsection{A l'Arrivee}
\\begin{itemize}
  \\item[$\\square$] Arriver 10-15 minutes en avance (pas plus)
  \\item[$\\square$] Passer aux toilettes, verifier son apparence
  \\item[$\\square$] Eteindre completement le telephone
  \\item[$\\square$] 3 respirations profondes avant d'entrer
  \\item[$\\square$] Sourire et poignee de main ferme (si en presentiel)
\\end{itemize}

\\subsubsection{Specifique ${typeLabel[interviewType]}}
\\begin{itemize}
  ${dayOfSpecific}
\\end{itemize}

\\vspace{1em}
\\begin{tcolorbox}[tipbox, title={\\textbf{Conseil du Coach}}]
La preparation physique et mentale compte autant que la preparation technique. Un candidat repose et confiant fait meilleure impression qu'un candidat qui a revise toute la nuit.
\\end{tcolorbox}

## REGLES CRITIQUES
1. **PRATIQUE**: Tous les items doivent etre concrets et actionnables
2. **COMPLET**: Couvrir preparation, logistique et mental
3. **IMPRIMABLE**: Format checkbox clair utilisable sur papier
4. **ADAPTE**: Items specifiques au type d'entretien ${interviewType}

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Utilise \\item[$\\square$] pour TOUTES les checkboxes
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Commence directement par \\section{Checklists Pre-Entretien}
`;
}

// ==================== STORY 7.10: SECTION 14 - POST-INTERVIEW NOTES TEMPLATE ====================

/**
 * Task 3.1-3.5: Generate Section 14 - Post-Interview Notes Template prompt
 * Generates a structured template for capturing post-interview feedback:
 * - Basic interview information
 * - First impressions section
 * - Questions asked/answered sections
 * - Follow-up items checklist
 * - Decision criteria section
 *
 * Task 4.1-4.3: Adapted by interview type (technical/hr/manager)
 */
export function getInterviewPrepSection14Prompt(
  jobOffer: { title: string | null; company: string | null },
  interviewType: "technical" | "hr" | "manager"
): string {
  const typeSpecificSections = {
    technical: {
      title: "Entretien Technique",
      specificQuestions: [
        "Questions techniques posees et mes reponses",
        "Exercices de code/whiteboard realises",
        "Technologies et outils discutes en detail",
        "Niveau de difficulte percu des questions",
      ],
      specificNotes: [
        "Architecture technique de l'equipe mentionnee",
        "Stack technologique et outils utilises",
        "Processus de code review et CI/CD",
        "Defis techniques actuels de l'equipe",
      ],
    },
    hr: {
      title: "Entretien RH / Fit Culturel",
      specificQuestions: [
        "Questions comportementales posees",
        "Discussion sur mes motivations et mon parcours",
        "Questions sur ma personnalite et mon style de travail",
        "Mes attentes salariales et avantages discutes",
      ],
      specificNotes: [
        "Ambiance et culture d'equipe percues",
        "Valeurs de l'entreprise mises en avant",
        "Politique de teletravail et flexibilite",
        "Avantages et package mentionnes",
      ],
    },
    manager: {
      title: "Entretien Manager / Leadership",
      specificQuestions: [
        "Discussion sur la strategie et les objectifs",
        "Questions sur mon style de management",
        "Scenarios de gestion d'equipe ou de crise",
        "Attentes pour les premiers mois",
      ],
      specificNotes: [
        "Vision du manager pour l'equipe",
        "Defis actuels de l'equipe",
        "Style de management observe",
        "Autonomie et responsabilites du poste",
      ],
    },
  };

  const specific = typeSpecificSections[interviewType];

  const specificQuestionsLatex = specific.specificQuestions
    .map(
      (q, i) =>
        `\\textbf{${i + 1}. ${q}}

\\rule{\\linewidth}{0.4pt}

\\vspace{0.3cm}

\\rule{\\linewidth}{0.4pt}

\\vspace{0.3cm}`
    )
    .join("\n\n");

  const specificNotesLatex = specific.specificNotes
    .map((n) => `  \\item ${n}: \\rule{0.6\\linewidth}{0.4pt}`)
    .join("\n");

  return `Tu es un coach en preparation d'entretien expert en suivi post-entretien et prise de decision.

## ENTRETIEN
Poste: ${jobOffer.title || "Non specifie"}
Entreprise: ${jobOffer.company || "Non specifiee"}
Type: ${specific.title}

## SECTIONS SPECIFIQUES A INCLURE POUR UN ENTRETIEN ${interviewType.toUpperCase()}

### Questions specifiques
${specific.specificQuestions.map((q) => `- ${q}`).join("\n")}

### Notes specifiques
${specific.specificNotes.map((n) => `- ${n}`).join("\n")}

## MISSION
Genere la Section 14 "Template Notes Post-Entretien" - un template imprimable a remplir dans les 30 minutes suivant l'entretien.

## FORMAT LATEX ATTENDU

\\section{Template Notes Post-Entretien}

\\textit{A remplir dans les 30 minutes suivant l'entretien pendant que les impressions sont fraiches. Template adapte pour un ${specific.title.toLowerCase()}.}

\\subsection{Informations de Base}

\\begin{tabular}{p{5cm}p{9cm}}
\\textbf{Date de l'entretien:} & \\rule{8cm}{0.4pt} \\\\[0.5cm]
\\textbf{Nom(s) de(s) intervieweur(s):} & \\rule{8cm}{0.4pt} \\\\[0.5cm]
\\textbf{Poste(s) de(s) intervieweur(s):} & \\rule{8cm}{0.4pt} \\\\[0.5cm]
\\textbf{Duree de l'entretien:} & \\rule{8cm}{0.4pt} \\\\[0.5cm]
\\textbf{Format (presentiel/visio/tel):} & \\rule{8cm}{0.4pt} \\\\
\\end{tabular}

\\subsection{Premieres Impressions}

\\textit{Notez vos impressions immediates - ce sont souvent les plus revelateurs.}

\\textbf{Mon ressenti global (1-10):} \\rule{2cm}{0.4pt}

\\textbf{L'ambiance etait:}
\\begin{itemize}
  \\item[$\\square$] Detendue et accueillante
  \\item[$\\square$] Professionnelle et formelle
  \\item[$\\square$] Tendue ou stressante
  \\item[$\\square$] Autre: \\rule{4cm}{0.4pt}
\\end{itemize}

\\textbf{Premieres impressions (ecrire librement):}

\\rule{\\linewidth}{0.4pt}

\\vspace{0.5cm}

\\rule{\\linewidth}{0.4pt}

\\vspace{0.5cm}

\\rule{\\linewidth}{0.4pt}

\\subsection{Questions Posees par le Recruteur}

\\textit{Notez les questions importantes et evaluez vos reponses.}

\\textbf{1.} \\rule{\\linewidth}{0.4pt}

Ma reponse (resume): \\rule{0.9\\linewidth}{0.4pt}

\\rule{0.9\\linewidth}{0.4pt}

Qualite de ma reponse: $\\square$ Excellente $\\square$ Bonne $\\square$ Moyenne $\\square$ A ameliorer

\\vspace{0.5cm}

\\textbf{2.} \\rule{\\linewidth}{0.4pt}

Ma reponse (resume): \\rule{0.9\\linewidth}{0.4pt}

\\rule{0.9\\linewidth}{0.4pt}

Qualite de ma reponse: $\\square$ Excellente $\\square$ Bonne $\\square$ Moyenne $\\square$ A ameliorer

\\vspace{0.5cm}

\\textbf{3.} \\rule{\\linewidth}{0.4pt}

Ma reponse (resume): \\rule{0.9\\linewidth}{0.4pt}

\\rule{0.9\\linewidth}{0.4pt}

Qualite de ma reponse: $\\square$ Excellente $\\square$ Bonne $\\square$ Moyenne $\\square$ A ameliorer

\\subsection{Section ${specific.title}}

${specificQuestionsLatex}

\\subsection{Ce Qui S'est Bien Passe}

\\begin{itemize}
  \\item \\rule{0.9\\linewidth}{0.4pt}
  \\item \\rule{0.9\\linewidth}{0.4pt}
  \\item \\rule{0.9\\linewidth}{0.4pt}
\\end{itemize}

\\subsection{Ce Que J'aurais Pu Mieux Faire}

\\begin{itemize}
  \\item \\rule{0.9\\linewidth}{0.4pt}
  \\item \\rule{0.9\\linewidth}{0.4pt}
  \\item \\rule{0.9\\linewidth}{0.4pt}
\\end{itemize}

\\subsection{Questions Que J'ai Posees}

\\textbf{1.} \\rule{\\linewidth}{0.4pt}

Reponse obtenue: \\rule{0.9\\linewidth}{0.4pt}

\\vspace{0.3cm}

\\textbf{2.} \\rule{\\linewidth}{0.4pt}

Reponse obtenue: \\rule{0.9\\linewidth}{0.4pt}

\\vspace{0.3cm}

\\textbf{3.} \\rule{\\linewidth}{0.4pt}

Reponse obtenue: \\rule{0.9\\linewidth}{0.4pt}

\\subsection{Informations Cles Apprises}

\\begin{itemize}
${specificNotesLatex}
\\end{itemize}

\\subsection{Red Flags Observes}

\\textit{Elements qui vous ont mis mal a l'aise ou semble problematiques:}

\\begin{itemize}
  \\item \\rule{0.9\\linewidth}{0.4pt}
  \\item \\rule{0.9\\linewidth}{0.4pt}
\\end{itemize}

\\subsection{Prochaines Etapes Annoncees}

\\rule{\\linewidth}{0.4pt}

\\vspace{0.3cm}

\\textbf{Delai de reponse annonce:} \\rule{5cm}{0.4pt}

\\textbf{Prochain tour prevu:} $\\square$ Oui $\\square$ Non $\\square$ Peut-etre

\\subsection{Follow-up a Faire}

\\begin{itemize}
  \\item[$\\square$] Envoyer un email de remerciement (dans les 24h)
  \\item[$\\square$] Connecter sur LinkedIn avec l'intervieweur: \\rule{4cm}{0.4pt}
  \\item[$\\square$] Rechercher/approfondir: \\rule{6cm}{0.4pt}
  \\item[$\\square$] Preparer pour le prochain tour: \\rule{5cm}{0.4pt}
  \\item[$\\square$] Relancer si pas de nouvelles d'ici: \\rule{3cm}{0.4pt}
\\end{itemize}

\\subsection{Ma Decision Preliminaire}

\\begin{itemize}
  \\item[$\\square$] \\textbf{Tres interesse} - J'accepterais une offre sans hesitation
  \\item[$\\square$] \\textbf{Interesse} - Besoin de plus d'informations sur: \\rule{4cm}{0.4pt}
  \\item[$\\square$] \\textbf{Hesitant} - Points a clarifier: \\rule{5cm}{0.4pt}
  \\item[$\\square$] \\textbf{Pas interesse} - Raison principale: \\rule{4cm}{0.4pt}
\\end{itemize}

\\subsection{Notes Additionnelles}

\\rule{\\linewidth}{0.4pt}

\\vspace{0.5cm}

\\rule{\\linewidth}{0.4pt}

\\vspace{0.5cm}

\\rule{\\linewidth}{0.4pt}

\\vspace{0.5cm}

\\rule{\\linewidth}{0.4pt}

\\vspace{1em}
\\begin{tcolorbox}[tipbox, title={\\textbf{Rappel Important}}]
Remplissez ce template dans les 30 minutes suivant l'entretien. Les details s'oublient vite, mais vos impressions immediates sont precieuses pour prendre une decision eclairee.
\\end{tcolorbox}

## REGLES CRITIQUES
1. **STRUCTURE**: Sections claires et logiques pour faciliter la prise de notes
2. **ESPACE**: Suffisamment de place pour ecrire (lignes \\rule)
3. **ACTIONNABLE**: Inclure les follow-ups concrets avec checkboxes
4. **REFLEXIF**: Aider a l'auto-evaluation et la prise de decision
5. **IMPRIMABLE**: Format utilisable sur papier

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Utilise \\rule{Xcm}{0.4pt} pour les espaces d'ecriture
- Utilise \\item[$\\square$] pour les checkboxes
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Commence directement par \\section{Template Notes Post-Entretien}
`;
}
