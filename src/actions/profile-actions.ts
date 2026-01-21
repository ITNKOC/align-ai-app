"use server";

import { prisma } from "@/lib/db";
import { getSession } from "./auth-actions";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { generateJSON } from "@/lib/gemini";
import { getCVExtractionPrompt } from "@/lib/prompts";
import type { CVData, Strategy, LearnedGap, LearnedGapsRecord } from "@/lib/types";

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

// ==================== UPDATE EXPERIENCE ====================

export type SectionType = "experiences" | "projects" | "education";

/**
 * Update a single item in a profile section (experience, project, or education).
 */
export async function updateProfileItem<T>(
  section: SectionType,
  index: number,
  updates: Partial<T>
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    const profile = await prisma.masterProfile.findFirst({
      where: {
        userId: session.id,
        isDefault: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil non trouve" };
    }

    const currentData = profile.structuredData as unknown as CVData;
    const sectionData = [...(currentData[section] || [])];

    if (index < 0 || index >= sectionData.length) {
      return { success: false, error: "Index invalide" };
    }

    // Merge updates with existing item
    sectionData[index] = { ...sectionData[index], ...updates };

    const updatedData: CVData = {
      ...currentData,
      [section]: sectionData,
    };

    await prisma.masterProfile.update({
      where: { id: profile.id },
      data: {
        structuredData: updatedData as object,
        updatedAt: new Date(),
      },
    });

    console.log('[PROFILE_UPDATE]', {
      section,
      index,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("[PROFILE_UPDATE_ERROR]", {
      section,
      index,
      error,
      timestamp: new Date().toISOString(),
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise a jour",
    };
  }
}

/**
 * Add a new item to a profile section.
 */
export async function addProfileItem<T>(
  section: SectionType,
  item: T
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    const profile = await prisma.masterProfile.findFirst({
      where: {
        userId: session.id,
        isDefault: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil non trouve" };
    }

    const currentData = profile.structuredData as unknown as CVData;
    const sectionData = [...(currentData[section] || []), item];

    const updatedData: CVData = {
      ...currentData,
      [section]: sectionData,
    };

    await prisma.masterProfile.update({
      where: { id: profile.id },
      data: {
        structuredData: updatedData as object,
        updatedAt: new Date(),
      },
    });

    console.log('[PROFILE_ADD]', {
      section,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("[PROFILE_ADD_ERROR]", {
      section,
      error,
      timestamp: new Date().toISOString(),
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'ajout",
    };
  }
}

/**
 * Delete an item from a profile section.
 */
export async function deleteProfileItem(
  section: SectionType,
  index: number
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    const profile = await prisma.masterProfile.findFirst({
      where: {
        userId: session.id,
        isDefault: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil non trouve" };
    }

    const currentData = profile.structuredData as unknown as CVData;
    const sectionData = [...(currentData[section] || [])];

    if (index < 0 || index >= sectionData.length) {
      return { success: false, error: "Index invalide" };
    }

    // Remove item at index
    sectionData.splice(index, 1);

    const updatedData: CVData = {
      ...currentData,
      [section]: sectionData,
    };

    await prisma.masterProfile.update({
      where: { id: profile.id },
      data: {
        structuredData: updatedData as object,
        updatedAt: new Date(),
      },
    });

    console.log('[PROFILE_DELETE]', {
      section,
      index,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("[PROFILE_DELETE_ERROR]", {
      section,
      index,
      error,
      timestamp: new Date().toISOString(),
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression",
    };
  }
}

// ==================== UPDATE SKILLS ====================

/**
 * Update the skills section of the user's CV data.
 */
export async function updateSkills(
  newSkills: CVData["skills"]
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    const profile = await prisma.masterProfile.findFirst({
      where: {
        userId: session.id,
        isDefault: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil non trouve" };
    }

    const currentData = profile.structuredData as unknown as CVData;
    const updatedData: CVData = {
      ...currentData,
      skills: newSkills,
    };

    await prisma.masterProfile.update({
      where: { id: profile.id },
      data: {
        structuredData: updatedData as object,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update skills error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise a jour",
    };
  }
}

// ==================== LEARNED GAPS (Progressive Intelligence) ====================

/**
 * Save a learned gap from a resolved conversation.
 * If the skill already exists, it merges with existing data and increments usage count.
 */
export async function saveLearnedGap(
  skill: string,
  strategy: Strategy,
  evidence: string[],
  confidence: number
): Promise<{
  success: boolean;
  data?: LearnedGap;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    const profile = await prisma.masterProfile.findFirst({
      where: {
        userId: session.id,
        isDefault: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil non trouve" };
    }

    // Get current learned gaps
    const currentLearnedGaps = (profile.learnedGaps as unknown as LearnedGapsRecord) || {};

    // Check if skill already exists
    const existingGap = currentLearnedGaps[skill];
    const now = new Date();

    const newLearnedGap: LearnedGap = {
      strategy,
      evidence: existingGap
        ? [...new Set([...existingGap.evidence, ...evidence])] // Merge and dedupe evidence
        : evidence,
      confidence: existingGap
        ? Math.max(existingGap.confidence, confidence) // Keep higher confidence
        : confidence,
      lastUsed: now,
      usageCount: existingGap ? existingGap.usageCount + 1 : 1,
    };

    // Update learned gaps record
    const updatedLearnedGaps: LearnedGapsRecord = {
      ...currentLearnedGaps,
      [skill]: newLearnedGap,
    };

    await prisma.masterProfile.update({
      where: { id: profile.id },
      data: {
        learnedGaps: updatedLearnedGaps as object,
        updatedAt: now,
      },
    });

    return { success: true, data: newLearnedGap };
  } catch (error) {
    console.error("Save learned gap error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la sauvegarde",
    };
  }
}

/**
 * Get all learned gaps for the user's default profile.
 */
export async function getLearnedGaps(): Promise<{
  success: boolean;
  data?: LearnedGapsRecord;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    const profile = await prisma.masterProfile.findFirst({
      where: {
        userId: session.id,
        isDefault: true,
      },
    });

    if (!profile) {
      return { success: true, data: {} };
    }

    const learnedGaps = (profile.learnedGaps as unknown as LearnedGapsRecord) || {};

    return { success: true, data: learnedGaps };
  } catch (error) {
    console.error("Get learned gaps error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors du chargement",
    };
  }
}

/**
 * Find matching learned gaps for a list of required skills.
 * Used during job analysis to auto-resolve gaps.
 */
export async function findMatchingLearnedGaps(
  requiredSkills: string[]
): Promise<{
  success: boolean;
  data?: Record<string, LearnedGap>;
  error?: string;
}> {
  try {
    const result = await getLearnedGaps();
    if (!result.success || !result.data) {
      return result;
    }

    const learnedGaps = result.data;
    const matches: Record<string, LearnedGap> = {};

    // Normalize skill names for matching (lowercase, trim)
    const normalizedLearned = Object.entries(learnedGaps).reduce(
      (acc, [skill, gap]) => {
        acc[skill.toLowerCase().trim()] = { originalKey: skill, gap };
        return acc;
      },
      {} as Record<string, { originalKey: string; gap: LearnedGap }>
    );

    for (const skill of requiredSkills) {
      const normalizedSkill = skill.toLowerCase().trim();

      // Exact match
      if (normalizedLearned[normalizedSkill]) {
        matches[skill] = normalizedLearned[normalizedSkill].gap;
        continue;
      }

      // Partial match (skill contains or is contained in learned skill)
      for (const [learnedKey, { gap }] of Object.entries(normalizedLearned)) {
        if (
          learnedKey.includes(normalizedSkill) ||
          normalizedSkill.includes(learnedKey)
        ) {
          // Only use if confidence is high enough
          if (gap.confidence >= 0.7) {
            matches[skill] = gap;
            break;
          }
        }
      }
    }

    return { success: true, data: matches };
  } catch (error) {
    console.error("Find matching learned gaps error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la recherche",
    };
  }
}

// ==================== COVERAGE METRICS ====================

export interface SkillCoverage {
  skill: string;
  requestCount: number;
  isCovered: boolean;
}

export interface CoverageMetrics {
  percentage: number;             // 0-100
  learnedGapsCount: number;       // Total skills learned
  totalJobsAnalyzed: number;      // Total jobs the user analyzed
  topRequestedSkills: SkillCoverage[];
}

/**
 * Calculate profile coverage metrics based on learned gaps and job analyses.
 * Coverage = how many commonly requested skills the user has strategies for.
 */
export async function getCoverageMetrics(): Promise<{
  success: boolean;
  data?: CoverageMetrics;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifie" };
    }

    // Get profile with learned gaps
    const profile = await prisma.masterProfile.findFirst({
      where: {
        userId: session.id,
        isDefault: true,
      },
      include: {
        jobOffers: true,
      },
    });

    if (!profile) {
      return {
        success: true,
        data: {
          percentage: 0,
          learnedGapsCount: 0,
          totalJobsAnalyzed: 0,
          topRequestedSkills: [],
        },
      };
    }

    const learnedGaps = (profile.learnedGaps as unknown as LearnedGapsRecord) || {};
    const learnedSkills = new Set(Object.keys(learnedGaps).map(s => s.toLowerCase()));
    const learnedGapsCount = learnedSkills.size;

    // Aggregate skill requests from all job analyses
    const skillRequestCounts: Record<string, number> = {};

    for (const jobOffer of profile.jobOffers) {
      const requiredSkills = jobOffer.requiredSkills || [];
      for (const skill of requiredSkills) {
        const normalizedSkill = skill.toLowerCase().trim();
        skillRequestCounts[normalizedSkill] = (skillRequestCounts[normalizedSkill] || 0) + 1;
      }
    }

    // Sort by request count and get top 10
    const sortedSkills = Object.entries(skillRequestCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topRequestedSkills: SkillCoverage[] = sortedSkills.map(([skill, count]) => ({
      skill: skill.charAt(0).toUpperCase() + skill.slice(1), // Capitalize
      requestCount: count,
      isCovered: learnedSkills.has(skill) ||
        // Partial match: check if learned skill contains or is contained in requested
        Array.from(learnedSkills).some(
          learned => learned.includes(skill) || skill.includes(learned)
        ),
    }));

    // Calculate coverage percentage
    // Base: how many of the top requested skills are covered
    const coveredCount = topRequestedSkills.filter(s => s.isCovered).length;
    const totalRequested = topRequestedSkills.length;

    // Coverage formula: combination of learned gaps and coverage of top skills
    // - Base score from learned gaps (0-50 points based on count)
    // - Skill coverage score (0-50 points based on coverage of top skills)
    const learnedScore = Math.min(learnedGapsCount * 10, 50);
    const coverageScore = totalRequested > 0
      ? Math.round((coveredCount / totalRequested) * 50)
      : 0;

    const percentage = Math.min(learnedScore + coverageScore, 100);

    return {
      success: true,
      data: {
        percentage,
        learnedGapsCount,
        totalJobsAnalyzed: profile.jobOffers.length,
        topRequestedSkills,
      },
    };
  } catch (error) {
    console.error("Get coverage metrics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors du calcul",
    };
  }
}
