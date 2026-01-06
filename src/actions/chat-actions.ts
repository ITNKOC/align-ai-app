"use server";

// ============================================
// ALIGN.AI - Chat Actions v3.0
// Framework: Smart Pre-Analysis + 1-Question Chat
// ============================================

import { prisma } from "@/lib/db";
import { generateJSON, generateContent } from "@/lib/gemini";
import {
  getStrategistSystemPrompt,
  getStrategistResponsePrompt,
  getConversationSummaryPrompt,
  getSmartPreAnalysisPrompt,
  getSmartStrategistPrompt,
} from "@/lib/prompts";
import type {
  CVData,
  AnalysisResult,
  ChatMessage,
  Strategy,
  GapSlot,
  GapAnalysis,
  StrategistResponse,
  CollectedProject,
  SuggestedReply,
  PreAnalysis,
} from "@/lib/types";

// ==================== TYPES ====================

export interface ChatActionResult {
  success: boolean;
  aiMessage?: ChatMessage;
  strategy?: Strategy;
  isComplete?: boolean;
  newGapIndex?: number;
  currentPhase?: "exploration" | "clarification" | "quantification" | "validation";
  gapSlot?: GapSlot;
  error?: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Initialize a GapSlot from a GapAnalysis
 */
function createGapSlot(gap: GapAnalysis): GapSlot {
  return {
    skill: gap.skill,
    severity: gap.severity,
    category: gap.category,
    status: "pending",
    hasDirectExperience: null,
    experienceLevel: null,
    relatedProjects: [],
    transferableSkills: [],
    learningEvidence: [],
    quantifiedAchievements: [],
    strategy: null,
    questionsAsked: 0,
    filledAt: null,
  };
}

/**
 * Determine the current conversation phase based on slot state
 */
function determinePhase(slot: GapSlot): "exploration" | "clarification" | "quantification" | "validation" {
  const questionsAsked = slot.questionsAsked || 0;

  // If we have enough info, go to validation
  if (slot.strategy && slot.strategy.validated) {
    return "validation";
  }

  // Phase based on questions asked and data collected
  if (questionsAsked <= 2) {
    return "exploration";
  }

  if (questionsAsked <= 4) {
    // Move to clarification if we have some experience indication
    if (slot.hasDirectExperience !== null) {
      return "clarification";
    }
    return "exploration";
  }

  if (questionsAsked <= 6) {
    // Move to quantification if we have projects
    if (slot.relatedProjects.length > 0) {
      return "quantification";
    }
    return "clarification";
  }

  // After 6 questions, move to validation
  return "validation";
}

/**
 * Build conversation history string for context
 */
function buildConversationHistory(
  chatHistory: ChatMessage[],
  maxMessages: number = 10
): string {
  const recentMessages = chatHistory.slice(-maxMessages);
  return recentMessages
    .map((m) => `${m.role === "assistant" ? "Coach" : "Candidat"}: ${m.content}`)
    .join("\n\n");
}

/**
 * Merge extracted data into the current slot
 */
function mergeExtraction(
  slot: GapSlot,
  extraction: StrategistResponse["extraction"]
): GapSlot {
  const updatedSlot = { ...slot };

  // Update experience info if provided
  if (extraction.hasExperience !== null) {
    updatedSlot.hasDirectExperience = extraction.hasExperience;
  }
  if (extraction.experienceLevel !== null) {
    updatedSlot.experienceLevel = extraction.experienceLevel;
  }

  // Merge projects (avoid duplicates by name)
  if (extraction.projects && extraction.projects.length > 0) {
    const existingNames = new Set(updatedSlot.relatedProjects.map((p) => p.name.toLowerCase()));
    const newProjects = extraction.projects.filter(
      (p) => p.name && !existingNames.has(p.name.toLowerCase())
    );
    updatedSlot.relatedProjects = [...updatedSlot.relatedProjects, ...newProjects as CollectedProject[]];
  }

  // Merge transferable skills
  if (extraction.transferableSkills && extraction.transferableSkills.length > 0) {
    const existingSkills = new Set(updatedSlot.transferableSkills.map((s) => s.skill.toLowerCase()));
    const newSkills = extraction.transferableSkills
      .filter((s) => !existingSkills.has(s.toLowerCase()))
      .map((skill) => ({
        skill,
        fromExperience: "Conversation",
        relevanceScore: 7,
      }));
    updatedSlot.transferableSkills = [...updatedSlot.transferableSkills, ...newSkills];
  }

  // Merge learning evidence
  if (extraction.learningEvidence && extraction.learningEvidence.length > 0) {
    const newEvidence = extraction.learningEvidence.map((desc) => ({
      type: "self_taught" as const,
      description: desc,
    }));
    updatedSlot.learningEvidence = [...updatedSlot.learningEvidence, ...newEvidence];
  }

  // Merge achievements
  if (extraction.achievements && extraction.achievements.length > 0) {
    const existingAchievements = new Set(
      updatedSlot.quantifiedAchievements.map((a) => a.toLowerCase())
    );
    const newAchievements = extraction.achievements.filter(
      (a) => !existingAchievements.has(a.toLowerCase())
    );
    updatedSlot.quantifiedAchievements = [
      ...updatedSlot.quantifiedAchievements,
      ...newAchievements,
    ];
  }

  return updatedSlot;
}

// ==================== SMART PRE-ANALYSIS (v3.0) ====================

/**
 * Pre-analyze a single gap to find transferable skills and suggest strategy
 */
async function preAnalyzeGap(
  cvData: CVData,
  gap: GapAnalysis
): Promise<PreAnalysis> {
  try {
    const prompt = getSmartPreAnalysisPrompt(cvData, gap);
    const result = await generateJSON<PreAnalysis>(prompt);
    return result;
  } catch (error) {
    console.error(`Pre-analysis failed for gap ${gap.skill}:`, error);
    // Return default pre-analysis on error
    return {
      potentialMatches: gap.relatedSkillsInCV || [],
      relatedProjects: [],
      relatedExperiences: [],
      suggestedStrategy: gap.potentialTransferable ? "transferable" : "fast_learner",
      confidence: gap.potentialTransferable ? 50 : 20,
      reasoning: "Analyse par défaut basée sur les données existantes",
    };
  }
}

/**
 * Pre-analyze all gaps for an application
 */
export async function preAnalyzeAllGaps(applicationId: string): Promise<{
  success: boolean;
  gapSlots?: GapSlot[];
  error?: string;
}> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobOffer: {
          include: { masterProfile: true },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Application non trouvée" };
    }

    const cvData = application.jobOffer.masterProfile.structuredData as unknown as CVData;
    const analysisResult = application.jobOffer.analysisResult as unknown as AnalysisResult;

    // Create gap slots with pre-analysis
    const gapSlots: GapSlot[] = [];

    for (const gap of analysisResult.gaps) {
      const preAnalysis = await preAnalyzeGap(cvData, gap);

      const slot: GapSlot = {
        skill: gap.skill,
        severity: gap.severity,
        category: gap.category,
        preAnalysis,
        status: "pending",
        hasDirectExperience: preAnalysis.confidence >= 70 ? true : null,
        experienceLevel: null,
        relatedProjects: [],
        transferableSkills: preAnalysis.potentialMatches.map(skill => ({
          skill,
          fromExperience: "CV",
          relevanceScore: preAnalysis.confidence / 10,
        })),
        learningEvidence: [],
        quantifiedAchievements: [],
        strategy: null,
        questionsAsked: 0,
        filledAt: null,
      };

      // Auto-fill strategy for minor gaps or high-confidence gaps
      if (gap.severity === "minor" || preAnalysis.confidence >= 85) {
        slot.status = "filled";
        slot.filledAt = Date.now();
        slot.strategy = {
          gapSkill: gap.skill,
          approach: preAnalysis.suggestedStrategy || "fast_learner",
          details: preAnalysis.reasoning,
          validated: true,
          evidenceUsed: preAnalysis.potentialMatches,
          cvSections: ["Skills"],
          coverLetterPoints: preAnalysis.confidence >= 70
            ? [`Mettre en avant l'expérience avec ${preAnalysis.potentialMatches[0] || gap.skill}`]
            : ["Souligner la capacité d'apprentissage rapide"],
        };
      }

      gapSlots.push(slot);
    }

    // Save to database
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        gapSlots: gapSlots as any,
        totalGaps: analysisResult.gaps.length,
      },
    });

    return { success: true, gapSlots };
  } catch (error) {
    console.error("Pre-analyze all gaps error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la pré-analyse",
    };
  }
}

/**
 * Skip all remaining gaps and mark them with fast_learner strategy
 */
export async function skipAllGaps(applicationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
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

    const analysisResult = application.jobOffer.analysisResult as unknown as AnalysisResult;
    let gapSlots = application.gapSlots as unknown as GapSlot[];
    const chatHistory = application.chatHistory as unknown as ChatMessage[];

    // Mark all unfilled gaps as skipped with appropriate strategy
    const strategies: Record<string, Strategy> = {};

    gapSlots = gapSlots.map((slot, index) => {
      if (slot.status !== "filled") {
        const gap = analysisResult.gaps[index];
        const preAnalysis = slot.preAnalysis;

        // Use pre-analysis to determine best strategy
        const approach = preAnalysis?.suggestedStrategy || "fast_learner";

        slot.status = "filled";
        slot.filledAt = Date.now();
        slot.strategy = {
          gapSkill: slot.skill,
          approach,
          details: preAnalysis?.reasoning || "Compétence à développer - mise en avant de la capacité d'apprentissage",
          validated: true,
          evidenceUsed: preAnalysis?.potentialMatches || [],
          cvSections: approach === "fast_learner" ? [] : ["Skills", "Experience"],
          coverLetterPoints: approach === "fast_learner"
            ? ["Mettre en avant la capacité d'apprentissage et l'adaptabilité"]
            : [`Valoriser l'expérience transférable avec ${preAnalysis?.potentialMatches[0] || slot.skill}`],
        };
      }

      if (slot.strategy) {
        strategies[slot.skill] = slot.strategy;
      }

      return slot;
    });

    // Add skip message to chat
    const skipMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: "Parfait ! J'ai analysé votre profil et préparé des stratégies optimales pour chaque compétence. Vous pouvez maintenant générer vos documents personnalisés.",
      timestamp: Date.now(),
    };

    // Update database
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        chatHistory: [...chatHistory, skipMessage] as any,
        gapSlots: gapSlots as any,
        currentGapIndex: analysisResult.gaps.length,
        strategies: strategies as any,
        gapsAddressed: analysisResult.gaps.length,
        status: "strategies_complete",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Skip all gaps error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors du skip",
    };
  }
}

// ==================== MAIN ACTIONS ====================

/**
 * Send a message in the strategic chat
 */
export async function sendChatMessage(
  applicationId: string,
  userMessage: string
): Promise<ChatActionResult> {
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

    const cvData = application.jobOffer.masterProfile.structuredData as unknown as CVData;
    const analysisResult = application.jobOffer.analysisResult as unknown as AnalysisResult;
    const chatHistory = application.chatHistory as unknown as ChatMessage[];
    let gapSlots = application.gapSlots as unknown as GapSlot[];
    const currentGapIndex = application.currentGapIndex;

    // Check if already complete
    if (currentGapIndex >= analysisResult.gaps.length) {
      return {
        success: true,
        isComplete: true,
      };
    }

    const currentGap = analysisResult.gaps[currentGapIndex];
    let currentSlot = gapSlots[currentGapIndex];

    // Ensure slot exists
    if (!currentSlot) {
      currentSlot = createGapSlot(currentGap);
      gapSlots[currentGapIndex] = currentSlot;
    }

    // Mark slot as exploring
    currentSlot.status = "exploring";
    currentSlot.questionsAsked = (currentSlot.questionsAsked || 0) + 1;

    // v3.0: Determine if this is the first question for this gap
    const isFirstQuestion = currentSlot.questionsAsked <= 1;

    // Create user message
    const userChatMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
      metadata: {
        gapIndex: currentGapIndex,
      },
    };

    // v3.0: Use Smart Strategist prompt (1-2 questions max)
    const responsePrompt = getSmartStrategistPrompt(
      userMessage,
      currentGap,
      currentSlot,
      cvData,
      isFirstQuestion
    );

    // Define simplified response type for v3.0
    interface SmartResponse {
      message: string;
      suggestedReplies: SuggestedReply[];
      extraction: {
        hasExperience: boolean | null;
        experienceLevel: "none" | "beginner" | "intermediate" | "advanced" | null;
        projectMentioned: string | null;
        transferableSkill: string | null;
      };
      strategy: Strategy | null;
      nextPhase: "continue" | "next_gap";
      confidenceToClose: number;
    }

    let aiResponse: SmartResponse;
    try {
      aiResponse = await generateJSON<SmartResponse>(responsePrompt);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: use pre-analysis to create strategy and move on
      const preAnalysis = currentSlot.preAnalysis;
      aiResponse = {
        message: preAnalysis && preAnalysis.confidence >= 50
          ? `Compris ! J'ai noté votre expérience. Passons à la suite.`
          : `D'accord, nous mettrons en avant votre capacité d'apprentissage. Passons à la suite.`,
        suggestedReplies: [],
        extraction: {
          hasExperience: preAnalysis?.confidence ? preAnalysis.confidence >= 50 : false,
          experienceLevel: null,
          projectMentioned: null,
          transferableSkill: preAnalysis?.potentialMatches?.[0] || null,
        },
        strategy: {
          gapSkill: currentGap.skill,
          approach: preAnalysis?.suggestedStrategy || "fast_learner",
          details: preAnalysis?.reasoning || "Capacité d'apprentissage rapide",
          validated: true,
          evidenceUsed: preAnalysis?.potentialMatches || [],
          cvSections: ["Skills"],
          coverLetterPoints: ["Mettre en avant la capacité d'adaptation"],
        },
        nextPhase: "next_gap",
        confidenceToClose: 80,
      };
    }

    // v3.0: Log simplified trace
    console.log(`[Smart v3.0] Gap: ${currentGap.skill}`);
    console.log(`[Smart v3.0] Questions: ${currentSlot.questionsAsked}`);
    console.log(`[Smart v3.0] Confidence: ${aiResponse.confidenceToClose}`);

    // v3.0: Simplified extraction merge
    if (aiResponse.extraction.hasExperience !== null) {
      currentSlot.hasDirectExperience = aiResponse.extraction.hasExperience;
    }
    if (aiResponse.extraction.experienceLevel) {
      currentSlot.experienceLevel = aiResponse.extraction.experienceLevel;
    }
    if (aiResponse.extraction.projectMentioned) {
      const existingNames = new Set(currentSlot.relatedProjects.map(p => p.name.toLowerCase()));
      if (!existingNames.has(aiResponse.extraction.projectMentioned.toLowerCase())) {
        currentSlot.relatedProjects.push({
          name: aiResponse.extraction.projectMentioned,
          description: "",
          context: "professional",
          technologies: [],
        });
      }
    }
    if (aiResponse.extraction.transferableSkill) {
      const existingSkills = new Set(currentSlot.transferableSkills.map(s => s.skill.toLowerCase()));
      if (!existingSkills.has(aiResponse.extraction.transferableSkill.toLowerCase())) {
        currentSlot.transferableSkills.push({
          skill: aiResponse.extraction.transferableSkill,
          fromExperience: "Conversation",
          relevanceScore: 7,
        });
      }
    }

    // Update strategy if provided
    if (aiResponse.strategy) {
      currentSlot.strategy = aiResponse.strategy;
    }

    // Create AI message with metadata and suggested replies
    const aiChatMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: aiResponse.message,
      timestamp: Date.now(),
      suggestedReplies: aiResponse.suggestedReplies || [],
      metadata: {
        gapIndex: currentGapIndex,
        extractedData: {
          hasDirectExperience: currentSlot.hasDirectExperience,
          relatedProjects: currentSlot.relatedProjects,
          transferableSkills: currentSlot.transferableSkills,
        },
      },
    };

    // Update chat history
    const newChatHistory = [...chatHistory, userChatMessage, aiChatMessage];

    // v3.0: Move to next gap after 2 questions MAX or high confidence
    const shouldMoveToNextGap =
      aiResponse.nextPhase === "next_gap" ||
      aiResponse.confidenceToClose >= 80 ||
      currentSlot.questionsAsked >= 2; // v3.0: 2 questions max instead of 8

    let newGapIndex = currentGapIndex;
    let isComplete = false;

    if (shouldMoveToNextGap) {
      // Mark current slot as filled
      currentSlot.status = "filled";
      currentSlot.filledAt = Date.now();

      // Ensure strategy exists (default to fast_learner if nothing found)
      if (!currentSlot.strategy) {
        currentSlot.strategy = {
          gapSkill: currentGap.skill,
          approach: "fast_learner",
          details: "Capacité d'apprentissage rapide à mettre en avant",
          validated: true,
          evidenceUsed: [],
          cvSections: [],
          coverLetterPoints: ["Mettre en avant la capacité d'adaptation"],
        };
      } else {
        currentSlot.strategy.validated = true;
      }

      // Move to next gap
      newGapIndex = currentGapIndex + 1;
      isComplete = newGapIndex >= analysisResult.gaps.length;

      // Initialize next slot if not complete
      if (!isComplete && !gapSlots[newGapIndex]) {
        gapSlots[newGapIndex] = createGapSlot(analysisResult.gaps[newGapIndex]);
      }
    }

    // Update slot in array
    gapSlots[currentGapIndex] = currentSlot;

    // Build strategies object from filled slots
    const strategies: Record<string, Strategy> = {};
    gapSlots
      .filter((s) => s.strategy && s.strategy.validated)
      .forEach((s) => {
        strategies[s.skill] = s.strategy!;
      });

    // Update application in database
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        chatHistory: newChatHistory as any,
        gapSlots: gapSlots as any,
        currentGapIndex: newGapIndex,
        strategies: strategies as any,
        gapsAddressed: newGapIndex, // Legacy field
        totalGaps: analysisResult.gaps.length, // Legacy field
        status: isComplete ? "strategies_complete" : "chatting",
      },
    });

    return {
      success: true,
      aiMessage: aiChatMessage,
      strategy: currentSlot.strategy || undefined,
      isComplete,
      newGapIndex,
      // v3.0: Simplified phase - just exploring or validation
      currentPhase: aiResponse.nextPhase === "next_gap" ? "validation" : "exploration",
      gapSlot: currentSlot,
    };
  } catch (error) {
    console.error("Chat error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Initialize the strategic chat conversation (v3.0 with pre-analysis)
 */
export async function initializeChat(
  applicationId: string
): Promise<ChatActionResult> {
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

    // If chat already has messages, return success
    const chatHistory = application.chatHistory as unknown as ChatMessage[];
    if (chatHistory.length > 0) {
      return { success: true };
    }

    const cvData = application.jobOffer.masterProfile.structuredData as unknown as CVData;
    const analysisResult = application.jobOffer.analysisResult as unknown as AnalysisResult;

    // v3.0: Run pre-analysis on all gaps
    const gapSlots: GapSlot[] = [];
    const strategies: Record<string, Strategy> = {};

    for (const gap of analysisResult.gaps) {
      const preAnalysis = await preAnalyzeGap(cvData, gap);

      const slot: GapSlot = {
        skill: gap.skill,
        severity: gap.severity,
        category: gap.category,
        preAnalysis,
        status: "pending",
        hasDirectExperience: preAnalysis.confidence >= 70 ? true : null,
        experienceLevel: null,
        relatedProjects: [],
        transferableSkills: preAnalysis.potentialMatches.map(skill => ({
          skill,
          fromExperience: "CV",
          relevanceScore: preAnalysis.confidence / 10,
        })),
        learningEvidence: [],
        quantifiedAchievements: [],
        strategy: null,
        questionsAsked: 0,
        filledAt: null,
      };

      // v3.0: Auto-fill strategy for minor gaps or high-confidence gaps
      if (gap.severity === "minor" || preAnalysis.confidence >= 85) {
        slot.status = "filled";
        slot.filledAt = Date.now();
        slot.strategy = {
          gapSkill: gap.skill,
          approach: preAnalysis.suggestedStrategy || "fast_learner",
          details: preAnalysis.reasoning,
          validated: true,
          evidenceUsed: preAnalysis.potentialMatches,
          cvSections: ["Skills"],
          coverLetterPoints: preAnalysis.confidence >= 70
            ? [`Mettre en avant l'expérience avec ${preAnalysis.potentialMatches[0] || gap.skill}`]
            : ["Souligner la capacité d'apprentissage rapide"],
        };
        strategies[gap.skill] = slot.strategy;
      }

      gapSlots.push(slot);
    }

    // v3.0: Find first gap that needs questions
    const firstUnfilledIndex = gapSlots.findIndex(s => s.status !== "filled");
    const currentGapIndex = firstUnfilledIndex >= 0 ? firstUnfilledIndex : 0;

    // Check if all gaps are already filled (no questions needed!)
    const allFilled = gapSlots.every(s => s.status === "filled");
    if (allFilled) {
      const completeMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: "Excellente nouvelle ! J'ai analysé votre profil et trouvé des correspondances pour toutes les compétences demandées. Vos documents sont prêts à être générés !",
        timestamp: Date.now(),
      };

      await prisma.application.update({
        where: { id: applicationId },
        data: {
          chatHistory: [completeMessage] as any,
          gapSlots: gapSlots as any,
          currentGapIndex: gapSlots.length,
          totalGaps: analysisResult.gaps.length,
          strategies: strategies as any,
          gapsAddressed: gapSlots.length,
          status: "strategies_complete",
        },
      });

      return {
        success: true,
        aiMessage: completeMessage,
        isComplete: true,
      };
    }

    // Mark first unfilled slot as exploring
    if (gapSlots[currentGapIndex]) {
      gapSlots[currentGapIndex].status = "exploring";
    }

    // v3.0: Generate smart initial message based on pre-analysis
    const firstGap = analysisResult.gaps[currentGapIndex];
    const firstSlot = gapSlots[currentGapIndex];
    const preAnalysis = firstSlot?.preAnalysis;

    // Count auto-filled gaps
    const autoFilledCount = gapSlots.filter(s => s.status === "filled").length;
    const remainingCount = gapSlots.length - autoFilledCount;

    let initialMessage = "";
    if (autoFilledCount > 0) {
      initialMessage = `J'ai analysé votre profil et trouvé des correspondances pour ${autoFilledCount} compétence${autoFilledCount > 1 ? "s" : ""}. `;
      initialMessage += `Il me reste ${remainingCount} question${remainingCount > 1 ? "s" : ""} rapide${remainingCount > 1 ? "s" : ""} pour optimiser votre candidature.\n\n`;
    }

    if (preAnalysis && preAnalysis.potentialMatches.length > 0) {
      initialMessage += `Concernant **${firstGap.skill}**, je vois que vous avez ${preAnalysis.potentialMatches.join(", ")} dans votre CV. Pouvez-vous me confirmer votre niveau d'expérience avec cette technologie ?`;
    } else {
      initialMessage += `Concernant **${firstGap.skill}**, avez-vous une expérience directe ou similaire avec cette technologie ?`;
    }

    // Smart suggested replies based on pre-analysis
    const initialSuggestedReplies: SuggestedReply[] = [
      {
        id: "reply_1",
        label: preAnalysis?.confidence && preAnalysis.confidence >= 50
          ? "Oui, je confirme"
          : `Oui, j'ai utilisé ${firstGap?.skill}`,
        value: `Oui, j'ai de l'expérience avec ${firstGap?.skill || "cette technologie"}.`,
        type: "positive",
      },
      {
        id: "reply_2",
        label: "Non, pas d'expérience",
        value: `Non, je n'ai pas d'expérience directe avec ${firstGap?.skill || "cette technologie"}.`,
        type: "negative",
      },
      {
        id: "reply_3",
        label: "Un peu / Technologie similaire",
        value: `J'ai une expérience partielle ou avec des technologies similaires à ${firstGap?.skill || "celle-ci"}.`,
        type: "neutral",
      },
    ];

    const aiChatMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: initialMessage,
      timestamp: Date.now(),
      suggestedReplies: initialSuggestedReplies,
      metadata: {
        gapIndex: currentGapIndex,
      },
    };

    // Save to database
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        chatHistory: [aiChatMessage] as any,
        gapSlots: gapSlots as any,
        currentGapIndex,
        totalGaps: analysisResult.gaps.length,
        strategies: strategies as any,
        gapsAddressed: autoFilledCount,
        status: "chatting",
      },
    });

    return {
      success: true,
      aiMessage: aiChatMessage,
      currentPhase: "exploration",
    };
  } catch (error) {
    console.error("Initialize chat error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Get current chat state
 */
export async function getChatState(applicationId: string) {
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

    const analysisResult = application.jobOffer.analysisResult as unknown as AnalysisResult;
    const gapSlots = application.gapSlots as unknown as GapSlot[];
    const currentGapIndex = application.currentGapIndex;

    // Determine current phase
    const currentSlot = gapSlots[currentGapIndex];
    const currentPhase = currentSlot ? determinePhase(currentSlot) : "exploration";

    return {
      success: true,
      chatHistory: application.chatHistory as unknown as ChatMessage[],
      strategies: Object.values(application.strategies as unknown as Record<string, Strategy>),
      gapSlots,
      currentGapIndex,
      totalGaps: analysisResult.gaps.length,
      gaps: analysisResult.gaps,
      currentPhase,
      isComplete: currentGapIndex >= analysisResult.gaps.length,
    };
  } catch (error) {
    console.error("Get chat state error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Skip current gap and move to next
 */
export async function skipCurrentGap(applicationId: string): Promise<ChatActionResult> {
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

    const analysisResult = application.jobOffer.analysisResult as unknown as AnalysisResult;
    let gapSlots = application.gapSlots as unknown as GapSlot[];
    const currentGapIndex = application.currentGapIndex;

    if (currentGapIndex >= analysisResult.gaps.length) {
      return { success: true, isComplete: true };
    }

    const currentGap = analysisResult.gaps[currentGapIndex];
    let currentSlot = gapSlots[currentGapIndex];

    // Mark as skipped with acknowledge_gap strategy
    currentSlot.status = "skipped";
    currentSlot.filledAt = Date.now();
    currentSlot.strategy = {
      gapSkill: currentGap.skill,
      approach: "acknowledge_gap",
      details: "Gap reconnu, plan d'apprentissage à définir",
      validated: true,
      evidenceUsed: [],
      cvSections: [],
      coverLetterPoints: ["Mentionner la volonté d'apprentissage"],
    };

    gapSlots[currentGapIndex] = currentSlot;

    const newGapIndex = currentGapIndex + 1;
    const isComplete = newGapIndex >= analysisResult.gaps.length;

    // Initialize next slot
    if (!isComplete && !gapSlots[newGapIndex]) {
      gapSlots[newGapIndex] = createGapSlot(analysisResult.gaps[newGapIndex]);
    }

    // Build strategies
    const strategies: Record<string, Strategy> = {};
    gapSlots
      .filter((s) => s.strategy && s.strategy.validated)
      .forEach((s) => {
        strategies[s.skill] = s.strategy!;
      });

    // Add skip message to chat
    const chatHistory = application.chatHistory as unknown as ChatMessage[];
    const skipMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: `D'accord, nous passons à la compétence suivante. Pour "${currentGap.skill}", nous mettrons en avant ta capacité d'apprentissage et ta motivation.`,
      timestamp: Date.now(),
      metadata: {
        gapIndex: currentGapIndex,
        phase: "validation",
      },
    };

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        chatHistory: [...chatHistory, skipMessage] as any,
        gapSlots: gapSlots as any,
        currentGapIndex: newGapIndex,
        strategies: strategies as any,
        gapsAddressed: newGapIndex,
        status: isComplete ? "strategies_complete" : "chatting",
      },
    });

    return {
      success: true,
      aiMessage: skipMessage,
      isComplete,
      newGapIndex,
    };
  } catch (error) {
    console.error("Skip gap error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

/**
 * Generate conversation summary for context compression
 */
export async function generateConversationSummary(applicationId: string): Promise<{ success: boolean; summary?: string; error?: string }> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return { success: false, error: "Application non trouvée" };
    }

    const chatHistory = application.chatHistory as unknown as ChatMessage[];
    const gapSlots = application.gapSlots as unknown as GapSlot[];

    if (chatHistory.length < 10) {
      return { success: true, summary: "" };
    }

    const prompt = getConversationSummaryPrompt(
      chatHistory.map((m) => ({ role: m.role, content: m.content })),
      gapSlots
    );

    const summary = await generateContent(prompt);

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        conversationSummary: summary,
      },
    });

    return { success: true, summary };
  } catch (error) {
    console.error("Summary generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
