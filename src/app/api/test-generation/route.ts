import { NextResponse } from "next/server";
import { buildCVLatex } from "@/lib/latex-template";
import { compileDocuments } from "@/lib/latex-compiler";
import { generateContent } from "@/lib/gemini";
import type { CVData, AnalysisResult } from "@/lib/types";

// Mock analysis result for testing
function createMockAnalysisResult(cvData: CVData, jobDescription?: string): AnalysisResult {
  // Extract all skills from CV
  const allSkills: string[] = [
    ...(cvData.skills.languages || []),
    ...(cvData.skills.frameworks || []),
    ...(cvData.skills.aiAndData || []),
    ...(cvData.skills.toolsAndCloud || []),
    ...(cvData.skills.dynamicCategories?.flatMap(c => c.skills) || []),
  ];

  // Take some as "matched"
  const matchedSkills = allSkills.slice(0, Math.min(6, allSkills.length));

  // Extract job title from description if available
  let jobTitle = cvData.experiences[0]?.title || "Poste";
  let company = "Entreprise";

  if (jobDescription) {
    // Try to extract job title from first line or common patterns
    const titleMatch = jobDescription.match(/(?:poste|job|titre|position)\s*[:\-]?\s*([^\n]+)/i) ||
                       jobDescription.match(/^([^\n]{10,60})/);
    if (titleMatch) {
      jobTitle = titleMatch[1].trim().substring(0, 50);
    }

    // Try to extract company name
    const companyMatch = jobDescription.match(/(?:entreprise|company|société|chez)\s*[:\-]?\s*([^\n,]+)/i);
    if (companyMatch) {
      company = companyMatch[1].trim().substring(0, 30);
    }
  }

  return {
    score: 75,
    gaps: [],
    keywords: matchedSkills,
    matchedSkills,
    jobTitle,
    company,
    totalGapsFound: 0,
    gapsByPriority: {
      critical: [],
      moderate: [],
      minor: [],
    },
  };
}

// Calculate years of experience
function calculateYears(experiences: CVData["experiences"]): number {
  if (!experiences || experiences.length === 0) return 0;

  const years = experiences
    .map(exp => {
      const match = exp.startDate?.match(/(\d{4})/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((y): y is number => y !== null);

  if (years.length === 0) return 0;

  const earliestYear = Math.min(...years);
  const currentYear = new Date().getFullYear();

  return Math.max(0, currentYear - earliestYear);
}

// Generate AI-powered "Why Me" section
async function generateWhyMeAI(
  cvData: CVData,
  analysisResult: AnalysisResult,
  jobDescription?: string
): Promise<string> {
  const years = calculateYears(cvData.experiences);
  const topSkills = analysisResult.matchedSkills.slice(0, 6);

  // Extract key achievements from experiences
  const keyAchievements = cvData.experiences
    .flatMap(exp => exp.bullets || [])
    .filter(bullet => /\d+%|\d+x|\d+ |amélio|optimis|rédu|augment|créé|développ|lancé|implémenté|migr/i.test(bullet))
    .slice(0, 3);

  const prompt = `Tu es un expert en personal branding. Génère une section "Pourquoi Moi" PERCUTANTE pour ce CV.

## CONTEXTE
- Poste visé: ${analysisResult.jobTitle}
- Entreprise: ${analysisResult.company}
- Années d'expérience: ${years}
- Compétences clés: ${topSkills.join(", ")}

${jobDescription ? `## OFFRE D'EMPLOI
${jobDescription.substring(0, 1500)}` : ""}

## ACHIEVEMENTS DU CANDIDAT
${keyAchievements.length > 0 ? keyAchievements.map(a => `- ${a}`).join("\n") : "- Expérience solide dans le domaine"}

## EXPÉRIENCES
${cvData.experiences.slice(0, 2).map(exp => `- ${exp.title} chez ${exp.company} (${exp.startDate} - ${exp.endDate})`).join("\n")}

## RÈGLES STRICTES
1. **4 phrases maximum**, courtes et IMPACTANTES
2. **Phrase 1 = HOOK**: Commence par un CHIFFRE ou résultat concret (pas "X ans d'expérience")
3. **Phrase 2 = PROOF**: Mentionne 2-3 technologies clés avec \\textbf{skill}
4. **Phrase 3 = MATCH**: Ce que tu apportes à CE poste précis
5. **Phrase 4 = VALUE**: Ta proposition unique / différenciation

## INTERDIT
- "Passionné", "Motivé", "Dynamique" (BANNI)
- "Solide expérience en..." (trop vague)
- Phrases génériques applicables à n'importe qui

## EXEMPLES DE BON "POURQUOI MOI"
"APIs gérant 2M requêtes/jour en production. Expert \\textbf{TypeScript}/\\textbf{React}/\\textbf{Node.js} depuis 5 ans. Habitué aux équipes agiles et au code review exigeant. Mon atout: je livre, je documente, je forme."

"Pipelines traitant 500GB/jour sans incident. Maîtrise \\textbf{Python}/\\textbf{Spark}/\\textbf{AWS}. Expérience migration legacy vers cloud. Autonome du besoin métier au dashboard final."

## FORMAT
Réponds UNIQUEMENT avec le texte (4 phrases max). Pas de guillemets, pas de titre.`;

  try {
    const response = await generateContent(prompt);
    // Clean up the response
    let content = response
      .replace(/^["']|["']$/g, "")
      .replace(/^Pourquoi [Mm]oi\s*[:\-]?\s*/i, "")
      .replace(/^\*\*Pourquoi [Mm]oi\*\*\s*[:\-]?\s*/i, "")
      .trim();

    console.log("[Test Generation] AI Why Me generated:", content.substring(0, 100) + "...");
    return content;
  } catch (error) {
    console.error("[Test Generation] AI Why Me error:", error);
    // Fallback
    return buildBasicWhyMe(cvData, analysisResult, years);
  }
}

// Fallback basic "Why Me"
function buildBasicWhyMe(cvData: CVData, analysisResult: AnalysisResult, years: number): string {
  const topSkills = analysisResult.matchedSkills.slice(0, 4);
  const lines: string[] = [];

  if (years > 0 && cvData.experiences[0]) {
    lines.push(`${years} ans en ${cvData.experiences[0].title?.toLowerCase() || "développement"}.`);
  }

  if (topSkills.length > 0) {
    const skillsText = topSkills.slice(0, 3).map(s => `\\textbf{${s}}`).join(", ");
    lines.push(`Expertise en ${skillsText}.`);
  }

  if (cvData.projects?.length > 0) {
    lines.push(`Projets récents: ${cvData.projects[0].name}.`);
  }

  return lines.join(" ") || "Profil motivé et adaptable.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cvData = body.cvData as CVData;
    const jobDescription = body.jobDescription as string | undefined;

    if (!cvData) {
      return NextResponse.json(
        { success: false, error: "cvData requis" },
        { status: 400 }
      );
    }

    // Create mock analysis
    const analysisResult = createMockAnalysisResult(cvData, jobDescription);

    console.log(`[Test Generation] Profile type: ${cvData.profileType || "developer"}`);
    console.log(`[Test Generation] Job description: ${jobDescription ? "provided" : "none"}`);

    // Generate AI-powered "Why Me" content
    const whyMeContent = await generateWhyMeAI(cvData, analysisResult, jobDescription);

    // Generate LaTeX using template system
    const cvLatex = buildCVLatex(
      cvData,
      whyMeContent,
      analysisResult.matchedSkills,
      {
        language: "fr",
        maxExperiences: 4,
        maxProjects: 3,
      }
    );

    console.log(`[Test Generation] LaTeX generated: ${cvLatex.length} chars`);

    // Try to compile PDF
    let cvPdfBase64: string | undefined;
    let pdfError: string | undefined;

    try {
      // Create a simple cover letter for compilation
      const coverLatex = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[margin=2.5cm]{geometry}
\\begin{document}
\\textbf{Lettre de motivation test}

Ceci est une lettre de test pour ${cvData.personalInfo.fullName}.

Cordialement,
${cvData.personalInfo.fullName}
\\end{document}`;

      const { cvPdf } = await compileDocuments(cvLatex, coverLatex);
      cvPdfBase64 = cvPdf.toString("base64");
      console.log("[Test Generation] PDF compiled successfully");
    } catch (err) {
      pdfError = err instanceof Error ? err.message : "Erreur de compilation PDF";
      console.error("[Test Generation] PDF compilation failed:", pdfError);
    }

    return NextResponse.json({
      success: !!cvPdfBase64,
      cvLatex,
      cvPdfBase64,
      error: pdfError,
      whyMe: whyMeContent,
      profileType: cvData.profileType || "developer",
      matchedSkills: analysisResult.matchedSkills,
    });
  } catch (error) {
    console.error("[Test Generation] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur interne",
      },
      { status: 500 }
    );
  }
}
