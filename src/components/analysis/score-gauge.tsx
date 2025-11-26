"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreGauge({
  score,
  size = 180,
  strokeWidth = 10,
}: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Determine color based on score - neon futuristic colors
  const getColor = (value: number) => {
    if (value >= 80) return { stroke: "#10b981", glow: "rgba(16, 185, 129, 0.5)" }; // Emerald neon
    if (value >= 50) return { stroke: "#f59e0b", glow: "rgba(245, 158, 11, 0.5)" }; // Amber neon
    return { stroke: "#f43f5e", glow: "rgba(244, 63, 94, 0.5)" }; // Rose neon
  };

  const colors = getColor(score);

  // Animate the number
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ backgroundColor: colors.glow }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1 }}
      />

      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Background circle - dark themed */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Outer glow ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference, opacity: 0 }}
          animate={{ strokeDashoffset: offset, opacity: 0.2 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          filter="blur(10px)"
        />
      </svg>

      {/* Inner glass circle */}
      <div className="absolute inset-6 rounded-full glass" />

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="flex items-baseline"
        >
          <span
            className="text-4xl md:text-5xl font-bold"
            style={{ color: colors.stroke }}
          >
            {displayScore}
          </span>
          <span className="text-xl md:text-2xl text-white/40">%</span>
        </motion.div>

        <motion.p
          className="mt-1 text-xs md:text-sm font-medium text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Compatibilité
        </motion.p>
      </div>

      {/* Rotating ring decoration */}
      <motion.div
        className="absolute inset-[-4px] rounded-full border border-white/5"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Decorative particles */}
      {score >= 80 && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: colors.stroke }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                x: Math.cos((i * Math.PI) / 4) * 70,
                y: Math.sin((i * Math.PI) / 4) * 70,
              }}
              transition={{
                duration: 1.5,
                delay: 1.5 + i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {/* Pulsing effect for high scores */}
      {score >= 80 && (
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: colors.stroke }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
}
