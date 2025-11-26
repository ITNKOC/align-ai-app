"use client";

import { motion } from "framer-motion";
import { Sparkles, Check, FileText, Brain, Zap } from "lucide-react";

interface BiometricLoaderProps {
  progress?: number;
  status?: string;
}

export function BiometricLoader({
  progress = 0,
  status = "Analyse en cours...",
}: BiometricLoaderProps) {
  const steps = [
    { label: "Extraction du texte", threshold: 30, icon: FileText, gradient: "from-cyan-500 to-indigo-500" },
    { label: "Analyse des compétences", threshold: 65, icon: Brain, gradient: "from-indigo-500 to-purple-500" },
    { label: "Structuration du profil", threshold: 90, icon: Zap, gradient: "from-purple-500 to-violet-500" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12">
      {/* Premium scanning animation container */}
      <div className="relative h-48 w-48 md:h-56 md:w-56 mb-8">
        {/* Static outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Outer ring - progress based */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(99, 102, 241, 0.1)"
            strokeWidth="2"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              strokeDasharray: "1 1",
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Middle decorative ring */}
        <div className="absolute inset-4 md:inset-6 rounded-full border border-white/10 backdrop-blur-sm" />

        {/* Inner premium glass circle */}
        <motion.div
          className="absolute inset-8 md:inset-10 rounded-full glass border border-white/20 backdrop-blur-xl overflow-hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10" />

          {/* Scanning effect overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-transparent via-indigo-500/20 to-transparent"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Center icon with entrance animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring", delay: 0.2 }}
            className="relative"
          >
            {/* Icon glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-50" />

            {/* Icon container */}
            <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl">
              <Sparkles className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Corner accent dots */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-indigo-400"
            style={{
              top: i < 2 ? "10%" : "90%",
              left: i % 2 === 0 ? "10%" : "90%",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
          />
        ))}
      </div>

      {/* Status text with gradient */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-6"
      >
        <p className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
          {status}
        </p>
      </motion.div>

      {/* Premium progress bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm mb-8"
      >
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
          {/* Progress fill with gradient */}
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 via-purple-500 to-violet-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        {/* Progress percentage with animation */}
        <motion.div
          className="mt-3 flex items-center justify-center gap-2"
          key={Math.floor(progress / 5)}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            {Math.round(progress)}%
          </span>
        </motion.div>
      </motion.div>

      {/* Premium extraction steps */}
      <div className="w-full max-w-sm space-y-4">
        {steps.map((step, index) => {
          const isComplete = progress >= step.threshold;
          const isActive =
            progress >= (steps[index - 1]?.threshold || 0) &&
            progress < step.threshold;

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
              className="relative group"
            >
              {/* Hover glow */}
              {isActive && (
                <div className={`absolute -inset-1 bg-gradient-to-r ${step.gradient} rounded-2xl opacity-20 blur-lg`} />
              )}

              {/* Step card */}
              <div className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
                isComplete
                  ? "glass border border-cyan-500/30 bg-cyan-500/5"
                  : isActive
                    ? "glass border border-indigo-500/50 bg-indigo-500/10"
                    : "glass border border-white/10"
              }`}>
                {/* Icon with gradient background */}
                <div className="relative flex-shrink-0">
                  {isActive && (
                    <div className={`absolute -inset-1 bg-gradient-to-r ${step.gradient} rounded-xl blur opacity-50`} />
                  )}

                  <div className={`relative h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    isComplete
                      ? "bg-gradient-to-r from-cyan-500 to-indigo-500"
                      : isActive
                        ? `bg-gradient-to-r ${step.gradient}`
                        : "bg-white/5"
                  }`}>
                    {isComplete ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <step.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-white/40"}`} />
                    )}
                  </div>
                </div>

                {/* Label */}
                <div className="flex-1">
                  <span className={`text-sm md:text-base font-semibold transition-colors duration-300 ${
                    isComplete
                      ? "text-cyan-400"
                      : isActive
                        ? "text-white"
                        : "text-white/50"
                  }`}>
                    {step.label}
                  </span>
                </div>

                {/* Status indicator */}
                {isActive && (
                  <motion.div
                    className="h-2 w-2 rounded-full bg-indigo-400"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
