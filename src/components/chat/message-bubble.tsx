"use client";

import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
  showTimestamp?: boolean;
}

/**
 * Parse simple markdown (bold **text**) to React elements
 */
function parseMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// Spring animation config for natural feel
const springConfig = {
  type: "spring" as const,
  damping: 25,
  stiffness: 400,
};

export function MessageBubble({ message, showTimestamp = true }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div className="space-y-1">
      {/* Grouped timestamp */}
      {showTimestamp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-2"
        >
          <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
            {new Date(message.timestamp).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={springConfig}
        className={cn(
          "flex gap-2",
          isAssistant ? "justify-start" : "justify-end"
        )}
      >
        {isAssistant && (
          <div className={cn(
            "flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20",
            "w-7 h-7 sm:w-8 sm:h-8"
          )}>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
        )}

        <div
          className={cn(
            "max-w-[80%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3",
            isAssistant
              ? "rounded-tl-sm bg-white/[0.06] border border-white/10"
              : "rounded-tr-sm bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25"
          )}
        >
          <p className={cn(
            "text-[15px] leading-relaxed whitespace-pre-wrap",
            isAssistant ? "text-white/90" : "text-white"
          )}>
            {parseMarkdown(message.content)}
          </p>
        </div>

        {!isAssistant && (
          <div className={cn(
            "flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center",
            "w-7 h-7 sm:w-8 sm:h-8"
          )}>
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={springConfig}
      className="flex items-center gap-2"
    >
      <div className={cn(
        "rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20",
        "w-7 h-7 sm:w-8 sm:h-8"
      )}>
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white/[0.06] border border-white/10 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-indigo-400"
            animate={{
              y: [-6, 0],
            }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: i * 0.12,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
