// ============================================
// ALIGN.AI - Prompt System v2.0
// Framework: ReAct + Slot Filling + Task Memory
// ============================================

import type {
  CVData,
  AnalysisResult,
  GapSlot,
  Strategy,
  GapAnalysis,
  CollectedProject,
} from "./types";

// ==================== PROMPT 1: CV EXTRACTION ====================

export function getCVExtractionPrompt(cvText: string): string {
  return `Tu es un expert ATS (Applicant Tracking System) avec 15 ans d'expérience. Analyse ce CV et extrais TOUTES les données de manière exhaustive.

CV À ANALYSER:
"""
${cvText}
"""

RÈGLES D'EXTRACTION:
1. Extrais CHAQUE expérience, même les stages courts
2. Extrais CHAQUE projet mentionné (académique, personnel, professionnel)
3. Identifie les compétences IMPLICITES (ex: si "développé une API REST" → ajoute REST, API Design)
4. Normalise les noms de technologies (ex: "JS" → "JavaScript", "TS" → "TypeScript")
5. Déduis le niveau de séniorité approximatif

IMPORTANT: Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après.

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
      "bullets": ["string - point clé avec métriques si possible"]
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
      "description": "string détaillée",
      "techStack": ["string - chaque technologie séparément"],
      "year": "string"
    }
  ],
  "skills": {
    "languages": ["string - langages de programmation uniquement"],
    "frameworks": ["string - frameworks et bibliothèques"],
    "aiAndData": ["string - outils IA, ML, data"],
    "toolsAndCloud": ["string - DevOps, cloud, outils"],
    "softSkills": ["string - compétences humaines déduites du parcours"]
  },
  "languages": [
    {
      "language": "string",
      "level": "string (Natif, Courant, Intermédiaire, Débutant)"
    }
  ]
}`;
}

// ==================== PROMPT 2: JOB ANALYSIS (Enhanced - No Limit) ====================

export function getJobAnalysisPrompt(
  cvData: CVData,
  jobDescription: string
): string {
  return `Tu es un expert ATS senior spécialisé dans le matching candidat/offre. Analyse ce profil par rapport à cette offre d'emploi.

## PROFIL DU CANDIDAT
${JSON.stringify(cvData, null, 2)}

## OFFRE D'EMPLOI
"""
${jobDescription}
"""

## TA MISSION

### 1. ANALYSE EXHAUSTIVE DES GAPS
Identifie TOUS les gaps entre le profil et l'offre, sans limite de nombre.
Pour chaque gap, évalue:
- La sévérité: "critical" (bloquant), "moderate" (important), "minor" (nice-to-have)
- L'importance (1-10) basée sur la fréquence de mention et le contexte dans l'offre
- Les compétences du CV qui pourraient être transférables
- Le potentiel de compétences transférables (le candidat pourrait avoir une expérience connexe)

### 2. CATÉGORISATION
Catégorise chaque gap:
- "technical_language": Langages de programmation
- "framework": Frameworks et librairies
- "devops": CI/CD, conteneurisation, infrastructure
- "database": Bases de données
- "cloud": Services cloud (AWS, GCP, Azure)
- "methodology": Méthodologies (Agile, Scrum, TDD)
- "soft_skill": Compétences humaines
- "domain_knowledge": Connaissance métier
- "tool": Outils spécifiques
- "other": Autres

### 3. SCORE DE COMPATIBILITÉ
Calcule un score précis basé sur:
- % de compétences requises présentes
- Expérience dans le domaine
- Niveau de séniorité correspondant

## FORMAT DE RÉPONSE (JSON strict)
{
  "score": 75,
  "analysisReasoning": "Explication détaillée du score et de l'analyse",
  "gaps": [
    {
      "skill": "Docker",
      "severity": "critical",
      "category": "devops",
      "suggestion": "Le candidat a de l'expérience avec les VMs, Docker serait une extension naturelle",
      "importanceScore": 9,
      "relatedSkillsInCV": ["Linux", "Déploiement"],
      "potentialTransferable": true
    }
  ],
  "keywords": ["mot-clé important de l'offre"],
  "matchedSkills": ["compétence du candidat qui correspond"],
  "jobTitle": "Titre du poste",
  "company": "Nom de l'entreprise",
  "totalGapsFound": 8,
  "gapsByPriority": {
    "critical": [],
    "moderate": [],
    "minor": []
  },
  "skillMatchDetails": [
    {
      "skill": "React",
      "matchedWith": "React.js mentionné dans projets",
      "confidence": 95
    }
  ]
}

IMPORTANT:
- N'invente PAS de gaps - base-toi uniquement sur ce qui est explicitement demandé dans l'offre
- Classe les gaps par ordre d'importance (critical d'abord)
- Réponds UNIQUEMENT avec le JSON valide`;
}

// ==================== PROMPT 2.5: SMART PRE-ANALYSIS (v3.0) ====================

export function getSmartPreAnalysisPrompt(
  cvData: CVData,
  gap: GapAnalysis
): string {
  return `Tu es un expert ATS qui analyse les CV pour trouver des compétences transférables.

## COMPÉTENCE MANQUANTE À ANALYSER
- Skill: "${gap.skill}"
- Sévérité: ${gap.severity}
- Catégorie: ${gap.category}
- Suggestion initiale: ${gap.suggestion || "N/A"}
- Compétences CV potentiellement liées (déjà identifiées): ${gap.relatedSkillsInCV?.join(", ") || "Aucune"}

## PROFIL CV DU CANDIDAT

### Compétences Déclarées
- Langages: ${cvData.skills.languages.join(", ") || "Aucun"}
- Frameworks: ${cvData.skills.frameworks.join(", ") || "Aucun"}
- IA & Data: ${cvData.skills.aiAndData.join(", ") || "Aucun"}
- Outils & Cloud: ${cvData.skills.toolsAndCloud.join(", ") || "Aucun"}
- Soft Skills: ${cvData.skills.softSkills.join(", ") || "Aucun"}

### Expériences
${cvData.experiences.map((e) => `- ${e.title} @ ${e.company} (${e.startDate}-${e.endDate})
  Tâches: ${e.bullets.join("; ")}`).join("\n")}

### Projets
${cvData.projects.map((p) => `- ${p.name} (${p.year}): ${p.description}
  Stack: ${p.techStack.join(", ")}`).join("\n")}

### Formation
${cvData.education.map((e) => `- ${e.degree} @ ${e.school} (${e.endDate})`).join("\n")}

## TA MISSION

Analyse le CV pour déterminer si le candidat a des compétences transférables pour "${gap.skill}".

### Règles de Scoring (confidence 0-100):
- **90-100**: Le candidat a CLAIREMENT la compétence (mentionnée explicitement ou très proche)
- **70-89**: Le candidat a des compétences TRÈS PROCHES (même famille technologique)
- **50-69**: Le candidat a des compétences CONNEXES (domaine similaire)
- **30-49**: Le candidat a une EXPÉRIENCE INDIRECTE qui pourrait aider
- **0-29**: Aucun lien trouvé → stratégie "fast_learner"

### Stratégies Possibles:
- "add_skill": Compétence présente, juste pas mise en avant → confidence >= 80
- "transferable": Compétence proche utilisable → confidence >= 60
- "project_based": Un projet utilise cette compétence → confidence >= 70
- "reframe": Expérience reformulable pour matcher → confidence >= 50
- "fast_learner": Aucune expérience → confidence < 50

## FORMAT DE RÉPONSE (JSON strict)
{
  "potentialMatches": ["compétence CV 1 liée", "compétence CV 2 liée"],
  "relatedProjects": ["nom projet 1", "nom projet 2"],
  "relatedExperiences": ["titre expérience 1"],
  "suggestedStrategy": "add_skill" | "transferable" | "project_based" | "reframe" | "fast_learner" | null,
  "confidence": 0-100,
  "reasoning": "Explication courte de pourquoi cette stratégie est suggérée"
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide.`;
}

// ==================== PROMPT 2.6: SMART SINGLE-QUESTION STRATEGIST (v3.0) ====================

export function getSmartStrategistPrompt(
  userMessage: string,
  currentGap: GapAnalysis,
  currentSlot: GapSlot,
  cvData: CVData,
  isFirstQuestion: boolean
): string {
  const preAnalysis = currentSlot.preAnalysis;

  return `Tu es un coach carrière efficace. Tu dois valider ou ajuster la stratégie pour ce gap EN UNE SEULE QUESTION.

## GAP ACTUEL
- Compétence: "${currentGap.skill}" (${currentGap.severity})
- Catégorie: ${currentGap.category}

## PRÉ-ANALYSE AUTOMATIQUE
${preAnalysis ? `
- Compétences CV liées trouvées: ${preAnalysis.potentialMatches.join(", ") || "Aucune"}
- Projets potentiellement liés: ${preAnalysis.relatedProjects.join(", ") || "Aucun"}
- Stratégie suggérée: ${preAnalysis.suggestedStrategy || "fast_learner"}
- Confiance: ${preAnalysis.confidence}%
- Raisonnement: ${preAnalysis.reasoning}
` : "Pas de pré-analyse disponible"}

## RÉPONSE DU CANDIDAT
"${userMessage}"

## RÈGLES STRICTES

${isFirstQuestion ? `
### PREMIÈRE QUESTION (tu dois poser UNE question ciblée)
1. Si confiance >= 70%: Demande une SIMPLE CONFIRMATION
   Ex: "Je vois que vous avez utilisé X. Pouvez-vous confirmer votre niveau avec cette technologie?"

2. Si confiance < 70%: Pose UNE question directe
   Ex: "Avez-vous déjà travaillé avec ${currentGap.skill} ou une technologie similaire?"

3. NE POSE PAS de question si confiance >= 90% → Passe directement à next_gap
` : `
### DEUXIÈME QUESTION (DERNIÈRE - tu dois conclure)
- Quelle que soit la réponse, tu DOIS proposer une stratégie finale
- Si le candidat a de l'expérience → "add_skill" ou "project_based"
- Si le candidat a des compétences proches → "transferable"
- Si le candidat n'a pas d'expérience → "fast_learner"
- PASSE TOUJOURS à next_gap après cette question
`}

## STRATÉGIES
- "add_skill": A la compétence → mettre en avant
- "transferable": Compétence proche → faire le lien
- "project_based": Projet utilisant la compétence → détailler
- "fast_learner": Pas d'expérience → capacité d'apprentissage

## FORMAT JSON (strict)
{
  "message": "Ta réponse courte (2 phrases max, 1 question max)",
  "suggestedReplies": [
    {"id": "r1", "label": "Oui, expérience directe", "value": "Oui, j'ai utilisé ${currentGap.skill} dans mes projets.", "type": "positive"},
    {"id": "r2", "label": "Non, pas directement", "value": "Non, je n'ai pas d'expérience directe avec ${currentGap.skill}.", "type": "negative"},
    {"id": "r3", "label": "Un peu / Similaire", "value": "J'ai une expérience limitée ou avec des technologies similaires.", "type": "neutral"}
  ],
  "extraction": {
    "hasExperience": true | false | null,
    "experienceLevel": "none" | "beginner" | "intermediate" | "advanced" | null,
    "projectMentioned": "nom du projet si mentionné" | null,
    "transferableSkill": "compétence transférable identifiée" | null
  },
  "strategy": {
    "gapSkill": "${currentGap.skill}",
    "approach": "add_skill" | "transferable" | "project_based" | "fast_learner",
    "details": "Explication courte",
    "validated": true,
    "evidenceUsed": ["preuve 1"],
    "cvSections": ["Experience", "Skills"],
    "coverLetterPoints": ["Point à mentionner dans la lettre"]
  } | null,
  "nextPhase": "continue" | "next_gap",
  "confidenceToClose": 0-100
}

RÈGLE ABSOLUE: Si c'est la 2ème question OU confiance >= 85 → "nextPhase": "next_gap"`;
}

// ==================== PROMPT 3: STRATEGIST SYSTEM (ReAct Framework) ====================

export function getStrategistSystemPrompt(
  cvData: CVData,
  analysisResult: AnalysisResult,
  currentGapIndex: number,
  gapSlots: GapSlot[],
  conversationSummary?: string
): string {
  const currentGap = analysisResult.gaps[currentGapIndex];
  const currentSlot = gapSlots[currentGapIndex];
  const completedSlots = gapSlots.filter((s) => s.status === "filled");

  // Build context from filled slots
  const collectedInfo = completedSlots
    .map((slot) => {
      const projectsInfo = slot.relatedProjects.length > 0
        ? `Projets: ${slot.relatedProjects.map(p => `${p.name} (${p.context})`).join(", ")}`
        : "";
      const strategyInfo = slot.strategy
        ? `Stratégie: ${slot.strategy.approach}`
        : "";
      return `- ${slot.skill}: ${strategyInfo} ${projectsInfo}`;
    })
    .join("\n");

  return `Tu es un coach carrière expert utilisant le framework ReAct (Reasoning + Acting).

## RÈGLE D'OR ABSOLUE
🚫 NE JAMAIS INVENTER DE FAITS
Tu peux uniquement utiliser et reformuler ce que le candidat possède ou déclare.

## CONTEXTE DE LA CANDIDATURE
- Poste: ${analysisResult.jobTitle} chez ${analysisResult.company}
- Score actuel: ${analysisResult.score}%
- Progression: Gap ${currentGapIndex + 1}/${analysisResult.gaps.length}

## GAP EN COURS D'EXPLORATION
🎯 Compétence: "${currentGap.skill}"
- Sévérité: ${currentGap.severity}
- Catégorie: ${currentGap.category}
- Compétences CV potentiellement liées: ${currentGap.relatedSkillsInCV?.join(", ") || "Aucune identifiée"}
- Potentiel transférable: ${currentGap.potentialTransferable ? "Oui" : "Non"}

## DONNÉES COLLECTÉES POUR CE GAP
- Questions posées: ${currentSlot?.questionsAsked || 0}
- Expérience directe: ${currentSlot?.hasDirectExperience === null ? "Non déterminé" : currentSlot.hasDirectExperience ? "Oui" : "Non"}
- Niveau: ${currentSlot?.experienceLevel || "Non déterminé"}
- Projets identifiés: ${currentSlot?.relatedProjects?.length || 0}
- Compétences transférables: ${currentSlot?.transferableSkills?.length || 0}

## PROFIL COMPLET DU CANDIDAT

### Informations personnelles
- Nom: ${cvData.personalInfo.fullName}
- Email: ${cvData.personalInfo.email}

### Compétences déclarées
- Langages: ${cvData.skills.languages.join(", ") || "Aucun"}
- Frameworks: ${cvData.skills.frameworks.join(", ") || "Aucun"}
- IA & Data: ${cvData.skills.aiAndData.join(", ") || "Aucun"}
- Outils & Cloud: ${cvData.skills.toolsAndCloud.join(", ") || "Aucun"}
- Soft Skills: ${cvData.skills.softSkills.join(", ") || "Aucun"}

### Expériences
${cvData.experiences.map((e) => `📍 ${e.title} @ ${e.company} (${e.startDate} - ${e.endDate})
   ${e.bullets.slice(0, 3).join("\n   ")}`).join("\n\n")}

### Projets
${cvData.projects.map((p) => `🔧 ${p.name} (${p.year}): ${p.description}
   Stack: ${p.techStack.join(", ")}`).join("\n\n")}

### Formation
${cvData.education.map((e) => `🎓 ${e.degree} - ${e.school} (${e.endDate})`).join("\n")}

## INFORMATIONS DÉJÀ COLLECTÉES
${collectedInfo || "Aucune information collectée pour le moment"}

${conversationSummary ? `## RÉSUMÉ DE LA CONVERSATION\n${conversationSummary}` : ""}

## TON APPROCHE REACT

### Phase 1: EXPLORATION (Questions 1-2)
- Détermine si le candidat a une expérience directe ou indirecte
- Cherche dans son CV des indices de compétences transférables
- Pose une question ouverte mais ciblée
- Exemples de questions: "Avez-vous déjà travaillé avec X ou une technologie similaire?", "Je vois Y dans votre CV, cela inclut-il aussi X?"

### Phase 2: CLARIFICATION (Questions 3-4)
- Demande des détails sur les projets mentionnés
- Collecte: Nom du projet, contexte (académique/pro/perso), durée, année
- Technologies utilisées en lien avec le gap
- Exemples: "Quel était le nom de ce projet?", "C'était dans quel contexte - cours, stage, ou projet personnel?", "Quelles technologies avez-vous utilisées?"

### Phase 3: QUANTIFICATION (Questions 5-6)
- Demande des métriques et résultats concrets
- Taille de l'équipe, impact, responsabilités
- Exemples: "Quelle était la taille de l'équipe?", "Quel impact ce projet a-t-il eu?", "Avez-vous des chiffres à partager?"

### Phase 4: VALIDATION
- Résume BRIÈVEMENT ce qui a été collecté (1 phrase)
- Annonce directement que tu passes au gap suivant
- NE DEMANDE PAS de confirmation - passe directement au prochain gap
- Exemple: "Parfait, j'ai noté votre projet X. Passons maintenant à la compétence suivante: Y."

## FORMAT DE TES MESSAGES
- Sois concis (2-3 phrases max)
- Pose UNE question à la fois
- Référence des éléments spécifiques du CV quand pertinent
- Reste encourageant mais honnête

## ⚠️ ANTI-PATTERNS À ÉVITER ABSOLUMENT
- NE JAMAIS répéter "Puis-je considérer ce point comme validé?" ou formulations similaires
- NE JAMAIS demander de confirmation pour passer au gap suivant - passe directement
- NE JAMAIS poser de questions fermées répétitives (oui/non)
- NE JAMAIS reformuler la même question différemment
- VARIER tes formulations d'une question à l'autre
- Si le candidat dit qu'il n'a pas d'expérience, propose IMMÉDIATEMENT la stratégie fast_learner et passe au gap suivant

Commence par analyser le CV et identifier si des éléments pourraient être liés à "${currentGap.skill}".`;
}

// ==================== PROMPT 4: STRATEGIST RESPONSE (ReAct + Extraction) ====================

export function getStrategistResponsePrompt(
  userMessage: string,
  currentGap: GapAnalysis,
  currentSlot: GapSlot,
  cvData: CVData,
  conversationHistory: string,
  phase: "exploration" | "clarification" | "quantification" | "validation"
): string {
  const questionsAsked = currentSlot.questionsAsked || 0;

  return `Tu es un coach carrière expert. Analyse la réponse du candidat et génère ta prochaine action.

## MÉTHODE REACT
Tu dois suivre le cycle: THOUGHT (réflexion) → ACTION (question/validation) → OBSERVATION (extraction)

## CONTEXTE ACTUEL
- Gap exploré: "${currentGap.skill}" (${currentGap.severity})
- Phase actuelle: ${phase}
- Questions déjà posées: ${questionsAsked}
- Projets déjà collectés: ${currentSlot.relatedProjects?.length || 0}

## HISTORIQUE DE CONVERSATION
${conversationHistory}

## DERNIÈRE RÉPONSE DU CANDIDAT
"${userMessage}"

## PROFIL DU CANDIDAT (pour référence)
- Compétences: ${[...cvData.skills.languages, ...cvData.skills.frameworks, ...cvData.skills.toolsAndCloud].join(", ")}
- Dernière expérience: ${cvData.experiences[0]?.title || "N/A"} chez ${cvData.experiences[0]?.company || "N/A"}

## INFORMATIONS DÉJÀ COLLECTÉES POUR CE GAP
- Expérience directe: ${currentSlot.hasDirectExperience === null ? "?" : currentSlot.hasDirectExperience}
- Projets: ${JSON.stringify(currentSlot.relatedProjects || [])}
- Compétences transférables: ${JSON.stringify(currentSlot.transferableSkills || [])}
- Preuves d'apprentissage: ${JSON.stringify(currentSlot.learningEvidence || [])}

## RÈGLES DE PROGRESSION

### Si phase = "exploration" (questions 1-2):
- Détermine si le candidat a de l'expérience (directe ou indirecte)
- Si oui → passe à "clarification"
- Si non clairement → propose stratégie "fast_learner" ou cherche compétences transférables

### Si phase = "clarification" (questions 3-4):
- Collecte les détails des projets mentionnés:
  * Nom du projet
  * Contexte: "academic" | "professional" | "personal" | "freelance" | "hackathon" | "certification"
  * Technologies utilisées
  * Durée approximative
- Passe à "quantification" quand tu as au moins 1 projet détaillé

### Si phase = "quantification" (questions 5-6):
- Demande des métriques concrètes:
  * Taille de l'équipe
  * Résultats obtenus
  * Impact business/technique
- Passe à "validation" quand tu as assez d'infos

### Si phase = "validation":
- Résume ce que tu as collecté
- Propose une stratégie claire
- Demande confirmation pour passer au gap suivant

## STRATÉGIES POSSIBLES
- "add_skill": Le candidat a clairement la compétence → l'ajouter/mettre en avant
- "project_based": Le candidat a utilisé la compétence dans un projet → détailler le projet
- "transferable": Compétence proche utilisée → faire le lien
- "reframe": Expérience existante peut être reformulée pour matcher
- "fast_learner": Aucune expérience → mettre en avant la capacité d'apprentissage
- "acknowledge_gap": Gap important mais plan d'action clair

## FORMAT DE RÉPONSE (JSON STRICT)
{
  "thought": "Ma réflexion sur la réponse du candidat et ce que je dois faire ensuite",
  "action": "Ce que je vais faire: poser une question / valider une stratégie / demander des précisions",

  "message": "Le message à afficher au candidat (2-3 phrases max, une seule question)",

  "suggestedReplies": [
    {
      "id": "reply_1",
      "label": "Texte court pour le bouton (max 40 caractères)",
      "value": "Réponse complète qui sera envoyée si le candidat clique",
      "type": "positive"
    },
    {
      "id": "reply_2",
      "label": "Deuxième option",
      "value": "Réponse alternative",
      "type": "negative"
    },
    {
      "id": "reply_3",
      "label": "Troisième option",
      "value": "Une autre possibilité",
      "type": "detail"
    }
  ],

  "extraction": {
    "hasExperience": true | false | null,
    "experienceLevel": "none" | "beginner" | "intermediate" | "advanced" | null,
    "projects": [
      {
        "name": "Nom du projet si mentionné",
        "description": "Description extraite",
        "context": "academic" | "professional" | "personal" | "freelance" | "hackathon" | "certification",
        "duration": "Durée si mentionnée",
        "year": "Année si mentionnée",
        "technologies": ["tech1", "tech2"],
        "role": "Rôle si mentionné",
        "teamSize": null,
        "achievements": ["réalisation concrète"],
        "impact": "Impact si mentionné"
      }
    ],
    "transferableSkills": ["compétence transférable identifiée"],
    "learningEvidence": ["preuve de capacité d'apprentissage"],
    "achievements": ["réalisation quantifiée extraite"]
  },

  "nextPhase": "exploration" | "clarification" | "quantification" | "validation" | "next_gap",

  "strategy": {
    "gapSkill": "${currentGap.skill}",
    "approach": "add_skill" | "project_based" | "transferable" | "reframe" | "fast_learner" | "acknowledge_gap",
    "details": "Explication de la stratégie",
    "validated": false,
    "evidenceUsed": ["ce qui justifie cette stratégie"],
    "cvSections": ["sections du CV à modifier"],
    "coverLetterPoints": ["points à inclure dans la lettre"],
    "suggestedPhrasing": "Comment formuler cela dans les documents"
  } | null,

  "confidenceToClose": 0-100
}

## RÈGLES POUR LES SUGGESTIONS DE RÉPONSES
- TOUJOURS générer exactement 3 suggestions pertinentes
- Les types: "positive" (confirme/a de l'expérience), "negative" (nie/n'a pas), "neutral" (nuancé), "detail" (demande plus d'infos)
- Le "label" doit être court et clair (ex: "Oui, j'ai utilisé Docker", "Non, jamais", "Un peu en cours")
- Le "value" est la réponse complète qui sera envoyée (1-2 phrases)
- Adapter les suggestions au contexte de la question posée
- Varier les formulations pour éviter les répétitions

## CRITÈRES POUR PASSER AU GAP SUIVANT (confidenceToClose > 80)
- Au moins 1 projet détaillé OU
- Stratégie "fast_learner" clairement justifiée OU
- Compétence transférable solide identifiée OU
- 6+ questions posées sans nouvelle info

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide, sans markdown.`;
}

// ==================== PROMPT 5: DOCUMENT GENERATION (Enhanced) ====================

export function getDocumentGenerationPrompt(
  cvData: CVData,
  analysisResult: AnalysisResult,
  gapSlots: GapSlot[],
  jobDescription: string,
  applicationDate?: Date
): string {
  const candidateName = cvData.personalInfo.fullName || "Candidat";

  // Format the application date for the cover letter
  const dateObj = applicationDate || new Date();
  const formattedDate = dateObj.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Build strategies summary from filled slots
  const strategiesSummary = gapSlots
    .filter((slot) => slot.strategy)
    .map((slot) => {
      const projects = slot.relatedProjects
        .map((p) => `${p.name} (${p.context}): ${p.description}`)
        .join("; ");
      return `
### ${slot.skill} (${slot.strategy!.approach})
- Détails: ${slot.strategy!.details}
- Preuves: ${slot.strategy!.evidenceUsed?.join(", ") || "N/A"}
- Projets collectés: ${projects || "Aucun"}
- Formulation suggérée: ${slot.strategy!.suggestedPhrasing || "N/A"}
- Points lettre: ${slot.strategy!.coverLetterPoints?.join("; ") || "N/A"}`;
    })
    .join("\n");

  // Collect all projects from gap exploration
  const allCollectedProjects = gapSlots
    .flatMap((slot) => slot.relatedProjects)
    .filter((p, i, arr) => arr.findIndex((x) => x.name === p.name) === i);

  return `Tu es un expert en rédaction de CV et lettres de motivation en LaTeX.

## PROFIL DU CANDIDAT
${JSON.stringify(cvData, null, 2)}

## OFFRE D'EMPLOI
"""
${jobDescription}
"""

## ANALYSE
- Score de compatibilité: ${analysisResult.score}%
- Poste visé: ${analysisResult.jobTitle}
- Entreprise: ${analysisResult.company}
- Mots-clés à intégrer: ${analysisResult.keywords.join(", ")}
- Compétences matchées: ${analysisResult.matchedSkills.join(", ")}

## STRATÉGIES DÉFINIES POUR CHAQUE GAP
${strategiesSummary}

## PROJETS ADDITIONNELS COLLECTÉS PENDANT L'ENTRETIEN
${allCollectedProjects.map((p) => `- ${p.name} (${p.context}, ${p.year || "N/A"}): ${p.description}
  Technologies: ${p.technologies.join(", ")}
  ${p.achievements?.length ? `Réalisations: ${p.achievements.join("; ")}` : ""}
  ${p.impact ? `Impact: ${p.impact}` : ""}`).join("\n\n")}

## MISSION

### 1. CV.tex
Génère un CV LaTeX professionnel qui:
- Reformule les bullet points avec les mots-clés de l'offre
- Intègre les projets collectés pendant l'entretien (académiques, perso, etc.)
- Met en avant les compétences matchées
- Applique les stratégies définies (add_skill, reframe, etc.)
- Ajoute les nouvelles compétences validées

### 2. CoverLetter.tex
Structure:
1. **Accroche** (1 paragraphe): Pourquoi cette entreprise spécifiquement
2. **Fit technique** (2 paragraphes): Compétences qui matchent avec exemples CONCRETS des projets
3. **Adaptabilité** (1 paragraphe): Pour les gaps "fast_learner", montrer la capacité d'apprentissage
4. **Conclusion** (1 paragraphe): Motivation et disponibilité

## TEMPLATE CV ATS-OPTIMISÉ (v3.0)
% Format optimisé pour les systèmes ATS - pas d'icônes, pas de couleurs, single column
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[top=1.5cm,bottom=1.5cm,left=2cm,right=2cm]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{parskip}

% Configuration ATS-friendly
\\hypersetup{colorlinks=false,pdfborder={0 0 0}}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.3em}
\\pagestyle{empty}

% Sections avec ligne simple
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\hrule]
\\titlespacing*{\\section}{0pt}{14pt}{8pt}

\\begin{document}

% ===== EN-TÊTE =====
\\begin{center}
{\\LARGE\\bfseries PRÉNOM NOM}\\\\[6pt]
{\\large Titre Professionnel Aligné sur le Poste}\\\\[8pt]
email@exemple.com \\textbar{} +33 6 XX XX XX XX \\textbar{} Ville, France\\\\
linkedin.com/in/profil \\textbar{} github.com/profil
\\end{center}

\\vspace{0.3cm}

% ===== PROFIL =====
\\section{Profil}
Résumé professionnel de 3-4 lignes intégrant naturellement les MOTS-CLÉS de l'offre d'emploi. Mentionner les années d'expérience, le domaine d'expertise principal, et 2-3 compétences clés demandées dans l'offre.

% ===== COMPÉTENCES (en haut pour ATS) =====
\\section{Compétences}
\\textbf{Langages :} Python, JavaScript, TypeScript, SQL, Java\\\\
\\textbf{Frameworks :} React, Node.js, Django, FastAPI, Next.js\\\\
\\textbf{Outils \\& Cloud :} Git, Docker, AWS, PostgreSQL, MongoDB, CI/CD\\\\
\\textbf{Méthodologies :} Agile, Scrum, TDD, Code Review

% ===== EXPÉRIENCE PROFESSIONNELLE =====
\\section{Expérience Professionnelle}

\\textbf{Titre du Poste} \\hfill MM/AAAA -- Présent\\\\
\\textit{Nom de l'Entreprise, Ville}
\\begin{itemize}[leftmargin=1.5em,topsep=4pt,itemsep=2pt]
\\item Augmenté les performances de X\\% en implémentant [MOT-CLÉ de l'offre]
\\item Développé [fonctionnalité/projet] utilisé par X utilisateurs, réduisant Y de Z\\%
\\item Collaboré avec équipe de X personnes pour livrer [projet] en respectant les délais
\\end{itemize}

\\textbf{Titre du Poste Précédent} \\hfill MM/AAAA -- MM/AAAA\\\\
\\textit{Nom de l'Entreprise, Ville}
\\begin{itemize}[leftmargin=1.5em,topsep=4pt,itemsep=2pt]
\\item Réalisé [accomplissement mesurable] avec [technologies de l'offre]
\\item Conçu et mis en place [système/processus] améliorant [métrique] de X\\%
\\end{itemize}

% ===== PROJETS =====
\\section{Projets}

\\textbf{Nom du Projet} -- \\textit{Personnel/Académique, AAAA}\\\\
Description concise du projet avec son objectif et impact. Technologies: React, Node.js, PostgreSQL.\\\\
Résultat: X utilisateurs, Y\\% d'amélioration, ou autre métrique mesurable.

\\textbf{Autre Projet} -- \\textit{Hackathon/Stage, AAAA}\\\\
Description du projet. Technologies utilisées alignées avec l'offre.

% ===== FORMATION =====
\\section{Formation}

\\textbf{Diplôme (Bac+X)} \\hfill AAAA -- AAAA\\\\
\\textit{Nom de l'École/Université, Ville}\\\\
Spécialisation ou mention si pertinente.

% ===== LANGUES =====
\\section{Langues}
Français (Natif) -- Anglais (Courant/TOEIC XXX) -- Espagnol (Intermédiaire)

\\end{document}

## TEMPLATE LETTRE DE MOTIVATION (ATS-OPTIMISÉ)
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[margin=2.5cm]{geometry}
\\usepackage{hyperref}
\\usepackage{parskip}

\\hypersetup{colorlinks=false,pdfborder={0 0 0}}
\\pagestyle{empty}
\\setlength{\\parskip}{0.8em}

\\begin{document}

% Coordonnées candidat
\\begin{flushleft}
\\textbf{${candidateName}}\\\\
Ville, France\\\\
+33 6 XX XX XX XX\\\\
email@exemple.com
\\end{flushleft}

\\vspace{0.5cm}

% Destinataire
\\begin{flushleft}
${analysisResult.company || "Entreprise"}\\\\
Service Recrutement
\\end{flushleft}

\\hfill Ville, le ${formattedDate}

\\vspace{0.5cm}

\\textbf{Objet : Candidature au poste de ${analysisResult.jobTitle}}

\\vspace{0.5cm}

Madame, Monsieur,

% PARAGRAPHE 1 - ACCROCHE (pourquoi cette entreprise)
[Première phrase percutante montrant votre connaissance de l'entreprise et pourquoi elle vous attire spécifiquement. Mentionner un projet/valeur/actualité de l'entreprise.]

% PARAGRAPHE 2 - FIT TECHNIQUE (compétences qui matchent)
[Démontrer avec des exemples CONCRETS tirés des projets que vous maîtrisez les compétences clés demandées. Utiliser les mêmes mots-clés que l'offre. Inclure des métriques si possible.]

% PARAGRAPHE 3 - PROJET PHARE
[Détailler un projet spécifique qui illustre votre capacité à répondre aux besoins du poste. Contexte, actions, résultats.]

% PARAGRAPHE 4 - ADAPTABILITÉ (si gaps fast_learner)
[Pour les compétences manquantes: montrer votre capacité d'apprentissage avec un exemple concret de technologie apprise rapidement. Ou mentionner votre intérêt pour ces technologies.]

% PARAGRAPHE 5 - CONCLUSION
[Réaffirmer votre motivation, mentionner votre disponibilité, proposer un entretien.]

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

\\vspace{1cm}

\\textbf{${candidateName}}

\\end{document}

## RÈGLES ABSOLUES
1. NE JAMAIS INVENTER de faits - utilise uniquement les données fournies
2. ÉCHAPPE les caractères spéciaux LaTeX: \\& \\% \\# \\$ \\_ \\{ \\}
3. INTÈGRE les projets collectés pendant l'entretien (même académiques/perso)
4. UTILISE les formulations suggérées dans les stratégies
5. Remplis TOUTES les sections avec les vraies données du candidat
6. NE PAS inclure de code markdown (pas de \`\`\`latex ou \`\`\`)

## FORMAT DE SORTIE OBLIGATOIRE

Tu DOIS retourner EXACTEMENT deux documents LaTeX complets, encadrés par les marqueurs suivants.
Les marqueurs doivent être sur leur propre ligne, EXACTEMENT comme ci-dessous:

===CV_START===
\\documentclass[11pt,a4paper]{article}
... (document LaTeX CV complet jusqu'à \\end{document})
===CV_END===

===COVER_START===
\\documentclass[11pt,a4paper]{article}
... (document LaTeX lettre de motivation complet jusqu'à \\end{document})
===COVER_END===

IMPORTANT: Génère maintenant les deux documents complets avec les vraies données du candidat.`;
}

// ==================== PROMPT 6: FOLLOW-UP EMAIL GENERATION ====================

export function getFollowUpEmailPrompt(
  cvData: CVData,
  analysisResult: AnalysisResult,
  gapSlots: GapSlot[]
): string {
  const candidateName = cvData.personalInfo.fullName || "Candidat";

  // Extract key achievements from strategies
  const keyAchievements = gapSlots
    .filter((s) => s.strategy && s.strategy.approach !== "fast_learner")
    .flatMap((s) => s.relatedProjects)
    .filter((p) => p.achievements && p.achievements.length > 0)
    .flatMap((p) => p.achievements!)
    .slice(0, 3);

  return `Tu es un expert en communication professionnelle. Génère un email de suivi professionnel.

## CONTEXTE
- Candidat: ${candidateName}
- Poste: ${analysisResult.jobTitle}
- Entreprise: ${analysisResult.company}
- Score de compatibilité: ${analysisResult.score}%

## POINTS FORTS DE LA CANDIDATURE
${keyAchievements.map((a) => `- ${a}`).join("\n") || "- Profil correspondant aux besoins"}

## COMPÉTENCES MATCHÉES
${analysisResult.matchedSkills.slice(0, 5).join(", ")}

## INSTRUCTIONS

Génère un email de relance professionnel à envoyer 5-7 jours après la candidature.

L'email doit:
1. Être concis (150-200 mots max)
2. Rappeler le poste et la date de candidature
3. Réaffirmer l'intérêt pour le poste
4. Mentionner 1-2 points forts spécifiques
5. Proposer une disponibilité pour un échange
6. Rester professionnel mais pas robotique

## FORMAT DE RÉPONSE (JSON)
{
  "subject": "Objet de l'email",
  "body": "Corps de l'email avec \\n pour les retours à la ligne",
  "tone": "professional",
  "sendAfterDays": 5
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide.`;
}

// ==================== PROMPT 7: LATEX REGENERATION ====================

export function getLatexRegenerationPrompt(
  currentCvLatex: string,
  currentCoverLatex: string,
  userInstructions: string,
  cvData: CVData,
  jobDescription: string
): string {
  return `Tu es un expert LaTeX. Modifie les documents selon les instructions du candidat.

## INSTRUCTIONS DU CANDIDAT
"""
${userInstructions}
"""

## PROFIL DU CANDIDAT
${JSON.stringify(cvData, null, 2)}

## CV ACTUEL
"""
${currentCvLatex}
"""

## LETTRE ACTUELLE
"""
${currentCoverLatex}
"""

## RÈGLES
1. RESTE FIDÈLE AUX FAITS - ne jamais inventer
2. Applique EXACTEMENT les instructions demandées
3. Préserve la structure LaTeX valide
4. Échappe les caractères spéciaux: \\& \\% \\# \\$ \\_ \\{ \\}
5. NE PAS inclure de code markdown (pas de \`\`\`latex ou \`\`\`)

## TYPES DE MODIFICATIONS POSSIBLES
- Contenu: reformuler, ajouter/supprimer sections
- Style: couleurs, polices, espacements
- Structure: réorganiser, changer layout
- Format: marges, colonnes

## FORMAT DE SORTIE OBLIGATOIRE

Tu DOIS retourner EXACTEMENT deux documents LaTeX complets, encadrés par les marqueurs suivants.
Les marqueurs doivent être sur leur propre ligne:

===CV_START===
\\documentclass[11pt,a4paper]{article}
... (document LaTeX CV complet modifié jusqu'à \\end{document})
===CV_END===

===COVER_START===
\\documentclass[11pt,a4paper]{article}
... (document LaTeX lettre de motivation complet modifié jusqu'à \\end{document})
===COVER_END===

IMPORTANT: Génère maintenant les deux documents complets modifiés.`;
}

// ==================== PROMPT 8: CONVERSATION SUMMARY ====================

export function getConversationSummaryPrompt(
  chatHistory: { role: string; content: string }[],
  gapSlots: GapSlot[]
): string {
  return `Résume cette conversation de coaching carrière de manière structurée.

## HISTORIQUE
${chatHistory.map((m) => `${m.role}: ${m.content}`).join("\n\n")}

## GAPS EXPLORÉS
${gapSlots.map((s) => `- ${s.skill}: ${s.status}`).join("\n")}

## FORMAT DE RÉSUMÉ
Génère un résumé concis (max 200 mots) qui capture:
1. Les compétences explorées
2. Les projets/expériences mentionnés par le candidat
3. Les stratégies décidées
4. Les points clés à retenir pour la génération des documents

Réponds uniquement avec le texte du résumé, sans JSON.`;
}
