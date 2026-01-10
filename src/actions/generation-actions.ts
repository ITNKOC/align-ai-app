"use server";

// ============================================
// ALIGN.AI - Generation Actions v2.0
// CV + Cover Letter + Follow-up Email
// ============================================

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { generateLatexDocuments, generateJSON } from "@/lib/gemini";
import {
  getDocumentGenerationPrompt,
  getLatexRegenerationPrompt,
  getFollowUpEmailPrompt,
} from "@/lib/prompts";
import { compileDocuments } from "@/lib/latex-compiler";
import type {
  CVData,
  AnalysisResult,
  Strategy,
  GapSlot,
  FollowUpEmail,
} from "@/lib/types";

// ==================== TYPES ====================

export interface GenerationResult {
  success: boolean;
  cvPdfBase64?: string;
  coverPdfBase64?: string;
  cvLatex?: string;
  coverLetterLatex?: string;
  followUpEmail?: FollowUpEmail;
  error?: string;
  partialSuccess?: boolean;
}

// ==================== MAIN ACTIONS ====================

/**
 * Generate all documents: CV, Cover Letter, and Follow-up Email
 */
export async function generateDocuments(
  applicationId: string
): Promise<GenerationResult> {
  try {
    // Get all necessary data
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

    // Verify strategies are complete
    if (application.status !== "strategies_complete") {
      return {
        success: false,
        error:
          "Les stratégies doivent être validées avant de générer les documents",
      };
    }

    const cvData = application.jobOffer.masterProfile
      .structuredData as unknown as CVData;
    const analysisResult = application.jobOffer
      .analysisResult as unknown as AnalysisResult;
    const gapSlots = application.gapSlots as unknown as GapSlot[];
    const jobDescription = application.jobOffer.rawText;

    // Generate LaTeX documents using the new prompt with gapSlots
    // Use current date as application date (date of document creation)
    const applicationDate = new Date();
    const documentPrompt = getDocumentGenerationPrompt(
      cvData,
      analysisResult,
      gapSlots,
      jobDescription,
      applicationDate
    );

    console.log("[Generation] Generating LaTeX documents...");
    console.log("[Generation] CV Data:", JSON.stringify(cvData.personalInfo));
    console.log("[Generation] Gaps count:", gapSlots.length);

    // Retry logic for LaTeX generation
    let generatedDocs: { cvLatex: string; coverLetterLatex: string };
    let lastError: Error | null = null;
    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[Generation] Retry attempt ${attempt}/${maxRetries}...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
        generatedDocs = await generateLatexDocuments(documentPrompt);

        // Validate the generated documents
        if (!generatedDocs.cvLatex || generatedDocs.cvLatex.length < 100) {
          throw new Error("CV LaTeX too short or empty");
        }
        if (!generatedDocs.coverLetterLatex || generatedDocs.coverLetterLatex.length < 100) {
          throw new Error("Cover letter LaTeX too short or empty");
        }

        console.log("[Generation] LaTeX documents generated successfully");
        console.log("[Generation] CV length:", generatedDocs.cvLatex.length);
        console.log("[Generation] Cover length:", generatedDocs.coverLetterLatex.length);
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[Generation] Attempt ${attempt + 1} failed:`, lastError.message);

        if (attempt === maxRetries) {
          throw new Error(`Échec de la génération après ${maxRetries + 1} tentatives: ${lastError.message}`);
        }
      }
    }

    // TypeScript guard - generatedDocs is definitely assigned if we reach here
    if (!generatedDocs!) {
      throw new Error("Échec inattendu de la génération des documents");
    }

    // Generate follow-up email
    console.log("[Generation] Generating follow-up email...");
    const emailPrompt = getFollowUpEmailPrompt(cvData, analysisResult, gapSlots);
    let followUpEmail: FollowUpEmail;
    try {
      followUpEmail = await generateJSON<FollowUpEmail>(emailPrompt);
    } catch (emailError) {
      console.error("Failed to generate follow-up email:", emailError);
      // Default email
      followUpEmail = {
        subject: `Suivi de ma candidature - ${analysisResult.jobTitle}`,
        body: `Madame, Monsieur,\n\nJe me permets de vous relancer concernant ma candidature au poste de ${analysisResult.jobTitle} envoyée il y a quelques jours.\n\nJe reste très motivé(e) par cette opportunité et serais ravi(e) d'échanger avec vous.\n\nCordialement,\n${cvData.personalInfo.fullName}`,
        tone: "professional",
        sendAfterDays: 5,
      };
    }

    // Save LaTeX, email, and document creation date to database
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        finalCvLatex: generatedDocs.cvLatex,
        finalCoverLatex: generatedDocs.coverLetterLatex,
        followUpEmail: followUpEmail as object,
        documentCreatedAt: applicationDate, // Store the date shown on documents
        status: "latex_generated",
      },
    });

    // Try to compile LaTeX to PDF
    try {
      console.log("[Generation] Compiling PDFs...");
      const { cvPdf, coverPdf } = await compileDocuments(
        generatedDocs.cvLatex,
        generatedDocs.coverLetterLatex
      );

      // Update with PDFs and set documents_ready status
      // Also store the application date (date when documents were created)
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          finalCvPdf: cvPdf as any,
          finalCoverPdf: coverPdf as any,
          status: "documents_ready",
        },
      });

      console.log("[Generation] Documents generated successfully!");
      return {
        success: true,
        cvPdfBase64: cvPdf.toString("base64"),
        coverPdfBase64: coverPdf.toString("base64"),
        cvLatex: generatedDocs.cvLatex,
        coverLetterLatex: generatedDocs.coverLetterLatex,
        followUpEmail,
      };
    } catch (pdfError) {
      console.error("PDF compilation failed:", pdfError);
      return {
        success: false,
        partialSuccess: true,
        cvLatex: generatedDocs.cvLatex,
        coverLetterLatex: generatedDocs.coverLetterLatex,
        followUpEmail,
        error:
          "La compilation PDF a échoué. Les fichiers LaTeX et l'email sont disponibles.",
      };
    }
  } catch (error) {
    console.error("Generation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la génération",
    };
  }
}

/**
 * Get generated documents for an application
 */
export async function getGeneratedDocuments(applicationId: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        status: true,
        finalCvPdf: true,
        finalCoverPdf: true,
        finalCvLatex: true,
        finalCoverLatex: true,
        followUpEmail: true,
      },
    });

    if (!application) {
      return { success: false, error: "Application non trouvée" };
    }

    const result: {
      success: boolean;
      cvPdfBase64?: string;
      coverPdfBase64?: string;
      cvLatex?: string;
      coverLetterLatex?: string;
      followUpEmail?: FollowUpEmail;
      error?: string;
    } = { success: true };

    // Include PDFs if available
    if (application.finalCvPdf) {
      result.cvPdfBase64 = Buffer.from(application.finalCvPdf).toString(
        "base64"
      );
    }
    if (application.finalCoverPdf) {
      result.coverPdfBase64 = Buffer.from(application.finalCoverPdf).toString(
        "base64"
      );
    }

    // Include LaTeX sources
    if (application.finalCvLatex) {
      result.cvLatex = application.finalCvLatex;
    }
    if (application.finalCoverLatex) {
      result.coverLetterLatex = application.finalCoverLatex;
    }

    // Include follow-up email
    if (application.followUpEmail) {
      result.followUpEmail = application.followUpEmail as unknown as FollowUpEmail;
    }

    // Check if we have enough
    if (!result.cvPdfBase64 && !result.cvLatex) {
      return { success: false, error: "Documents non encore générés" };
    }

    return result;
  } catch (error) {
    console.error("Get documents error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Get comparison data for Avant/Après display
 */
export async function getComparisonData(applicationId: string) {
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

    const cvData = application.jobOffer.masterProfile.structuredData as unknown as CVData;
    const analysisResult = application.jobOffer.analysisResult as unknown as AnalysisResult;
    const strategies = (application.strategies || {}) as unknown as Record<string, Strategy>;

    return {
      success: true,
      cvData,
      analysisResult,
      strategies,
    };
  } catch (error) {
    console.error("Get comparison data error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Regenerate documents with optional user instructions
 */
export async function regenerateDocuments(
  applicationId: string,
  instructions?: string
): Promise<GenerationResult> {
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

    // If no instructions or no existing LaTeX, do full regeneration
    if (
      !instructions ||
      !application.finalCvLatex ||
      !application.finalCoverLatex
    ) {
      // Reset and regenerate
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: "strategies_complete",
          finalCvLatex: null,
          finalCoverLatex: null,
          finalCvPdf: null,
          finalCoverPdf: null,
          followUpEmail: Prisma.JsonNull,
        },
      });

      return generateDocuments(applicationId);
    }

    // Intelligent regeneration with user instructions
    const cvData = application.jobOffer.masterProfile
      .structuredData as unknown as CVData;
    const jobDescription = application.jobOffer.rawText;

    console.log("[Regeneration] Applying user instructions...");
    const prompt = getLatexRegenerationPrompt(
      application.finalCvLatex,
      application.finalCoverLatex,
      instructions,
      cvData,
      jobDescription
    );

    const generatedDocs = await generateLatexDocuments(prompt);

    // Save modified LaTeX
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        finalCvLatex: generatedDocs.cvLatex,
        finalCoverLatex: generatedDocs.coverLetterLatex,
        status: "latex_generated",
      },
    });

    // Try to compile
    try {
      const { cvPdf, coverPdf } = await compileDocuments(
        generatedDocs.cvLatex,
        generatedDocs.coverLetterLatex
      );

      await prisma.application.update({
        where: { id: applicationId },
        data: {
          finalCvPdf: cvPdf as any,
          finalCoverPdf: coverPdf as any,
          status: "completed",
        },
      });

      return {
        success: true,
        cvPdfBase64: cvPdf.toString("base64"),
        coverPdfBase64: coverPdf.toString("base64"),
        cvLatex: generatedDocs.cvLatex,
        coverLetterLatex: generatedDocs.coverLetterLatex,
        followUpEmail: application.followUpEmail as unknown as FollowUpEmail,
      };
    } catch (pdfError) {
      console.error("PDF compilation failed:", pdfError);
      return {
        success: false,
        partialSuccess: true,
        cvLatex: generatedDocs.cvLatex,
        coverLetterLatex: generatedDocs.coverLetterLatex,
        followUpEmail: application.followUpEmail as unknown as FollowUpEmail,
        error: "La compilation PDF a échoué.",
      };
    }
  } catch (error) {
    console.error("Regeneration error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Regenerate only the follow-up email
 */
export async function regenerateFollowUpEmail(
  applicationId: string,
  tone?: "formal" | "professional" | "friendly"
): Promise<{ success: boolean; followUpEmail?: FollowUpEmail; error?: string }> {
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
    const analysisResult = application.jobOffer
      .analysisResult as unknown as AnalysisResult;
    const gapSlots = application.gapSlots as unknown as GapSlot[];

    // Generate new email
    const emailPrompt = getFollowUpEmailPrompt(cvData, analysisResult, gapSlots);
    const followUpEmail = await generateJSON<FollowUpEmail>(emailPrompt);

    // Apply tone preference if specified
    if (tone) {
      followUpEmail.tone = tone;
    }

    // Save to database
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        followUpEmail: followUpEmail as object,
      },
    });

    return {
      success: true,
      followUpEmail,
    };
  } catch (error) {
    console.error("Email regeneration error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Get only the follow-up email
 */
export async function getFollowUpEmail(applicationId: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        followUpEmail: true,
        jobOffer: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Application non trouvée" };
    }

    if (!application.followUpEmail) {
      return { success: false, error: "Email de suivi non encore généré" };
    }

    return {
      success: true,
      followUpEmail: application.followUpEmail as unknown as FollowUpEmail,
      jobTitle: application.jobOffer.title,
      company: application.jobOffer.company,
    };
  } catch (error) {
    console.error("Get email error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Download LaTeX source files
 */
export async function downloadLatexSources(applicationId: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        finalCvLatex: true,
        finalCoverLatex: true,
        jobOffer: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Application non trouvée" };
    }

    if (!application.finalCvLatex || !application.finalCoverLatex) {
      return { success: false, error: "Documents LaTeX non disponibles" };
    }

    const safeName = (application.jobOffer.title || "document")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");

    return {
      success: true,
      files: [
        {
          name: `cv_${safeName}.tex`,
          content: application.finalCvLatex,
        },
        {
          name: `lettre_${safeName}.tex`,
          content: application.finalCoverLatex,
        },
      ],
    };
  } catch (error) {
    console.error("Download error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
