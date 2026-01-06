"use server";

import { prisma } from "@/lib/db";
import { getSession } from "./auth-actions";
import type { CVData, AnalysisResult, FollowUpEmail } from "@/lib/types";

// ==================== TYPES ====================

export type ApplicationStatus =
  | "analyzing"
  | "chatting"
  | "strategies_complete"
  | "documents_ready"
  | "applied"
  | "interview_scheduled"
  | "interview_done"
  | "offer_received"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface DashboardApplication {
  id: string;
  status: ApplicationStatus;
  jobTitle: string | null;
  company: string | null;
  jobUrl: string | null;
  score: number | null;
  appliedAt: Date | null;
  appliedVia: string | null;
  interviewDate: Date | null;
  nextFollowUpAt: Date | null;
  followUpCount: number;
  hasCV: boolean;
  hasCoverLetter: boolean;
  hasFollowUpEmail: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  appliedThisWeek: number;
  responseRate: number;
}

export interface ApplicationDetail {
  id: string;
  status: ApplicationStatus;
  jobTitle: string | null;
  company: string | null;
  jobUrl: string | null;
  jobDescription: string;
  score: number | null;
  gaps: { skill: string; severity: string }[];
  appliedAt: Date | null;
  appliedVia: string | null;
  applicationNotes: string | null;
  interviewDate: Date | null;
  interviewType: string | null;
  interviewNotes: string | null;
  responseDate: Date | null;
  responseNotes: string | null;
  salaryOffered: string | null;
  lastFollowUpAt: Date | null;
  nextFollowUpAt: Date | null;
  followUpCount: number;
  cvPdfBase64: string | null;
  coverPdfBase64: string | null;
  followUpEmail: FollowUpEmail | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== DASHBOARD ACTIONS ====================

/**
 * Get all applications for the current user
 */
export async function getApplications(): Promise<{
  success: boolean;
  applications?: DashboardApplication[];
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

    const applications = await prisma.application.findMany({
      where: {
        jobOffer: {
          masterProfile: {
            userId: session.id,
          },
        },
      },
      include: {
        jobOffer: {
          select: {
            title: true,
            company: true,
            jobUrl: true,
            analysisResult: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const dashboardApps: DashboardApplication[] = applications.map((app) => {
      const analysis = app.jobOffer.analysisResult as AnalysisResult | null;
      return {
        id: app.id,
        status: app.status as ApplicationStatus,
        jobTitle: app.jobOffer.title,
        company: app.jobOffer.company,
        jobUrl: app.jobOffer.jobUrl,
        score: analysis?.score ?? null,
        appliedAt: app.appliedAt,
        appliedVia: app.appliedVia,
        interviewDate: app.interviewDate,
        nextFollowUpAt: app.nextFollowUpAt,
        followUpCount: app.followUpCount,
        hasCV: !!app.finalCvPdf,
        hasCoverLetter: !!app.finalCoverPdf,
        hasFollowUpEmail: !!app.followUpEmail,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      };
    });

    return { success: true, applications: dashboardApps };
  } catch (error) {
    console.error("Get applications error:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<{
  success: boolean;
  stats?: DashboardStats;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const applications = await prisma.application.findMany({
      where: {
        jobOffer: {
          masterProfile: {
            userId: session.id,
          },
        },
      },
      select: {
        status: true,
        appliedAt: true,
        responseDate: true,
      },
    });

    const totalApplications = applications.length;
    const pendingApplications = applications.filter(
      (a) => ["applied", "interview_scheduled"].includes(a.status)
    ).length;
    const interviewsScheduled = applications.filter(
      (a) => a.status === "interview_scheduled"
    ).length;
    const offersReceived = applications.filter(
      (a) => ["offer_received", "accepted"].includes(a.status)
    ).length;
    const appliedThisWeek = applications.filter(
      (a) => a.appliedAt && a.appliedAt >= oneWeekAgo
    ).length;

    // Response rate = applications with response / applications that were applied
    const appliedApps = applications.filter((a) => a.appliedAt);
    const respondedApps = applications.filter((a) => a.responseDate);
    const responseRate =
      appliedApps.length > 0
        ? Math.round((respondedApps.length / appliedApps.length) * 100)
        : 0;

    return {
      success: true,
      stats: {
        totalApplications,
        pendingApplications,
        interviewsScheduled,
        offersReceived,
        appliedThisWeek,
        responseRate,
      },
    };
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}

/**
 * Get detailed application info
 */
export async function getApplicationDetail(applicationId: string): Promise<{
  success: boolean;
  application?: ApplicationDetail;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

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
          select: {
            title: true,
            company: true,
            jobUrl: true,
            rawText: true,
            analysisResult: true,
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Candidature non trouvée" };
    }

    const analysis = application.jobOffer.analysisResult as AnalysisResult | null;

    const detail: ApplicationDetail = {
      id: application.id,
      status: application.status as ApplicationStatus,
      jobTitle: application.jobOffer.title,
      company: application.jobOffer.company,
      jobUrl: application.jobOffer.jobUrl,
      jobDescription: application.jobOffer.rawText,
      score: analysis?.score ?? null,
      gaps: analysis?.gaps?.map((g) => ({ skill: g.skill, severity: g.severity })) ?? [],
      appliedAt: application.appliedAt,
      appliedVia: application.appliedVia,
      applicationNotes: application.applicationNotes,
      interviewDate: application.interviewDate,
      interviewType: application.interviewType,
      interviewNotes: application.interviewNotes,
      responseDate: application.responseDate,
      responseNotes: application.responseNotes,
      salaryOffered: application.salaryOffered,
      lastFollowUpAt: application.lastFollowUpAt,
      nextFollowUpAt: application.nextFollowUpAt,
      followUpCount: application.followUpCount,
      cvPdfBase64: application.finalCvPdf
        ? Buffer.from(application.finalCvPdf).toString("base64")
        : null,
      coverPdfBase64: application.finalCoverPdf
        ? Buffer.from(application.finalCoverPdf).toString("base64")
        : null,
      followUpEmail: application.followUpEmail as FollowUpEmail | null,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };

    return { success: true, application: detail };
  } catch (error) {
    console.error("Get application detail error:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}

/**
 * Update application status and tracking info
 */
export async function updateApplicationStatus(
  applicationId: string,
  data: {
    status?: ApplicationStatus;
    appliedAt?: Date | null;
    appliedVia?: string | null;
    applicationNotes?: string | null;
    interviewDate?: Date | null;
    interviewType?: string | null;
    interviewNotes?: string | null;
    responseDate?: Date | null;
    responseNotes?: string | null;
    salaryOffered?: string | null;
    nextFollowUpAt?: Date | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
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
      return { success: false, error: "Candidature non trouvée" };
    }

    // Update application
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update application status error:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}

/**
 * Mark application as applied
 */
export async function markAsApplied(
  applicationId: string,
  appliedVia: string,
  jobUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

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
        jobOffer: true,
      },
    });

    if (!application) {
      return { success: false, error: "Candidature non trouvée" };
    }

    // Use documentCreatedAt if available (synced with CV/cover letter date)
    // Otherwise use current date
    const appliedAtDate = application.documentCreatedAt || new Date();

    // Update application status
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "applied",
        appliedAt: appliedAtDate, // Synced with document creation date
        appliedVia,
        // Set next follow-up to 5 days from appliedAt
        nextFollowUpAt: new Date(appliedAtDate.getTime() + 5 * 24 * 60 * 60 * 1000),
      },
    });

    // Update job URL if provided
    if (jobUrl) {
      await prisma.jobOffer.update({
        where: { id: application.jobOfferId },
        data: { jobUrl },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Mark as applied error:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}

/**
 * Record a follow-up
 */
export async function recordFollowUp(
  applicationId: string,
  nextFollowUpDays?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

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
      return { success: false, error: "Candidature non trouvée" };
    }

    const nextFollowUpAt = nextFollowUpDays
      ? new Date(Date.now() + nextFollowUpDays * 24 * 60 * 60 * 1000)
      : null;

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        lastFollowUpAt: new Date(),
        nextFollowUpAt,
        followUpCount: application.followUpCount + 1,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Record follow-up error:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}

/**
 * Delete an application
 */
export async function deleteApplication(
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

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
      return { success: false, error: "Candidature non trouvée" };
    }

    await prisma.application.delete({
      where: { id: applicationId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete application error:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}

/**
 * Get user's CV profiles
 */
export async function getCVProfiles(): Promise<{
  success: boolean;
  profiles?: {
    id: string;
    name: string;
    personalInfo: { fullName: string; email: string };
    createdAt: Date;
    applicationCount: number;
  }[];
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

    const profiles = await prisma.masterProfile.findMany({
      where: { userId: session.id },
      include: {
        _count: {
          select: { jobOffers: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      success: true,
      profiles: profiles.map((p) => {
        const cvData = p.structuredData as unknown as CVData;
        return {
          id: p.id,
          name: p.name,
          personalInfo: {
            fullName: cvData.personalInfo?.fullName || "N/A",
            email: cvData.personalInfo?.email || "N/A",
          },
          createdAt: p.createdAt,
          applicationCount: p._count.jobOffers,
        };
      }),
    };
  } catch (error) {
    console.error("Get CV profiles error:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}

/**
 * Get applications that need follow-up (past due or due today)
 */
export async function getFollowUpReminders(): Promise<{
  success: boolean;
  reminders?: {
    id: string;
    jobTitle: string | null;
    company: string | null;
    nextFollowUpAt: Date;
    followUpCount: number;
  }[];
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const applications = await prisma.application.findMany({
      where: {
        jobOffer: {
          masterProfile: {
            userId: session.id,
          },
        },
        status: "applied",
        nextFollowUpAt: {
          lte: today,
        },
      },
      include: {
        jobOffer: {
          select: {
            title: true,
            company: true,
          },
        },
      },
      orderBy: {
        nextFollowUpAt: "asc",
      },
    });

    return {
      success: true,
      reminders: applications.map((a) => ({
        id: a.id,
        jobTitle: a.jobOffer.title,
        company: a.jobOffer.company,
        nextFollowUpAt: a.nextFollowUpAt!,
        followUpCount: a.followUpCount,
      })),
    };
  } catch (error) {
    console.error("Get follow-up reminders error:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}
