"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Sparkles, Star, PartyPopper, Trophy, Zap, CheckCircle2, Rocket } from "lucide-react";

// ==================== MICRO-CELEBRATIONS DUOLINGO-STYLE ====================
// Celebrations are triggered at key moments:
// - Gap completed in chat
// - All gaps resolved
// - Document generated
// - High score achieved

type CelebrationType =
  | "gap_completed"      // Single gap resolved
  | "all_gaps_done"      // All gaps completed
  | "document_ready"     // CV/Letter generated
  | "high_score"         // Score >= 80%
  | "streak"             // Consecutive applications
  | "first_application"; // First app milestone

interface CelebrationProps {
  type: CelebrationType;
  isVisible: boolean;
  onComplete?: () => void;
  customMessage?: string;
}

const celebrationConfig: Record<CelebrationType, {
  icon: typeof Sparkles;
  title: string;
  message: string;
  gradient: string;
  particleColor: string;
}> = {
  gap_completed: {
    icon: CheckCircle2,
    title: "Bravo !",
    message: "Gap résolu avec succès",
    gradient: "from-emerald-500 to-cyan-500",
    particleColor: "#10b981",
  },
  all_gaps_done: {
    icon: Trophy,
    title: "Incroyable !",
    message: "Tous les gaps sont résolus",
    gradient: "from-amber-500 to-orange-500",
    particleColor: "#f59e0b",
  },
  document_ready: {
    icon: Rocket,
    title: "C'est prêt !",
    message: "Vos documents sont générés",
    gradient: "from-indigo-500 to-purple-500",
    particleColor: "#6366f1",
  },
  high_score: {
    icon: Star,
    title: "Excellent !",
    message: "Score supérieur à 80%",
    gradient: "from-yellow-400 to-amber-500",
    particleColor: "#eab308",
  },
  streak: {
    icon: Zap,
    title: "En feu !",
    message: "Vous êtes sur une lancée",
    gradient: "from-orange-500 to-red-500",
    particleColor: "#f97316",
  },
  first_application: {
    icon: PartyPopper,
    title: "Félicitations !",
    message: "Première candidature créée",
    gradient: "from-pink-500 to-rose-500",
    particleColor: "#ec4899",
  },
};

// Particle component for confetti effect
function Particle({ delay, color }: { delay: number; color: string }) {
  const randomX = Math.random() * 200 - 100;
  const randomY = Math.random() * -150 - 50;
  const randomRotate = Math.random() * 720 - 360;
  const size = Math.random() * 8 + 4;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: "50%",
        top: "50%",
      }}
      initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      animate={{
        opacity: [1, 1, 0],
        scale: [1, 1.2, 0.5],
        x: randomX,
        y: randomY,
        rotate: randomRotate,
      }}
      transition={{
        duration: 1,
        delay: delay,
        ease: "easeOut",
      }}
    />
  );
}

export function Celebration({ type, isVisible, onComplete, customMessage }: CelebrationProps) {
  const [particles, setParticles] = useState<number[]>([]);
  const config = celebrationConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isVisible) {
      // Generate particles
      setParticles(Array.from({ length: 20 }, (_, i) => i));

      // Auto-hide after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop glow */}
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Celebration card */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
          >
            {/* Particles */}
            <div className="absolute inset-0">
              {particles.map((i) => (
                <Particle key={i} delay={i * 0.03} color={config.particleColor} />
              ))}
            </div>

            {/* Main celebration content */}
            <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.gradient} opacity-20 blur-xl`} />

              <div className="relative text-center">
                {/* Icon with pulse animation */}
                <motion.div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${config.gradient} mb-4`}
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 20px rgba(99, 102, 241, 0.3)",
                      "0 0 40px rgba(99, 102, 241, 0.5)",
                      "0 0 20px rgba(99, 102, 241, 0.3)",
                    ],
                  }}
                  transition={{ duration: 1, repeat: 1 }}
                >
                  <Icon className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="text-3xl font-bold text-white mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {config.title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  className="text-lg text-white/70"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {customMessage || config.message}
                </motion.p>

                {/* Sparkles decoration */}
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -left-2"
                  animate={{ rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 0.5, repeat: 2, delay: 0.2 }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==================== MINI CELEBRATION (inline) ====================
// Smaller celebration for inline use (e.g., after validation in chat)

interface MiniCelebrationProps {
  isVisible: boolean;
  message?: string;
}

export function MiniCelebration({ isVisible, message = "Validé !" }: MiniCelebrationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 0.4, repeat: 1 }}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </motion.div>
          <span className="text-emerald-300 font-medium">{message}</span>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==================== PROGRESS CELEBRATION (for streaks) ====================

interface ProgressCelebrationProps {
  current: number;
  target: number;
  label: string;
}

export function ProgressCelebration({ current, target, label }: ProgressCelebrationProps) {
  const progress = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl p-4 bg-slate-800/50 border border-white/10"
      whileHover={{ scale: 1.02 }}
    >
      {/* Progress bar background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />

      {/* Animated progress fill */}
      <motion.div
        className={`absolute inset-y-0 left-0 ${
          isComplete
            ? "bg-gradient-to-r from-emerald-500/30 to-cyan-500/30"
            : "bg-gradient-to-r from-indigo-500/20 to-purple-500/20"
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 360] }}
              transition={{ type: "spring", damping: 10 }}
            >
              <Trophy className="w-6 h-6 text-yellow-400" />
            </motion.div>
          ) : (
            <Zap className="w-6 h-6 text-indigo-400" />
          )}
          <span className="font-medium text-white">{label}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${isComplete ? "text-emerald-400" : "text-white"}`}>
            {current}
          </span>
          <span className="text-white/50">/ {target}</span>
          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ==================== CELEBRATION CONTEXT HOOK ====================
// Global celebration state management

import { createContext, useContext, type ReactNode } from "react";

interface CelebrationContextType {
  celebrate: (type: CelebrationType, customMessage?: string) => void;
}

const CelebrationContext = createContext<CelebrationContextType | null>(null);

export function CelebrationProvider({ children }: { children: ReactNode }) {
  // Celebrations disabled - replaced with subtle toasts
  // The celebrate function is now a no-op
  const celebrate = useCallback((_type: CelebrationType, _customMessage?: string) => {
    // No-op: celebrations are disabled for better UX
    // Use toast notifications instead where appropriate
  }, []);

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    // Return a no-op celebrate function when used outside provider
    // This effectively disables all celebration modals app-wide
    return { celebrate: () => {} };
  }
  return context;
}
