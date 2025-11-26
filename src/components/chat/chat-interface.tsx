"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowRight, Sparkles, Check, Zap } from "lucide-react";
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
    <div className="flex h-full flex-col bg-gradient-to-b from-transparent to-black/20">
      {/* Enhanced Progress Header - Mobile First */}
      <motion.div
        className="border-b border-white/10 bg-gradient-to-r from-white/[0.03] to-white/[0.08] backdrop-blur-xl px-3 py-3 sm:px-4 sm:py-4 md:px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Top row - Title and Stats */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="flex-shrink-0"
                >
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </motion.div>
                <h3 className="font-bold text-white text-sm sm:text-base truncate">
                  Exploration des compétences
                </h3>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                {isComplete
                  ? "✓ Toutes les stratégies sont définies"
                  : `Gap ${currentGapIndex + 1} sur ${gaps.length}`}
              </p>
            </div>

            {/* Completion badge */}
            {isComplete && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex-shrink-0 rounded-full bg-emerald-500/20 px-3 py-1.5 border border-emerald-500/30"
              >
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">
                    Complet
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Gap pills - Enhanced scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {gaps.map((gap, index) => {
              const isCompleted = index < currentGapIndex;
              const isCurrent = index === currentGapIndex;

              return (
                <motion.div
                  key={gap.skill}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5",
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/20"
                      : isCurrent
                        ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-300 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/30 scale-105"
                        : "bg-white/5 text-white/40 ring-1 ring-white/10"
                  )}
                >
                  {isCompleted && (
                    <Check className="h-3 w-3 flex-shrink-0" />
                  )}
                  {isCurrent && (
                    <motion.div
                      className="h-2 w-2 rounded-full bg-indigo-400"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <span>{gap.skill}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Enhanced Progress bar */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 relative"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentGapIndex + (isComplete ? 1 : 0)) / gaps.length) * 100}%`,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Messages area - Mobile optimized */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input area - Mobile First */}
      <div className="border-t border-white/10 bg-gradient-to-t from-black/20 to-white/[0.03] backdrop-blur-xl p-3 sm:p-4">
        {isComplete ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-2"
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-4 ring-2 ring-emerald-500/30">
                <Check className="h-8 w-8 text-emerald-400" />
              </div>
            </motion.div>

            {/* Text */}
            <div className="text-center max-w-md">
              <motion.h4
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl font-bold text-emerald-400 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Stratégies validées !
              </motion.h4>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-sm text-white/60 leading-relaxed"
              >
                Toutes les compétences ont été explorées. Vous pouvez maintenant
                générer vos documents optimisés.
              </motion.p>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-sm"
            >
              <Button
                onClick={onComplete}
                className="w-full btn-futuristic py-6 text-base sm:text-lg font-semibold shadow-2xl shadow-indigo-500/50"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Générer mes documents
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <div className="flex gap-2 sm:gap-3">
            {/* Textarea - Enhanced for mobile */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tapez votre réponse..."
                className="min-h-[56px] sm:min-h-[64px] resize-none glass border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl px-4 py-3 text-base"
                disabled={isSending || isTyping}
                rows={2}
              />
              {/* Character hint */}
              {input.length > 200 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-2 right-2 text-xs text-white/30"
                >
                  {input.length}
                </motion.div>
              )}
            </div>

            {/* Send Button - Mobile optimized */}
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isSending || isTyping}
              className="shrink-0 btn-futuristic h-auto w-14 sm:w-16 rounded-2xl"
              size="icon"
            >
              {isSending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Validated strategies summary */}
      {strategies.length > 0 && !isComplete && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-white/10 bg-gradient-to-b from-white/[0.02] to-white/[0.05] backdrop-blur-xl px-3 py-3 sm:px-4 sm:py-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <p className="text-xs font-semibold text-emerald-400/80">
              Stratégies validées
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {strategies.map((strategy, index) => (
              <motion.div
                key={strategy.gapSkill}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05, type: "spring" }}
                className="group relative"
              >
                <motion.div
                  className="absolute -inset-0.5 rounded-full bg-emerald-500/30 opacity-0 group-hover:opacity-100 blur transition-opacity"
                />
                <div className="relative rounded-full bg-emerald-500/15 px-3 py-1.5 ring-1 ring-emerald-500/30 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs text-emerald-300 font-medium">
                      {strategy.gapSkill}
                    </span>
                    <span className="text-xs text-emerald-400/60">·</span>
                    <span className="text-[10px] text-emerald-400/80 uppercase font-semibold">
                      {strategy.approach === "add_skill"
                        ? "Ajout"
                        : strategy.approach === "transferable"
                          ? "Transférable"
                          : "Fast Learner"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
