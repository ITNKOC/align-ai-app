"use client";

import { motion } from "framer-motion";
import { Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: isAssistant ? -20 : 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex gap-2 md:gap-3",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 ring-1 ring-white/10"
        >
          <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-400" />
        </motion.div>
      )}

      <motion.div
        whileHover={{ scale: 1.01 }}
        className={cn(
          "max-w-[85%] md:max-w-[80%] rounded-2xl px-3 md:px-4 py-2.5 md:py-3",
          isAssistant
            ? "rounded-bl-md glass border border-white/10"
            : "rounded-br-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
        )}
      >
        <p className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap",
          isAssistant ? "text-white/90" : "text-white"
        )}>
          {message.content}
        </p>
        <p
          className={cn(
            "mt-1.5 text-xs",
            isAssistant ? "text-white/40" : "text-white/60"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </motion.div>

      {!isAssistant && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10"
        >
          <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-white/70" />
        </motion.div>
      )}
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center gap-2 md:gap-3"
    >
      <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 ring-1 ring-white/10">
        <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-400" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md glass border border-white/10 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-indigo-400"
            animate={{
              y: [0, -6, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
