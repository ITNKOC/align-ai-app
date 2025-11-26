"use server";

import { prisma } from "@/lib/db";
import { generateJSON } from "@/lib/gemini";
import { getJobAnalysisPrompt } from "@/lib/prompts";
import type { CVData, AnalysisResult } from "@/lib/types";

export interface AnalysisActionResult {
  success: boolean;
  jobOfferId?: string;
  applicationId?: string;
  analysisResult?: AnalysisResult;
  error?: string;
}

export async function analyzeJobOffer(
  profileId: string,
  jobDescription: string
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

    // Use Gemini to analyze the match
    const prompt = getJobAnalysisPrompt(cvData, jobDescription);
    const analysisResult = await generateJSON<AnalysisResult>(prompt);

    // Ensure we have exactly 3 gaps (or less if the match is very good)
    const gaps = analysisResult.gaps.slice(0, 3);

    // Create JobOffer record
    const jobOffer = await prisma.jobOffer.create({
      data: {
        masterProfileId: profileId,
        rawText: jobDescription,
        title: analysisResult.jobTitle || null,
        company: analysisResult.company || null,
        requiredSkills: analysisResult.keywords,
        analysisResult: { ...analysisResult, gaps } as object,
      },
    });

    // Create Application record
    const application = await prisma.application.create({
      data: {
        jobOfferId: jobOffer.id,
        status: "analyzed",
        totalGaps: gaps.length,
        gapsAddressed: 0,
      },
    });

    return {
      success: true,
      jobOfferId: jobOffer.id,
      applicationId: application.id,
      analysisResult: { ...analysisResult, gaps },
    };
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue lors de l'analyse",
    };
  }
}

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

    return {
      success: true,
      application: {
        id: application.id,
        status: application.status,
        chatHistory: application.chatHistory,
        strategies: application.strategies,
        gapsAddressed: application.gapsAddressed,
        totalGaps: application.totalGaps,
      },
      jobOffer: {
        id: application.jobOffer.id,
        title: application.jobOffer.title,
        company: application.jobOffer.company,
        analysisResult: application.jobOffer.analysisResult as unknown as AnalysisResult,
      },
      profile: {
        id: application.jobOffer.masterProfile.id,
        cvData: application.jobOffer.masterProfile.structuredData as unknown as CVData,
      },
    };
  } catch (error) {
    console.error("Get analysis error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
