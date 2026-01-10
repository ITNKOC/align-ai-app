"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, Zap } from "lucide-react";
import {
  gaugeContainer,
  gaugeProgress,
  gaugeNumber,
  gaugeLabel,
} from "@/lib/animations";

interface CoverageGaugeProps {
  percentage: number;
  learnedGapsCount: number;
  totalJobsAnalyzed: number;
}

export function CoverageGauge({
  percentage,
  learnedGapsCount,
  totalJobsAnalyzed,
}: CoverageGaugeProps) {
  // SVG parameters
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Color based on percentage
  const getColor = () => {
    if (percentage >= 70) return { stroke: "#10b981", bg: "bg-emerald-500/20", text: "text-emerald-400" };
    if (percentage >= 40) return { stroke: "#f59e0b", bg: "bg-amber-500/20", text: "text-amber-400" };
    return { stroke: "#6366f1", bg: "bg-indigo-500/20", text: "text-indigo-400" };
  };

  const colors = getColor();

  return (
    <motion.div
      variants={gaugeContainer}
      initial="initial"
      animate="animate"
      className="card-modern p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Target className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div>
          <h3 className="font-semibold text-white">Couverture Profil</h3>
          <p className="text-xs text-white/50">Intelligence progressive</p>
        </div>
      </div>

      {/* Gauge */}
      <div className="flex justify-center mb-4">
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background circle */}
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-white/10"
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
              variants={gaugeProgress(percentage)}
              initial="initial"
              animate="animate"
              style={{
                strokeDashoffset: circumference,
              }}
            />
          </svg>

          {/* Center content */}
          <motion.div
            variants={gaugeNumber}
            initial="initial"
            animate="animate"
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span className="text-3xl font-bold text-white">{percentage}</span>
            <span className="text-xs text-white/50">%</span>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        variants={gaugeLabel}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3"
      >
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]">
          <Zap className="w-4 h-4 text-purple-400" />
          <div>
            <p className="text-sm font-medium text-white">{learnedGapsCount}</p>
            <p className="text-[10px] text-white/50">Skills appris</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <div>
            <p className="text-sm font-medium text-white">{totalJobsAnalyzed}</p>
            <p className="text-[10px] text-white/50">Jobs analyses</p>
          </div>
        </div>
      </motion.div>

      {/* Encouragement message */}
      {percentage < 50 && totalJobsAnalyzed > 0 && (
        <motion.p
          variants={gaugeLabel}
          initial="initial"
          animate="animate"
          className="text-xs text-white/40 text-center mt-3"
        >
          Continuez a postuler pour enrichir votre profil
        </motion.p>
      )}
      {percentage >= 70 && (
        <motion.p
          variants={gaugeLabel}
          initial="initial"
          animate="animate"
          className="text-xs text-emerald-400/70 text-center mt-3"
        >
          Excellent ! Votre profil est bien optimise
        </motion.p>
      )}
    </motion.div>
  );
}
