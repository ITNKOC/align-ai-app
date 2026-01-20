"use server";

// ============================================
// ALIGN.AI - Interview Prep Actions v2.0
// Story 7.1: Interview Status Trigger & Type Selection
// Story 7.2: Job Offer Summary & Match Analysis
// ============================================

import { prisma } from "@/lib/db";
import { getSession } from "./auth-actions";
import { generateContent } from "@/lib/gemini";
import {
  getInterviewPrepSection1Prompt,
  getInterviewPrepSection2Prompt,
  getInterviewPrepSection3Prompt,
  getInterviewPrepSection4Prompt,
  getInterviewPrepSection5Prompt,
  getInterviewPrepSection6Prompt,
  getInterviewPrepSection7Prompt,
  getInterviewPrepSection8Prompt,
  getInterviewPrepSection9Prompt,
  getInterviewPrepSection10Prompt,
  getInterviewPrepSection11Prompt,
  getInterviewPrepSection12Prompt,
  getInterviewPrepSection13Prompt,
  getInterviewPrepSection14Prompt,
  calculateSeniorityLevel,
} from "@/lib/prompts";
import {
  extractCompanyInfo,
  searchCompanyInfo,
  hasValidSearchResults,
  type CompanySearchResults,
} from "@/lib/company-search";
import type { CVData, AnalysisResult, GapSlot } from "@/lib/types";

// ==================== TYPES ====================

export type InterviewType = "technical" | "hr" | "manager";
export type PrepStatus = "pending" | "generating" | "ready" | "failed";

export interface InterviewPrepSections {
  section1: string;
  section2: string;
  section3: string;
  section4: string;
  section5: string;
  section6: string;
  section7: string;
  section8: string;
  section9: string;
  section10: string;
  section11: string;
  section12: string;
  section13: string;
  section14: string;
}

export interface InterviewPrepResult {
  success: boolean;
  status?: PrepStatus;
  pdfBase64?: string;
  error?: string;
}

// ==================== MAIN ACTIONS ====================

/**
 * Start interview prep document generation (AC2)
 * This is the entry point - actual generation will be implemented in Stories 7.2-7.11
 */
export async function startInterviewPrepGeneration(
  applicationId: string,
  interviewType: InterviewType,
  interviewDate?: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    // Verify ownership
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          masterProfile: {
            userId: session.id,
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Candidature non trouvee" };
    }

    // Verify application is in interview_scheduled status
    if (application.status !== "interview_scheduled") {
      return {
        success: false,
        error: "L'application doit etre en statut 'Entretien programme'",
      };
    }

    // Update application with interview info and set prep status to generating
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        interviewType,
        interviewDate,
        interviewPrepStatus: "generating",
      },
    });

    // Story 7.2+: Generate interview prep document with all sections
    // Start async generation (don't await - allow immediate return)
    generateFullInterviewPrepDocument(applicationId).catch((err) => {
      console.error("[InterviewPrep] Background generation failed:", err);
    });

    return { success: true };
  } catch (error) {
    console.error("Start interview prep error:", error);
    return { success: false, error: "Erreur lors du demarrage de la preparation" };
  }
}

/**
 * Get current status of interview prep generation (AC3)
 * Used for polling during generation
 */
export async function getInterviewPrepStatus(
  applicationId: string
): Promise<InterviewPrepResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    // Verify ownership
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          masterProfile: {
            userId: session.id,
          },
        },
      },
      select: {
        interviewPrepStatus: true,
        interviewPrepPdf: true,
        interviewPrepError: true,
      },
    });

    if (!application) {
      return { success: false, error: "Candidature non trouvee" };
    }

    return {
      success: true,
      status: (application.interviewPrepStatus as PrepStatus) || "pending",
      pdfBase64: application.interviewPrepPdf
        ? Buffer.from(application.interviewPrepPdf).toString("base64")
        : undefined,
      error: application.interviewPrepError || undefined,
    };
  } catch (error) {
    console.error("Get interview prep status error:", error);
    return { success: false, error: "Erreur lors de la verification du statut" };
  }
}

/**
 * Reset interview prep to allow regeneration
 */
export async function resetInterviewPrep(
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    // Verify ownership
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          masterProfile: {
            userId: session.id,
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Candidature non trouvee" };
    }

    // Reset prep fields
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        interviewPrepStatus: "pending",
        interviewPrepPdf: null,
        interviewPrepLatex: null,
        interviewPrepError: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Reset interview prep error:", error);
    return { success: false, error: "Erreur lors de la reinitialisation" };
  }
}

// ==================== STORY 7.2: FULL DOCUMENT GENERATION ====================

/**
 * Generate the full interview prep document (background process)
 * Implements Sections 1-7 (Stories 7.2-7.6)
 * Future stories (7.7-7.11) will add additional sections
 */
async function generateFullInterviewPrepDocument(applicationId: string): Promise<void> {
  try {
    console.log("[InterviewPrep] Starting full document generation for:", applicationId);

    // Generate Sections 1-14
    const sectionsResult = await generateInterviewPrepSections1To10(applicationId);

    if (!sectionsResult.success || !sectionsResult.data) {
      throw new Error(sectionsResult.error || "Failed to generate sections");
    }

    const { section1, section2, section3, section4, section5, section6, section7, section8, section9, section10, section11, section12, section13, section14 } = sectionsResult.data;

    // Build the full LaTeX document with professional styling
    const fullLatex = buildInterviewPrepLatexDocument(section1, section2, section3, section4, section5, section6, section7, section8, section9, section10, section11, section12, section13, section14);

    console.log("[InterviewPrep] Full LaTeX document built, length:", fullLatex.length);

    // Store LaTeX source first (AC3 fallback requirement)
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        interviewPrepLatex: fullLatex,
      },
    });

    // Compile LaTeX to PDF with circuit breaker (AC1, AC2)
    console.log("[InterviewPrep] Compiling PDF...");
    const pdfResult = await compileInterviewPrepPdf(fullLatex);

    if (pdfResult.success && pdfResult.pdf) {
      // PDF compilation succeeded
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          interviewPrepPdf: pdfResult.pdf as any,
          interviewPrepStatus: "ready",
          interviewPrepError: null,
        },
      });
      console.log("[InterviewPrep] PDF compilation successful for:", applicationId);
    } else {
      // PDF compilation failed - LaTeX is still available as fallback (AC3)
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          interviewPrepStatus: "failed",
          interviewPrepError: pdfResult.error || "Compilation PDF echouee. Le fichier LaTeX est disponible en fallback.",
        },
      });
      console.log("[InterviewPrep] PDF compilation failed, LaTeX available as fallback:", applicationId);
    }
  } catch (error) {
    console.error("[InterviewPrep] Document generation failed:", error);

    // Update status to failed with error message
    try {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          interviewPrepStatus: "failed",
          interviewPrepError:
            error instanceof Error ? error.message : "Erreur inconnue lors de la generation",
        },
      });
    } catch (updateError) {
      console.error("[InterviewPrep] Failed to update error status:", updateError);
    }
  }
}

// ==================== STORY 7.11: PDF COMPILATION WITH CIRCUIT BREAKER ====================

const LATEXIA_URL = process.env.LATEX_API_URL || "https://latex.ytotech.com/builds/sync";
const MAX_RETRIES = 2;
const TIMEOUT_MS = 30000; // 30 seconds max (AC1)

/**
 * Compile LaTeX to PDF with circuit breaker pattern (2 retries, 30s timeout)
 * Implements AC1: compilation completes in < 30 seconds
 * Implements AC2: professionally formatted PDF
 */
async function compileInterviewPrepPdf(
  latex: string
): Promise<{ success: boolean; pdf?: Buffer; error?: string }> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[InterviewPrep] PDF compilation attempt ${attempt + 1}/${MAX_RETRIES + 1}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(LATEXIA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          compiler: "pdflatex",
          resources: [
            {
              path: "main.tex",
              content: latex,
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const pdf = Buffer.from(await response.arrayBuffer());
        console.log("[InterviewPrep] PDF compiled successfully, size:", pdf.length);
        return { success: true, pdf };
      } else {
        const errorText = await response.text();
        lastError = `Latexia error: ${response.status} - ${errorText.substring(0, 200)}`;
        console.error(`[InterviewPrep] Latexia API error:`, lastError);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        lastError = "Timeout: la compilation a pris trop de temps (> 30s)";
        console.error("[InterviewPrep] Compilation timeout");
      } else {
        lastError = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[InterviewPrep] Compilation error:", lastError);
      }
    }

    // Wait before retry with exponential backoff
    if (attempt < MAX_RETRIES) {
      const waitTime = 1000 * (attempt + 1);
      console.log(`[InterviewPrep] Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  return { success: false, error: lastError };
}

/**
 * Build the full LaTeX document with professional styling
 * Template for interview preparation document (Sections 1-14 for Stories 7.2-7.10)
 */
function buildInterviewPrepLatexDocument(section1: string, section2: string, section3: string, section4: string, section5: string, section6: string, section7: string, section8: string, section9: string, section10: string, section11: string, section12: string, section13: string, section14: string): string {
  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage[top=2cm,bottom=2cm,left=2.5cm,right=2.5cm]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{parskip}
\\usepackage{xcolor}
\\usepackage{tcolorbox}
\\usepackage{fancyhdr}
\\usepackage{graphicx}

% ===== COLORS =====
\\definecolor{primary}{RGB}{79, 70, 229}
\\definecolor{secondary}{RGB}{99, 102, 241}
\\definecolor{success}{RGB}{34, 197, 94}
\\definecolor{warning}{RGB}{234, 179, 8}
\\definecolor{danger}{RGB}{239, 68, 68}
\\definecolor{lightgray}{RGB}{243, 244, 246}
\\definecolor{darkgray}{RGB}{55, 65, 81}

% ===== PAGE STYLE =====
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\textcolor{primary}{\\textbf{Align.ai}} - Document de Preparation d'Entretien}
\\fancyhead[R]{\\thepage}
\\fancyfoot[C]{\\textcolor{darkgray}{\\small Document genere par Align.ai}}
\\renewcommand{\\headrulewidth}{0.5pt}
\\renewcommand{\\footrulewidth}{0.5pt}

% ===== HYPERLINKS =====
\\hypersetup{
  colorlinks=true,
  linkcolor=primary,
  urlcolor=secondary,
}

% ===== SECTION STYLING =====
\\titleformat{\\section}
  {\\Large\\bfseries\\color{primary}}
  {\\thesection.}
  {0.5em}
  {}
  [\\vspace{-0.5em}\\rule{\\textwidth}{0.5pt}]

\\titleformat{\\subsection}
  {\\large\\bfseries\\color{darkgray}}
  {\\thesubsection}
  {0.5em}
  {}

% ===== CUSTOM BOXES =====
\\tcbset{
  highlight/.style={
    colback=lightgray,
    colframe=primary,
    boxrule=1pt,
    arc=3pt,
    left=10pt,
    right=10pt,
    top=8pt,
    bottom=8pt,
  },
  scorebox/.style={
    colback=primary!10,
    colframe=primary,
    boxrule=2pt,
    arc=5pt,
    width=5cm,
    halign=center,
  },
  tipbox/.style={
    colback=success!10,
    colframe=success,
    boxrule=1pt,
    arc=3pt,
    title={\\textbf{\\textcolor{success}{Conseil}}},
  },
  warningbox/.style={
    colback=warning!10,
    colframe=warning,
    boxrule=1pt,
    arc=3pt,
    title={\\textbf{\\textcolor{warning}{Attention}}},
  }
}

% ===== LIST STYLING =====
\\setlist[itemize]{
  leftmargin=1.5em,
  topsep=4pt,
  itemsep=2pt,
  parsep=0pt,
}

\\setlist[enumerate]{
  leftmargin=1.5em,
  topsep=4pt,
  itemsep=2pt,
  parsep=0pt,
}

\\begin{document}

% ===== TITLE PAGE =====
\\begin{center}
{\\Huge\\bfseries\\textcolor{primary}{Document de Preparation}}\\\\[0.5cm]
{\\LARGE\\textcolor{darkgray}{Entretien d'Embauche}}\\\\[1cm]
\\rule{0.8\\textwidth}{1pt}\\\\[1cm]
{\\large Genere par \\textbf{Align.ai}}\\\\[0.5cm]
{\\normalsize \\today}
\\end{center}

\\vspace{1cm}

% ===== TABLE OF CONTENTS PLACEHOLDER =====
\\begin{tcolorbox}[highlight]
\\textbf{Contenu de ce document:}
\\begin{enumerate}
  \\item \\textbf{Resume de l'Offre} - Ce que l'employeur recherche
  \\item \\textbf{Analyse de Match} - Vos forces et points a mettre en avant
  \\item \\textbf{Scripts de Pitch Personnel} - Versions 1 minute et 3 minutes
  \\item \\textbf{Questions Techniques Anticipees} - Questions par competence avec reponses
  \\item \\textbf{Questions Comportementales (STAR)} - Scenarios avec methode STAR
  \\item \\textbf{Questions Pieges} - Reponses strategiques et honnetes
  \\item \\textbf{Strategies pour les Gaps} - Comment aborder vos lacunes
  \\item \\textbf{Recherche Entreprise} - Culture, valeurs, actualites et concurrents
  \\item \\textbf{Questions a Poser au Recruteur} - Questions intelligentes par categorie
  \\item \\textbf{Fiches Techniques Rapides} - Rappels sur les technologies cles
  \\item \\textbf{Negociation Salariale} - Fourchettes de marche et strategies
  \\item \\textbf{Red Flags} - Signaux d'alerte a detecter
  \\item \\textbf{Checklists Pre-Entretien} - J-1 et Jour J (imprimables)
  \\item \\textbf{Template Notes Post-Entretien} - A remplir apres l'entretien
\\end{enumerate}
\\end{tcolorbox}

\\newpage

% ===== SECTION 1: JOB OFFER SUMMARY =====
${section1}

\\newpage

% ===== SECTION 2: MATCH ANALYSIS =====
${section2}

\\newpage

% ===== SECTION 3: PERSONAL PITCH SCRIPTS =====
${section3}

\\newpage

% ===== SECTION 4: TECHNICAL QUESTIONS =====
${section4}

\\newpage

% ===== SECTION 5: BEHAVIORAL QUESTIONS STAR =====
${section5}

\\newpage

% ===== SECTION 6: TRAP QUESTIONS (Story 7.6) =====
${section6}

\\newpage

% ===== SECTION 7: GAP STRATEGIES (Story 7.6) =====
${section7}

\\newpage

% ===== SECTION 8: COMPANY RESEARCH (Story 7.7) =====
${section8}

\\newpage

% ===== SECTION 9: QUESTIONS FOR RECRUITER (Story 7.8) =====
${section9}

\\newpage

% ===== SECTION 10: TECHNICAL QUICK SHEETS (Story 7.8) =====
${section10}

\\newpage

% ===== SECTION 11: SALARY NEGOTIATION (Story 7.9) =====
${section11}

\\newpage

% ===== SECTION 12: RED FLAGS (Story 7.9) =====
${section12}

\\newpage

% ===== SECTION 13: PRE-INTERVIEW CHECKLISTS (Story 7.10) =====
${section13}

\\newpage

% ===== SECTION 14: POST-INTERVIEW NOTES TEMPLATE (Story 7.10) =====
${section14}

\\end{document}
`;
}

// ==================== STORY 7.2-7.10: SECTIONS 1-14 GENERATION ====================

/**
 * Generate Interview Prep Sections 1-14 (Stories 7.2-7.10)
 * Section 1: Job Offer Summary - structured reminder of what the employer wants
 * Section 2: Match Analysis - candidate's strengths, score, and skills to highlight
 * Section 3: Personal Pitch Scripts - 1-minute and 3-minute versions with Past → Present → Future
 * Section 4: Technical Questions - anticipated questions with personalized answers
 * Section 5: Behavioral Questions STAR - behavioral scenarios with STAR method answers
 * Section 6: Trap Questions - strategic but honest answers for tricky questions
 * Section 7: Gap Strategies - honest approaches to address identified skill gaps
 * Section 8: Company Research - culture, values, news, and competitive positioning (Story 7.7)
 * Section 9: Questions for Recruiter - intelligent questions to ask by category (Story 7.8)
 * Section 10: Technical Quick Sheets - technology refreshers with concepts, trends, questions (Story 7.8)
 * Section 11: Salary Negotiation - market ranges and negotiation strategies (Story 7.9)
 * Section 12: Red Flags - warning signals and decision checklist (Story 7.9)
 * Section 13: Pre-Interview Checklists - J-1 and Day-of checklists with checkboxes (Story 7.10)
 * Section 14: Post-Interview Notes Template - printable template to fill after interview (Story 7.10)
 */
export async function generateInterviewPrepSections1To10(
  applicationId: string
): Promise<{ success: boolean; data?: InterviewPrepSections; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    // Load application with all related data
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          masterProfile: {
            userId: session.id,
          },
        },
      },
      include: {
        jobOffer: {
          include: {
            masterProfile: true,
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Candidature non trouvee" };
    }

    const interviewType = (application.interviewType as InterviewType) || "technical";
    const cvData = application.jobOffer.masterProfile.structuredData as unknown as CVData | null;
    const analysisResult = application.jobOffer.analysisResult as unknown as AnalysisResult | null;
    const gapSlots = (application.gapSlots as unknown as GapSlot[]) || [];

    // Validate required data
    if (!cvData) {
      return { success: false, error: "Donnees CV non disponibles" };
    }

    if (!analysisResult) {
      return { success: false, error: "Analyse de l'offre non disponible" };
    }

    console.log("[InterviewPrep] Generating Section 1 - Job Summary...");

    // Generate Section 1: Job Offer Summary
    const section1Prompt = getInterviewPrepSection1Prompt(
      {
        title: application.jobOffer.title,
        company: application.jobOffer.company,
        rawText: application.jobOffer.rawText,
      },
      interviewType
    );
    const section1 = await generateContent(section1Prompt);

    console.log("[InterviewPrep] Section 1 generated, length:", section1.length);
    console.log("[InterviewPrep] Generating Section 2 - Match Analysis...");

    // Generate Section 2: Match Analysis
    const section2Prompt = getInterviewPrepSection2Prompt(
      cvData,
      analysisResult,
      gapSlots,
      interviewType
    );
    const section2 = await generateContent(section2Prompt);

    console.log("[InterviewPrep] Section 2 generated, length:", section2.length);
    console.log("[InterviewPrep] Generating Section 3 - Personal Pitch Scripts...");

    // Generate Section 3: Personal Pitch Scripts (Story 7.3)
    const section3Prompt = getInterviewPrepSection3Prompt(
      cvData,
      {
        title: application.jobOffer.title,
        company: application.jobOffer.company,
        rawText: application.jobOffer.rawText,
      },
      interviewType
    );
    const section3 = await generateContent(section3Prompt);

    console.log("[InterviewPrep] Section 3 generated, length:", section3.length);
    console.log("[InterviewPrep] Generating Section 4 - Technical Questions...");

    // Generate Section 4: Technical Questions (Story 7.4)
    const section4Prompt = getInterviewPrepSection4Prompt(
      cvData,
      analysisResult,
      interviewType
    );
    const section4 = await generateContent(section4Prompt);

    console.log("[InterviewPrep] Section 4 generated, length:", section4.length);
    console.log("[InterviewPrep] Generating Section 5 - Behavioral Questions STAR...");

    // Generate Section 5: Behavioral Questions STAR (Story 7.5)
    const section5Prompt = getInterviewPrepSection5Prompt(
      cvData,
      {
        title: application.jobOffer.title,
        company: application.jobOffer.company,
        rawText: application.jobOffer.rawText,
      },
      interviewType
    );
    const section5 = await generateContent(section5Prompt);

    console.log("[InterviewPrep] Section 5 generated, length:", section5.length);
    console.log("[InterviewPrep] Generating Section 6 - Trap Questions...");

    // Generate Section 6: Trap Questions (Story 7.6)
    const section6Prompt = getInterviewPrepSection6Prompt(
      cvData,
      {
        title: application.jobOffer.title,
        company: application.jobOffer.company,
        rawText: application.jobOffer.rawText,
      },
      interviewType
    );
    const section6 = await generateContent(section6Prompt);

    console.log("[InterviewPrep] Section 6 generated, length:", section6.length);
    console.log("[InterviewPrep] Generating Section 7 - Gap Strategies...");

    // Generate Section 7: Gap Strategies (Story 7.6)
    const section7Prompt = getInterviewPrepSection7Prompt(
      cvData,
      gapSlots,
      interviewType
    );
    const section7 = await generateContent(section7Prompt);

    console.log("[InterviewPrep] Section 7 generated, length:", section7.length);
    console.log("[InterviewPrep] Generating Section 8 - Company Research...");

    // Generate Section 8: Company Research (Story 7.7)
    // Extract company info from job offer
    const companyInfo = extractCompanyInfo(
      application.jobOffer.company,
      application.jobOffer.location,
      application.jobOffer.rawText
    );

    // Search for company information if we have a valid company name
    let searchResults: CompanySearchResults = {};
    let hasSearchResultsValid = false;

    if (companyInfo.hasValidCompany && companyInfo.companyName) {
      console.log("[InterviewPrep] Searching for company info:", companyInfo.companyName);
      try {
        searchResults = await searchCompanyInfo(
          companyInfo.companyName,
          companyInfo.industry
        );
        hasSearchResultsValid = hasValidSearchResults(searchResults);
        console.log("[InterviewPrep] Search results valid:", hasSearchResultsValid);
      } catch (searchError) {
        console.error("[InterviewPrep] Company search failed:", searchError);
        // Will use fallback prompt
      }
    }

    const section8Prompt = getInterviewPrepSection8Prompt(
      companyInfo.companyName || application.jobOffer.company || "Non specifiee",
      application.jobOffer.title || "Non specifie",
      searchResults,
      hasSearchResultsValid
    );
    const section8 = await generateContent(section8Prompt);

    console.log("[InterviewPrep] Section 8 generated, length:", section8.length);
    console.log("[InterviewPrep] Generating Section 9 - Questions for Recruiter...");

    // Generate Section 9: Questions for Recruiter (Story 7.8)
    const section9Prompt = getInterviewPrepSection9Prompt(
      {
        title: application.jobOffer.title,
        company: application.jobOffer.company,
        rawText: application.jobOffer.rawText,
      },
      cvData,
      interviewType
    );
    const section9 = await generateContent(section9Prompt);

    console.log("[InterviewPrep] Section 9 generated, length:", section9.length);
    console.log("[InterviewPrep] Generating Section 10 - Technical Quick Sheets...");

    // Generate Section 10: Technical Quick Sheets (Story 7.8)
    // Extract all skills from CV for comparison
    const cvSkillsList: string[] = [
      ...(cvData.skills?.languages || []),
      ...(cvData.skills?.frameworks || []),
      ...(cvData.skills?.aiAndData || []),
      ...(cvData.skills?.toolsAndCloud || []),
    ];

    const section10Prompt = getInterviewPrepSection10Prompt(
      analysisResult.keywords || [],
      cvSkillsList,
      interviewType
    );
    const section10 = await generateContent(section10Prompt);

    console.log("[InterviewPrep] Section 10 generated, length:", section10.length);
    console.log("[InterviewPrep] Generating Section 11 - Salary Negotiation...");

    // Generate Section 11: Salary Negotiation (Story 7.9)
    // Calculate seniority level based on CV experience
    const seniorityLevel = calculateSeniorityLevel(cvData);
    console.log("[InterviewPrep] Detected seniority level:", seniorityLevel);

    const section11Prompt = getInterviewPrepSection11Prompt(
      {
        title: application.jobOffer.title,
        company: application.jobOffer.company,
        rawText: application.jobOffer.rawText,
      },
      cvData,
      seniorityLevel
    );
    const section11 = await generateContent(section11Prompt);

    console.log("[InterviewPrep] Section 11 generated, length:", section11.length);
    console.log("[InterviewPrep] Generating Section 12 - Red Flags...");

    // Generate Section 12: Red Flags (Story 7.9)
    const section12Prompt = getInterviewPrepSection12Prompt(
      {
        title: application.jobOffer.title,
        rawText: application.jobOffer.rawText,
      },
      interviewType
    );
    const section12 = await generateContent(section12Prompt);

    console.log("[InterviewPrep] Section 12 generated, length:", section12.length);
    console.log("[InterviewPrep] Generating Section 13 - Pre-Interview Checklists...");

    // Generate Section 13: Pre-Interview Checklists (Story 7.10)
    const section13Prompt = getInterviewPrepSection13Prompt(
      {
        title: application.jobOffer.title,
        company: application.jobOffer.company,
      },
      interviewType,
      application.interviewDate || undefined
    );
    const section13 = await generateContent(section13Prompt);

    console.log("[InterviewPrep] Section 13 generated, length:", section13.length);
    console.log("[InterviewPrep] Generating Section 14 - Post-Interview Notes Template...");

    // Generate Section 14: Post-Interview Notes Template (Story 7.10)
    const section14Prompt = getInterviewPrepSection14Prompt(
      {
        title: application.jobOffer.title,
        company: application.jobOffer.company,
      },
      interviewType
    );
    const section14 = await generateContent(section14Prompt);

    console.log("[InterviewPrep] Section 14 generated, length:", section14.length);

    return {
      success: true,
      data: {
        section1: cleanLatexSection(section1),
        section2: cleanLatexSection(section2),
        section3: cleanLatexSection(section3),
        section4: cleanLatexSection(section4),
        section5: cleanLatexSection(section5),
        section6: cleanLatexSection(section6),
        section7: cleanLatexSection(section7),
        section8: cleanLatexSection(section8),
        section9: cleanLatexSection(section9),
        section10: cleanLatexSection(section10),
        section11: cleanLatexSection(section11),
        section12: cleanLatexSection(section12),
        section13: cleanLatexSection(section13),
        section14: cleanLatexSection(section14),
      },
    };
  } catch (error) {
    console.error("Generate interview prep sections error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la generation",
    };
  }
}

/**
 * Generate Interview Prep Sections 1-8 (Stories 7.2-7.7) - Legacy function for backwards compatibility
 * Now redirects to generateInterviewPrepSections1To10 which includes all sections
 */
export async function generateInterviewPrepSections1To7(
  applicationId: string
): Promise<{ success: boolean; data?: InterviewPrepSections; error?: string }> {
  // Redirect to the full generation function that includes all sections
  return generateInterviewPrepSections1To10(applicationId);
}

/**
 * Generate Interview Prep Sections 1, 2, 3, 4 & 5 (Stories 7.2-7.5) - Legacy function for backwards compatibility
 * Now redirects to generateInterviewPrepSections1To10 which includes all sections
 */
export async function generateInterviewPrepSections1To5(
  applicationId: string
): Promise<{ success: boolean; data?: InterviewPrepSections; error?: string }> {
  // Redirect to the full generation function that includes all sections
  return generateInterviewPrepSections1To10(applicationId);
}

/**
 * Generate Interview Prep Sections 1, 2, 3 & 4 (Stories 7.2-7.4) - Legacy function for backwards compatibility
 * Now redirects to generateInterviewPrepSections1To10 which includes all sections
 */
export async function generateInterviewPrepSections1To4(
  applicationId: string
): Promise<{ success: boolean; data?: InterviewPrepSections; error?: string }> {
  // Redirect to the full generation function that includes all sections
  return generateInterviewPrepSections1To10(applicationId);
}

/**
 * Generate Interview Prep Sections 1 & 2 (Story 7.2) - Legacy function for backwards compatibility
 * Now redirects to generateInterviewPrepSections1To10 which includes all sections
 */
export async function generateInterviewPrepSections1And2(
  applicationId: string
): Promise<{ success: boolean; data?: InterviewPrepSections; error?: string }> {
  // Redirect to the full generation function that includes all sections
  return generateInterviewPrepSections1To10(applicationId);
}

/**
 * Generate Interview Prep Sections 1, 2 & 3 (Story 7.3) - Legacy function for backwards compatibility
 * Now redirects to generateInterviewPrepSections1To10 which includes all sections
 */
export async function generateInterviewPrepSections1To3(
  applicationId: string
): Promise<{ success: boolean; data?: InterviewPrepSections; error?: string }> {
  // Redirect to the full generation function that includes all sections
  return generateInterviewPrepSections1To10(applicationId);
}

/**
 * Clean and validate LaTeX section output
 * Removes markdown formatting and ensures valid LaTeX
 */
function cleanLatexSection(latex: string): string {
  let cleaned = latex.trim();

  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```(?:latex|tex)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/gi, "");

  // Ensure section starts with \section
  const sectionStart = cleaned.indexOf("\\section");
  if (sectionStart > 0) {
    cleaned = cleaned.substring(sectionStart);
  }

  return cleaned.trim();
}

// ==================== STORY 7.11: DOWNLOAD ENDPOINTS ====================

/**
 * Download interview prep PDF (AC2)
 * Returns PDF as base64 for client-side download
 */
export async function downloadInterviewPrepPdf(
  applicationId: string
): Promise<{ success: boolean; pdfBase64?: string; filename?: string; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    // Verify ownership
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          masterProfile: {
            userId: session.id,
          },
        },
      },
      select: {
        interviewPrepPdf: true,
        interviewPrepStatus: true,
        jobOffer: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Candidature non trouvee" };
    }

    if (application.interviewPrepStatus !== "ready" || !application.interviewPrepPdf) {
      return { success: false, error: "PDF non disponible. Utilisez le fallback LaTeX." };
    }

    // Generate filename from job info
    const safeName = `${application.jobOffer.company || "entreprise"}-${application.jobOffer.title || "poste"}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);

    return {
      success: true,
      pdfBase64: Buffer.from(application.interviewPrepPdf).toString("base64"),
      filename: `preparation-entretien-${safeName}.pdf`,
    };
  } catch (error) {
    console.error("Download PDF error:", error);
    return { success: false, error: "Erreur lors du telechargement du PDF" };
  }
}

/**
 * Download interview prep LaTeX source (AC3 fallback)
 * Returns LaTeX source for compilation elsewhere
 */
export async function downloadInterviewPrepLatex(
  applicationId: string
): Promise<{ success: boolean; latex?: string; filename?: string; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    // Verify ownership
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          masterProfile: {
            userId: session.id,
          },
        },
      },
      select: {
        interviewPrepLatex: true,
        jobOffer: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Candidature non trouvee" };
    }

    if (!application.interviewPrepLatex) {
      return { success: false, error: "Document LaTeX non disponible" };
    }

    // Generate filename from job info
    const safeName = `${application.jobOffer.company || "entreprise"}-${application.jobOffer.title || "poste"}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);

    return {
      success: true,
      latex: application.interviewPrepLatex,
      filename: `preparation-entretien-${safeName}.tex`,
    };
  } catch (error) {
    console.error("Download LaTeX error:", error);
    return { success: false, error: "Erreur lors du telechargement du LaTeX" };
  }
}

