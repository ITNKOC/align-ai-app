"use client";

import { motion } from "framer-motion";
import { Upload, Search, MessageSquare, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  id: number;
  name: string;
  shortName: string;
  icon: React.ElementType;
  path: string;
  gradient: string;
}

const phases: Phase[] = [
  { id: 1, name: "CV", shortName: "CV", icon: Upload, path: "/upload", gradient: "from-cyan-500 to-indigo-500" },
  { id: 2, name: "Analyse", shortName: "Analyse", icon: Search, path: "/analyze", gradient: "from-indigo-500 to-purple-500" },
  { id: 3, name: "Stratégie", shortName: "Chat", icon: MessageSquare, path: "/chat", gradient: "from-purple-500 to-violet-500" },
  { id: 4, name: "Documents", shortName: "Docs", icon: FileText, path: "/generate", gradient: "from-violet-500 to-cyan-500" },
];

interface PhaseIndicatorProps {
  currentPhase: number;
}

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  return (
    <div className="w-full py-6 md:py-8">
      {/* Mobile: Premium compact horizontal */}
      <div className="flex items-center justify-center gap-2 md:hidden">
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          const isComplete = phase.id < currentPhase;
          const isCurrent = phase.id === currentPhase;

          return (
            <motion.div
              key={phase.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.08, type: "spring" }}
              className="flex items-center"
            >
              <div className="relative group">
                {/* Glow for current/completed */}
                {(isCurrent || isComplete) && (
                  <div className={`absolute -inset-1 bg-gradient-to-r ${phase.gradient} rounded-full blur-md opacity-40`} />
                )}

                {/* Phase circle */}
                <motion.div
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-500",
                    isComplete
                      ? `bg-gradient-to-br ${phase.gradient} shadow-lg`
                      : isCurrent
                        ? "glass ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/30"
                        : "glass ring-1 ring-white/10"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <Icon className={cn(
                      "h-5 w-5 transition-colors",
                      isCurrent ? "text-indigo-400" : "text-white/40"
                    )} />
                  )}
                </motion.div>
              </div>

              {/* Connector line */}
              {index < phases.length - 1 && (
                <div className="relative mx-2 w-6">
                  <div className="absolute inset-0 h-0.5 top-1/2 -translate-y-1/2 bg-white/10 rounded-full" />
                  {isComplete && (
                    <motion.div
                      className={`absolute inset-0 h-0.5 top-1/2 -translate-y-1/2 bg-gradient-to-r ${phase.gradient} rounded-full`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.08 + 0.3, duration: 0.4 }}
                      style={{ originX: 0 }}
                    />
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Desktop: Premium full indicator */}
      <div className="hidden md:flex items-center justify-center">
        {phases.map((phase, index) => {
          const Icon = phase.icon;
          const isComplete = phase.id < currentPhase;
          const isCurrent = phase.id === currentPhase;

          return (
            <div key={phase.id} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                className="flex flex-col items-center relative group"
              >
                {/* Static glow for current/completed */}
                {(isCurrent || isComplete) && (
                  <div className={`absolute top-0 -inset-2 bg-gradient-to-r ${phase.gradient} rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
                )}

                {/* Premium phase card */}
                <motion.div
                  className={cn(
                    "relative flex h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-2xl transition-all duration-500 overflow-hidden",
                    isComplete
                      ? `bg-gradient-to-br ${phase.gradient} shadow-2xl ring-2 ring-white/20`
                      : isCurrent
                        ? "glass ring-2 ring-indigo-500/50 shadow-2xl shadow-indigo-500/30"
                        : "glass ring-1 ring-white/10"
                  )}
                  whileHover={{ scale: 1.08, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Top accent */}
                  {(isCurrent || isComplete) && (
                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${phase.gradient}`} />
                  )}

                  {/* Icon or check */}
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                    >
                      <Check className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
                    </motion.div>
                  ) : (
                    <Icon className={cn(
                      "h-6 w-6 lg:h-7 lg:w-7 transition-colors",
                      isCurrent ? "text-indigo-400" : "text-white/40"
                    )} />
                  )}

                  {/* Bottom shine */}
                  {(isCurrent || isComplete) && (
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  )}
                </motion.div>

                {/* Label with gradient for completed/current */}
                <motion.span
                  className={cn(
                    "mt-4 text-sm lg:text-base font-bold transition-colors duration-300",
                    isComplete
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400"
                      : isCurrent
                        ? "text-white"
                        : "text-white/40"
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {phase.name}
                </motion.span>

                {/* Phase number badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                  className={cn(
                    "mt-2 px-2 py-0.5 rounded-full text-xs font-semibold",
                    isComplete
                      ? `bg-gradient-to-r ${phase.gradient} text-white`
                      : isCurrent
                        ? "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30"
                        : "bg-white/5 text-white/30"
                  )}
                >
                  {phase.id}
                </motion.div>
              </motion.div>

              {/* Premium connector */}
              {index < phases.length - 1 && (
                <div className="relative mx-6 lg:mx-8 w-24 lg:w-32">
                  {/* Background line */}
                  <div className="absolute inset-0 h-1 top-1/2 -translate-y-1/2 bg-white/10 rounded-full" />

                  {/* Animated progress line */}
                  {isComplete && (
                    <motion.div
                      className={`absolute inset-0 h-1 top-1/2 -translate-y-1/2 bg-gradient-to-r ${phase.gradient} rounded-full shadow-lg`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.1 + 0.4, duration: 0.6, ease: "easeOut" }}
                      style={{ originX: 0 }}
                    />
                  )}

                  {/* Moving dot on active line */}
                  {isComplete && (
                    <motion.div
                      className="absolute h-2 w-2 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg"
                      initial={{ left: 0 }}
                      animate={{ left: "100%" }}
                      transition={{ delay: index * 0.1 + 0.4, duration: 0.6, ease: "easeOut" }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile progress info - Premium */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4 text-center md:hidden"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 backdrop-blur-xl">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold text-white/70">
            Étape {currentPhase} sur {phases.length}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
