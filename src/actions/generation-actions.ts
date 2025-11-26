"use server";

import { prisma } from "@/lib/db";
import { generateLatexDocuments } from "@/lib/gemini";
import { getDocumentGenerationPrompt } from "@/lib/prompts";
import { compileDocuments } from "@/lib/latex-compiler";
import type { CVData, AnalysisResult, Strategy } from "@/lib/types";

export interface GenerationResult {
  success: boolean;
  cvPdfBase64?: string;
  coverPdfBase64?: string;
  cvLatex?: string;
  coverLetterLatex?: string;
  error?: string;
  partialSuccess?: boolean; // LaTeX generated but PDF compilation failed
}

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
        error: "Les stratégies doivent être validées avant de générer les documents",
      };
    }

    const cvData = application.jobOffer.masterProfile.structuredData as unknown as CVData;
    const analysisResult = application.jobOffer.analysisResult as unknown as AnalysisResult;
    const strategies = Object.values(application.strategies as unknown as Record<string, Strategy>);
    const jobDescription = application.jobOffer.rawText;

    // Generate LaTeX documents using Gemini
    const prompt = getDocumentGenerationPrompt(
      cvData,
      analysisResult,
      strategies,
      jobDescription
    );

    const generatedDocs = await generateLatexDocuments(prompt);

    // Save LaTeX to database first (even if PDF compilation fails)
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        finalCvLatex: generatedDocs.cvLatex,
        finalCoverLatex: generatedDocs.coverLetterLatex,
        status: "latex_generated",
      },
    });

    // Try to compile LaTeX to PDF
    try {
      const { cvPdf, coverPdf } = await compileDocuments(
        generatedDocs.cvLatex,
        generatedDocs.coverLetterLatex
      );

      // Update with PDFs
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
      };
    } catch (pdfError) {
      console.error("PDF compilation failed, but LaTeX was saved:", pdfError);
      // Return partial success - LaTeX is available for download
      return {
        success: false,
        partialSuccess: true,
        cvLatex: generatedDocs.cvLatex,
        coverLetterLatex: generatedDocs.coverLetterLatex,
        error: "La compilation PDF a échoué. Vous pouvez télécharger les fichiers LaTeX et les compiler localement.",
      };
    }
  } catch (error) {
    console.error("Generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue lors de la génération",
    };
  }
}

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
      },
    });

    if (!application) {
      return { success: false, error: "Application non trouvée" };
    }

    if (!application.finalCvPdf || !application.finalCoverPdf) {
      return { success: false, error: "Documents non encore générés" };
    }

    return {
      success: true,
      cvPdfBase64: Buffer.from(application.finalCvPdf).toString("base64"),
      coverPdfBase64: Buffer.from(application.finalCoverPdf).toString("base64"),
    };
  } catch (error) {
    console.error("Get documents error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

export async function regenerateDocuments(
  applicationId: string
): Promise<GenerationResult> {
  try {
    // Reset status and regenerate
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "strategies_complete",
        finalCvLatex: null,
        finalCoverLatex: null,
        finalCvPdf: null,
        finalCoverPdf: null,
      },
    });

    return generateDocuments(applicationId);
  } catch (error) {
    console.error("Regeneration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
