"use server";

import { prisma } from "@/lib/db";
import { generateJSON } from "@/lib/gemini";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { getCVExtractionPrompt } from "@/lib/prompts";
import type { CVData } from "@/lib/types";

export interface CVUploadResult {
  success: boolean;
  profileId?: string;
  cvData?: CVData;
  error?: string;
}

export async function uploadAndParseCV(formData: FormData): Promise<CVUploadResult> {
  try {
    const file = formData.get("cv") as File;

    if (!file) {
      return { success: false, error: "Aucun fichier fourni" };
    }

    if (file.type !== "application/pdf") {
      return { success: false, error: "Seuls les fichiers PDF sont acceptés" };
    }

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const rawText = await extractTextFromPDF(buffer);

    if (!rawText || rawText.trim().length < 100) {
      return {
        success: false,
        error: "Le PDF semble vide ou illisible. Veuillez vérifier votre fichier."
      };
    }

    // Use Gemini to extract structured data
    const prompt = getCVExtractionPrompt(rawText);
    const cvData = await generateJSON<CVData>(prompt);

    // Save to database
    const profile = await prisma.masterProfile.create({
      data: {
        rawText,
        structuredData: cvData as object,
      },
    });

    return {
      success: true,
      profileId: profile.id,
      cvData,
    };
  } catch (error) {
    console.error("CV upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

export async function getProfile(profileId: string) {
  try {
    const profile = await prisma.masterProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return { success: false, error: "Profil non trouvé" };
    }

    return {
      success: true,
      profile: {
        id: profile.id,
        cvData: profile.structuredData as CVData,
        rawText: profile.rawText,
      },
    };
  } catch (error) {
    console.error("Get profile error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
