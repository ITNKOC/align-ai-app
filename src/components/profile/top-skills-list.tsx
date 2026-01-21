"use client";

import { motion } from "framer-motion";
import { BarChart3, CheckCircle, Circle } from "lucide-react";
import { staggerContainer, staggerItem, fadeIn } from "@/lib/animations";
import type { SkillCoverage } from "@/actions/profile-actions";

interface TopSkillsListProps {
  skills: SkillCoverage[];
}

export function TopSkillsList({ skills }: TopSkillsListProps) {
  if (skills.length === 0) {
    return null;
  }

  // Calculate max for relative bar widths
  const maxCount = Math.max(...skills.map(s => s.requestCount), 1);

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="card-modern p-3 sm:p-5"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/20 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm sm:text-base">Top Skills Demandes</h3>
          <p className="text-[10px] sm:text-xs text-white/50">Base sur vos analyses</p>
        </div>
      </div>

      <motion.div
        variants={staggerContainer(0.05)}
        initial="initial"
        animate="animate"
        className="space-y-1.5 sm:space-y-2"
      >
        {skills.slice(0, 6).map((skill, index) => (
          <motion.div
            key={skill.skill}
            variants={staggerItem}
            className="relative"
          >
            {/* Background bar */}
            <div className="absolute inset-0 rounded-md sm:rounded-lg bg-white/[0.03]" />

            {/* Progress bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(skill.requestCount / maxCount) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.05 + 0.3 }}
              className={`absolute inset-y-0 left-0 rounded-md sm:rounded-lg ${
                skill.isCovered ? "bg-emerald-500/20" : "bg-indigo-500/10"
              }`}
            />

            {/* Content */}
            <div className="relative flex items-center justify-between p-2 sm:p-2.5">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                {skill.isCovered ? (
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/30 flex-shrink-0" />
                )}
                <span className={`text-xs sm:text-sm truncate ${
                  skill.isCovered ? "text-white" : "text-white/70"
                }`}>
                  {skill.skill}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-white/40 tabular-nums flex-shrink-0 ml-2">
                {skill.requestCount}x
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Legend */}
      <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/5 text-[10px] sm:text-xs text-white/40">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
          Couvert
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Circle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/30" />
          A developper
        </div>
      </div>
    </motion.div>
  );
}
