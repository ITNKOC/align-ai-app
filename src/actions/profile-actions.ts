"use server";

import { prisma } from "@/lib/db";
import { getSession } from "./auth-actions";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { generateJSON } from "@/lib/gemini";
import { getCVExtractionPrompt } from "@/lib/prompts";
import type { CVData } from "@/lib/types";

// ==================== TYPES ====================

export interface ProfileData {
  id: string;
  name: string;
  fileName: string | null;
  fileSize: number | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  cvData: CVData;
}

export interface ProfileStats {
  totalApplications: number;
  appliedCount: number;
  interviewCount: number;
  offersCount: number;
}

// ==================== GET USER PROFILE ====================

export async function getUserProfile(): Promise<{
  success: boolean;
  profile?: ProfileData;
  stats?: ProfileStats;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    // Get user's default profile
    const profile = await prisma.masterProfile.findFirst({
      where: {
        userId: session.id,
        isDefault: true,
      },
      include: {
        jobOffers: {
          include: {
            applications: true,
          },
        },
      },
    });

    if (!profile) {
      return { success: true, profile: undefined };
    }

    // Calculate stats
    const allApplications = profile.jobOffers.flatMap((jo) => jo.applications);
    const stats: ProfileStats = {
      totalApplications: allApplications.length,
      appliedCount: allApplications.filter((a) =>
        ["applied", "interview_scheduled", "interview_done", "offer_received", "accepted"].includes(a.status)
      ).length,
      interviewCount: allApplications.filter((a) =>
        ["interview_scheduled", "interview_done"].includes(a.status)
      ).length,
      offersCount: allApplications.filter((a) =>
        ["offer_received", "accepted"].includes(a.status)
      ).length,
    };

    return {
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        fileName: profile.fileName,
        fileSize: profile.fileSize,
        isDefault: profile.isDefault,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        cvData: profile.structuredData as unknown as CVData,
      },
      stats,
    };
  } catch (error) {
    console.error("Get profile error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors du chargement du profil",
    };
  }
}

// ==================== CHECK IF USER HAS CV ====================

export async function hasExistingCV(): Promise<{
  success: boolean;
  hasCV: boolean;
  profileId?: string;
  cvData?: CVData;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, hasCV: false, error: "Non authentifie" };
    }

    const profile = await prisma.masterProfile.findFirst({
      where: {
        userId: session.id,
        isDefault: true,
      },
    });

    if (profile) {
      return {
        success: true,
        hasCV: true,
        profileId: profile.id,
        cvData: profile.structuredData as unknown as CVData,
      };
    }

    return { success: true, hasCV: false };
  } catch (error) {
    console.error("Check CV error:", error);
    return {
      success: false,
      hasCV: false,
      error: error instanceof Error ? error.message : "Erreur",
    };
  }
}

// ==================== UPLOAD/UPDATE CV ====================

export async function uploadCV(formData: FormData): Promise<{
  success: boolean;
  profileId?: string;
  cvData?: CVData;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    const file = formData.get("cv") as File;
    if (!file) {
      return { success: false, error: "Aucun fichier fourni" };
    }

    // Parse PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractTextFromPDF(buffer);

    if (!rawText || rawText.length < 100) {
      return { success: false, error: "Le CV semble vide ou illisible" };
    }

    // Extract structured data with AI
    const extractionPrompt = getCVExtractionPrompt(rawText);
    const cvData = await generateJSON<CVData>(extractionPrompt);

    // Check for existing default profile
    const existingProfile = await prisma.masterProfile.findFirst({
      where: {
        userId: session.id,
        isDefault: true,
      },
    });

    let profileId: string;

    if (existingProfile) {
      // Update existing profile
      const updated = await prisma.masterProfile.update({
        where: { id: existingProfile.id },
        data: {
          rawText,
          structuredData: cvData as object,
          fileName: file.name,
          fileSize: file.size,
          updatedAt: new Date(),
        },
      });
      profileId = updated.id;
    } else {
      // Create new profile
      const newProfile = await prisma.masterProfile.create({
        data: {
          userId: session.id,
          name: "Mon CV",
          rawText,
          structuredData: cvData as object,
          fileName: file.name,
          fileSize: file.size,
          isDefault: true,
        },
      });
      profileId = newProfile.id;
    }

    return {
      success: true,
      profileId,
      cvData,
    };
  } catch (error) {
    console.error("Upload CV error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'upload",
    };
  }
}

// ==================== DELETE CV ====================

export async function deleteCV(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    await prisma.masterProfile.deleteMany({
      where: {
        userId: session.id,
        isDefault: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete CV error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression",
    };
  }
}

// ==================== UPDATE CV DATA (manual edit) ====================

export async function updateCVData(
  profileId: string,
  updates: Partial<CVData>
): Promise<{
  success: boolean;
  cvData?: CVData;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    const profile = await prisma.masterProfile.findFirst({
      where: {
        id: profileId,
        userId: session.id,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil non trouve" };
    }

    const currentData = profile.structuredData as unknown as CVData;
    const newData = { ...currentData, ...updates };

    await prisma.masterProfile.update({
      where: { id: profileId },
      data: {
        structuredData: newData as object,
        updatedAt: new Date(),
      },
    });

    return { success: true, cvData: newData };
  } catch (error) {
    console.error("Update CV data error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise a jour",
    };
  }
}
