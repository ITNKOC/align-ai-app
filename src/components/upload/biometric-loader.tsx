"use client";

import { motion } from "framer-motion";
import { Scan, Check } from "lucide-react";

interface BiometricLoaderProps {
  progress?: number;
  status?: string;
}

export function BiometricLoader({
  progress = 0,
  status = "Analyse en cours...",
}: BiometricLoaderProps) {
  const steps = [
    { label: "Extraction du texte", threshold: 20 },
    { label: "Analyse des compétences", threshold: 50 },
    { label: "Structuration du profil", threshold: 80 },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12">
      {/* Scanning animation container */}
      <div className="relative h-40 w-40 md:h-48 md:w-48">
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-indigo-500/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Middle ring with gradient */}
        <motion.div
          className="absolute inset-3 md:inset-4 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent, rgba(99, 102, 241, 0.5), transparent)`,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner glass circle */}
        <div className="absolute inset-6 md:inset-8 rounded-full glass" />

        {/* Inner scanning ring */}
        <motion.div
          className="absolute inset-6 md:inset-8 rounded-full ring-2 ring-indigo-500/50"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Scan className="h-10 w-10 md:h-12 md:w-12 text-indigo-400" />
          </motion.div>
        </div>

        {/* Scanning line */}
        <motion.div
          className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-indigo-400 to-transparent"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ originY: "50%" }}
        />

        {/* Data points */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-indigo-400"
            style={{
              top: `${50 + 38 * Math.sin((i * Math.PI) / 4)}%`,
              left: `${50 + 38 * Math.cos((i * Math.PI) / 4)}%`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Status text */}
      <motion.p
        className="mt-6 md:mt-8 text-base md:text-lg font-medium text-white"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {status}
      </motion.p>

      {/* Progress bar */}
      <div className="mt-4 md:mt-6 w-full max-w-xs">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Progress percentage */}
        <motion.p
          className="mt-2 text-center text-sm text-white/50"
          key={progress}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-indigo-400 font-medium">{Math.round(progress)}%</span>
        </motion.p>
      </div>

      {/* Extraction steps */}
      <div className="mt-6 md:mt-8 space-y-3 w-full max-w-xs">
        {steps.map((step, index) => {
          const isComplete = progress >= step.threshold;
          const isActive =
            progress >= (steps[index - 1]?.threshold || 0) &&
            progress < step.threshold;

          return (
            <motion.div
              key={step.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 ${
                  isComplete
                    ? "bg-emerald-500/20 ring-2 ring-emerald-500/50"
                    : isActive
                      ? "bg-indigo-500/20 ring-2 ring-indigo-500/50"
                      : "bg-white/5 ring-1 ring-white/10"
                }`}
              >
                {isComplete ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isActive ? "bg-indigo-400 animate-pulse" : "bg-white/30"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-sm transition-colors duration-300 ${
                  isComplete
                    ? "text-emerald-400"
                    : isActive
                      ? "text-white"
                      : "text-white/40"
                }`}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
