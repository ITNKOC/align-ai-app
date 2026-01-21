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

  // Responsive sizes
  const mobileSize = 100;
  const desktopSize = 120;

  return (
    <motion.div
      variants={gaugeContainer}
      initial="initial"
      animate="animate"
      className="card-modern p-3 sm:p-5"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Target className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm sm:text-base">Couverture Profil</h3>
          <p className="text-[10px] sm:text-xs text-white/50">Intelligence progressive</p>
        </div>
      </div>

      {/* Gauge - Responsive via CSS */}
      <div className="flex justify-center mb-3 sm:mb-4">
        {/* Mobile gauge */}
        <div className="relative sm:hidden" style={{ width: mobileSize, height: mobileSize }}>
          <svg
            width={mobileSize}
            height={mobileSize}
            className="transform -rotate-90"
          >
            <circle
              cx={mobileSize / 2}
              cy={mobileSize / 2}
              r={(mobileSize - 6) / 2}
              fill="none"
              stroke="currentColor"
              strokeWidth={6}
              className="text-white/10"
            />
            <motion.circle
              cx={mobileSize / 2}
              cy={mobileSize / 2}
              r={(mobileSize - 6) / 2}
              fill="none"
              stroke={colors.stroke}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * ((mobileSize - 6) / 2)}
              variants={gaugeProgress(percentage)}
              initial="initial"
              animate="animate"
              style={{
                strokeDashoffset: 2 * Math.PI * ((mobileSize - 6) / 2),
              }}
            />
          </svg>
          <motion.div
            variants={gaugeNumber}
            initial="initial"
            animate="animate"
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span className="text-2xl font-bold text-white">{percentage}</span>
            <span className="text-[10px] text-white/50">%</span>
          </motion.div>
        </div>

        {/* Desktop gauge */}
        <div className="relative hidden sm:block" style={{ width: desktopSize, height: desktopSize }}>
          <svg
            width={desktopSize}
            height={desktopSize}
            className="transform -rotate-90"
          >
            <circle
              cx={desktopSize / 2}
              cy={desktopSize / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-white/10"
            />
            <motion.circle
              cx={desktopSize / 2}
              cy={desktopSize / 2}
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
        className="grid grid-cols-2 gap-2 sm:gap-3"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-white/[0.03]">
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-white">{learnedGapsCount}</p>
            <p className="text-[9px] sm:text-[10px] text-white/50 truncate">Skills appris</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-white/[0.03]">
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-white">{totalJobsAnalyzed}</p>
            <p className="text-[9px] sm:text-[10px] text-white/50 truncate">Jobs analyses</p>
          </div>
        </div>
      </motion.div>

      {/* Encouragement message */}
      {percentage < 50 && totalJobsAnalyzed > 0 && (
        <motion.p
          variants={gaugeLabel}
          initial="initial"
          animate="animate"
          className="text-[10px] sm:text-xs text-white/40 text-center mt-2 sm:mt-3"
        >
          Continuez a postuler pour enrichir votre profil
        </motion.p>
      )}
      {percentage >= 70 && (
        <motion.p
          variants={gaugeLabel}
          initial="initial"
          animate="animate"
          className="text-[10px] sm:text-xs text-emerald-400/70 text-center mt-2 sm:mt-3"
        >
          Excellent ! Votre profil est bien optimise
        </motion.p>
      )}
    </motion.div>
  );
}
