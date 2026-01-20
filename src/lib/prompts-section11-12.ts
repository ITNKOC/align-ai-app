// ============================================
// ALIGN.AI - Interview Prep Prompts (Sections 11-12)
// Story 7.9: Salary Negotiation & Red Flags
// ============================================

import type { CVData } from "@/lib/types";

// ==================== STORY 7.9: SECTION 11 - SALARY NEGOTIATION ====================

/**
 * Task 1.1-1.5: Generate Section 11 - Salary Negotiation prompt
 * Generates salary negotiation guidance based on:
 * - Market salary range for the role + location + experience
 * - Experience-based arguments from the CV
 * - Negotiation strategy and timing tips
 * - Common mistakes to avoid
 * - Negotiation scripts
 *
 * Task 3.1-3.4: Adapted by seniority level (junior/confirmed/senior)
 * Task 4.1-4.3: Role-specific guidance included
 */
export function getInterviewPrepSection11Prompt(
  jobOffer: { title: string | null; company: string | null; rawText: string },
  cvData: CVData,
  seniorityLevel: "junior" | "confirmed" | "senior"
): string {
  // Calculate years of experience (simplified from number of positions)
  const yearsExperience = cvData.experiences?.length
    ? Math.min(cvData.experiences.length * 2.5, 15) // Estimate ~2.5 years per position, cap at 15
    : 0;

  const seniorityGuidance = {
    junior: {
      negotiationStyle: "Prudent - focus sur l'apprentissage et la croissance",
      salaryApproach: "Accepter une fourchette raisonnable, negocier sur la formation et l'evolution",
      leverage: "Potentiel, motivation, formation recente, energie et adaptabilite",
      focusAreas: ["Formation continue", "Mentorship", "Perspectives d'evolution", "Environnement d'apprentissage"],
    },
    confirmed: {
      negotiationStyle: "Equilibre - valoriser l'experience sans surestimer",
      salaryApproach: "Negocier fermement dans la fourchette marche, justifier avec des resultats",
      leverage: "Experience prouvee, resultats concrets, autonomie, polyvalence",
      focusAreas: ["Salaire fixe", "Variable/bonus", "Teletravail flexible", "Formation avancee"],
    },
    senior: {
      negotiationStyle: "Assertif - vous apportez une valeur significative",
      salaryApproach: "Negocier salaire + package complet (equity, bonus, avantages)",
      leverage: "Expertise rare, leadership, impact business mesurable, reseau professionnel",
      focusAreas: ["Package global", "Equity/stock options", "Bonus significatif", "Autonomie et responsabilites", "Titre et reconnaissance"],
    },
  };

  const guidance = seniorityGuidance[seniorityLevel];

  // Extract recent job titles for context
  const recentTitles = cvData.experiences?.slice(0, 2).map(e => `${e.title} chez ${e.company}`).join("\n") || "Non specifies";

  // Extract key skills for negotiation arguments
  const topSkills = [
    ...(cvData.skills?.languages?.slice(0, 3) || []),
    ...(cvData.skills?.frameworks?.slice(0, 3) || []),
  ].slice(0, 6).join(", ") || "Non specifiees";

  const focusAreasPrompt = guidance.focusAreas.map(f => `  - ${f}`).join("\n");
  const focusAreasLatex = guidance.focusAreas.map(f => `  \\item ${f}`).join("\n");

  return `Tu es un expert en negociation salariale avec 15 ans d'experience en recrutement tech.

## POSTE CIBLE
Titre: ${jobOffer.title || "Non specifie"}
Entreprise: ${jobOffer.company || "Non specifiee"}

## PROFIL DU CANDIDAT
Nombre de postes: ${cvData.experiences?.length || 0}
Niveau estime: ${seniorityLevel.toUpperCase()}
Annees d'experience estimees: ~${Math.round(yearsExperience)} ans

### Competences cles
${topSkills}

### Derniers postes
${recentTitles}

## GUIDANCE POUR CE NIVEAU (${seniorityLevel.toUpperCase()})
- Style: ${guidance.negotiationStyle}
- Approche: ${guidance.salaryApproach}
- Levier: ${guidance.leverage}
- Points a negocier: ${guidance.focusAreas.join(", ")}

## MISSION
Genere la Section 11 "Negociation Salariale" avec:

### 1. Fourchette de marche estimee
- Fourchette basse / mediane / haute pour ce type de poste en France
- Facteurs qui influencent (localisation Paris vs province, taille entreprise, secteur)
- Disclaimer: verifier sur Glassdoor, LinkedIn Salary, talent.io

### 2. Vos arguments de negociation (BASES SUR LE CV)
- 3-4 arguments concrets bases sur l'experience du candidat
- Metriques et realisations a mettre en avant
- Comment valoriser le parcours unique

### 3. Strategie de negociation adaptee au niveau ${seniorityLevel}
- Quand aborder le sujet du salaire
- Comment repondre a "Quelles sont vos pretentions?"
- Technique de la fourchette
- Elements a negocier au-dela du salaire fixe:
${focusAreasPrompt}

### 4. Erreurs a eviter
- 4-5 erreurs classiques en negociation
- Phrases a ne jamais dire
- Signaux a ne pas envoyer

### 5. Scripts de negociation
- 3-4 phrases types pour differentes situations:
  * Quand on vous demande vos pretentions trop tot
  * Quand l'offre est en dessous de vos attentes
  * Quand vous voulez negocier au-dela du salaire
  * Comment accepter une offre avec classe

## FORMAT LATEX ATTENDU

\\section{Negociation Salariale}

\\textit{Guide de negociation adapte a votre profil ${seniorityLevel}.}

\\subsection{Fourchette de Marche Estimee}
\\begin{center}
\\begin{tabular}{|c|c|c|}
\\hline
\\textbf{Basse} & \\textbf{Mediane} & \\textbf{Haute} \\\\
\\hline
[XX]k\\euro{} & [XX]k\\euro{} & [XX]k\\euro{} \\\\
\\hline
\\end{tabular}
\\end{center}

\\textit{Facteurs: [Location, taille entreprise, secteur]}

\\vspace{0.5em}
\\fbox{\\parbox{\\dimexpr\\linewidth-2\\fboxsep-2\\fboxrule}{
\\textbf{Note:} Ces estimations sont indicatives pour le marche francais. Verifiez sur Glassdoor, LinkedIn Salary et talent.io.
}}

\\subsection{Vos Arguments de Negociation}
\\begin{enumerate}
  \\item \\textbf{[Argument 1 base sur CV]}
  \\item \\textbf{[Argument 2 base sur experience]}
  \\item \\textbf{[Argument 3 base sur competences]}
\\end{enumerate}

\\subsection{Strategie de Negociation}

\\textbf{Quand aborder le sujet:}
[Guidance appropriee]

\\textbf{Comment repondre a "Quelles sont vos pretentions?"}
\\begin{quote}
"[Script personnalise]"
\\end{quote}

\\textbf{Au-dela du salaire fixe:}
\\begin{itemize}
${focusAreasLatex}
\\end{itemize}

\\subsection{Erreurs a Eviter}
\\begin{itemize}
  \\item[$\\times$] [Erreur 1 avec explication]
  \\item[$\\times$] [Erreur 2 avec explication]
  \\item[$\\times$] [Erreur 3 avec explication]
  \\item[$\\times$] [Erreur 4 avec explication]
\\end{itemize}

\\subsection{Scripts de Negociation}

\\textbf{Quand on vous demande vos pretentions trop tot:}
\\begin{quote}
"[Script]"
\\end{quote}

\\textbf{Quand l'offre est en dessous de vos attentes:}
\\begin{quote}
"[Script]"
\\end{quote}

\\textbf{Pour negocier au-dela du salaire:}
\\begin{quote}
"[Script]"
\\end{quote}

\\textbf{Pour accepter avec classe:}
\\begin{quote}
"[Script]"
\\end{quote}

## REGLES CRITIQUES
1. **REALISTE**: Fourchettes basees sur le marche francais 2024-2025
2. **ADAPTE**: Conseils specifiques au niveau ${seniorityLevel}
3. **ACTIONNABLE**: Scripts concrets utilisables immediatement
4. **PRUDENT**: Rappeler de verifier les donnees sur des sources fiables
5. **HONNETE**: Pas de manipulation, negociation ethique

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Les montants doivent etre realistes pour le marche francais
- Commence directement par \\section{Negociation Salariale}
`;
}

// ==================== STORY 7.9: SECTION 12 - RED FLAGS ====================

/**
 * Task 2.1-2.4: Generate Section 12 - Red Flags prompt
 * Generates guidance on identifying problematic workplace signals:
 * - Warning signals during the interview
 * - Probing questions to detect issues
 * - Red flags in job offers
 * - Decision checklist
 *
 * Task 4.1-4.3: Adapted by interview type (technical/hr/manager)
 */
export function getInterviewPrepSection12Prompt(
  jobOffer: { title: string | null; rawText: string },
  interviewType: "technical" | "hr" | "manager"
): string {
  const typeSpecificFlags = {
    technical: {
      title: "Entretien Technique",
      flags: [
        { flag: "Dette technique massive non reconnue", question: "Quel pourcentage du temps est consacre au refactoring et a la dette technique?" },
        { flag: "Stack technologique obsolete sans plan de migration", question: "Quand avez-vous mis a jour vos technologies principales?" },
        { flag: "Pas de tests automatises", question: "Quelle est votre couverture de tests? Utilisez-vous du TDD?" },
        { flag: "Deploiements manuels et risques", question: "Comment se passent vos deploiements? Avez-vous du CI/CD?" },
        { flag: "Documentation inexistante", question: "Comment un nouveau developpeur se met-il a niveau sur le projet?" },
      ],
    },
    hr: {
      title: "Entretien RH",
      flags: [
        { flag: "Processus de recrutement interminable sans explication", question: "Combien d'etapes reste-t-il dans le processus?" },
        { flag: "Evasif sur la culture d'entreprise", question: "Comment decririez-vous l'ambiance au quotidien dans l'equipe?" },
        { flag: "Turnover eleve minimise", question: "Quel est le turnover moyen de l'entreprise et de l'equipe?" },
        { flag: "Avantages vagues ou inexistants", question: "Pouvez-vous me detailler le package d'avantages complet?" },
        { flag: "Pression sur la decision rapide", question: "De combien de temps dispose-je pour reflechir a une offre?" },
      ],
    },
    manager: {
      title: "Entretien Manager",
      flags: [
        { flag: "Pas d'autonomie reelle", question: "Quel niveau de decision ai-je sur mes taches quotidiennes?" },
        { flag: "Budget et ressources flous", question: "Quel est le budget de l'equipe? Les ressources prevues?" },
        { flag: "Objectifs irrealistes ou flous", question: "Comment sont definis et mesures les objectifs de l'equipe?" },
        { flag: "Management toxique cache", question: "Comment gerez-vous les desaccords au sein de l'equipe?" },
        { flag: "Surcharge de travail chronique", question: "Quelle est la charge de travail typique? Y a-t-il des periodes de crunch?" },
      ],
    },
  };

  const currentTypeFlags = typeSpecificFlags[interviewType];
  const flagsFormatted = currentTypeFlags.flags.map(f => `- \\textbf{${f.flag}}: "${f.question}"`).join("\n");

  return `Tu es un expert en recrutement qui aide les candidats a identifier les situations problematiques.

## POSTE CIBLE
Titre: ${jobOffer.title || "Non specifie"}

## TYPE D'ENTRETIEN: ${currentTypeFlags.title.toUpperCase()}

## RED FLAGS SPECIFIQUES AU TYPE D'ENTRETIEN
${flagsFormatted}

## CATEGORIES UNIVERSELLES DE RED FLAGS

### Culture toxique
Signaux: Turnover eleve, pas de work-life balance, management autoritaire, communications passives-agressives
Questions: "Quel est le turnover de l'equipe ces 2 dernieres annees?", "Comment gerez-vous les periodes intenses?"

### Mauvaise organisation
Signaux: Pas de processus clairs, objectifs qui changent constamment, communication chaotique
Questions: "Comment sont definis les objectifs?", "Quelle est la frequence des reunions?"

### Problemes financiers
Signaux: Retards de paiement mentionnes, gel des embauches, reduction des avantages recemment
Questions: "Comment va l'entreprise financierement?", "Y a-t-il eu des licenciements recents?"

### Poste problematique
Signaux: Poste vacant depuis longtemps, predecesseur parti rapidement, responsabilites floues
Questions: "Pourquoi ce poste est-il vacant?", "Que s'est-il passe avec le predecesseur?", "Depuis combien de temps recrutez-vous?"

## MISSION
Genere la Section 12 "Red Flags - Signaux d'Alerte" avec:

### 1. Signaux pendant l'entretien (5-6 points)
- Comportements inquietants a observer
- Comment les interpreter
- Exemples concrets de ce qui devrait alerter

### 2. Questions pour detecter les problemes (5-6 questions)
- Questions "innocentes" qui revelent les problemes
- Ce que chaque type de reponse peut indiquer
- Comment interpreter les non-reponses ou l'evasion

### 3. Red flags dans l'offre d'emploi
- Elements suspects dans les descriptions de poste
- Formulations qui cachent souvent des problemes
- Decoder le jargon corporate ("environnement dynamique" = ?)

### 4. Apres l'entretien
- Signaux dans le processus de recrutement
- Ce que les delais de reponse indiquent
- Quand se retirer d'un processus

### 5. Checklist de decision (format checkbox)
- Questions a se poser avant d'accepter
- Comment peser objectivement le pour et le contre
- Quand dire non malgre une offre attractive

## FORMAT LATEX ATTENDU

\\section{Red Flags - Signaux d'Alerte}

\\textit{Apprenez a identifier les situations problematiques avant qu'il ne soit trop tard. Guide adapte pour un entretien ${currentTypeFlags.title.toLowerCase()}.}

\\subsection{Signaux Pendant l'Entretien}
\\begin{itemize}
  \\item \\textbf{[Signal 1]:} [Ce que cela peut indiquer]
  \\item \\textbf{[Signal 2]:} [Ce que cela peut indiquer]
  \\item \\textbf{[Signal 3]:} [Ce que cela peut indiquer]
  \\item \\textbf{[Signal 4]:} [Ce que cela peut indiquer]
  \\item \\textbf{[Signal 5]:} [Ce que cela peut indiquer]
\\end{itemize}

\\subsection{Questions pour Detecter les Problemes}

\\textit{Questions a poser qui semblent anodines mais revelent beaucoup:}

\\begin{enumerate}
  \\item \\textbf{Question:} "[Question innocente]"

  \\textit{Reponse ideale:} [Ce qu'une bonne reponse contient]

  \\textit{Red flag si:} [Ce qui devrait vous alerter]

  \\item \\textbf{Question:} "[Question]"

  \\textit{Reponse ideale:} [Description]

  \\textit{Red flag si:} [Description]

  % Repeat for 4-5 more questions
\\end{enumerate}

\\subsection{Red Flags dans l'Offre d'Emploi}

\\textbf{Decodeur de jargon:}
\\begin{itemize}
  \\item "Environnement dynamique" = [Signification reelle]
  \\item "Equipe jeune et passionnee" = [Signification reelle]
  \\item "Salaire selon profil" = [Signification reelle]
  \\item "Startup en forte croissance" = [Signification reelle]
  \\item "Polyvalence requise" = [Signification reelle]
\\end{itemize}

\\subsection{Signaux Apres l'Entretien}
\\begin{itemize}
  \\item \\textbf{[Signal processus 1]:} [Interpretation]
  \\item \\textbf{[Signal processus 2]:} [Interpretation]
  \\item \\textbf{[Signal processus 3]:} [Interpretation]
\\end{itemize}

\\subsection{Checklist de Decision}

\\textit{Avant d'accepter une offre, verifiez ces points:}

\\begin{itemize}
  \\item[$\\square$] [Point de verification 1]
  \\item[$\\square$] [Point de verification 2]
  \\item[$\\square$] [Point de verification 3]
  \\item[$\\square$] [Point de verification 4]
  \\item[$\\square$] [Point de verification 5]
  \\item[$\\square$] [Point de verification 6]
\\end{itemize}

\\begin{tcolorbox}[warningbox, title={\\textbf{Quand Dire Non}}]
Il vaut mieux refuser une offre si:
\\begin{itemize}
  \\item [Critere 1]
  \\item [Critere 2]
  \\item [Critere 3]
\\end{itemize}
\\end{tcolorbox}

## REGLES CRITIQUES
1. **OBJECTIF**: Signaux factuels et observables, pas de paranoia
2. **EQUILIBRE**: Certains flags peuvent avoir des explications legitimes - mentionner
3. **ACTIONNABLE**: Questions que le candidat peut vraiment poser
4. **RESPECTUEUX**: Pas de jugement, juste des observations professionnelles
5. **SPECIFIQUE**: Adapte au type d'entretien ${interviewType}

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Les conseils doivent etre realistes et professionnels
- Commence directement par \\section{Red Flags - Signaux d'Alerte}
`;
}

// ==================== HELPER: CALCULATE SENIORITY LEVEL ====================

/**
 * Calculate seniority level based on CV data
 * Used by Section 11 (Salary Negotiation) for adapted guidance
 */
export function calculateSeniorityLevel(cvData: CVData): "junior" | "confirmed" | "senior" {
  let totalYears = 0;

  // Try to calculate from experience dates
  cvData.experiences?.forEach(exp => {
    if (!exp.startDate || !exp.endDate) return;

    // Parse year from date strings (format: MM/YYYY or YYYY)
    const parseYear = (dateStr: string): number | null => {
      const parts = dateStr.split("/");
      const yearStr = parts.length === 2 ? parts[1] : parts[0];
      const year = parseInt(yearStr, 10);
      return !isNaN(year) && year > 1950 && year < 2100 ? year : null;
    };

    const startYear = parseYear(exp.startDate);
    const endYear = exp.endDate.toLowerCase().includes("present") || exp.endDate.toLowerCase().includes("actuel")
      ? new Date().getFullYear()
      : parseYear(exp.endDate);

    if (startYear && endYear && endYear >= startYear) {
      totalYears += endYear - startYear;
    }
  });

  // Fallback: estimate ~2.5 years per position if dates parsing failed
  if (totalYears === 0 && cvData.experiences?.length) {
    totalYears = cvData.experiences.length * 2.5;
  }

  // Classify seniority
  if (totalYears > 8) return "senior";
  if (totalYears > 3) return "confirmed";
  return "junior";
}
