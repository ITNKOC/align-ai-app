"use server";

// ============================================
// ALIGN.AI - Analysis Actions v2.0
// No gap limit - Full analysis with prioritization
// ============================================

import { prisma } from "@/lib/db";
import { generateJSON } from "@/lib/gemini";
import { getJobAnalysisPrompt } from "@/lib/prompts";
import type { CVData, AnalysisResult, GapAnalysis } from "@/lib/types";

// ==================== TYPES ====================

export interface AnalysisActionResult {
  success: boolean;
  jobOfferId?: string;
  applicationId?: string;
  analysisResult?: AnalysisResult;
  error?: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Sort gaps by priority: critical first, then by importance score
 */
function sortGapsByPriority(gaps: GapAnalysis[]): GapAnalysis[] {
  const severityOrder = { critical: 0, moderate: 1, minor: 2 };

  return [...gaps].sort((a, b) => {
    // First sort by severity
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;

    // Then by importance score (descending)
    const scoreA = a.importanceScore || 5;
    const scoreB = b.importanceScore || 5;
    return scoreB - scoreA;
  });
}

/**
 * Group gaps by priority level
 */
function groupGapsByPriority(gaps: GapAnalysis[]): {
  critical: GapAnalysis[];
  moderate: GapAnalysis[];
  minor: GapAnalysis[];
} {
  return {
    critical: gaps.filter((g) => g.severity === "critical"),
    moderate: gaps.filter((g) => g.severity === "moderate"),
    minor: gaps.filter((g) => g.severity === "minor"),
  };
}

/**
 * Ensure gap has all required fields with defaults
 */
function normalizeGap(gap: Partial<GapAnalysis>, index: number): GapAnalysis {
  return {
    skill: gap.skill || `Compétence ${index + 1}`,
    severity: gap.severity || "moderate",
    category: gap.category || "other",
    suggestion: gap.suggestion || "",
    importanceScore: gap.importanceScore || 5,
    relatedSkillsInCV: gap.relatedSkillsInCV || [],
    potentialTransferable: gap.potentialTransferable ?? false,
  };
}

// ==================== MAIN ACTIONS ====================

/**
 * Analyze job offer against candidate profile
 * NO LIMIT on gaps - returns all identified gaps
 */
export async function analyzeJobOffer(
  profileId: string,
  jobDescription: string,
  jobUrl?: string
): Promise<AnalysisActionResult> {
  try {
    // Get the master profile
    const profile = await prisma.masterProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return { success: false, error: "Profil non trouvé" };
    }

    const cvData = profile.structuredData as unknown as CVData;

    // Use Gemini to analyze the match - NO LIMIT on gaps
    const prompt = getJobAnalysisPrompt(cvData, jobDescription);
    const rawResult = await generateJSON<AnalysisResult>(prompt);

    // Normalize and sort gaps
    const normalizedGaps = (rawResult.gaps || []).map((gap, i) =>
      normalizeGap(gap, i)
    );
    const sortedGaps = sortGapsByPriority(normalizedGaps);
    const gapsByPriority = groupGapsByPriority(sortedGaps);

    // Build complete analysis result
    const analysisResult: AnalysisResult = {
      score: rawResult.score || 0,
      gaps: sortedGaps, // ALL gaps, sorted by priority
      keywords: rawResult.keywords || [],
      matchedSkills: rawResult.matchedSkills || [],
      jobTitle: rawResult.jobTitle || "Poste non spécifié",
      company: rawResult.company || "Entreprise non spécifiée",
      totalGapsFound: sortedGaps.length,
      gapsByPriority,
    };

    // Log analysis summary
    console.log(`[Analysis] Score: ${analysisResult.score}%`);
    console.log(`[Analysis] Total gaps: ${analysisResult.totalGapsFound}`);
    console.log(`[Analysis] Critical: ${gapsByPriority.critical.length}`);
    console.log(`[Analysis] Moderate: ${gapsByPriority.moderate.length}`);
    console.log(`[Analysis] Minor: ${gapsByPriority.minor.length}`);

    // Create JobOffer record
    const jobOffer = await prisma.jobOffer.create({
      data: {
        masterProfileId: profileId,
        rawText: jobDescription,
        jobUrl: jobUrl || null,
        title: analysisResult.jobTitle,
        company: analysisResult.company,
        requiredSkills: analysisResult.keywords,
        analysisResult: analysisResult as object,
      },
    });

    // Create Application record with dynamic gap count
    const application = await prisma.application.create({
      data: {
        jobOfferId: jobOffer.id,
        status: "analyzed",
        totalGaps: sortedGaps.length, // Dynamic, not fixed at 3
        gapsAddressed: 0,
        currentGapIndex: 0,
        gapSlots: [], // Will be initialized when chat starts
      },
    });

    return {
      success: true,
      jobOfferId: jobOffer.id,
      applicationId: application.id,
      analysisResult,
    };
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'analyse",
    };
  }
}

/**
 * Get job analysis for an application
 */
export async function getJobAnalysis(applicationId: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobOffer: {
          include: {
            masterProfile: true,
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Application non trouvée" };
    }

    const analysisResult = application.jobOffer
      .analysisResult as unknown as AnalysisResult;

    return {
      success: true,
      application: {
        id: application.id,
        status: application.status,
        chatHistory: application.chatHistory,
        strategies: application.strategies,
        gapSlots: application.gapSlots,
        currentGapIndex: application.currentGapIndex,
        gapsAddressed: application.gapsAddressed,
        totalGaps: application.totalGaps,
      },
      jobOffer: {
        id: application.jobOffer.id,
        title: application.jobOffer.title,
        company: application.jobOffer.company,
        analysisResult,
      },
      profile: {
        id: application.jobOffer.masterProfile.id,
        cvData: application.jobOffer.masterProfile
          .structuredData as unknown as CVData,
      },
    };
  } catch (error) {
    console.error("Get analysis error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Re-analyze with updated job description
 */
export async function reanalyzeJobOffer(
  applicationId: string,
  newJobDescription?: string
): Promise<AnalysisActionResult> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobOffer: {
          include: {
            masterProfile: true,
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Application non trouvée" };
    }

    const cvData = application.jobOffer.masterProfile
      .structuredData as unknown as CVData;
    const jobDescription = newJobDescription || application.jobOffer.rawText;

    // Re-run analysis
    const prompt = getJobAnalysisPrompt(cvData, jobDescription);
    const rawResult = await generateJSON<AnalysisResult>(prompt);

    // Process gaps
    const normalizedGaps = (rawResult.gaps || []).map((gap, i) =>
      normalizeGap(gap, i)
    );
    const sortedGaps = sortGapsByPriority(normalizedGaps);
    const gapsByPriority = groupGapsByPriority(sortedGaps);

    const analysisResult: AnalysisResult = {
      score: rawResult.score || 0,
      gaps: sortedGaps,
      keywords: rawResult.keywords || [],
      matchedSkills: rawResult.matchedSkills || [],
      jobTitle: rawResult.jobTitle || "Poste non spécifié",
      company: rawResult.company || "Entreprise non spécifiée",
      totalGapsFound: sortedGaps.length,
      gapsByPriority,
    };

    // Update records
    await prisma.jobOffer.update({
      where: { id: application.jobOfferId },
      data: {
        rawText: jobDescription,
        title: analysisResult.jobTitle,
        company: analysisResult.company,
        requiredSkills: analysisResult.keywords,
        analysisResult: analysisResult as object,
      },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "analyzed",
        totalGaps: sortedGaps.length,
        gapsAddressed: 0,
        currentGapIndex: 0,
        gapSlots: [],
        chatHistory: [],
        strategies: {},
      },
    });

    return {
      success: true,
      jobOfferId: application.jobOfferId,
      applicationId: application.id,
      analysisResult,
    };
  } catch (error) {
    console.error("Re-analysis error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la ré-analyse",
    };
  }
}

/**
 * Get gap statistics for an analysis
 */
export async function getGapStatistics(applicationId: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobOffer: true,
      },
    });

    if (!application) {
      return { success: false, error: "Application non trouvée" };
    }

    const analysisResult = application.jobOffer
      .analysisResult as unknown as AnalysisResult;

    const stats = {
      totalGaps: analysisResult.gaps.length,
      byPriority: {
        critical: analysisResult.gapsByPriority?.critical?.length || 0,
        moderate: analysisResult.gapsByPriority?.moderate?.length || 0,
        minor: analysisResult.gapsByPriority?.minor?.length || 0,
      },
      byCategory: {} as Record<string, number>,
      averageImportance:
        analysisResult.gaps.reduce(
          (sum, g) => sum + (g.importanceScore || 5),
          0
        ) / (analysisResult.gaps.length || 1),
      transferablePotential: analysisResult.gaps.filter(
        (g) => g.potentialTransferable
      ).length,
    };

    // Count by category
    analysisResult.gaps.forEach((gap) => {
      const cat = gap.category || "other";
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
    });

    return {
      success: true,
      stats,
      score: analysisResult.score,
      matchedSkills: analysisResult.matchedSkills,
    };
  } catch (error) {
    console.error("Get statistics error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
