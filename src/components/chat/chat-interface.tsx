"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ArrowRight,
  Sparkles,
  Check,
  Zap,
  SkipForward,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  PenLine,
  Loader2,
  CheckCircle,
  Circle,
} from "lucide-react";
import { MessageBubble, TypingIndicator } from "./message-bubble";
import { MiniCelebration, useCelebration } from "@/components/shared/celebration";
import type { ChatMessage, GapAnalysis, Strategy, GapSlot, SuggestedReply } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onSkipGap?: () => Promise<void>;
  onSkipAll?: () => Promise<void>;
  isTyping: boolean;
  gaps: GapAnalysis[];
  gapSlots?: GapSlot[];
  currentGapIndex: number;
  currentPhase?: "exploration" | "clarification" | "quantification" | "validation";
  strategies: Strategy[];
  onComplete: () => void;
  isComplete: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onSkipGap,
  onSkipAll,
  isTyping,
  gaps,
  gapSlots = [],
  currentGapIndex,
  strategies,
  onComplete,
  isComplete,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSkipAllConfirm, setShowSkipAllConfirm] = useState(false);
  const [isSkippingAll, setIsSkippingAll] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showMiniCelebration, setShowMiniCelebration] = useState(false);
  const [prevGapIndex, setPrevGapIndex] = useState(currentGapIndex);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Celebration hook for big milestones
  const { celebrate } = useCelebration();

  const currentGap = gaps[currentGapIndex];

  // Trigger celebration when moving to next gap
  useEffect(() => {
    if (currentGapIndex > prevGapIndex && prevGapIndex < gaps.length) {
      // Gap completed - trigger celebration!
      celebrate("gap_completed", `${gaps[prevGapIndex]?.skill || "Competence"} valide !`);
    }
    setPrevGapIndex(currentGapIndex);
  }, [currentGapIndex, prevGapIndex, gaps, celebrate]);

  // Trigger celebration when all gaps are done
  useEffect(() => {
    if (isComplete && strategies.length > 0) {
      celebrate("all_gaps_done", `${strategies.length} strategies pretes !`);
    }
  }, [isComplete, strategies.length, celebrate]);
  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
  const suggestedReplies = lastAssistantMessage?.suggestedReplies || [];

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
    setShowCustomInput(false);
    setIsSending(true);
    try {
      await onSendMessage(message);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleSuggestionClick = async (suggestion: SuggestedReply) => {
    if (isSending) return;
    setIsSending(true);
    setShowCustomInput(false);

    // Show mini celebration for positive validation
    if (suggestion.type === "positive") {
      setShowMiniCelebration(true);
      setTimeout(() => setShowMiniCelebration(false), 1500);
    }

    try {
      await onSendMessage(suggestion.value);
    } finally {
      setIsSending(false);
    }
  };

  const handleSkipAll = async () => {
    if (onSkipAll) {
      setShowSkipAllConfirm(false);
      setIsSkippingAll(true);
      try {
        await onSkipAll();
      } finally {
        setIsSkippingAll(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <ThumbsUp className="w-3.5 h-3.5" />;
      case "negative":
        return <ThumbsDown className="w-3.5 h-3.5" />;
      case "detail":
        return <HelpCircle className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const getSuggestionStyle = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20";
      case "negative":
        return "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20";
      case "detail":
        return "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20";
      default:
        return "bg-white/5 border-white/20 text-white/80 hover:bg-white/10";
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Compact Header */}
      <div className="border-b border-white/10 bg-white/[0.02] px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Current gap info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">
                {isComplete ? "Exploration terminee" : currentGap?.skill || "Competence"}
              </h3>
              <p className="text-xs text-white/50">
                {isComplete
                  ? `${strategies.length} strategies definies`
                  : `Gap ${currentGapIndex + 1}/${gaps.length}`}
              </p>
            </div>
          </div>

          {/* Quick action */}
          {!isComplete && onSkipAll && (
            <button
              onClick={() => setShowSkipAllConfirm(true)}
              disabled={isSkippingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Generer maintenant</span>
              <span className="sm:hidden">Generer</span>
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
          {gaps.map((gap, index) => {
            const isCompleted = index < currentGapIndex || (gapSlots[index]?.status === "filled");
            const isCurrent = index === currentGapIndex && !isComplete;

            return (
              <motion.div
                key={gap.skill}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all",
                  isCompleted
                    ? "bg-emerald-500/20 text-emerald-400"
                    : isCurrent
                      ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50"
                      : "bg-white/5 text-white/40"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-3 h-3" />
                ) : isCurrent ? (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-indigo-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">{gap.skill}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Skip All Modal */}
      <AnimatePresence>
        {showSkipAllConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSkipAllConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-modern p-6 max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white">Generer maintenant ?</h3>
              </div>
              <p className="text-sm text-white/60 mb-6">
                L'IA a pre-analyse votre profil et trouvera des strategies optimales pour les competences restantes.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipAllConfirm(false)}
                  className="btn-ghost flex-1 py-2.5"
                >
                  Continuer
                </button>
                <button
                  onClick={handleSkipAll}
                  disabled={isSkippingAll}
                  className="btn-primary flex-1 py-2.5"
                >
                  {isSkippingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-white/[0.02] p-4">
        {isComplete ? (
          /* Completion State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-2"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
              <Check className="w-7 h-7 text-white" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">
              Strategies validees !
            </h4>
            <p className="text-sm text-white/50 mb-4">
              {strategies.length} strategie{strategies.length > 1 ? "s" : ""} prete{strategies.length > 1 ? "s" : ""} pour vos documents
            </p>
            <button onClick={onComplete} className="btn-primary py-3 px-8">
              <Sparkles className="w-5 h-5" />
              Generer mes documents
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          /* Active Chat Input */
          <div className="space-y-3">
            {/* VALIDATOR MODE: Action Buttons */}
            <AnimatePresence mode="wait">
              {suggestedReplies.length > 0 && !showCustomInput && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {/* Mini Celebration */}
                  <div className="flex justify-center">
                    <MiniCelebration isVisible={showMiniCelebration} message="Valide !" />
                  </div>

                  {/* Validator Mode Header */}
                  {!showMiniCelebration && (
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                      <span className="text-xs text-indigo-400 font-medium px-2">Validez en 1 clic</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                    </div>
                  )}

                  {/* Primary Action: Parfait button (larger, prominent) */}
                  <div className="flex flex-col gap-2">
                    {suggestedReplies[0] && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => handleSuggestionClick(suggestedReplies[0])}
                        disabled={isSending}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all disabled:opacity-50"
                      >
                        <Check className="w-5 h-5" />
                        {suggestedReplies[0].label}
                      </motion.button>
                    )}

                    {/* Secondary Actions */}
                    <div className="flex gap-2">
                      {suggestedReplies.slice(1).map((suggestion, index) => (
                        <motion.button
                          key={suggestion.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (index + 1) * 0.05 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isSending}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-50",
                            getSuggestionStyle(suggestion.type)
                          )}
                        >
                          {getSuggestionIcon(suggestion.type)}
                          {suggestion.label}
                        </motion.button>
                      ))}
                      {onSkipGap && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 }}
                          onClick={async () => {
                            setIsSending(true);
                            try {
                              await onSkipGap();
                            } finally {
                              setIsSending(false);
                            }
                          }}
                          disabled={isSending}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border bg-white/5 border-white/20 text-white/50 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300 transition-all disabled:opacity-50"
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                          Passer
                        </motion.button>
                      )}
                    </div>

                    {/* Custom input toggle */}
                    <button
                      onClick={() => {
                        setShowCustomInput(true);
                        setTimeout(() => textareaRef.current?.focus(), 100);
                      }}
                      className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center justify-center gap-1 py-1"
                    >
                      <PenLine className="w-3 h-3" />
                      Ecrire une reponse personnalisee
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Custom Input */}
              {(showCustomInput || suggestedReplies.length === 0 || isTyping) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2"
                >
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Tapez votre reponse..."
                      className="input-modern w-full min-h-[52px] resize-none py-3 pr-4"
                      disabled={isSending || isTyping}
                      rows={1}
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isSending || isTyping}
                    className="btn-primary w-13 h-[52px] rounded-xl flex-shrink-0 disabled:opacity-50"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to validator mode */}
            {showCustomInput && suggestedReplies.length > 0 && (
              <button
                onClick={() => setShowCustomInput(false)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center gap-1"
              >
                ← Revenir aux options de validation
              </button>
            )}
          </div>
        )}
      </div>

      {/* Strategies Summary (compact) */}
      {strategies.length > 0 && !isComplete && (
        <div className="border-t border-white/10 bg-emerald-500/5 px-4 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-emerald-400/80 font-medium">
              Valide:
            </span>
            {strategies.slice(0, 4).map((strategy) => (
              <span
                key={strategy.gapSkill}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300"
              >
                <Check className="w-2.5 h-2.5" />
                {strategy.gapSkill}
              </span>
            ))}
            {strategies.length > 4 && (
              <span className="text-[10px] text-emerald-400/60">
                +{strategies.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
