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
import { getVocabularyExamples } from "./vocabulary-helper";

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

### 4. ANALYSE PROBLÈMES → SOLUTIONS (NOUVEAU - TRÈS IMPORTANT)
Identifie les PROBLÈMES IMPLICITES que l'entreprise cherche à résoudre:
- Lis entre les lignes de l'offre: "gérer une équipe grandissante" = problème de scaling
- "Améliorer la performance" = problème de lenteur actuelle
- "Mettre en place CI/CD" = problème de déploiement manuel
- "Développer de nouvelles features" = problème de vélocité

Pour chaque problème identifié, cherche dans le CV du candidat:
- A-t-il RÉSOLU un problème SIMILAIRE ?
- Pas juste "a la compétence" mais "a PROUVÉ qu'il peut résoudre CE TYPE de problème"

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
  ],
  "problemSolutionMatches": [
    {
      "implicitProblem": "Besoin de scaling (équipe qui grandit)",
      "candidateProof": "A géré une équipe de 3 à 8 personnes chez X",
      "relevanceScore": 9,
      "cvEvidence": "Lead technique chez Company X"
    },
    {
      "implicitProblem": "Amélioration de la performance",
      "candidateProof": "Optimisation qui a réduit le temps de chargement de 40%",
      "relevanceScore": 8,
      "cvEvidence": "Projet Y - Performance optimization"
    }
  ],
  "implicitProblemsDetected": [
    "Scaling de l'équipe technique",
    "Mise en place de bonnes pratiques",
    "Accélération des déploiements"
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

// ==================== PROMPT 2.6: VALIDATOR MODE (v3.1 - Candidat Validateur) ====================
// PARADIGME: L'IA PROPOSE, le candidat VALIDE en 1 clic

export function getSmartStrategistPrompt(
  userMessage: string,
  currentGap: GapAnalysis,
  currentSlot: GapSlot,
  cvData: CVData,
  isFirstQuestion: boolean
): string {
  const preAnalysis = currentSlot.preAnalysis;

  // Extraire les infos pertinentes du CV pour proposer du contenu
  const relevantExp = cvData.experiences?.find(e =>
    e.bullets?.some(b => b.toLowerCase().includes(currentGap.skill.toLowerCase())) ||
    e.title?.toLowerCase().includes(currentGap.skill.toLowerCase())
  );
  const relevantProject = cvData.projects?.find(p =>
    p.techStack?.some(t => t.toLowerCase().includes(currentGap.skill.toLowerCase())) ||
    p.description?.toLowerCase().includes(currentGap.skill.toLowerCase())
  );
  const relatedSkills = [...(cvData.skills?.languages || []), ...(cvData.skills?.frameworks || []), ...(cvData.skills?.toolsAndCloud || [])]
    .filter(s => s.toLowerCase().includes(currentGap.skill.split(' ')[0].toLowerCase()) ||
                 currentGap.skill.toLowerCase().includes(s.toLowerCase()));

  // Get vocabulary examples for this skill
  const skillExamples = getVocabularyExamples(currentGap.skill);
  const skillWithExamples = skillExamples.length > 0
    ? `${currentGap.skill} (ex: ${skillExamples.slice(0, 3).join(", ")})`
    : currentGap.skill;

  return `Tu es un assistant bienveillant et encourageant qui PROPOSE du contenu pour le CV. JAMAIS de questions - TOUJOURS une proposition concrète.

## PARADIGME "CANDIDAT VALIDATEUR"
L'utilisateur ne doit PAS réfléchir. Tu analyses son CV et tu PROPOSES une formulation.
Il clique [✓ Parfait] ou [Modifier].

## TON ENCOURAGEANT (OBLIGATOIRE)
- Commence TOUJOURS par une phrase positive sur ce que tu as trouvé dans le CV
- Utilise des formulations comme: "Super !", "Excellent !", "J'ai trouvé quelque chose de bien !", "Bonne nouvelle !"
- Même si tu ne trouves pas d'expérience directe, reste positif: "Pas de souci !", "C'est normal !", "On va trouver une solution !"
- Valorise TOUJOURS les compétences existantes du candidat avant de proposer

## GAP À TRAITER
- Compétence: "${skillWithExamples}" (${currentGap.severity})
- Catégorie: ${currentGap.category}
${skillExamples.length > 0 ? `- 💡 Exemples d'outils: ${skillExamples.join(", ")}` : ""}

## ÉLÉMENTS TROUVÉS DANS LE CV
${relevantExp ? `
📍 EXPÉRIENCE LIÉE: ${relevantExp.title} @ ${relevantExp.company}
   - ${relevantExp.bullets?.slice(0, 2).join('\n   - ') || 'Pas de détails'}
` : ''}
${relevantProject ? `
🔧 PROJET LIÉ: ${relevantProject.name} (${relevantProject.year || 'N/A'})
   - ${relevantProject.description?.slice(0, 150) || ''}
   - Stack: ${relevantProject.techStack?.join(', ') || 'N/A'}
` : ''}
${relatedSkills.length > 0 ? `
⚡ COMPÉTENCES PROCHES: ${relatedSkills.join(', ')}
` : ''}
${preAnalysis ? `
📊 PRÉ-ANALYSE: ${preAnalysis.reasoning} (confiance: ${preAnalysis.confidence}%)
` : ''}

## RÉPONSE DU CANDIDAT
"${userMessage}"

## TA MISSION
${isFirstQuestion ? `
### PREMIÈRE INTERACTION - PROPOSE UNE FORMULATION CONCRÈTE

SI tu as trouvé quelque chose dans le CV:
→ COMMENCE par "Super !" ou "Excellent !" puis explique ce que tu as trouvé
→ PROPOSE une formulation précise pour le CV/lettre
→ Exemple: "Super ! J'ai repéré votre projet X avec React - c'est exactement ce qu'il nous faut ! Je propose d'ajouter:
   **'Développement d'interfaces React avec gestion d'état (Projet X, 2024)'**"

SI tu n'as rien trouvé:
→ RESTE POSITIF : "Pas de souci !" ou "C'est normal, on va trouver une solution !"
→ PROPOSE de mettre en avant la capacité d'apprentissage
→ Exemple: "Pas de souci ! Docker n'est pas encore dans votre boîte à outils, mais votre profil montre une vraie capacité d'adaptation. Je propose:
   **'Forte capacité d'apprentissage technique - Motivation à maîtriser Docker rapidement'**"

NE POSE PAS DE QUESTION. PROPOSE DIRECTEMENT AVEC ENTHOUSIASME.
` : `
### APRÈS VALIDATION - CÉLÈBRE ET PASSE AU SUIVANT
Le candidat a validé ou modifié. Célèbre sa décision et passe au gap suivant.
→ "Parfait, excellent choix !" ou "Super, c'est noté !" puis IMMÉDIATEMENT nextPhase: "next_gap"
`}

## FORMAT JSON (strict)
{
  "message": "Ta proposition (inclure la formulation en **gras**). PAS DE QUESTION.",
  "proposedContent": "La formulation exacte proposée pour le CV ou la lettre",
  "suggestedReplies": [
    {"id": "r1", "label": "✓ Parfait", "value": "C'est parfait, je valide cette formulation.", "type": "positive"},
    {"id": "r2", "label": "Modifier", "value": "Je voudrais modifier légèrement cette proposition.", "type": "neutral"},
    {"id": "r3", "label": "Pas cette compétence", "value": "Je préfère ne pas mettre en avant cette compétence.", "type": "negative"}
  ],
  "extraction": {
    "hasExperience": true | false | null,
    "experienceLevel": "none" | "beginner" | "intermediate" | "advanced" | null,
    "projectMentioned": "${relevantProject?.name || 'null'}",
    "transferableSkill": "${relatedSkills[0] || 'null'}"
  },
  "strategy": {
    "gapSkill": "${currentGap.skill}",
    "approach": "${preAnalysis?.suggestedStrategy || 'fast_learner'}",
    "details": "Explication",
    "validated": true,
    "evidenceUsed": [${relatedSkills.map(s => `"${s}"`).join(', ') || '"Capacité d\'apprentissage"'}],
    "cvSections": ["Skills"],
    "coverLetterPoints": ["Point à mentionner"]
  },
  "nextPhase": "${isFirstQuestion ? 'continue' : 'next_gap'}",
  "confidenceToClose": ${preAnalysis?.confidence || 50}
}

RÈGLE ABSOLUE:
- JAMAIS de question ouverte
- TOUJOURS une proposition concrète en **gras** dans le message
- Si le candidat dit "Parfait" → nextPhase: "next_gap"`;
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

  return `Tu es un coach carrière bienveillant et encourageant utilisant le framework ReAct (Reasoning + Acting).

## TON ENCOURAGEANT (OBLIGATOIRE)
- Commence TOUJOURS tes messages par quelque chose de positif
- Utilise des formulations chaleureuses: "Super !", "Excellent !", "Bonne nouvelle !", "C'est parfait !"
- Valorise les efforts et les compétences du candidat
- Même quand il y a un gap, reste positif: "On va trouver une solution ensemble !"
- Célèbre chaque avancée: "Bravo, on progresse bien !"

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

  return `Tu es un coach carrière bienveillant et encourageant. Analyse la réponse du candidat et génère ta prochaine action.

## TON ENCOURAGEANT (OBLIGATOIRE)
- Commence TOUJOURS tes messages par quelque chose de positif
- Utilise des formulations comme: "Super !", "Excellent !", "Bonne nouvelle !", "Parfait !"
- Valorise ce que le candidat partage, même si c'est peu
- Si le candidat n'a pas d'expérience, reste positif: "Pas de souci !", "C'est normal !"
- Célèbre chaque information collectée: "Génial, c'est exactement ce qu'il nous faut !"

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

// ==================== PROMPT 5: DOCUMENT GENERATION v4.0 (CV PARFAIT) ====================
// Paradigme: MINIMISER LES RAISONS DE REJET > Maximiser le match
// Features: Pourquoi Moi, Ordre Dynamique, Mapping Synonymes, ATS-Optimisé

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

  // Build keyword synonym map for ATS optimization
  const keywordSynonyms = `
MAPPING SYNONYMES ATS (utilise le terme de l'offre):
- JavaScript/JS/ECMAScript → utilise exactement le terme de l'offre
- TypeScript/TS → utilise exactement le terme de l'offre
- React/ReactJS/React.js → utilise exactement le terme de l'offre
- Node/NodeJS/Node.js → utilise exactement le terme de l'offre
- Python/Python3 → utilise exactement le terme de l'offre
- Docker/Containerization → utilise exactement le terme de l'offre
- CI/CD/Continuous Integration/DevOps → utilise exactement le terme de l'offre
- Agile/Scrum/Kanban → utilise exactement le terme de l'offre
- AWS/Amazon Web Services/Cloud → utilise exactement le terme de l'offre
- PostgreSQL/Postgres/SQL → utilise exactement le terme de l'offre
- MongoDB/NoSQL → utilise exactement le terme de l'offre
- REST/RESTful/API → utilise exactement le terme de l'offre
- Git/GitHub/GitLab/Version Control → utilise exactement le terme de l'offre
- Testing/Tests/TDD/Unit Tests → utilise exactement le terme de l'offre
`;

  return `Tu es un expert en rédaction de CV "chirurgicaux" — parfaitement ciblés pour MINIMISER LES RAISONS DE REJET.

## 🎯 PARADIGME FONDAMENTAL: MINIMISER LE REJET

Les recruteurs passent 6 SECONDES sur un CV. Ils cherchent des RAISONS DE REJETER, pas des raisons d'embaucher.

**Ton objectif:** Éliminer TOUTES les raisons de rejet:
1. ❌ Gap visible → ✅ Comblé ou expliqué
2. ❌ Doute sur les compétences → ✅ Preuves concrètes avec métriques
3. ❌ Confusion sur le profil → ✅ "Pourquoi Moi" ultra-clair en 6 secondes
4. ❌ Risque perçu → ✅ Expériences similaires au poste
5. ❌ Bruit/infos non pertinentes → ✅ Tout est ciblé sur CETTE offre

${keywordSynonyms}

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
- Mots-clés EXACTS de l'offre à utiliser: ${analysisResult.keywords.join(", ")}
- Compétences matchées: ${analysisResult.matchedSkills.join(", ")}
- Gaps identifiés: ${analysisResult.gaps.map(g => g.skill).join(", ")}

## STRATÉGIES DÉFINIES POUR CHAQUE GAP
${strategiesSummary}

## PROJETS ADDITIONNELS COLLECTÉS
${allCollectedProjects.map((p) => `- ${p.name} (${p.context}, ${p.year || "N/A"}): ${p.description}
  Technologies: ${p.technologies.join(", ")}
  ${p.achievements?.length ? `Réalisations: ${p.achievements.join("; ")}` : ""}
  ${p.impact ? `Impact: ${p.impact}` : ""}`).join("\n\n")}

## 📋 MISSION: GÉNÉRER UN CV PARFAIT

### ÉTAPE 1: Section "POURQUOI MOI" (CRITIQUE)
Cette section apparaît EN HAUT du CV, juste après le nom. Elle doit répondre en 3-4 lignes à:
"Pourquoi ce candidat est parfait pour CE poste spécifique?"

Structure obligatoire:
- Phrase 1: X années d'expérience dans [domaine pertinent pour l'offre]
- Phrase 2: Expertise principale qui MATCHE directement avec l'offre
- Phrase 3: 2-3 compétences clés EXACTEMENT comme dans l'offre
- Phrase 4: Élément différenciant (projet, métrique, réalisation)

### ÉTAPE 2: Ordre DYNAMIQUE des Expériences
RÉORDONNE les expériences du candidat PAR PERTINENCE pour cette offre:
- Position 1: L'expérience la PLUS pertinente (même si pas la plus récente)
- Position 2: La 2ème plus pertinente
- etc.

Critères de pertinence:
- Technologies utilisées matchent l'offre
- Responsabilités similaires au poste
- Secteur/domaine similaire
- Métriques impressionnantes

### ÉTAPE 3: Reformulation ATS
Pour CHAQUE bullet point:
1. Identifie les mots-clés de l'offre qui peuvent s'appliquer
2. Reformule en utilisant EXACTEMENT ces mots-clés
3. Ajoute des métriques si disponibles (%, X utilisateurs, etc.)
4. Structure: [Action] + [Technologie de l'offre] + [Résultat mesurable]

### ÉTAPE 4: Compétences Ciblées
Liste les compétences dans cet ORDRE:
1. Compétences EXACTEMENT demandées dans l'offre (en premier)
2. Compétences proches/transférables
3. Autres compétences pertinentes

### 2. CoverLetter.tex
Structure optimisée:
1. **Accroche personnalisée** (2-3 phrases): Pourquoi ${analysisResult.company} spécifiquement
2. **"Pourquoi moi"** (1 paragraphe): Les 3 raisons principales de m'embaucher
3. **Preuve technique** (1 paragraphe): UN projet concret avec métriques qui prouve la compétence
4. **Gaps comblés** (1 paragraphe): Pour les stratégies "fast_learner" ou "transferable"
5. **Conclusion** (2 phrases): Motivation + disponibilité

## TEMPLATE CV ATS-OPTIMISÉ (v4.0 - CV PARFAIT)
% Format optimisé pour les systèmes ATS - pas d'icônes, pas de couleurs, single column
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[top=1.2cm,bottom=1.2cm,left=1.8cm,right=1.8cm]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{parskip}

% Configuration ATS-friendly
\\hypersetup{colorlinks=false,pdfborder={0 0 0}}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.2em}
\\pagestyle{empty}

% Sections avec ligne simple
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\hrule]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}

\\begin{document}

% ===== EN-TÊTE =====
\\begin{center}
{\\LARGE\\bfseries ${candidateName.toUpperCase()}}\\\\[4pt]
{\\large ${analysisResult.jobTitle}}\\\\[6pt]
${cvData.personalInfo.email || "email@exemple.com"} \\textbar{} ${cvData.personalInfo.phone || "+33 6 XX XX XX XX"} \\textbar{} ${cvData.personalInfo.location || "France"}\\\\
${cvData.personalInfo.linkedinUrl ? cvData.personalInfo.linkedinUrl.replace("https://", "") : ""} ${cvData.personalInfo.githubUrl ? "\\textbar{} " + cvData.personalInfo.githubUrl.replace("https://", "") : ""}
\\end{center}

\\vspace{0.2cm}

% ===== POURQUOI MOI (SECTION CRITIQUE) =====
\\section{Pourquoi Moi}
% Cette section doit convaincre en 6 SECONDES. 3-4 lignes MAX.
% Structure: Années d'expérience + Expertise principale + Compétences clés de l'offre + Élément différenciant
[GÉNÈRE ICI: Développeur avec X années d'expérience en [domaine de l'offre]. Expertise approfondie en [compétences matchées]. Maîtrise de [mots-clés EXACTS de l'offre]. [Métrique ou réalisation impressionnante].]

% ===== COMPÉTENCES (triées par pertinence pour l'offre) =====
\\section{Compétences Techniques}
% ORDRE: 1) Compétences de l'offre en premier 2) Compétences proches 3) Autres
\\textbf{${analysisResult.keywords.slice(0, 3).join(", ")} :} [Les compétences qui matchent EXACTEMENT l'offre]\\\\
\\textbf{Frameworks \\& Outils :} [Autres compétences pertinentes]\\\\
\\textbf{Méthodologies :} [Agile, Scrum, etc. si mentionnés dans l'offre]

% ===== EXPÉRIENCE PROFESSIONNELLE (ORDRE DYNAMIQUE PAR PERTINENCE) =====
\\section{Expérience Professionnelle}
% IMPORTANT: Réordonne les expériences du candidat PAR PERTINENCE pour l'offre
% Position 1 = expérience la PLUS pertinente (pas forcément la plus récente)

% Pour chaque bullet point:
% - Utilise les MOTS-CLÉS EXACTS de l'offre
% - Ajoute des MÉTRIQUES (%, utilisateurs, €, temps)
% - Structure: [Verbe d'action] + [Technologie de l'offre] + [Résultat mesurable]

\\textbf{[Titre aligné sur l'offre]} \\hfill [Dates]\\\\
\\textit{[Entreprise], [Ville]}
\\begin{itemize}[leftmargin=1.5em,topsep=3pt,itemsep=1pt]
\\item [Verbe] [MOT-CLÉ OFFRE]: [Action] permettant [RÉSULTAT QUANTIFIÉ]
\\item [Verbe] [MOT-CLÉ OFFRE]: [Action] pour [X utilisateurs/clients]
\\item [Verbe] collaboration avec équipe de X personnes sur [projet utilisant technologies de l'offre]
\\end{itemize}

% Répète pour chaque expérience, ordonnées par pertinence décroissante

% ===== PROJETS (inclure projets perso, académiques, hackathons) =====
\\section{Projets}

% IMPORTANT: Inclure TOUS les projets collectés pendant l'entretien
% Même les projets perso/académiques si pertinents pour l'offre

\\textbf{[Nom du Projet]} -- \\textit{[Contexte: Professionnel/Personnel/Académique], [Année]}\\\\
[Description ciblée sur les besoins de l'offre]. Technologies: [MOTS-CLÉS OFFRE].\\\\
Résultat: [Métrique si disponible].

% ===== FORMATION =====
\\section{Formation}

\\textbf{[Diplôme]} \\hfill [Années]\\\\
\\textit{[École], [Ville]}\\\\
[Spécialisation pertinente pour l'offre si applicable]

% ===== LANGUES (si pertinent) =====
\\section{Langues}
[Langue 1] ([Niveau]) -- [Langue 2] ([Niveau])

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

// ==================== PROMPT 9: INTERVIEW PREP SECTION 1 - JOB SUMMARY ====================

export function getInterviewPrepSection1Prompt(
  jobOffer: { title: string | null; company: string | null; rawText: string },
  interviewType: "technical" | "hr" | "manager"
): string {
  const typeEmphasis = {
    technical: "Mets l'accent sur les competences techniques requises et les technologies mentionnees.",
    hr: "Mets l'accent sur les soft skills, la culture d'entreprise et les valeurs.",
    manager: "Mets l'accent sur les responsabilites de leadership et la vision strategique.",
  };

  return `Tu es un expert en preparation d'entretien avec 15 ans d'experience.

## OFFRE D'EMPLOI
Titre: ${jobOffer.title || "Non specifie"}
Entreprise: ${jobOffer.company || "Non specifiee"}

Description complete:
"""
${jobOffer.rawText}
"""

## TYPE D'ENTRETIEN
${interviewType.toUpperCase()} - ${typeEmphasis[interviewType]}

## MISSION
Genere la Section 1 "Resume de l'Offre" du document de preparation d'entretien.

Cette section doit inclure:
1. **En-tete**: Titre du poste et entreprise
2. **Resume executif**: 2-3 phrases resumant le role
3. **Responsabilites cles**: Liste des 5-7 principales missions
4. **Competences requises**: Liste hierarchisee (essentielles vs nice-to-have)
5. **Indices culturels**: Ce que l'offre revele sur la culture d'entreprise

IMPORTANT: Genere UNIQUEMENT du LaTeX valide. Utilise \\section, \\subsection, itemize, et textbf.
Echappe tous les caracteres speciaux LaTeX: \\& \\% \\# \\$ \\_ \\{ \\}

Commence directement par:
\\section{Resume de l'Offre}
`;
}

// ==================== PROMPT 10: INTERVIEW PREP SECTION 2 - MATCH ANALYSIS ====================

export function getInterviewPrepSection2Prompt(
  cvData: CVData,
  analysisResult: AnalysisResult,
  gapSlots: GapSlot[],
  interviewType: "technical" | "hr" | "manager"
): string {
  const matchingSkills = analysisResult.matchedSkills || [];
  const gaps = analysisResult.gaps || [];
  const score = analysisResult.score || 0;

  // Build strategies summary
  const strategiesSummary = gapSlots
    .filter((slot) => slot.strategy)
    .map((slot) => `- ${slot.skill}: ${slot.strategy!.approach} - ${slot.strategy!.details}`)
    .join("\n");

  // Extract projects evidence from CV
  const projectsEvidence = cvData.projects
    .slice(0, 5)
    .map((p) => `- ${p.name} (${p.year}): ${p.description} [${p.techStack.join(", ")}]`)
    .join("\n");

  // Extract experience evidence
  const experienceEvidence = cvData.experiences
    .slice(0, 3)
    .map((e) => `- ${e.title} @ ${e.company}: ${e.bullets.slice(0, 2).join("; ")}`)
    .join("\n");

  return `Tu es un expert en preparation d'entretien.

## PROFIL DU CANDIDAT
Nom: ${cvData.personalInfo.fullName}
${JSON.stringify(cvData.personalInfo, null, 2)}

## EXPERIENCES CLES
${experienceEvidence}

## PROJETS CLES
${projectsEvidence}

## COMPETENCES CORRESPONDANTES
${matchingSkills.map((s) => `- ${s}`).join("\n")}

## GAPS IDENTIFIES
${gaps.map((g) => `- ${g.skill} (${g.severity}): ${g.suggestion}`).join("\n")}

## STRATEGIES VALIDEES
${strategiesSummary || "Aucune strategie validee"}

## SCORE DE MATCH
${score}%

## TYPE D'ENTRETIEN
${interviewType.toUpperCase()}

## MISSION
Genere la Section 2 "Analyse de Match" du document de preparation.

Cette section doit inclure:
1. **Score global**: Affichage visuel du score avec interpretation
2. **Points forts a mettre en avant**: Top 3-5 skills avec preuves concretes du CV
3. **Gaps et strategies**: Comment aborder chaque gap identifie
4. **Arguments cles**: 3 phrases d'accroche pour l'entretien

Pour chaque point fort, cite un exemple CONCRET du CV (projet, experience, metrique).
Pour chaque gap, indique la strategie a utiliser pendant l'entretien.

IMPORTANT: Genere UNIQUEMENT du LaTeX valide.
Echappe tous les caracteres speciaux LaTeX: \\& \\% \\# \\$ \\_ \\{ \\}

Commence directement par:
\\section{Analyse de Match}
`;
}

// ==================== PROMPT 11: INTERVIEW PREP SECTION 3 - PERSONAL PITCH SCRIPTS ====================

export function getInterviewPrepSection3Prompt(
  cvData: CVData,
  jobOffer: { title: string | null; company: string | null; rawText: string },
  interviewType: "technical" | "hr" | "manager"
): string {
  const typeEmphasis = {
    technical: `
      - Mets l'accent sur les realisations techniques et les projets
      - Cite des technologies specifiques et des metriques de performance
      - Montre la progression technique et l'expertise`,
    hr: `
      - Mets l'accent sur les valeurs, la motivation et le fit culturel
      - Inclus des exemples de collaboration et de soft skills
      - Montre l'alignement avec la mission de l'entreprise`,
    manager: `
      - Mets l'accent sur le leadership et la vision strategique
      - Inclus des exemples de gestion d'equipe et de prise de decision
      - Montre la capacite a avoir un impact business`,
  };

  // Extract experiences for pitch content
  const experiencesText = cvData.experiences
    .slice(0, 4)
    .map(
      (exp) => `
- ${exp.title} chez ${exp.company} (${exp.startDate} - ${exp.endDate})
  ${exp.bullets.slice(0, 3).map((b) => `  • ${b}`).join("\n")}`
    )
    .join("\n");

  // Extract projects for pitch content
  const projectsText =
    cvData.projects
      .slice(0, 3)
      .map((p) => `- ${p.name}: ${p.description} (${p.techStack.join(", ")})`)
      .join("\n") || "Non specifies";

  // Extract education
  const educationText = cvData.education
    .map((e) => `- ${e.degree} - ${e.school}`)
    .join("\n");

  return `Tu es un coach en preparation d'entretien avec 15 ans d'experience.

## PROFIL DU CANDIDAT
Nom: ${cvData.personalInfo.fullName}

### Experiences
${experiencesText}

### Projets Cles
${projectsText}

### Formation
${educationText}

### Competences
- Langages: ${cvData.skills.languages.join(", ") || "Non specifies"}
- Frameworks: ${cvData.skills.frameworks.join(", ") || "Non specifies"}
- Outils: ${cvData.skills.toolsAndCloud.join(", ") || "Non specifies"}

## OFFRE CIBLEE
Poste: ${jobOffer.title || "Non specifie"}
Entreprise: ${jobOffer.company || "Non specifiee"}

Description:
"""
${jobOffer.rawText.slice(0, 1500)}
"""

## TYPE D'ENTRETIEN: ${interviewType.toUpperCase()}
${typeEmphasis[interviewType]}

## MISSION
Genere la Section 3 "Scripts de Pitch Personnel" avec DEUX versions:

### VERSION 1 MINUTE (~150 mots)
Structure OBLIGATOIRE:
- **PASSE** (20%): D'ou je viens, formation cle
- **PRESENT** (50%): Ce que je fais maintenant, expertise actuelle
- **FUTUR** (30%): Pourquoi ce poste, ce que j'apporte

### VERSION 3 MINUTES (~450 mots)
Structure OBLIGATOIRE:
- **PASSE** (25%): Parcours detaille, moments cles
- **PRESENT** (40%): Role actuel, realisations concretes avec metriques
- **FUTUR** (35%): Vision pour ce poste, contribution envisagee

## REGLES CRITIQUES - HONNETETE RADICALE
1. **N'invente RIEN** - utilise UNIQUEMENT les donnees du CV fournies
2. **PERSONNALISE** - Chaque phrase doit etre specifique a CE candidat
3. **CONNECTE** - Relie l'experience au poste cible
4. **NATUREL** - Le script doit sonner comme une conversation, pas une recitation
5. **ADAPTE AU TYPE** - Ajuste l'emphase selon le type d'entretien (${interviewType})

## FORMAT LATEX ATTENDU

\\section{Scripts de Pitch Personnel}

\\subsection{Version 1 Minute}
\\textit{Pour les introductions rapides et les premiers echanges}

\\begin{quote}
\\textbf{PASSE:} [1-2 phrases sur le parcours - UTILISE les vraies donnees du CV]

\\textbf{PRESENT:} [2-3 phrases sur l'expertise actuelle - CITE les vraies experiences]

\\textbf{FUTUR:} [1-2 phrases sur la motivation pour ce poste]
\\end{quote}

\\vspace{0.5em}
\\textit{Duree estimee: 1 minute | $\\sim$150 mots}

\\subsection{Version 3 Minutes}
\\textit{Pour "Parlez-moi de vous" et presentations detaillees}

\\begin{quote}
\\textbf{PASSE}

[Paragraphe detaille sur le parcours - 2-3 phrases avec VRAIES donnees]

\\textbf{PRESENT}

[Paragraphe sur le role actuel et les realisations - 3-4 phrases avec metriques REELLES]

\\textbf{FUTUR}

[Paragraphe sur la vision et contribution - 2-3 phrases]
\\end{quote}

\\vspace{0.5em}
\\textit{Duree estimee: 3 minutes | $\\sim$450 mots}

\\subsection{Points Cles a Retenir}
\\begin{itemize}
  \\item [Point fort 1 - extrait du CV]
  \\item [Point fort 2 - extrait du CV]
  \\item [Point fort 3 - extrait du CV]
\\end{itemize}

\\subsection{Conseils de Presentation}
\\begin{tcolorbox}[tipbox]
[Conseil specifique au type d'entretien ${interviewType}]
\\end{tcolorbox}

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Commence directement par \\section{Scripts de Pitch Personnel}
`;
}

// ==================== PROMPT 12: INTERVIEW PREP SECTION 4 - TECHNICAL QUESTIONS ====================

export function getInterviewPrepSection4Prompt(
  cvData: CVData,
  analysisResult: AnalysisResult,
  interviewType: "technical" | "hr" | "manager"
): string {
  // Extract required skills from keywords and gaps
  const requiredSkills = [
    ...new Set([
      ...analysisResult.keywords.slice(0, 10),
      ...analysisResult.gaps.map((g) => g.skill),
    ]),
  ];

  const matchedSkills = analysisResult.matchedSkills || [];

  // Build evidence map: skill -> evidence from CV
  const evidenceBySkill: Record<string, string[]> = {};

  for (const skill of requiredSkills) {
    const evidence: string[] = [];
    const skillLower = skill.toLowerCase();

    // Find in projects
    cvData.projects?.forEach((project) => {
      const techMatch = project.techStack.some((t) =>
        t.toLowerCase().includes(skillLower) || skillLower.includes(t.toLowerCase())
      );
      const descMatch = project.description.toLowerCase().includes(skillLower);

      if (techMatch || descMatch) {
        evidence.push(
          `[Projet ${project.name}]: ${project.description} (Stack: ${project.techStack.join(", ")})`
        );
      }
    });

    // Find in experiences
    cvData.experiences.forEach((exp) => {
      exp.bullets.forEach((bullet) => {
        if (bullet.toLowerCase().includes(skillLower)) {
          evidence.push(`[${exp.company} - ${exp.title}]: ${bullet}`);
        }
      });
    });

    // Find in skills
    const allSkills = [
      ...cvData.skills.languages,
      ...cvData.skills.frameworks,
      ...cvData.skills.toolsAndCloud,
      ...cvData.skills.aiAndData,
    ];
    const directSkillMatch = allSkills.find(
      (s) => s.toLowerCase().includes(skillLower) || skillLower.includes(s.toLowerCase())
    );
    if (directSkillMatch && evidence.length === 0) {
      evidence.push(`[Competence declaree]: ${directSkillMatch}`);
    }

    evidenceBySkill[skill] = evidence;
  }

  // Question count and focus by interview type
  const questionConfig = {
    technical: {
      count: "5-7 questions par competence",
      focus: "implementation detaillee, architecture, debugging, optimisation",
      depth: "Profondeur technique maximale avec code et concepts avances",
    },
    hr: {
      count: "2-3 questions par competence",
      focus: "approche de resolution de problemes, apprentissage, collaboration",
      depth: "Niveau conceptuel, focus sur le raisonnement et les soft skills",
    },
    manager: {
      count: "3-4 questions par competence",
      focus: "impact business, decisions architecturales, trade-offs",
      depth: "Vision strategique et capacite de decision",
    },
  };

  const config = questionConfig[interviewType];

  // Format evidence for prompt
  const evidenceSection = Object.entries(evidenceBySkill)
    .map(
      ([skill, evidence]) => `
### ${skill}
${evidence.length > 0 ? evidence.map((e) => `- ${e}`).join("\n") : "- Pas de preuve directe dans le CV (suggerer approche transferable)"}`
    )
    .join("\n");

  // Format projects for reference
  const projectsSection =
    cvData.projects
      ?.slice(0, 5)
      .map(
        (p) =>
          `- **${p.name}** (${p.year || "N/A"}): ${p.description}\n  Stack: ${p.techStack.join(", ")}`
      )
      .join("\n") || "Aucun projet";

  // Format experiences for reference
  const experiencesSection = cvData.experiences
    .slice(0, 3)
    .map(
      (e) =>
        `- **${e.title}** @ ${e.company} (${e.startDate} - ${e.endDate})\n  ${e.bullets.slice(0, 2).join("\n  ")}`
    )
    .join("\n");

  return `Tu es un expert technique senior qui prepare des candidats pour des entretiens ${interviewType}.

## COMPETENCES REQUISES PAR L'OFFRE
${requiredSkills.map((s) => `- ${s}`).join("\n")}

## COMPETENCES CORRESPONDANTES DU CANDIDAT
${matchedSkills.map((s) => `- ${s}`).join("\n")}

## EVIDENCE DU CV POUR CHAQUE COMPETENCE
${evidenceSection}

## PROJETS DU CANDIDAT (pour reference dans les reponses)
${projectsSection}

## EXPERIENCES DU CANDIDAT (pour reference dans les reponses)
${experiencesSection}

## TYPE D'ENTRETIEN: ${interviewType.toUpperCase()}
- Nombre de questions: ${config.count}
- Focus: ${config.focus}
- Niveau de detail: ${config.depth}

## MISSION
Genere la Section 4 "Questions Techniques Anticipees" avec:

Pour CHAQUE competence requise (${requiredSkills.length} competences):
1. **Questions techniques typiques** (${config.count})
2. **Reponse suggeree** basee sur les preuves du CV
3. **Question de suivi** possible
4. **Pro Tip** pour cette competence

## REGLES CRITIQUES - HONNETETE RADICALE
1. Les reponses DOIVENT citer des projets/experiences REELS du CV
2. Inclure des metriques concretes quand disponibles dans le CV
3. Si pas de preuve directe, suggerer comment transferer une competence connexe
4. Ne JAMAIS inventer d'experience ou de metrique
5. Utiliser les noms EXACTS des projets et entreprises du CV

## FORMAT LATEX ATTENDU

\\section{Questions Techniques Anticipees}

\\textit{${config.count} - Focus: ${config.focus}}

\\subsection{[Nom de la Competence]}

\\textbf{Q1: [Question technique typique]}

\\textit{Reponse suggeree:}
\\begin{quote}
"[Reponse citant un projet/experience REEL du CV avec metriques si disponibles]"
\\end{quote}

\\textbf{Q2: [Question de suivi ou variante]}

\\textit{Reponse suggeree:}
\\begin{quote}
"[Reponse technique plus approfondie]"
\\end{quote}

% Continuer avec les autres questions selon le type d'entretien

\\begin{tcolorbox}[tipbox]
\\textbf{Pro Tip:} [Conseil pratique pour cette competence]
\\end{tcolorbox}

\\vspace{1em}

% Repeter pour chaque competence requise...

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Cite les vrais noms de projets et entreprises du CV
- Commence directement par \\section{Questions Techniques Anticipees}
`;
}

// ==================== PROMPT 14: INTERVIEW PREP SECTION 6 - TRAP QUESTIONS ====================

export function getInterviewPrepSection6Prompt(
  cvData: CVData,
  jobOffer: { title: string | null; company: string | null; rawText: string },
  interviewType: "technical" | "hr" | "manager"
): string {
  // Define standard trap questions with strategies
  const trapQuestions = [
    {
      id: "weakness",
      question: "Quelle est votre plus grande faiblesse?",
      strategy: "Mentionner une vraie faiblesse avec plan d'amelioration concret",
      whatTheySeek: "Conscience de soi, honnetete, capacite d'amelioration",
    },
    {
      id: "leaving",
      question: "Pourquoi quittez-vous votre poste actuel?",
      strategy: "Rester positif, focus sur la croissance et les opportunites",
      whatTheySeek: "Motivation positive, pas de negativite envers ex-employeur",
    },
    {
      id: "salary",
      question: "Quelles sont vos pretentions salariales?",
      strategy: "Donner une fourchette basee sur le marche, rester flexible",
      whatTheySeek: "Connaissance du marche, flexibilite, confiance",
    },
    {
      id: "conflict",
      question: "Parlez-moi d'un conflit avec un collegue",
      strategy: "Montrer la resolution constructive et l'apprentissage",
      whatTheySeek: "Intelligence emotionnelle, gestion des conflits",
    },
    {
      id: "failure",
      question: "Parlez-moi de votre plus grand echec professionnel",
      strategy: "Etre honnete sur l'echec, focus sur les lecons apprises",
      whatTheySeek: "Resilience, capacite d'apprentissage, humilite",
    },
    {
      id: "fiveYears",
      question: "Ou vous voyez-vous dans 5 ans?",
      strategy: "Montrer ambition alignee avec le poste et l'entreprise",
      whatTheySeek: "Vision, engagement a long terme, alignement",
    },
    {
      id: "whyUs",
      question: "Pourquoi voulez-vous travailler chez nous?",
      strategy: "Montrer recherche sur l'entreprise et alignement valeurs",
      whatTheySeek: "Interet genuint, preparation, fit culturel",
    },
    {
      id: "whyYou",
      question: "Pourquoi devrions-nous vous embaucher?",
      strategy: "Resume des points forts alignes avec les besoins du poste",
      whatTheySeek: "Confiance, valeur ajoutee, fit technique",
    },
  ];

  // Additional questions for HR interviews
  const hrExtraQuestions = [
    {
      id: "motivation",
      question: "Qu'est-ce qui vous motive au quotidien?",
      strategy: "Partager motivations authentiques liees au travail",
      whatTheySeek: "Motivation intrinseque, engagement",
    },
    {
      id: "stress",
      question: "Comment gerez-vous le stress?",
      strategy: "Donner methodes concretes et exemple de situation geree",
      whatTheySeek: "Resilience, methodes de gestion, maturite",
    },
  ];

  const questionCount = {
    technical: "4-5 questions pieges, focus sur honnetete technique",
    hr: "7-8 questions pieges, exploration approfondie",
    manager: "5-6 questions pieges, focus sur leadership et vision",
  };

  // Build questions list based on interview type
  let questionsToUse = [...trapQuestions];
  if (interviewType === "hr") {
    questionsToUse = [...trapQuestions, ...hrExtraQuestions];
  } else if (interviewType === "technical") {
    questionsToUse = trapQuestions.slice(0, 5);
  } else if (interviewType === "manager") {
    questionsToUse = trapQuestions.slice(0, 6);
  }

  // Extract relevant context from CV
  const currentJob = cvData.experiences[0];
  const yearsExperience = cvData.experiences.length;

  // Format experiences for context
  const experiencesText = cvData.experiences
    .slice(0, 3)
    .map(
      (exp) => `
- ${exp.title} chez ${exp.company} (${exp.startDate} - ${exp.endDate})
  ${exp.bullets.slice(0, 2).map((b) => `  • ${b}`).join("\n")}`
    )
    .join("\n");

  // Format projects for context
  const projectsText =
    cvData.projects
      ?.slice(0, 3)
      .map((p) => `- ${p.name}: ${p.description}`)
      .join("\n") || "Non specifies";

  return `Tu es un coach en preparation d'entretien expert en questions pieges.

## PROFIL DU CANDIDAT
Nom: ${cvData.personalInfo.fullName}
Poste actuel: ${currentJob?.title || "Non specifie"} chez ${currentJob?.company || "Non specifie"}
Experience totale: ~${yearsExperience} postes

### Competences cles
${cvData.skills?.languages?.join(", ") || "Non specifiees"}, ${cvData.skills?.frameworks?.join(", ") || ""}

### Experiences
${experiencesText}

### Projets
${projectsText}

## OFFRE CIBLEE
Poste: ${jobOffer.title || "Non specifie"}
Entreprise: ${jobOffer.company || "Non specifiee"}

Description:
"""
${jobOffer.rawText.slice(0, 1500)}
"""

## TYPE D'ENTRETIEN: ${interviewType.toUpperCase()}
Genere ${questionCount[interviewType]}

## QUESTIONS PIEGES A TRAITER
${questionsToUse.map((q) => `- **${q.question}**\n  Strategie: ${q.strategy}\n  Ce que le recruteur cherche: ${q.whatTheySeek}`).join("\n\n")}

## MISSION
Genere la Section 6 "Questions Pieges - Reponses Strategiques" avec:

Pour CHAQUE question:
1. **La question** du recruteur
2. **Pourquoi c'est piege**: Ce que le recruteur cherche vraiment
3. **Reponse strategique**: Honnete mais bien formulee, PERSONNALISEE au candidat
4. **A eviter**: Les erreurs classiques
5. **Exemple concret**: Base sur le profil du candidat

## REGLES CRITIQUES - HONNETETE RADICALE
1. **JAMAIS de mensonge**, meme strategique
2. **PERSONNALISE**: Chaque reponse doit refleter CE candidat et son CV
3. **CONSTRUCTIF**: Tourner les faiblesses en opportunites d'amelioration
4. **SPECIFIQUE**: Pas de reponses generiques type "je suis perfectionniste"
5. **CONCRET**: Utiliser des exemples REELS tires du CV

## FORMAT LATEX ATTENDU

\\section{Questions Pieges - Reponses Strategiques}

\\textit{Ces questions sont concues pour tester votre honnetete, votre conscience de soi et votre capacite a gerer des situations delicates.}

\\begin{tcolorbox}[highlight]
\\textbf{Cle du succes:} Repondez avec honnetete tout en montrant votre capacite de reflexion et d'amelioration.
\\end{tcolorbox}

\\subsection{Quelle est votre plus grande faiblesse?}

\\textbf{Ce que le recruteur cherche:}
\\begin{itemize}
  \\item Votre niveau de conscience de soi
  \\item Votre capacite a vous ameliorer
  \\item Votre honnetete
\\end{itemize}

\\textbf{Reponse strategique:}
\\begin{quote}
"[Reponse personnalisee basee sur le profil du candidat]..."
\\end{quote}

\\vspace{0.5em}
\\fbox{\\parbox{\\dimexpr\\linewidth-2\\fboxsep-2\\fboxrule}{
\\textbf{A eviter:} "Je suis perfectionniste" ou toute autre reponse cliche.
}}

\\begin{tcolorbox}[tipbox]
\\textbf{Conseil:} [Conseil specifique pour presenter cette reponse]
\\end{tcolorbox}

% Repeter pour chaque question piege...

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Personnalise CHAQUE reponse avec des elements du CV du candidat
- Adapte le nombre de questions au type d'entretien (${interviewType}: ${questionCount[interviewType]})
- Commence directement par \\section{Questions Pieges - Reponses Strategiques}
`;
}

// ==================== PROMPT 15: INTERVIEW PREP SECTION 7 - GAP STRATEGIES ====================

export function getInterviewPrepSection7Prompt(
  cvData: CVData,
  gapSlots: GapSlot[],
  interviewType: "technical" | "hr" | "manager"
): string {
  // Strategy descriptions for prompt context
  const strategyDescriptions: Record<string, string> = {
    transferable: "Mettre en avant une competence connexe qui demontre la capacite",
    fast_learner: "Souligner la capacite d'apprentissage rapide avec preuves",
    project_based: "Presenter un projet personnel ou formation en cours",
    reframe: "Reformuler le besoin pour montrer une competence equivalente",
    acknowledge_gap: "Reconnaitre honnetement le gap et presenter un plan d'action",
    add_skill: "Competence deja acquise (pas de gap reel)",
  };

  // Filter gaps that have strategies
  const gapsWithStrategies = gapSlots.filter((gap) => gap.strategy);

  // Build gaps section with all collected data
  const gapsSection = gapsWithStrategies.length > 0
    ? gapsWithStrategies
        .map((gap) => {
          const projectsInfo = gap.relatedProjects.length > 0
            ? gap.relatedProjects
                .map((p) => `  - ${p.name} (${p.context}): ${p.description}`)
                .join("\n")
            : "  Aucun projet identifie";

          const transferableInfo = gap.transferableSkills.length > 0
            ? gap.transferableSkills
                .map((t) => `  - ${t.skill} (de: ${t.fromExperience}, pertinence: ${t.relevanceScore}/10)`)
                .join("\n")
            : "  Aucune competence transferable identifiee";

          const learningInfo = gap.learningEvidence.length > 0
            ? gap.learningEvidence
                .map((l) => `  - ${l.type}: ${l.description}`)
                .join("\n")
            : "  Aucune preuve d'apprentissage";

          return `
### Gap: ${gap.skill}
- **Severite**: ${gap.severity}
- **Categorie**: ${gap.category}
- **Strategie choisie**: ${gap.strategy?.approach || "non definie"}
- **Description**: ${strategyDescriptions[gap.strategy?.approach || "acknowledge_gap"]}
- **Details**: ${gap.strategy?.details || "Non specifies"}
- **Preuves utilisees**: ${gap.strategy?.evidenceUsed?.join(", ") || "Aucune"}
- **Formulation suggeree**: ${gap.strategy?.suggestedPhrasing || "Non specifiee"}

**Projets lies:**
${projectsInfo}

**Competences transferables:**
${transferableInfo}

**Preuves d'apprentissage:**
${learningInfo}
`;
        })
        .join("\n")
    : "Aucun gap avec strategie validee. Concentrez-vous sur vos points forts.";

  // Format CV skills for reference
  const allSkills = [
    ...(cvData.skills?.languages || []),
    ...(cvData.skills?.frameworks || []),
    ...(cvData.skills?.toolsAndCloud || []),
    ...(cvData.skills?.aiAndData || []),
  ];

  // Format projects for reference
  const projectsText =
    cvData.projects
      ?.slice(0, 5)
      .map((p) => `- ${p.name}: ${p.description} (${p.techStack.join(", ")})`)
      .join("\n") || "Non specifies";

  // Gap depth by interview type
  const gapDepth = {
    technical: "Focus sur les gaps techniques, solutions concretes avec code/architecture",
    hr: "Focus sur la communication, montrer conscience de soi et plan d'action",
    manager: "Focus sur les gaps strategiques, vision et leadership",
  };

  return `Tu es un coach en preparation d'entretien expert en gestion de gaps de competences.

## GAPS IDENTIFIES ET STRATEGIES VALIDEES
${gapsSection}

## COMPETENCES DU CV (pour transferable skills)
${allSkills.join(", ") || "Non specifiees"}

## PROJETS DU CV (pour project_based)
${projectsText}

## TYPE D'ENTRETIEN: ${interviewType.toUpperCase()}
${gapDepth[interviewType]}

## MISSION
Genere la Section 7 "Strategies pour les Gaps Identifies" avec:

Pour CHAQUE gap identifie:
1. **Le gap**: Competence manquante
2. **Approche recommandee**: Comment en parler honnetement (${Object.keys(strategyDescriptions).join(", ")})
3. **Script suggere**: Phrase type a utiliser en entretien
4. **Preuve d'appui**: Element du CV qui soutient l'approche
5. **Plan d'action**: Ce que le candidat fait pour combler le gap

## REGLES CRITIQUES - HONNETETE RADICALE
1. **JAMAIS pretendre maitriser une competence non maitrisee**
2. **STRATEGIES VALIDEES**: Utiliser UNIQUEMENT les strategies definies dans les gapSlots
3. **ACTIONNABLE**: Chaque gap doit avoir un plan concret
4. **POSITIF**: Tourner les gaps en opportunites d'apprentissage
5. **PREUVES REELLES**: Utiliser les projets et competences REELS du CV

## TYPES DE STRATEGIES

| Strategy | Quand l'utiliser | Script type |
|----------|------------------|-------------|
| **transferable** | Competence similaire existe | "Je n'ai pas utilise X directement, mais j'ai N ans d'experience avec Y qui partage les memes concepts..." |
| **fast_learner** | Historique d'apprentissage rapide | "C'est nouveau pour moi, mais j'ai appris Z en 2 semaines pour un projet urgent chez [Company]..." |
| **project_based** | Projet perso/formation existe | "J'ai commence a explorer X dans un projet personnel. J'ai deja [achievement concret]..." |
| **reframe** | Competence equivalente differente | "Plutot que X, j'utilise Y qui atteint le meme objectif de [goal]..." |
| **acknowledge_gap** | Pas de mitigation possible | "Je n'ai pas encore cette competence, mais voici mon plan pour l'acquerir: [plan]..." |

## FORMAT LATEX ATTENDU

\\section{Strategies pour les Gaps Identifies}

\\textit{Comment aborder honnetement les competences que vous ne maitrisez pas encore.}

\\begin{tcolorbox}[highlight]
\\textbf{Rappel important:} L'honnetete est toujours appreciee. Montrez votre conscience de vos limites ET votre capacite a les combler.
\\end{tcolorbox}

\\subsection{[Nom du Skill Gap]}

\\textbf{Approche:} [transferable / fast\\_learner / project\\_based / reframe / acknowledge\\_gap]

\\textbf{Script suggere:}
\\begin{quote}
"[Phrase exacte a utiliser en entretien, personnalisee au candidat]"
\\end{quote}

\\textbf{Preuve d'appui:}
\\begin{itemize}
  \\item [Element du CV qui soutient cette approche]
\\end{itemize}

\\textbf{Plan d'action:}
\\begin{itemize}
  \\item [Etape concrete pour combler le gap]
  \\item [Timeline si pertinent]
\\end{itemize}

\\begin{tcolorbox}[tipbox]
\\textbf{Conseil:} [Conseil specifique pour presenter ce gap]
\\end{tcolorbox}

% Repeter pour chaque gap...

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Si aucun gap n'a de strategie, genere une section courte encourageante
- Adapte le niveau de detail au type d'entretien (${interviewType})
- Commence directement par \\section{Strategies pour les Gaps Identifies}
`;
}

// ==================== PROMPT 13: INTERVIEW PREP SECTION 5 - BEHAVIORAL QUESTIONS STAR ====================

/**
 * Extract behavioral experiences from CV data
 * Maps CV bullets to behavioral categories based on keywords
 */
function extractBehavioralPool(cvData: CVData): Record<string, string[]> {
  const pool: Record<string, string[]> = {
    leadership: [],
    conflict: [],
    failure: [],
    success: [],
    pressure: [],
    teamwork: [],
  };

  const keywords: Record<string, string[]> = {
    leadership: ["dirige", "lead", "gere", "initiative", "responsable", "pilote", "manage", "coordonne", "supervise", "encadre"],
    conflict: ["conflit", "desaccord", "difficulte", "negocie", "resolu", "mediation", "compromis"],
    failure: ["echec", "erreur", "appris", "ameliore", "challenge", "obstacle", "probleme", "defi"],
    success: ["reussi", "augmente", "ameliore", "optimise", "%", "performance", "atteint", "depasse", "objectif"],
    pressure: ["deadline", "urgence", "pression", "delai", "temps", "contrainte", "priorite"],
    teamwork: ["equipe", "collabore", "ensemble", "partenariat", "collectif", "groupe", "transverse"],
  };

  cvData.experiences.forEach((exp) => {
    exp.bullets.forEach((bullet) => {
      const lowerBullet = bullet.toLowerCase();
      for (const [category, words] of Object.entries(keywords)) {
        if (words.some((word) => lowerBullet.includes(word))) {
          pool[category].push(`[${exp.company}] ${bullet}`);
        }
      }
    });
  });

  // Also check projects for behavioral indicators
  cvData.projects?.forEach((project) => {
    const lowerDesc = project.description.toLowerCase();
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some((word) => lowerDesc.includes(word))) {
        pool[category].push(`[Projet ${project.name}] ${project.description}`);
      }
    }
  });

  return pool;
}

export function getInterviewPrepSection5Prompt(
  cvData: CVData,
  jobOffer: { title: string | null; company: string | null; rawText: string },
  interviewType: "technical" | "hr" | "manager"
): string {
  // Extract experiences with behavioral indicators
  const behavioralPool = extractBehavioralPool(cvData);

  const scenarioCount: Record<string, string> = {
    technical: "3-4 scenarios, focus sur resolution de problemes et collaboration technique",
    hr: "5-6 scenarios, focus sur soft skills, communication, et culture fit",
    manager: "4-5 scenarios, focus sur leadership, prise de decision, et gestion d'equipe",
  };

  const behavioralCategories = [
    { id: "leadership", label: "Leadership \\& Initiative", question: "Parlez-moi d'une fois ou vous avez pris l'initiative ou dirige un projet" },
    { id: "conflict", label: "Gestion de Conflit", question: "Decrivez une situation de conflit et comment vous l'avez geree" },
    { id: "failure", label: "Echec \\& Apprentissage", question: "Parlez-moi d'un echec et ce que vous en avez appris" },
    { id: "success", label: "Reussite \\& Impact", question: "Decrivez votre plus grande reussite professionnelle" },
    { id: "pressure", label: "Gestion du Stress", question: "Comment gerez-vous la pression et les deadlines serrees?" },
    { id: "teamwork", label: "Travail d'Equipe", question: "Donnez un exemple de collaboration reussie en equipe" },
  ];

  // Build evidence section from behavioral pool
  const evidenceSection = Object.entries(behavioralPool)
    .map(([category, evidence]) => {
      const categoryLabel = behavioralCategories.find((c) => c.id === category)?.label || category;
      return `### ${categoryLabel}
${evidence.length > 0 ? evidence.slice(0, 3).map((e) => `- ${e}`).join("\n") : "- Pas d'exemple direct identifie (adapter une experience connexe)"}`;
    })
    .join("\n\n");

  // Format experiences for the prompt
  const experiencesText = cvData.experiences
    .slice(0, 5)
    .map((exp) => `
**${exp.title} chez ${exp.company}** (${exp.startDate} - ${exp.endDate})
${exp.bullets.map((b) => `- ${b}`).join("\n")}`)
    .join("\n");

  // Format projects for the prompt
  const projectsText = cvData.projects
    ?.slice(0, 4)
    .map((p) => `- ${p.name}: ${p.description}`)
    .join("\n") || "Non specifies";

  return `Tu es un coach en preparation d'entretien expert en questions comportementales.

## PROFIL DU CANDIDAT
Nom: ${cvData.personalInfo.fullName}

### Experiences (source pour les scenarios STAR)
${experiencesText}

### Projets
${projectsText}

## EVIDENCE COMPORTEMENTALE IDENTIFIEE DANS LE CV
${evidenceSection}

## OFFRE CIBLEE
Poste: ${jobOffer.title || "Non specifie"}
Entreprise: ${jobOffer.company || "Non specifiee"}

## TYPE D'ENTRETIEN: ${interviewType.toUpperCase()}
Genere ${scenarioCount[interviewType]}

## CATEGORIES COMPORTEMENTALES
${behavioralCategories.map((c) => `- **${c.label}**: "${c.question}"`).join("\n")}

## MISSION
Genere la Section 5 "Questions Comportementales - Methode STAR" avec:

Pour CHAQUE scenario:
1. **Question type** du recruteur
2. **Reponse STAR formatee:**
   - **S - Situation**: Contexte precis (entreprise, periode, enjeux)
   - **T - Tache**: Ton role et responsabilite specifique
   - **A - Action**: Ce que TU as fait concretement (pas l'equipe)
   - **R - Resultat**: Impact mesurable si possible

3. **Competence demontree** (1 ligne)
4. **Conseil de presentation** (comment raconter efficacement)

## REGLES CRITIQUES - HONNETETE RADICALE
1. **CHAQUE scenario doit etre base sur une experience REELLE du CV** - utilise les preuves de la section "EVIDENCE COMPORTEMENTALE"
2. **SPECIFIQUE**: Pas de reponses generiques - cite des details concrets (noms d'entreprises, projets, dates)
3. **MESURABLE**: Inclure des metriques/chiffres quand disponibles dans le CV
4. **PERSONNEL**: Utiliser "j'ai" pas "nous avons" pour montrer le role du candidat
5. Si pas d'experience directe pour une categorie, indiquer comment adapter une experience similaire du CV
6. **NOMBRE DE SCENARIOS**:
   - HR: 5-6 scenarios (emphasize soft skills)
   - Technical: 3-4 scenarios (emphasize problem-solving)
   - Manager: 4-5 scenarios (emphasize leadership)

## FORMAT LATEX ATTENDU

\\section{Questions Comportementales - Methode STAR}

\\textit{La methode STAR vous aide a structurer vos reponses de maniere claire et impactante.}

\\begin{tcolorbox}[highlight]
\\textbf{Rappel STAR:}
\\begin{itemize}
  \\item \\textbf{S - Situation:} Contexte precis (20\\% du temps de reponse)
  \\item \\textbf{T - Tache:} Votre role specifique (10\\% du temps)
  \\item \\textbf{A - Action:} Ce que VOUS avez fait (50\\% du temps)
  \\item \\textbf{R - Resultat:} Impact mesurable (20\\% du temps)
\\end{itemize}
\\end{tcolorbox}

\\subsection{Leadership \\& Initiative}

\\textbf{Question type:} "Parlez-moi d'une fois ou vous avez pris l'initiative..."

\\begin{tcolorbox}[colback=blue!5,colframe=blue!40,title=Reponse STAR]
\\textbf{S - Situation:}
[Contexte precis avec nom d'entreprise et periode du CV]

\\textbf{T - Tache:}
[Role et responsabilite specifique extraits du CV]

\\textbf{A - Action:}
[Actions concretes que le candidat a prises - details du CV]

\\textbf{R - Resultat:}
[Impact mesurable avec metriques si disponibles]
\\end{tcolorbox}

\\vspace{0.5em}
\\fbox{\\parbox{\\dimexpr\\linewidth-2\\fboxsep-2\\fboxrule}{
\\textbf{Competence demontree:} [Competence cle mise en evidence]
}}

\\begin{tcolorbox}[tipbox]
\\textit{Conseil:} [Conseil pratique pour presenter cette reponse]
\\end{tcolorbox}

% Repeter pour chaque categorie comportementale selon le type d'entretien...

\\subsection{Gestion de Conflit}
% ...

\\subsection{Echec \\& Apprentissage}
% ...

\\subsection{Reussite \\& Impact}
% ...

\\subsection{Gestion du Stress}
% ...

\\subsection{Travail d'Equipe}
% ...

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Cite les vrais noms d'entreprises et projets du CV
- Adapte le nombre de scenarios au type d'entretien (${interviewType}: ${scenarioCount[interviewType]})
- Commence directement par \\section{Questions Comportementales - Methode STAR}
`;
}

// ==================== STORY 7.7: SECTION 8 - COMPANY RESEARCH ====================

import type { CompanySearchResults } from "./company-search";

/**
 * Task 3.1-3.4: Generate Section 8 - Company Research prompt
 * Includes web search results as context and generates actionable insights
 */
export function getInterviewPrepSection8Prompt(
  companyName: string,
  jobTitle: string,
  searchResults: CompanySearchResults,
  hasSearchResults: boolean
): string {
  if (!hasSearchResults) {
    return getCompanyResearchFallbackPrompt(companyName, jobTitle);
  }

  // Format search results for the prompt
  const cultureSection = searchResults.culture?.length
    ? searchResults.culture.join("\n")
    : "Non trouve";

  const valuesSection = searchResults.values?.length
    ? searchResults.values.join("\n")
    : "Non trouve";

  const newsSection = searchResults.recentNews?.length
    ? searchResults.recentNews
        .map((n) => `- [${n.date}] ${n.title}: ${n.summary}`)
        .join("\n")
    : "Non trouve";

  const competitorsSection = searchResults.competitors?.length
    ? searchResults.competitors.join(", ")
    : "Non trouve";

  return `Tu es un expert en recherche d'entreprise pour preparation d'entretien.

## ENTREPRISE CIBLEE
Nom: ${companyName}
Poste vise: ${jobTitle}

## DONNEES COLLECTEES (via recherche web)

### Description
${searchResults.description || "Non trouve"}

### Culture d'entreprise
${cultureSection}

### Valeurs
${valuesSection}

### Actualites recentes
${newsSection}

### Concurrents
${competitorsSection}

### Position sur le marche
${searchResults.marketPosition || "Non trouve"}

### Informations generales
- Effectifs: ${searchResults.employees || "Non trouve"}
- Fondation: ${searchResults.founded || "Non trouve"}
- Siege: ${searchResults.headquarters || "Non trouve"}
- Secteur: ${searchResults.industry || "Non trouve"}

## MISSION
Genere la Section 8 "Recherche Entreprise" avec:

1. **Profil de l'entreprise**: Resume structure (qui sont-ils, que font-ils)
2. **Culture et valeurs**: Ce qui semble important pour eux
3. **Actualites cles**: Ce qui se passe en ce moment (si disponible)
4. **Positionnement**: Ou se situe l'entreprise vs concurrents
5. **Points a mentionner en entretien**: 3-5 elements specifiques a evoquer
6. **Questions basees sur la recherche**: Questions intelligentes a poser

## REGLES CRITIQUES
1. **FACTUEL**: N'invente pas d'informations, utilise uniquement les donnees fournies
2. **PERTINENT**: Focus sur ce qui est utile pour l'entretien
3. **ACTIONNABLE**: Chaque info doit pouvoir servir en entretien
4. **RECENT**: Privilegier les infos recentes si disponibles

## FORMAT LATEX ATTENDU

\\section{Recherche Entreprise - ${escapeLatex(companyName)}}

\\subsection{Profil de l'Entreprise}
\\begin{itemize}
  \\item \\textbf{Secteur:} [Industry]
  \\item \\textbf{Fondee:} [Year]
  \\item \\textbf{Siege:} [Headquarters]
  \\item \\textbf{Effectifs:} [Employee count]
\\end{itemize}

[Brief company description]

\\subsection{Culture \\& Valeurs}
\\begin{itemize}
  \\item [Value 1 with explanation]
  \\item [Value 2 with explanation]
  \\item [Value 3 with explanation]
\\end{itemize}

\\textit{Ce que cela signifie pour l'entretien:} [How to demonstrate alignment]

\\subsection{Actualites Cles}
\\begin{itemize}
  \\item \\textbf{[Date]:} [News headline] - [Brief summary and relevance]
  \\item ...
\\end{itemize}

\\subsection{Positionnement Concurrentiel}
\\textbf{Principaux concurrents:} [Competitor 1], [Competitor 2], [Competitor 3]

[Brief analysis of market position]

\\subsection{Points a Mentionner en Entretien}
\\begin{enumerate}
  \\item [Specific point about company to reference]
  \\item [Recent achievement to congratulate them on]
  \\item [Alignment between your values and theirs]
\\end{enumerate}

\\subsection{Questions Basees sur la Recherche}
\\begin{itemize}
  \\item "[Smart question about recent news]"
  \\item "[Question about company culture/values]"
  \\item "[Question about market strategy]"
\\end{itemize}

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Commence directement par \\section{Recherche Entreprise - ${escapeLatex(companyName)}}
`;
}

/**
 * Task 4.1-4.4: Fallback prompt when search returns insufficient data
 * Generates generic company research checklist for manual research
 */
export function getCompanyResearchFallbackPrompt(
  companyName: string,
  jobTitle: string
): string {
  const displayCompany = companyName || "Non specifiee";

  return `Tu es un expert en preparation d'entretien.

## ENTREPRISE CIBLEE
Nom: ${displayCompany}
Poste vise: ${jobTitle}

## SITUATION
La recherche automatique n'a pas retourne suffisamment d'informations sur cette entreprise.

## MISSION
Genere la Section 8 "Recherche Entreprise" avec:

1. **Checklist de recherche manuelle**: Ou chercher des informations
   - Site officiel de l'entreprise
   - Page LinkedIn de l'entreprise
   - Glassdoor (avis employes)
   - Articles de presse recents
   - Profils LinkedIn des employes

2. **Questions a se poser**: Ce qu'il faut decouvrir
   - Quelle est leur mission/vision?
   - Quels sont leurs produits/services principaux?
   - Qui sont leurs clients types?
   - Quelle est leur culture d'entreprise?
   - Y a-t-il des actualites recentes?

3. **Points generiques a preparer**: En attendant plus d'infos
   - Pourquoi cette entreprise vous interesse
   - Comment vous pouvez contribuer
   - Questions a poser au recruteur

## FORMAT LATEX ATTENDU

\\section{Recherche Entreprise - Guide}

\\begin{tcolorbox}[warningbox, title={\\textbf{Recherche Manuelle Requise}}]
\\textit{La recherche automatique n'a pas retourne suffisamment d'informations sur ${escapeLatex(displayCompany)}.
Utilisez ce guide pour effectuer votre propre recherche.}
\\end{tcolorbox}

\\subsection{Checklist de Recherche}
\\begin{itemize}
  \\item[$\\square$] Site officiel de l'entreprise
  \\item[$\\square$] Page LinkedIn de l'entreprise
  \\item[$\\square$] Glassdoor (avis employes)
  \\item[$\\square$] Articles de presse recents
  \\item[$\\square$] Profils LinkedIn des employes actuels
\\end{itemize}

\\subsection{Questions a Se Poser}
\\begin{enumerate}
  \\item Quelle est leur mission/vision?
  \\item Quels sont leurs produits/services principaux?
  \\item Qui sont leurs clients types?
  \\item Quelle est leur culture d'entreprise?
  \\item Y a-t-il des actualites recentes importantes?
\\end{enumerate}

\\subsection{Points Generiques a Preparer}
\\begin{itemize}
  \\item \\textbf{Motivation:} Pourquoi cette entreprise vous interesse (meme sans details specifiques)
  \\item \\textbf{Contribution:} Comment vos competences peuvent les aider
  \\item \\textbf{Questions:} Preparez des questions pertinentes pour le recruteur
\\end{itemize}

\\subsection{Notes de Recherche}
\\textit{(Espace pour vos notes personnelles apres recherche manuelle)}

\\vspace{3cm}

\\rule{\\textwidth}{0.5pt}

\\vspace{3cm}

\\rule{\\textwidth}{0.5pt}

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Commence directement par \\section{Recherche Entreprise - Guide}
`;
}

/**
 * Helper function to escape LaTeX special characters
 */
function escapeLatex(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

// ==================== STORY 7.8: SECTION 9 - QUESTIONS FOR RECRUITER ====================

/**
 * Task 1.1-1.5: Generate Section 9 - Questions for Recruiter prompt
 * Generates intelligent questions to ask the recruiter across 5 categories:
 * - Role: Responsibilities, expectations
 * - Team: Collaboration, structure
 * - Growth: Career path, learning
 * - Company: Strategy, vision
 * - Process: Next steps, timeline
 * Also includes "Questions to Avoid" guidance
 */
export function getInterviewPrepSection9Prompt(
  jobOffer: { title: string | null; company: string | null; rawText: string },
  cvData: { experiences: { title: string; company: string }[]; skills?: { languages?: string[]; frameworks?: string[]; aiAndData?: string[]; toolsAndCloud?: string[]; softSkills?: string[] } },
  interviewType: "technical" | "hr" | "manager"
): string {
  const questionCategories = {
    role: "Questions sur le poste et les responsabilites",
    team: "Questions sur l'equipe et la collaboration",
    growth: "Questions sur l'evolution et le developpement",
    company: "Questions sur l'entreprise et sa vision",
    process: "Questions sur le processus de recrutement",
  };

  const typeEmphasis = {
    technical: "Focus sur les aspects techniques: stack, architecture, code review, dette technique, methodologies de developpement",
    hr: "Focus sur la culture, l'onboarding, l'equilibre vie pro/perso, les avantages, l'ambiance de travail",
    manager: "Focus sur la strategie, les objectifs d'equipe, le style de management, les KPIs, la vision produit",
  };

  const questionCount = {
    technical: "3 questions par categorie, plus detaillees sur role et team",
    hr: "2-3 questions par categorie, equilibrees",
    manager: "2-3 questions par categorie, plus detaillees sur company et growth",
  };

  const experienceLevel = cvData.experiences.length > 5 ? "Senior" : cvData.experiences.length > 2 ? "Confirme" : "Junior";

  return `Tu es un coach en preparation d'entretien expert en questions strategiques.

## POSTE CIBLE
Titre: ${jobOffer.title || "Non specifie"}
Entreprise: ${jobOffer.company || "Non specifiee"}

## OFFRE D'EMPLOI
${jobOffer.rawText.substring(0, 2000)}

## PROFIL DU CANDIDAT
Experience: ${cvData.experiences.length} postes
Niveau: ${experienceLevel}
Dernier poste: ${cvData.experiences[0]?.title || "Non specifie"} chez ${cvData.experiences[0]?.company || "Non specifie"}

## TYPE D'ENTRETIEN: ${interviewType.toUpperCase()}
${typeEmphasis[interviewType]}
Nombre de questions: ${questionCount[interviewType]}

## CATEGORIES DE QUESTIONS
${Object.entries(questionCategories).map(([k, v]) => `- **${k}**: ${v}`).join("\n")}

## MISSION
Genere la Section 9 "Questions a Poser au Recruteur" avec:

### Pour chaque categorie (role, team, growth, company, process):
1. **2-3 questions intelligentes** qui montrent:
   - Que vous avez fait vos recherches sur l'entreprise
   - Que vous reflechissez serieusement au poste
   - Votre interet pour reussir dans ce role
   - Votre niveau d'experience (${experienceLevel})

2. **Pourquoi cette question est pertinente** (1 ligne explicative)

### Section finale: Questions a eviter
- Liste de 4-5 questions a NE PAS poser en entretien
- Avec explication de pourquoi elles sont mal percues

## REGLES CRITIQUES
1. **INTELLIGENT**: Pas de questions basiques dont la reponse est sur le site web
2. **STRATEGIQUE**: Chaque question doit avoir un but (montrer interet, decouvrir info cle)
3. **ADAPTE**: Questions appropriees au niveau d'experience du candidat (${experienceLevel})
4. **OUVERTES**: Eviter les questions oui/non, privilegier les questions ouvertes
5. **TYPE-SPECIFIC**: Adapter les questions au type d'entretien (${interviewType})

## FORMAT LATEX ATTENDU

\\section{Questions a Poser au Recruteur}

\\textit{Poser des questions intelligentes montre votre interet et votre reflexion sur le poste.}

\\subsection{Sur le Poste}
\\begin{enumerate}
  \\item \\textbf{Question:} "[Smart question about role]"

  \\textit{Pourquoi: [Why this question is strategic]}

  \\item \\textbf{Question:} "[Another question]"

  \\textit{Pourquoi: [Explanation]}
\\end{enumerate}

\\subsection{Sur l'Equipe}
% 2-3 questions with explanations

\\subsection{Sur l'Evolution}
% 2-3 questions with explanations

\\subsection{Sur l'Entreprise}
% 2-3 questions with explanations

\\subsection{Sur le Processus}
% 2-3 questions with explanations

\\subsection{Questions a Eviter}
\\begin{tcolorbox}[warningbox, title={\\textbf{Ne Posez Pas Ces Questions}}]
\\begin{itemize}
  \\item[$\\times$] "[Bad question]" - \\textit{Pourquoi: [Explanation]}
  \\item[$\\times$] "[Another bad question]" - \\textit{Pourquoi: [Explanation]}
  \\item[$\\times$] "[Bad question 3]" - \\textit{Pourquoi: [Explanation]}
  \\item[$\\times$] "[Bad question 4]" - \\textit{Pourquoi: [Explanation]}
\\end{itemize}
\\end{tcolorbox}

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Les questions doivent etre personnalisees pour ${jobOffer.title || "ce poste"} chez ${jobOffer.company || "cette entreprise"}
- Commence directement par \\section{Questions a Poser au Recruteur}
`;
}

// ==================== STORY 7.8: SECTION 10 - TECHNICAL QUICK SHEETS ====================

/**
 * Task 2.1-2.5: Generate Section 10 - Technical Quick Sheets prompt
 * Generates technical refreshers on key technologies from the job offer
 * Each sheet includes: key concepts, trends, common questions, pitfalls
 * Adapted by interview type (Technical: 5-7 detailed, HR: 2-3 high-level, Manager: 3-4 architecture-focused)
 * Task 4.1-4.3: Personalized based on CV - marks technologies as "maitrise" or "a reviser"
 */
export function getInterviewPrepSection10Prompt(
  requiredSkills: string[],
  cvSkills: string[],
  interviewType: "technical" | "hr" | "manager"
): string {
  // Categorize technologies by comparing with CV skills
  const techStatus = requiredSkills.map((tech) => {
    const isStrength = cvSkills.some(
      (s) =>
        s.toLowerCase().includes(tech.toLowerCase()) ||
        tech.toLowerCase().includes(s.toLowerCase())
    );
    return {
      name: tech,
      status: isStrength ? "maitrise" : "a_reviser",
    };
  });

  const strengthTechs = techStatus.filter((t) => t.status === "maitrise");
  const reviewTechs = techStatus.filter((t) => t.status === "a_reviser");

  const sheetCount = {
    technical: "5-7 fiches detaillees avec exemples de code",
    hr: "2-3 fiches high-level, concepts principaux seulement",
    manager: "3-4 fiches focus architecture et decisions techniques",
  };

  const detailLevel = {
    technical: "DETAILLE - Incluez des snippets de code, comparaisons avec alternatives, cas d'usage specifiques",
    hr: "HIGH-LEVEL - Focus sur 'c'est quoi' et 'a quoi ca sert', pas de code",
    manager: "ARCHITECTURE - Focus sur les decisions techniques, trade-offs, scalabilite",
  };

  return `Tu es un expert technique senior qui prepare des fiches de revision pour entretien.

## TECHNOLOGIES REQUISES PAR L'OFFRE

### Technologies maitrisees par le candidat (rappel rapide)
${strengthTechs.map((t) => `- ${t.name} \\textcolor{green}{(Maitrise)}`).join("\n") || "Aucune identifiee"}

### Technologies a reviser (plus de detail necessaire)
${reviewTechs.map((t) => `- ${t.name} \\textcolor{orange}{(A reviser)}`).join("\n") || "Aucune identifiee"}

## TYPE D'ENTRETIEN: ${interviewType.toUpperCase()}
Genere ${sheetCount[interviewType]}
Niveau de detail: ${detailLevel[interviewType]}

## MISSION
Genere la Section 10 "Fiches Techniques Rapides" avec:

Pour CHAQUE technologie (priorise celles "a reviser"):

### Fiche [Technology Name]
1. **En une phrase**: C'est quoi et a quoi ca sert
2. **Concepts cles** (5-7 points):
   - Les fondamentaux a connaitre absolument
   - Termes techniques importants
3. **Tendances actuelles** (2-3 points):
   - Derniere version majeure et nouveautes
   - Best practices 2024-2025
4. **Questions d'entretien typiques** (3-4):
   - Questions courantes avec reponses suggerees
5. **Pieges a eviter**:
   - Erreurs communes a ne pas faire

${interviewType === "technical" ? `
### Pour entretien technique, ajoute aussi:
- **Code example** (snippet simple illustrant un concept cle)
- **Comparaison** avec technologies similaires
- **Cas d'usage** ou cette techno excelle vs alternatives
` : ""}

${interviewType === "manager" ? `
### Pour entretien manager, ajoute aussi:
- **Decisions architecturales** liees a cette techno
- **Trade-offs** a considerer (performance, maintenabilite, cout)
- **Scalabilite** considerations
` : ""}

## REGLES CRITIQUES
1. **CONCIS**: Fiches de revision, pas de cours complet
2. **PRATIQUE**: Focus sur ce qui tombe en entretien
3. **ACTUEL**: Informations a jour (2024-2025)
4. **MEMORISABLE**: Format facile a reviser rapidement
5. **PERSONNALISE**: Plus de detail pour les technologies "a reviser"

## FORMAT LATEX ATTENDU

\\section{Fiches Techniques Rapides}

\\textit{Rappels rapides sur les technologies cles du poste. Les technologies marquees \\textcolor{orange}{(A reviser)} necessitent plus d'attention.}

\\subsection{[Technology 1] \\hfill \\small{\\textcolor{green}{Maitrise}}}

\\textbf{En une phrase:} [Brief description]

\\textbf{Concepts cles:}
\\begin{itemize}
  \\item [Concept 1]
  \\item [Concept 2]
  \\item [Concept 3]
\\end{itemize}

\\textbf{Tendances 2024-2025:}
\\begin{itemize}
  \\item [Trend 1]
  \\item [Trend 2]
\\end{itemize}

\\textbf{Questions d'entretien:}
\\begin{enumerate}
  \\item \\textbf{Q:} "[Question]" \\\\
        \\textit{R:} "[Suggested answer]"
  \\item \\textbf{Q:} "[Question]" \\\\
        \\textit{R:} "[Suggested answer]"
\\end{enumerate}

\\vspace{0.5em}
\\fbox{\\parbox{\\dimexpr\\linewidth-2\\fboxsep-2\\fboxrule}{
\\textbf{Piege a eviter:} [Common mistake]
}}

\\subsection{[Technology 2] \\hfill \\small{\\textcolor{orange}{A reviser}}}
% More detailed for technologies to review...

IMPORTANT:
- Genere UNIQUEMENT du LaTeX valide
- Echappe tous les caracteres speciaux: \\& \\% \\# \\$ \\_ \\{ \\}
- N'inclus PAS de blocs markdown
- Adapte le nombre de fiches au type d'entretien (${interviewType}: ${sheetCount[interviewType]})
- Priorise les technologies "a reviser" dans l'ordre et le detail
- Commence directement par \\section{Fiches Techniques Rapides}
`;
}

// ==================== STORY 7.9: SECTIONS 11-12 ====================
// Re-export functions from dedicated file for Stories 7.9+

export {
  getInterviewPrepSection11Prompt,
  getInterviewPrepSection12Prompt,
  calculateSeniorityLevel,
} from "./prompts-section11-12";

// ==================== STORY 7.10: SECTIONS 13-14 ====================
// Re-export functions from dedicated file for Story 7.10

export {
  getInterviewPrepSection13Prompt,
  getInterviewPrepSection14Prompt,
} from "./prompts-section13-14";

// END OF FILE - Story 7.10 functions in prompts-section13-14.ts
