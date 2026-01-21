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
import { toast } from "sonner";
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
  const [prevGapIndex, setPrevGapIndex] = useState(currentGapIndex);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentGap = gaps[currentGapIndex];

  // Subtle toast notification when moving to next gap
  useEffect(() => {
    if (currentGapIndex > prevGapIndex && prevGapIndex < gaps.length) {
      toast.success(`${gaps[prevGapIndex]?.skill || "Competence"} valide`, { duration: 1500 });
    }
    setPrevGapIndex(currentGapIndex);
  }, [currentGapIndex, prevGapIndex, gaps]);

  // Subtle toast when all gaps are done
  useEffect(() => {
    if (isComplete && strategies.length > 0) {
      toast.success(`${strategies.length} strategies pretes`, { duration: 2000 });
    }
  }, [isComplete, strategies.length]);
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

  // Track scroll direction for collapsible header
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let lastScrollTop = 0;
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      setIsScrolledDown(scrollTop > 50);
      lastScrollTop = scrollTop;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex h-full flex-col relative">
      {/* Compact Collapsible Header */}
      <motion.div
        className="sticky top-0 z-10 border-b border-white/10 bg-black/80 backdrop-blur-xl px-4"
        animate={{
          paddingTop: isScrolledDown ? 8 : 12,
          paddingBottom: isScrolledDown ? 8 : 12
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Current gap pill */}
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 transition-all",
              isScrolledDown ? "w-7 h-7" : "w-8 h-8"
            )}>
              <Sparkles className={cn("text-white transition-all", isScrolledDown ? "w-3.5 h-3.5" : "w-4 h-4")} />
            </div>
            <div className="min-w-0 flex items-center gap-2">
              <span className={cn(
                "font-semibold text-white truncate transition-all",
                isScrolledDown ? "text-xs" : "text-sm"
              )}>
                {isComplete ? "Termine" : currentGap?.skill || "Competence"}
              </span>
              <span className={cn(
                "text-white/50 flex-shrink-0",
                isScrolledDown ? "text-[10px]" : "text-xs"
              )}>
                {isComplete
                  ? `${strategies.length} ok`
                  : `${currentGapIndex + 1}/${gaps.length}`}
              </span>
            </div>
          </div>

          {/* Quick action */}
          {!isComplete && onSkipAll && (
            <button
              onClick={() => setShowSkipAllConfirm(true)}
              disabled={isSkippingAll}
              className={cn(
                "flex items-center gap-1.5 rounded-full font-medium bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 transition-all disabled:opacity-50",
                isScrolledDown ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
              )}
            >
              <Zap className={cn("transition-all", isScrolledDown ? "w-3 h-3" : "w-3.5 h-3.5")} />
              <span className="hidden sm:inline">Generer</span>
              <ArrowRight className={cn("sm:hidden transition-all", isScrolledDown ? "w-3 h-3" : "w-3.5 h-3.5")} />
            </button>
          )}
        </div>

        {/* Progress dots - collapsible on scroll */}
        <AnimatePresence>
          {!isScrolledDown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                {gaps.map((gap, index) => {
                  const isCompleted = index < currentGapIndex || (gapSlots[index]?.status === "filled");
                  const isCurrent = index === currentGapIndex && !isComplete;

                  return (
                    <motion.button
                      key={gap.skill}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn(
                        "flex items-center justify-center flex-shrink-0 rounded-full transition-all min-w-[32px] min-h-[32px]",
                        isCompleted
                          ? "bg-emerald-500/20"
                          : isCurrent
                            ? "bg-indigo-500/20 ring-2 ring-indigo-500/50"
                            : "bg-white/5"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <motion.div
                          className="w-3 h-3 rounded-full bg-indigo-400"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      ) : (
                        <Circle className="w-4 h-4 text-white/40" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              showTimestamp={
                index === 0 ||
                (message.timestamp - messages[index - 1].timestamp > 5 * 60 * 1000)
              }
            />
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Area */}
      <div className="sticky bottom-0 border-t border-white/10 bg-black/90 backdrop-blur-xl p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        {isComplete ? (
          /* Completion State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/25">
              <Check className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              Strategies validees !
            </h4>
            <p className="text-xs text-white/50 mb-3">
              {strategies.length} strategie{strategies.length > 1 ? "s" : ""} prete{strategies.length > 1 ? "s" : ""} pour vos documents
            </p>
            <button onClick={onComplete} className="btn-primary py-3 px-6 w-full">
              <Sparkles className="w-5 h-5" />
              Generer mes documents
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          /* Active Chat Input - Mobile-First Floating Design */
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {suggestedReplies.length > 0 && !showCustomInput && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  {/* Primary Action - Full width */}
                  {suggestedReplies[0] && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(suggestedReplies[0])}
                      disabled={isSending}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-[15px] font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 active:shadow-emerald-500/40 transition-all disabled:opacity-50"
                    >
                      <Check className="w-5 h-5" />
                      {suggestedReplies[0].label}
                    </motion.button>
                  )}

                  {/* Secondary Actions - Horizontal scrollable chips (WhatsApp style) */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
                    {suggestedReplies.slice(1).map((suggestion, index) => (
                      <motion.button
                        key={suggestion.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: (index + 1) * 0.03 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isSending}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border whitespace-nowrap flex-shrink-0 transition-all disabled:opacity-50 active:scale-95",
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
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 0.1 }}
                        onClick={async () => {
                          setIsSending(true);
                          try {
                            await onSkipGap();
                          } finally {
                            setIsSending(false);
                          }
                        }}
                        disabled={isSending}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border whitespace-nowrap flex-shrink-0 bg-white/5 border-white/20 text-white/50 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300 transition-all disabled:opacity-50 active:scale-95"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                        Passer
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Custom Text Input - Pill-shaped floating design */}
              {(showCustomInput || suggestedReplies.length === 0 || isTyping) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-end gap-2"
                >
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Tapez votre reponse..."
                      className="w-full min-h-[44px] max-h-[120px] resize-none py-3 px-4 rounded-[22px] bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-[15px]"
                      disabled={isSending || isTyping}
                      rows={1}
                    />
                  </div>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isSending || isTyping}
                    animate={{
                      scale: input.trim() ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      scale: { duration: 0.3, repeat: input.trim() ? Infinity : 0, repeatDelay: 2 }
                    }}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                      input.trim()
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25"
                        : "bg-white/10",
                      "disabled:opacity-50"
                    )}
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Send className={cn("w-5 h-5", input.trim() ? "text-white" : "text-white/40")} />
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle between modes */}
            <div className="flex justify-center">
              {showCustomInput && suggestedReplies.length > 0 ? (
                <button
                  onClick={() => setShowCustomInput(false)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 py-1"
                >
                  ← Options rapides
                </button>
              ) : suggestedReplies.length > 0 && !showCustomInput && !isTyping && (
                <button
                  onClick={() => {
                    setShowCustomInput(true);
                    setTimeout(() => textareaRef.current?.focus(), 100);
                  }}
                  className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center gap-1 py-1"
                >
                  <PenLine className="w-3 h-3" />
                  Personnaliser
                </button>
              )}
            </div>
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
