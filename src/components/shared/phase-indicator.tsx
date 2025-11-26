"use client";

import { motion } from "framer-motion";
import { Upload, Search, MessageSquare, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  id: number;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  path: string;
}

const phases: Phase[] = [
  { id: 1, name: "CV", shortName: "CV", icon: <Upload className="h-4 w-4 md:h-5 md:w-5" />, path: "/upload" },
  { id: 2, name: "Analyse", shortName: "Analyse", icon: <Search className="h-4 w-4 md:h-5 md:w-5" />, path: "/analyze" },
  { id: 3, name: "Stratégie", shortName: "Chat", icon: <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />, path: "/chat" },
  { id: 4, name: "Documents", shortName: "Docs", icon: <FileText className="h-4 w-4 md:h-5 md:w-5" />, path: "/generate" },
];

interface PhaseIndicatorProps {
  currentPhase: number;
}

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  return (
    <div className="w-full py-4 md:py-6">
      {/* Mobile: Compact horizontal pills */}
      <div className="flex items-center justify-center gap-2 md:hidden">
        {phases.map((phase, index) => (
          <motion.div
            key={phase.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center"
          >
            <motion.div
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500",
                phase.id < currentPhase
                  ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50"
                  : phase.id === currentPhase
                    ? "bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500/50 glow-primary"
                    : "bg-white/5 text-white/30 ring-1 ring-white/10"
              )}
              whileTap={{ scale: 0.95 }}
            >
              {phase.id < currentPhase ? (
                <Check className="h-4 w-4" />
              ) : (
                phase.icon
              )}
              {phase.id === currentPhase && (
                <motion.div
                  className="absolute inset-0 rounded-full ring-2 ring-indigo-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>

            {index < phases.length - 1 && (
              <motion.div
                className={cn(
                  "mx-1 h-0.5 w-4",
                  phase.id < currentPhase
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-500/50"
                    : "bg-white/10"
                )}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Desktop: Full indicator with labels */}
      <div className="hidden md:flex items-center justify-center">
        {phases.map((phase, index) => (
          <div key={phase.id} className="flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className={cn(
                  "relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500",
                  phase.id < currentPhase
                    ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50"
                    : phase.id === currentPhase
                      ? "bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-white ring-2 ring-indigo-500/50 glow-primary"
                      : "bg-white/5 text-white/30 ring-1 ring-white/10"
                )}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {phase.id < currentPhase ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className="h-6 w-6" />
                  </motion.div>
                ) : (
                  phase.icon
                )}

                {phase.id === currentPhase && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-2xl ring-2 ring-indigo-400"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-xl"
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </>
                )}
              </motion.div>

              <motion.span
                className={cn(
                  "mt-3 text-sm font-medium transition-colors duration-300",
                  phase.id < currentPhase
                    ? "text-emerald-400"
                    : phase.id === currentPhase
                      ? "text-white"
                      : "text-white/40"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {phase.name}
              </motion.span>
            </motion.div>

            {index < phases.length - 1 && (
              <div className="relative mx-4 w-20 lg:w-28">
                <div className="absolute inset-0 h-0.5 top-1/2 -translate-y-1/2 bg-white/10 rounded-full" />
                <motion.div
                  className={cn(
                    "absolute inset-0 h-0.5 top-1/2 -translate-y-1/2 rounded-full",
                    phase.id < currentPhase
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      : "bg-transparent"
                  )}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: phase.id < currentPhase ? 1 : 0 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  style={{ originX: 0 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress text for mobile */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-3 text-center text-xs text-white/50 md:hidden"
      >
        Étape {currentPhase} sur {phases.length}
      </motion.p>
    </div>
  );
}
