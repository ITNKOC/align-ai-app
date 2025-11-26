"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MessageSquare, Shield } from "lucide-react";
import { PhaseIndicator } from "@/components/shared/phase-indicator";
import { PageTransition } from "@/components/shared/page-transition";
import { ChatInterface } from "@/components/chat/chat-interface";
import {
  initializeChat,
  sendChatMessage,
  getChatState,
} from "@/actions/chat-actions";
import type { ChatMessage, GapAnalysis, Strategy } from "@/lib/types";

export default function ChatPage() {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [gaps, setGaps] = useState<GapAnalysis[]>([]);
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
        setCurrentGapIndex(stateResult.currentGapIndex || 0);
        setStrategies(stateResult.strategies || []);
        setIsComplete(stateResult.isComplete || false);

        // Initialize chat if no messages yet
        if (!stateResult.chatHistory?.length) {
          const initResult = await initializeChat(appId);
          if (initResult.success && initResult.aiMessage) {
            setMessages([initResult.aiMessage]);
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

  if (isLoading) {
    return (
      <PageTransition className="min-h-screen safe-top safe-bottom">
        <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
          <PhaseIndicator currentPhase={3} />
          <div className="mt-16 md:mt-20 flex flex-col items-center justify-center">
            {/* Loading animation */}
            <div className="relative h-20 w-20 md:h-24 md:w-24">
              <motion.div
                className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-indigo-500/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-3 md:inset-4 rounded-full glass flex items-center justify-center">
                <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-indigo-400" />
              </div>
            </div>
            <motion.p
              className="mt-6 text-base md:text-lg font-medium text-white"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Chargement du chat...
            </motion.p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen safe-top safe-bottom flex flex-col">
      <div className="mx-auto w-full max-w-4xl px-4 py-4 md:py-6 flex flex-col flex-1">
        <PhaseIndicator currentPhase={3} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 md:mt-6 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Chat <span className="gradient-text">stratégique</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/50">
            Explorez vos compétences pour combler les gaps identifiés
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 md:mt-6 flex-1 min-h-0 overflow-hidden rounded-2xl glass border border-white/10"
        >
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            gaps={gaps}
            currentGapIndex={currentGapIndex}
            strategies={strategies}
            onComplete={handleComplete}
            isComplete={isComplete}
          />
        </motion.div>

        {/* Info box - Hidden on mobile to save space */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="hidden md:block mt-4 rounded-xl glass border border-indigo-500/20 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-indigo-500/20 p-2">
              <Shield className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">
                Pourquoi ce chat ?
              </h3>
              <p className="mt-1 text-sm text-white/60">
                Notre IA explore vos expériences pour trouver des compétences
                transférables. Si vous n&apos;avez pas une compétence, elle vous aidera
                à mettre en avant votre capacité d&apos;apprentissage - sans jamais
                inventer de faits.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
