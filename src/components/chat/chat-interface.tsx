"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowRight, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble, TypingIndicator } from "./message-bubble";
import type { ChatMessage, GapAnalysis, Strategy } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isTyping: boolean;
  gaps: GapAnalysis[];
  currentGapIndex: number;
  strategies: Strategy[];
  onComplete: () => void;
  isComplete: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  isTyping,
  gaps,
  currentGapIndex,
  strategies,
  onComplete,
  isComplete,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async () => {
    if (!input.trim() || isSending) return;

    const message = input.trim();
    setInput("");
    setIsSending(true);

    try {
      await onSendMessage(message);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Progress header */}
      <motion.div
        className="border-b border-white/10 bg-white/5 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white text-sm md:text-base">
              Exploration des compétences
            </h3>
            <p className="text-xs md:text-sm text-white/50">
              {isComplete
                ? "Toutes les stratégies sont définies !"
                : `Gap ${currentGapIndex + 1} sur ${gaps.length}`}
            </p>
          </div>

          {/* Gap pills - Scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {gaps.map((gap, index) => (
              <motion.div
                key={gap.skill}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "rounded-full px-2.5 md:px-3 py-1 text-xs font-medium transition-all whitespace-nowrap flex-shrink-0",
                  index < currentGapIndex
                    ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                    : index === currentGapIndex
                      ? "bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500/50"
                      : "bg-white/5 text-white/40 ring-1 ring-white/10"
                )}
              >
                {index < currentGapIndex && <Check className="inline h-3 w-3 mr-1" />}
                {gap.skill}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentGapIndex + (isComplete ? 1 : 0)) / gaps.length) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area or Complete button */}
      <div className="border-t border-white/10 bg-white/5 p-3 md:p-4">
        {isComplete ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-2"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 text-lg font-semibold text-emerald-400"
              >
                <div className="rounded-full bg-emerald-500/20 p-1">
                  <Check className="h-4 w-4" />
                </div>
                Stratégies validées !
              </motion.div>
              <p className="mt-2 text-sm text-white/50">
                Toutes les compétences ont été explorées. Vous pouvez maintenant
                générer vos documents.
              </p>
            </div>

            <Button
              onClick={onComplete}
              className="btn-futuristic"
              size="lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Générer mes documents
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <div className="flex gap-2 md:gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Votre réponse..."
              className="min-h-[50px] md:min-h-[60px] resize-none glass border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20"
              disabled={isSending || isTyping}
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isSending || isTyping}
              className="shrink-0 btn-futuristic h-auto"
              size="icon"
            >
              {isSending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Validated strategies summary */}
      {strategies.length > 0 && !isComplete && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-white/10 bg-white/[0.02] px-4 md:px-6 py-3"
        >
          <p className="text-xs font-medium text-white/40 mb-2">
            Stratégies validées :
          </p>
          <div className="flex flex-wrap gap-2">
            {strategies.map((strategy) => (
              <span
                key={strategy.gapSkill}
                className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400 ring-1 ring-emerald-500/30"
              >
                {strategy.gapSkill}:{" "}
                {strategy.approach === "add_skill"
                  ? "Ajout"
                  : strategy.approach === "transferable"
                    ? "Transférable"
                    : "Fast Learner"}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
