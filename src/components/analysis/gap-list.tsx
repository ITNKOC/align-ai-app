"use client";

import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, Lightbulb } from "lucide-react";
import type { GapAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GapListProps {
  gaps: GapAnalysis[];
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
    badge: "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30",
    label: "Critique",
    glow: "hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]",
  },
  moderate: {
    icon: AlertCircle,
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30",
    label: "Modéré",
    glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
  },
  minor: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30",
    label: "Mineur",
    glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
  },
};

export function GapList({ gaps }: GapListProps) {
  return (
    <div className="space-y-4">
      <motion.h3
        className="text-lg font-semibold text-white flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <span className="gradient-text">Compétences à développer</span>
        <span className="text-white/50 text-sm font-normal">({gaps.length})</span>
      </motion.h3>

      <div className="space-y-3">
        {gaps.map((gap, index) => {
          const config = severityConfig[gap.severity];
          const Icon = config.icon;

          return (
            <motion.div
              key={gap.skill}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className={cn(
                "rounded-xl border p-4 transition-all duration-300",
                config.bg,
                config.border,
                config.glow
              )}
            >
              <div className="flex items-start gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.15 + 0.2, type: "spring" }}
                  className={cn("rounded-lg p-2", config.iconBg)}
                >
                  <Icon className={cn("h-4 w-4", config.iconColor)} />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-white">{gap.skill}</h4>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        config.badge
                      )}
                    >
                      {config.label}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-white/50">{gap.category}</p>

                  <motion.div
                    className="mt-3 flex items-start gap-2 rounded-lg bg-white/5 p-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                  >
                    <Lightbulb className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-white/60">{gap.suggestion}</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

interface KeywordCloudProps {
  keywords: string[];
  matchedSkills: string[];
}

export function KeywordCloud({ keywords, matchedSkills }: KeywordCloudProps) {
  const matchedSet = new Set(matchedSkills.map((s) => s.toLowerCase()));

  return (
    <div className="space-y-4">
      <motion.h3
        className="text-lg font-semibold text-white"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Mots-clés de l&apos;offre
      </motion.h3>

      <motion.div
        className="flex flex-wrap gap-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
          },
        }}
      >
        {keywords.map((keyword) => {
          const isMatched = matchedSet.has(keyword.toLowerCase());

          return (
            <motion.span
              key={keyword}
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
              whileHover={{ scale: 1.1, y: -2 }}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 cursor-default",
                isMatched
                  ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                  : "bg-white/5 text-white/50 ring-1 ring-white/10 hover:bg-white/10"
              )}
            >
              {isMatched && "✓ "}
              {keyword}
            </motion.span>
          );
        })}
      </motion.div>

      <motion.div
        className="flex items-center gap-2 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="text-white/50">
          <span className="text-emerald-400 font-medium">{matchedSkills.length}</span> compétences correspondantes sur{" "}
          <span className="text-white/70">{keywords.length}</span> mots-clés
        </span>
      </motion.div>
    </div>
  );
}
