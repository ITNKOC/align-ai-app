"use server";

import { prisma } from "@/lib/db";
import { generateJSON } from "@/lib/gemini";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { getCVExtractionPrompt } from "@/lib/prompts";
import { getSession } from "./auth-actions";
import type { CVData } from "@/lib/types";

export interface CVUploadResult {
  success: boolean;
  profileId?: string;
  cvData?: CVData;
  error?: string;
}

export async function uploadAndParseCV(formData: FormData): Promise<CVUploadResult> {
  try {
    // Require authentication
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Vous devez être connecté pour télécharger un CV" };
    }

    const file = formData.get("cv") as File;
    const profileName = formData.get("profileName") as string | null;

    if (!file) {
      return { success: false, error: "Aucun fichier fourni" };
    }

    if (file.type !== "application/pdf") {
      return { success: false, error: "Seuls les fichiers PDF sont acceptés" };
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "Le fichier ne doit pas dépasser 10 Mo" };
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

    // Save to database with user association
    const profile = await prisma.masterProfile.create({
      data: {
        userId: session.id,
        name: profileName || `CV - ${cvData.personalInfo?.fullName || "Sans nom"}`,
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
    // Require authentication
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

    const profile = await prisma.masterProfile.findFirst({
      where: {
        id: profileId,
        userId: session.id, // Ensure ownership
      },
    });

    if (!profile) {
      return { success: false, error: "Profil non trouvé" };
    }

    return {
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        cvData: profile.structuredData as unknown as CVData,
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

/**
 * Get all CV profiles for the current user
 */
export async function getUserProfiles() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

    const profiles = await prisma.masterProfile.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
    });

    return {
      success: true,
      profiles: profiles.map((p) => ({
        id: p.id,
        name: p.name,
        cvData: p.structuredData as unknown as CVData,
        createdAt: p.createdAt,
      })),
    };
  } catch (error) {
    console.error("Get user profiles error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
