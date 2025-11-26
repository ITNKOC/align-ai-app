"use server";

import { prisma } from "@/lib/db";
import { generateJSON, generateContent } from "@/lib/gemini";
import {
  getStrategistSystemPrompt,
  getStrategistResponsePrompt,
} from "@/lib/prompts";
import type { CVData, AnalysisResult, ChatMessage, Strategy } from "@/lib/types";

interface ChatResponse {
  message: string;
  strategy?: Strategy;
  moveToNextGap: boolean;
}

export interface ChatActionResult {
  success: boolean;
  aiMessage?: ChatMessage;
  strategy?: Strategy;
  isComplete?: boolean;
  newGapIndex?: number;
  error?: string;
}

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
    const strategies = Object.values(application.strategies as unknown as Record<string, Strategy>);
    const currentGapIndex = application.gapsAddressed;

    // Check if already complete
    if (currentGapIndex >= analysisResult.gaps.length) {
      return {
        success: true,
        isComplete: true,
      };
    }

    const currentGap = analysisResult.gaps[currentGapIndex];
    const gapStartIndex = application.gapStartIndex || 0;

    // Count user messages since the current gap started
    const messagesForCurrentGap = chatHistory.slice(gapStartIndex);
    const exchangesForCurrentGap = messagesForCurrentGap.filter(msg => msg.role === "user").length;

    console.log(`Gap ${currentGapIndex + 1}/${analysisResult.gaps.length}: "${currentGap.skill}" - Exchange count: ${exchangesForCurrentGap}, gapStartIndex: ${gapStartIndex}`);

    // Create user message
    const userChatMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };

    // Determine if user has related experience based on message sentiment
    // Simple heuristic: look for positive indicators
    const positiveIndicators = [
      "oui",
      "yes",
      "j'ai",
      "j'ai fait",
      "j'ai utilisé",
      "j'ai travaillé",
      "j'ai eu",
      "un peu",
      "quelques",
      "experience",
      "expérience",
      "projet",
      "stage",
      "connais",
      "sais",
      "maîtrise",
      "appris",
    ];
    const negativeIndicators = [
      "non",
      "no",
      "jamais",
      "pas",
      "aucun",
      "never",
      "pas encore",
      "pas vraiment",
      "pas du tout",
    ];

    const lowerMessage = userMessage.toLowerCase();
    const hasPositive = positiveIndicators.some((ind) =>
      lowerMessage.includes(ind)
    );
    const hasNegative = negativeIndicators.some((ind) =>
      lowerMessage.includes(ind)
    );

    const hasRelatedExperience = hasPositive && !hasNegative;

    // Get next gap for announcement (if any)
    const nextGap = currentGapIndex + 1 < analysisResult.gaps.length
      ? analysisResult.gaps[currentGapIndex + 1].skill
      : undefined;

    // Generate AI response with full CV context
    const responsePrompt = getStrategistResponsePrompt(
      userMessage,
      currentGap.skill,
      hasRelatedExperience,
      exchangesForCurrentGap + 1, // +1 because we're about to add this exchange
      nextGap,
      cvData // Pass full CV data for context
    );

    const aiResponse = await generateJSON<ChatResponse>(responsePrompt);

    // Create AI message
    const aiChatMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: aiResponse.message,
      timestamp: Date.now(),
    };

    // Update chat history
    const newChatHistory = [...chatHistory, userChatMessage, aiChatMessage];

    // Update strategies if a new one was validated
    const newStrategies = { ...(application.strategies as unknown as Record<string, Strategy>) };
    if (aiResponse.strategy && aiResponse.strategy.validated) {
      newStrategies[currentGap.skill] = aiResponse.strategy;
    }

    // Force move to next gap after 3+ exchanges, even if AI didn't set moveToNextGap
    const forceNextGap = exchangesForCurrentGap >= 3 && !aiResponse.moveToNextGap;
    if (forceNextGap) {
      console.log(`Forcing move to next gap after ${exchangesForCurrentGap} exchanges`);
      // Create a default strategy if none was set
      if (!newStrategies[currentGap.skill]) {
        newStrategies[currentGap.skill] = {
          gapSkill: currentGap.skill,
          approach: "fast_learner",
          details: "Capacité d'apprentissage rapide à mettre en avant",
          validated: true,
        };
      }
    }

    // Calculate new gap index
    const shouldMoveToNextGap = aiResponse.moveToNextGap || forceNextGap;
    const newGapIndex = shouldMoveToNextGap
      ? currentGapIndex + 1
      : currentGapIndex;
    const isComplete = newGapIndex >= analysisResult.gaps.length;

    // Calculate new gapStartIndex (update it when moving to next gap)
    const newGapStartIndex = shouldMoveToNextGap
      ? newChatHistory.length // Start fresh from end of current history
      : gapStartIndex; // Keep current start index

    console.log(`Moving to gap ${newGapIndex + 1}, isComplete: ${isComplete}, newGapStartIndex: ${newGapStartIndex}`);

    // Update application in database
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        chatHistory: newChatHistory,
        strategies: newStrategies,
        gapsAddressed: newGapIndex,
        gapStartIndex: newGapStartIndex,
        status: isComplete ? "strategies_complete" : "chatting",
      },
    });

    return {
      success: true,
      aiMessage: aiChatMessage,
      strategy: aiResponse.strategy,
      isComplete,
      newGapIndex,
    };
  } catch (error) {
    console.error("Chat error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

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
    const strategies = Object.values(application.strategies as unknown as Record<string, Strategy>);

    // Generate initial message from AI
    const systemPrompt = getStrategistSystemPrompt(
      cvData,
      analysisResult,
      0,
      strategies
    );

    const initialMessage = await generateContent(systemPrompt);

    const aiChatMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: initialMessage,
      timestamp: Date.now(),
    };

    // Save to database
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        chatHistory: [aiChatMessage],
        status: "chatting",
      },
    });

    return {
      success: true,
      aiMessage: aiChatMessage,
    };
  } catch (error) {
    console.error("Initialize chat error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}

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

    return {
      success: true,
      chatHistory: application.chatHistory as unknown as ChatMessage[],
      strategies: Object.values(application.strategies as unknown as Record<string, Strategy>),
      currentGapIndex: application.gapsAddressed,
      totalGaps: application.totalGaps,
      gaps: analysisResult.gaps,
      isComplete: application.gapsAddressed >= analysisResult.gaps.length,
    };
  } catch (error) {
    console.error("Get chat state error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue",
    };
  }
}
