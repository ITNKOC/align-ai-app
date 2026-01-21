"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MessageSquare, Shield, Loader2 } from "lucide-react";
import { AppNavbar } from "@/components/shared/app-navbar";
import { PhaseIndicator } from "@/components/shared/phase-indicator";
import { ChatInterface } from "@/components/chat/chat-interface";
import {
  initializeChat,
  sendChatMessage,
  getChatState,
  skipAllGaps,
  skipCurrentGap,
} from "@/actions/chat-actions";
import type { ChatMessage, GapAnalysis, Strategy, GapSlot } from "@/lib/types";

export default function ChatPage() {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [gaps, setGaps] = useState<GapAnalysis[]>([]);
  const [gapSlots, setGapSlots] = useState<GapSlot[]>([]); // v3.0
  const [currentGapIndex, setCurrentGapIndex] = useState(0);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize chat on mount
  useEffect(() => {
    const storedApplicationId = localStorage.getItem("currentApplicationId");
    if (!storedApplicationId) {
      toast.error("Veuillez d'abord analyser une offre d'emploi");
      router.push("/analyze");
      return;
    }

    setApplicationId(storedApplicationId);
    initializeChatSession(storedApplicationId);
  }, [router]);

  const initializeChatSession = async (appId: string) => {
    try {
      // Get current chat state
      const stateResult = await getChatState(appId);

      if (stateResult.success) {
        setMessages(stateResult.chatHistory || []);
        setGaps(stateResult.gaps || []);
        setGapSlots(stateResult.gapSlots || []); // v3.0
        setCurrentGapIndex(stateResult.currentGapIndex || 0);
        setStrategies(stateResult.strategies || []);
        setIsComplete(stateResult.isComplete || false);

        // Initialize chat if no messages yet
        if (!stateResult.chatHistory?.length) {
          const initResult = await initializeChat(appId);
          if (initResult.success && initResult.aiMessage) {
            setMessages([initResult.aiMessage]);
            // v3.0: Check if init returned complete (all gaps auto-filled)
            if (initResult.isComplete) {
              setIsComplete(true);
            }
          }
          // Refresh state to get updated gapSlots after pre-analysis
          const refreshedState = await getChatState(appId);
          if (refreshedState.success) {
            setGapSlots(refreshedState.gapSlots || []);
            setCurrentGapIndex(refreshedState.currentGapIndex || 0);
          }
        }
      } else {
        throw new Error(stateResult.error);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors du chargement du chat"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!applicationId) return;

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const result = await sendChatMessage(applicationId, content);

        if (result.success) {
          if (result.aiMessage) {
            setMessages((prev) => [...prev, result.aiMessage!]);
          }

          if (result.strategy) {
            setStrategies((prev) => [...prev, result.strategy!]);
          }

          if (result.newGapIndex !== undefined) {
            setCurrentGapIndex(result.newGapIndex);
          }

          if (result.isComplete) {
            setIsComplete(true);
          }
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de l'envoi du message"
        );
      } finally {
        setIsTyping(false);
      }
    },
    [applicationId]
  );

  const handleComplete = useCallback(() => {
    router.push("/generate");
  }, [router]);

  // v3.0: Handle skip current gap
  const handleSkipGap = useCallback(async () => {
    if (!applicationId) return;

    try {
      const result = await skipCurrentGap(applicationId);
      if (result.success) {
        if (result.aiMessage) {
          setMessages((prev) => [...prev, result.aiMessage!]);
        }
        if (result.newGapIndex !== undefined) {
          setCurrentGapIndex(result.newGapIndex);
        }
        if (result.isComplete) {
          setIsComplete(true);
        }
        toast.info("Gap passé - vous pourrez y revenir plus tard");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors du skip"
      );
    }
  }, [applicationId]);

  // v3.0: Handle skip all gaps and go to generation
  const handleSkipAll = useCallback(async () => {
    if (!applicationId) return;

    try {
      const result = await skipAllGaps(applicationId);
      if (result.success) {
        toast.success("Documents prêts à être générés !");
        router.push("/generate");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors du skip"
      );
    }
  }, [applicationId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 md:pb-8">
        <AppNavbar />
        <main className="container-app py-6">
          <div className="mt-16 flex flex-col items-center justify-center">
            <div className="relative w-20 h-20">
              <motion.div
                className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-indigo-500/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-3 rounded-full bg-white/5 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <p className="mt-4 text-white/70">Chargement du chat...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8 flex flex-col">
      <AppNavbar />
      <main className="container-app py-2 sm:py-4 flex flex-col flex-1 min-h-0">
        {/* Phase indicator - compact on mobile */}
        <div className="hidden sm:block">
          <PhaseIndicator currentPhase={3} />
        </div>

        {/* Chat Interface - Full height mobile-first */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-h-0 overflow-hidden card-modern"
        >
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onSkipGap={handleSkipGap}
            onSkipAll={handleSkipAll}
            isTyping={isTyping}
            gaps={gaps}
            gapSlots={gapSlots}
            currentGapIndex={currentGapIndex}
            strategies={strategies}
            onComplete={handleComplete}
            isComplete={isComplete}
          />
        </motion.div>

        {/* Info box - Hidden on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 items-start gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-medium text-white text-sm">Pourquoi ce chat ?</h3>
            <p className="mt-1 text-xs text-white/60">
              Notre IA explore vos experiences pour trouver des competences
              transferables. Si vous n&apos;avez pas une competence, elle vous aidera
              a mettre en avant votre capacite d&apos;apprentissage - sans jamais
              inventer de faits.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
