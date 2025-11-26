import type { CVData, AnalysisResult, Strategy } from "./types";

// PROMPT 1: CV EXTRACTION (Analyst)
export function getCVExtractionPrompt(cvText: string): string {
  return `Tu es un expert ATS (Applicant Tracking System). Analyse ce CV et extrais les données en JSON strict.

CV À ANALYSER:
"""
${cvText}
"""

IMPORTANT: Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après.

Structure JSON attendue:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedinUrl": "string ou null",
    "githubUrl": "string ou null",
    "portfolioUrl": "string ou null"
  },
  "experiences": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string (MM/YYYY ou YYYY)",
      "endDate": "string (MM/YYYY ou YYYY ou Présent)",
      "bullets": ["string - point clé de l'expérience"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "techStack": ["string"],
      "year": "string"
    }
  ],
  "skills": {
    "languages": ["string - langages de programmation"],
    "frameworks": ["string - frameworks et bibliothèques"],
    "aiAndData": ["string - outils IA et data"],
    "toolsAndCloud": ["string - outils et cloud"],
    "softSkills": ["string - compétences humaines"]
  },
  "languages": [
    {
      "language": "string",
      "level": "string (Natif, Courant, Intermédiaire, Débutant)"
    }
  ]
}

Extrais toutes les informations disponibles. Si une information n'est pas présente, utilise une valeur vide ou un tableau vide.`;
}

// PROMPT 2: JOB ANALYSIS (Analyst)
export function getJobAnalysisPrompt(
  cvData: CVData,
  jobDescription: string
): string {
  return `Tu es un expert ATS. Compare ce profil candidat avec cette offre d'emploi.

PROFIL DU CANDIDAT:
${JSON.stringify(cvData, null, 2)}

OFFRE D'EMPLOI:
"""
${jobDescription}
"""

MISSION:
1. Identifie les 3 compétences manquantes les plus CRITIQUES (celles qui empêcheraient le recrutement)
2. Calcule un score de compatibilité (0-100)
3. Extrais les mots-clés importants de l'offre
4. Liste les compétences du candidat qui matchent

IMPORTANT: Réponds UNIQUEMENT avec un JSON valide.

Structure JSON attendue:
{
  "score": 75,
  "gaps": [
    {
      "skill": "string - nom de la compétence manquante",
      "severity": "critical" | "moderate" | "minor",
      "category": "string - ex: Backend, DevOps, Soft Skills",
      "suggestion": "string - comment le candidat pourrait combler ce gap"
    }
  ],
  "keywords": ["string - mots-clés importants de l'offre"],
  "matchedSkills": ["string - compétences du candidat qui correspondent"],
  "jobTitle": "string - titre du poste",
  "company": "string - nom de l'entreprise si mentionné"
}

Limite les gaps à 3 maximum, les plus critiques.`;
}

// PROMPT 3: STRATEGIC CHAT (Strategist)
export function getStrategistSystemPrompt(
  cvData: CVData,
  analysisResult: AnalysisResult,
  currentGapIndex: number,
  strategies: Strategy[]
): string {
  const currentGap = analysisResult.gaps[currentGapIndex];
  const previousStrategies = strategies
    .map(
      (s) =>
        `- ${s.gapSkill}: ${s.approach === "add_skill" ? "Ajout de compétence" : s.approach === "transferable" ? "Compétence transférable" : "Fast Learner"}`
    )
    .join("\n");

  return `Tu es un coach carrière bienveillant mais rigoureux.

RÈGLE D'OR: NE JAMAIS INVENTER DE FAITS. Tu ne peux que reformuler ce que le candidat possède déjà.

CONTEXTE:
- Poste visé: ${analysisResult.jobTitle} chez ${analysisResult.company}
- Score actuel: ${analysisResult.score}%
- Gap en cours d'exploration: "${currentGap.skill}" (${currentGap.severity})

PROFIL COMPLET DU CANDIDAT:
- Nom: ${cvData.personalInfo.fullName}
- Email: ${cvData.personalInfo.email}
- Localisation: ${cvData.personalInfo.location}

COMPÉTENCES DÉCLARÉES:
- Langages: ${cvData.skills.languages.join(", ") || "Aucun"}
- Frameworks: ${cvData.skills.frameworks.join(", ") || "Aucun"}
- IA & Data: ${cvData.skills.aiAndData.join(", ") || "Aucun"}
- Outils & Cloud: ${cvData.skills.toolsAndCloud.join(", ") || "Aucun"}
- Soft Skills: ${cvData.skills.softSkills.join(", ") || "Aucun"}

EXPÉRIENCES DÉTAILLÉES:
${cvData.experiences.map((e) => `- ${e.title} chez ${e.company} (${e.startDate} - ${e.endDate})
  Points clés: ${e.bullets.slice(0, 3).join("; ")}`).join("\n")}

PROJETS:
${cvData.projects.map(p => `- ${p.name}: ${p.description} (Stack: ${p.techStack.join(", ")})`).join("\n")}

FORMATION:
${cvData.education.map(e => `- ${e.degree} à ${e.school} (${e.startDate} - ${e.endDate})`).join("\n")}

STRATÉGIES DÉJÀ VALIDÉES:
${previousStrategies || "Aucune pour le moment"}

TA MISSION POUR CE GAP "${currentGap.skill}":
1. ANALYSE D'ABORD SON CV: Cherche si le candidat a déjà des compétences proches ou transférables
2. Si tu trouves une compétence liée dans son CV, mentionne-la et demande des précisions
3. Si rien dans le CV ne correspond, pose UNE question simple pour explorer
4. Exemples: "Je vois que tu as travaillé avec X, as-tu eu l'occasion d'utiliser ${currentGap.skill} dans ce contexte?"

IMPORTANT:
- Sois bref (2-3 phrases max)
- Pose une seule question PERTINENTE basée sur son CV
- Ne pose pas de questions sur des compétences qu'il a déjà
- Reste encourageant mais réaliste`;
}

export function getStrategistResponsePrompt(
  userMessage: string,
  currentGap: string,
  hasRelatedExperience: boolean,
  exchangeCount: number = 0,
  nextGap?: string,
  cvData?: CVData
): string {
  const shouldValidateNow = exchangeCount >= 2;
  const nextGapAnnouncement = nextGap
    ? `Annonce ensuite: "Passons maintenant à ${nextGap}."`
    : "Félicite-le car tous les gaps sont couverts.";

  // Format CV data for context
  const cvContext = cvData ? `
PROFIL COMPLET DU CANDIDAT (utilise ces infos pour poser des questions pertinentes):
- Nom: ${cvData.personalInfo.fullName}
- Poste actuel/dernier: ${cvData.experiences[0]?.title || "Non spécifié"} chez ${cvData.experiences[0]?.company || "Non spécifié"}

COMPÉTENCES DÉCLARÉES:
- Langages: ${cvData.skills.languages.join(", ") || "Aucun"}
- Frameworks: ${cvData.skills.frameworks.join(", ") || "Aucun"}
- IA & Data: ${cvData.skills.aiAndData.join(", ") || "Aucun"}
- Outils & Cloud: ${cvData.skills.toolsAndCloud.join(", ") || "Aucun"}
- Soft Skills: ${cvData.skills.softSkills.join(", ") || "Aucun"}

EXPÉRIENCES:
${cvData.experiences.map(e => `- ${e.title} chez ${e.company} (${e.startDate} - ${e.endDate}): ${e.bullets.slice(0, 2).join("; ")}`).join("\n")}

PROJETS:
${cvData.projects.map(p => `- ${p.name}: ${p.description} (Stack: ${p.techStack.join(", ")})`).join("\n")}

FORMATION:
${cvData.education.map(e => `- ${e.degree} à ${e.school}`).join("\n")}

⚠️ IMPORTANT: NE POSE PAS de questions sur des compétences que le candidat a DÉJÀ dans son CV.
Si le gap "${currentGap}" est lié à une compétence déjà présente, propose directement d'ajouter/reformuler.
` : "";

  if (hasRelatedExperience) {
    return `${cvContext}
Le candidat a indiqué avoir une expérience liée à "${currentGap}".
Message du candidat: "${userMessage}"

NOMBRE D'ÉCHANGES SUR CE GAP: ${exchangeCount}
${shouldValidateNow ? `⚠️ IL EST TEMPS DE VALIDER LA STRATÉGIE ET PASSER AU GAP SUIVANT. ${nextGapAnnouncement}` : ""}

CONSIGNE: ${shouldValidateNow
  ? `Tu as assez d'informations. Valide la stratégie maintenant. ${nextGapAnnouncement}`
  : "Pose UNE question de suivi pour préciser son expérience, OU valide si tu as assez d'infos."}

Génère une réponse JSON STRICTE (pas de texte avant ou après):
{
  "message": "string - ${shouldValidateNow ? `confirme la stratégie adoptée puis annonce le gap suivant` : "pose une question de suivi OU valide"}",
  "strategy": {
    "gapSkill": "${currentGap}",
    "approach": "add_skill",
    "details": "string - comment reformuler/ajouter cette compétence basé sur ce qu'il a dit",
    "validated": true
  },
  "moveToNextGap": ${shouldValidateNow ? "true" : "true si tu valides, false si tu poses une question"}
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide, sans markdown ni texte additionnel.`;
  } else {
    return `${cvContext}
Le candidat a indiqué ne PAS avoir d'expérience directe avec "${currentGap}".
Message du candidat: "${userMessage}"

NOMBRE D'ÉCHANGES SUR CE GAP: ${exchangeCount}
${shouldValidateNow ? `⚠️ IL EST TEMPS DE PROPOSER FAST LEARNER ET PASSER AU GAP SUIVANT. ${nextGapAnnouncement}` : ""}

CONSIGNE: ${shouldValidateNow
  ? `Propose la stratégie Fast Learner et passe au gap suivant. ${nextGapAnnouncement}`
  : "Regarde son CV et explore s'il a des compétences PROCHES ou TRANSFÉRABLES."}

Génère une réponse JSON STRICTE (pas de texte avant ou après):
{
  "message": "string - ${shouldValidateNow
    ? `propose Fast Learner (capacité d'apprentissage rapide), puis annonce le gap suivant`
    : "pose une question sur des compétences proches EN TE BASANT SUR SON CV"}",
  "strategy": ${shouldValidateNow ? `{
    "gapSkill": "${currentGap}",
    "approach": "fast_learner",
    "details": "Mettre en avant la capacité d'apprentissage rapide du candidat",
    "validated": true
  }` : "null"},
  "moveToNextGap": ${shouldValidateNow ? "true" : "false"}
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide, sans markdown ni texte additionnel.`;
  }
}

// PROMPT 4: DOCUMENT GENERATION (Writer)
export function getDocumentGenerationPrompt(
  cvData: CVData,
  analysisResult: AnalysisResult,
  strategies: Strategy[],
  jobDescription: string
): string {
  const candidateName = cvData.personalInfo.fullName || "Candidat";
  const candidateTitle = cvData.experiences[0]?.title || "Développeur";

  return `Tu es un expert en rédaction de CV et lettres de motivation en LaTeX.

PROFIL DU CANDIDAT:
${JSON.stringify(cvData, null, 2)}

OFFRE D'EMPLOI:
"""
${jobDescription}
"""

ANALYSE:
- Score: ${analysisResult.score}%
- Poste visé: ${analysisResult.jobTitle}
- Entreprise: ${analysisResult.company}
- Mots-clés à intégrer: ${analysisResult.keywords.join(", ")}

STRATÉGIES DÉFINIES POUR LES GAPS:
${strategies
  .map(
    (s) =>
      `- ${s.gapSkill}: ${s.approach} - ${s.details}`
  )
  .join("\n")}

MISSION:
Génère DEUX documents LaTeX complets en utilisant les templates ci-dessous.

1. CV.tex - Reformule les bullet points pour:
   - Utiliser les mots-clés de l'offre
   - Mettre en avant les compétences matchées
   - Intégrer les stratégies définies (si approach = "add_skill" ou "transferable")

2. CoverLetter.tex - Structure:
   - Accroche: Pourquoi cette entreprise (personnalisé)
   - Fit technique: Compétences qui matchent avec exemples concrets
   - Adaptabilité: Pour les gaps avec strategy "fast_learner", mettre en avant la capacité d'apprentissage
   - Conclusion: Motivation et disponibilité

TEMPLATE CV COMPLET À SUIVRE:
\\documentclass[11pt,a4paper]{article}

% Packages essentiels
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[margin=1.3cm]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{fontawesome5}
\\usepackage{tabularx}
\\usepackage{lmodern}
\\usepackage{microtype}
\\usepackage{xcolor}

% Configuration noir et blanc classique
\\definecolor{black}{RGB}{0,0,0}
\\definecolor{darkgray}{RGB}{50,50,50}
\\definecolor{mediumgray}{RGB}{100,100,100}

% Configuration des liens
\\hypersetup{
    colorlinks=false,
    pdfborder={0 0 0},
    pdftitle={CV ${candidateName}},
    pdfauthor={${candidateName}}
}

% Suppression de l'indentation
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

% Style des sections avec icônes
\\titleformat{\\section}
{\\Large\\bfseries\\scshape}
{}{0em}{}[\\vspace{-6pt}\\rule{\\textwidth}{0.8pt}\\vspace{1pt}]

\\titlespacing*{\\section}{0pt}{8pt}{4pt}

% Commandes personnalisées
\\newcommand{\\CVItem}[1]{
\\par\\hangindent=1.5em\\hangafter=1 \\makebox[1.5em][l]{--}#1\\par
}

\\newcommand{\\CVSubheading}[4]{
\\vspace{3pt}
\\begin{tabularx}{\\textwidth}{@{}X r@{}}
    \\textbf{#1} & \\textit{#2} \\\\
    \\textit{#3} & \\textit{\\small #4}
\\end{tabularx}
\\vspace{1pt}
}

\\begin{document}

% ============= EN-TÊTE =============
\\begin{center}
    \\vspace{-10pt}
    {\\Huge\\bfseries NOM DU CANDIDAT}\\\\[8pt]
    \\rule{0.6\\textwidth}{0.5pt}\\\\[6pt]
    {\\Large Titre Professionnel}\\\\[12pt]

    \\begin{tabular}{c @{\\hspace{1cm}} c @{\\hspace{1cm}} c}
        \\faPhone\\ +1 (XXX) XXX-XXXX &
        \\faEnvelope\\ email@example.com &
        \\faMapMarker\\ Ville, Province
    \\end{tabular}\\\\[4pt]
    \\begin{tabular}{c @{\\hspace{1cm}} c @{\\hspace{1cm}} c}
        \\faGithub\\ github.com/user &
        \\faLinkedin\\ LinkedIn/user &
        \\faGlobe\\ portfolio.com
    \\end{tabular}\\\\[4pt]
    \\rule{0.6\\textwidth}{0.5pt}
\\end{center}

\\vspace{2pt}
% ============= PROFIL PROFESSIONNEL =============
\\section{\\faUser\\ Profil Professionnel}
\\vspace{1pt}
Résumé professionnel optimisé avec les mots-clés de l'offre...

\\vspace{2pt}
% ============= EXPÉRIENCE PROFESSIONNELLE =============
\\section{\\faBriefcase\\ Expérience Professionnelle}
\\vspace{1pt}

\\CVSubheading
{Titre du Poste}{Date début -- Date fin}
{Entreprise}{Lieu}
\\vspace{1pt}
\\CVItem{Description reformulée avec mots-clés de l'offre}

\\vspace{2pt}
% ============= COMPÉTENCES TECHNIQUES =============
\\section{\\faCode\\ Compétences Techniques}
\\vspace{1pt}
\\textbf{Catégorie :} Liste des compétences...

\\vspace{2pt}
% ============= PROJETS =============
\\section{\\faLaptopCode\\ Projets}
\\vspace{1pt}
\\textbf{Nom du Projet} (Année) -- Description. \\textit{Stack : Technologies}

\\vspace{2pt}
% ============= FORMATION =============
\\section{\\faGraduationCap\\ Formation Académique}
\\vspace{1pt}
\\CVSubheading
{Diplôme}{Date début -- Date fin}
{Établissement}{Lieu}

\\vspace{2pt}
% ============= LANGUES =============
\\section{\\faLanguage\\ Langues}
\\vspace{1pt}
\\begin{tabularx}{\\textwidth}{@{}l l l@{}}
\\textbf{Langue 1} & \\textbf{Langue 2} & \\textbf{Langue 3} \\\\
Niveau & Niveau & Niveau \\\\
\\end{tabularx}

\\end{document}

TEMPLATE LETTRE DE MOTIVATION:
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[margin=2.5cm]{geometry}
\\usepackage{fontawesome5}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{parskip}

\\pagestyle{empty}

\\begin{document}

% En-tête candidat
\\begin{flushleft}
\\textbf{${candidateName}}\\\\
Adresse\\\\
Téléphone\\\\
Email
\\end{flushleft}

\\vspace{1cm}

% Destinataire
\\begin{flushleft}
\\textbf{${analysisResult.company || "Entreprise"}}\\\\
Service des Ressources Humaines\\\\
\\end{flushleft}

\\vspace{0.5cm}

\\begin{flushright}
Montréal, le \\today
\\end{flushright}

\\vspace{0.5cm}

\\textbf{Objet : Candidature au poste de ${analysisResult.jobTitle || "Développeur"}}

\\vspace{0.5cm}

Madame, Monsieur,

% ACCROCHE - Pourquoi cette entreprise
Paragraphe d'accroche personnalisé...

% FIT TECHNIQUE - Compétences qui matchent
Paragraphe sur les compétences techniques correspondantes...

% ADAPTABILITÉ - Fast learner si applicable
Paragraphe sur la capacité d'adaptation et d'apprentissage...

% CONCLUSION
Paragraphe de conclusion avec disponibilité...

\\vspace{0.5cm}

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

\\vspace{1cm}

\\textbf{${candidateName}}

\\end{document}

RÈGLES IMPORTANTES:
1. Réponds avec les deux documents LaTeX complets entre les marqueurs
2. NE PAS utiliser de blocs de code markdown (pas de \`\`\`latex)
3. ÉCHAPPE les caractères spéciaux: \\& pour &, \\% pour %, \\# pour #, \\$ pour $, \\_ pour _
4. Utilise \\textbf{} pour le gras, \\textit{} pour l'italique
5. Pour les dates, utilise -- (double tiret) pour le tiret long
6. Remplis TOUTES les sections avec les vraies données du candidat
7. Adapte le contenu aux mots-clés de l'offre d'emploi

===CV_START===
(document LaTeX complet du CV - commence par \\documentclass)
===CV_END===

===COVER_START===
(document LaTeX complet de la lettre - commence par \\documentclass)
===COVER_END===`;
}

// PROMPT 5: LATEX REGENERATION WITH INSTRUCTIONS (Writer)
export function getLatexRegenerationPrompt(
  currentCvLatex: string,
  currentCoverLatex: string,
  userInstructions: string,
  cvData: CVData,
  jobDescription: string
): string {
  return `Tu es un expert en LaTeX et en optimisation de documents professionnels.

CONTEXTE:
Le candidat a des documents LaTeX déjà générés (CV et lettre de motivation) et souhaite les modifier selon ses instructions spécifiques.

PROFIL DU CANDIDAT:
${JSON.stringify(cvData, null, 2)}

OFFRE D'EMPLOI:
"""
${jobDescription}
"""

DOCUMENT CV ACTUEL:
"""
${currentCvLatex}
"""

DOCUMENT LETTRE DE MOTIVATION ACTUELLE:
"""
${currentCoverLatex}
"""

INSTRUCTIONS DU CANDIDAT:
"""
${userInstructions}
"""

MISSION:
Modifie les documents LaTeX en suivant EXACTEMENT les instructions du candidat. Les modifications peuvent inclure:

1. **CONTENU**:
   - Reformuler des bullet points
   - Ajouter/supprimer des sections
   - Mettre en avant certaines compétences
   - Changer l'ordre des informations

2. **STYLE VISUEL**:
   - Changer les couleurs (remplacer les RGB)
   - Modifier la police de caractères
   - Ajuster les espacements
   - Ajouter/supprimer des éléments décoratifs (règles, bordures)

3. **STRUCTURE**:
   - Réorganiser l'ordre des sections
   - Changer la disposition (1 colonne, 2 colonnes)
   - Modifier les en-têtes/pieds de page

4. **FORMAT**:
   - Passer à un format sur 2 colonnes
   - Changer les marges
   - Ajuster la taille de police globale

RÈGLES ABSOLUES:
1. RESTE FIDÈLE AUX FAITS: Ne jamais inventer d'expériences ou de compétences
2. PRÉSERVE LES DONNÉES RÉELLES: Garde toutes les informations factuelles du candidat
3. APPLIQUE LES INSTRUCTIONS: Fais exactement ce que le candidat demande
4. GARDE LE FORMAT LaTeX VALIDE: Les documents doivent compiler correctement
5. ÉCHAPPE LES CARACTÈRES SPÉCIAUX: \\& pour &, \\% pour %, \\# pour #, \\$ pour $, \\_ pour _

EXEMPLES D'INSTRUCTIONS ET ACTIONS:
- "Mettre en avant mes compétences Python" → Reformuler les bullets pour souligner Python
- "Passer le CV sur 2 colonnes" → Utiliser minipage ou multicol pour layout 2 colonnes
- "Changer la couleur en bleu marine" → Modifier definecolor avec RGB approprié
- "Ajouter une section Certifications" → Insérer nouvelle section avec icône appropriée
- "Rendre la lettre plus concise" → Réduire les paragraphes tout en gardant l'essentiel
- "Supprimer la section Projets" → Retirer complètement cette section du LaTeX

FORMAT DE RÉPONSE:
Réponds avec les deux documents LaTeX complets entre les marqueurs.
NE PAS utiliser de blocs de code markdown (pas de \`\`\`latex).

===CV_START===
(document LaTeX complet du CV modifié - commence par \\documentclass)
===CV_END===

===COVER_START===
(document LaTeX complet de la lettre modifiée - commence par \\documentclass)
===COVER_END===`;
}
