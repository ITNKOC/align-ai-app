"use client";

import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, Lightbulb, Zap, CheckCircle2, Target, Puzzle } from "lucide-react";
import type { GapAnalysis, ProblemSolutionMatch } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GapListProps {
  gaps: GapAnalysis[];
  autoResolvedSkills?: Set<string>;
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

export function GapList({ gaps, autoResolvedSkills }: GapListProps) {
  const autoResolvedCount = autoResolvedSkills?.size || 0;

  return (
    <div className="space-y-4">
      <motion.h3
        className="text-lg font-semibold text-white flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <span className="text-indigo-400">→</span>
        <span className="gradient-text">Ce qu'il reste à valoriser</span>
        <span className="text-white/50 text-sm font-normal">({gaps.length})</span>
        {autoResolvedCount > 0 && (
          <span className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Zap className="w-3 h-3" />
            {autoResolvedCount} auto
          </span>
        )}
      </motion.h3>

      <div className="space-y-3">
        {gaps.map((gap, index) => {
          const config = severityConfig[gap.severity];
          const Icon = config.icon;
          const isAutoResolved = autoResolvedSkills?.has(gap.skill);

          return (
            <motion.div
              key={gap.skill}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className={cn(
                "rounded-xl border p-4 transition-all duration-300",
                isAutoResolved
                  ? "bg-emerald-500/10 border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : cn(config.bg, config.border, config.glow)
              )}
            >
              <div className="flex items-start gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.15 + 0.2, type: "spring" }}
                  className={cn(
                    "rounded-lg p-2",
                    isAutoResolved ? "bg-emerald-500/20" : config.iconBg
                  )}
                >
                  {isAutoResolved ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Icon className={cn("h-4 w-4", config.iconColor)} />
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className={cn(
                      "font-semibold",
                      isAutoResolved ? "text-emerald-300" : "text-white"
                    )}>
                      {gap.skill}
                    </h4>
                    {isAutoResolved ? (
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Auto-résolu
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          config.badge
                        )}
                      >
                        {config.label}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-white/50">{gap.category}</p>

                  <motion.div
                    className={cn(
                      "mt-3 flex items-start gap-2 rounded-lg p-2",
                      isAutoResolved ? "bg-emerald-500/10" : "bg-white/5"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                  >
                    {isAutoResolved ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-emerald-300/80">
                          Stratégie apprise d'une candidature précédente
                        </p>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-white/60">{gap.suggestion}</p>
                      </>
                    )}
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

// ==================== NEW: MATCHED SKILLS COMPONENT (Matches AVANT gaps) ====================
interface MatchedSkillsListProps {
  matchedSkills: string[];
  totalKeywords: number;
  score: number;
}

export function MatchedSkillsList({ matchedSkills, totalKeywords, score }: MatchedSkillsListProps) {
  const targetScore = Math.min(score + 20, 100); // Target score after addressing gaps

  return (
    <div className="space-y-4">
      {/* Encouraging header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-300 font-semibold">
            Tu as déjà {score}% du job !
          </span>
        </motion.div>
        <p className="text-sm text-white/60">
          Voici comment atteindre <span className="text-indigo-400 font-semibold">{targetScore}%</span>
        </p>
      </motion.div>

      {/* Section header */}
      <motion.h3
        className="text-lg font-semibold text-white flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-emerald-400">✓</span>
        <span className="gradient-text">Ce que tu maîtrises déjà</span>
        <span className="text-white/50 text-sm font-normal">({matchedSkills.length})</span>
      </motion.h3>

      {/* Matched skills grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
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
        {matchedSkills.map((skill, index) => (
          <motion.div
            key={skill}
            variants={{
              hidden: { opacity: 0, scale: 0.8, y: 10 },
              visible: { opacity: 1, scale: 1, y: 0 },
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition-all cursor-default"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-sm text-emerald-300 font-medium truncate">{skill}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary stat */}
      <motion.div
        className="flex items-center justify-center gap-2 pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-sm text-white/50">
          <span className="text-emerald-400 font-semibold">{matchedSkills.length}</span> compétences sur{" "}
          <span className="text-white/70">{totalKeywords}</span> déjà acquises
        </span>
      </motion.div>
    </div>
  );
}

// ==================== PROBLEM → SOLUTION MATCHES ====================
// Shows how the candidate has solved similar problems to what the company needs

interface ProblemSolutionListProps {
  matches: ProblemSolutionMatch[];
}

export function ProblemSolutionList({ matches }: ProblemSolutionListProps) {
  if (!matches || matches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 mb-3"
        >
          <Puzzle className="w-5 h-5 text-purple-400" />
          <span className="text-purple-300 font-semibold">
            Vous avez déjà résolu des problèmes similaires !
          </span>
        </motion.div>
      </motion.div>

      {/* Section title */}
      <motion.h3
        className="text-lg font-semibold text-white flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Target className="w-5 h-5 text-purple-400" />
        <span className="gradient-text">Problèmes → Solutions</span>
        <span className="text-white/50 text-sm font-normal">({matches.length} matches)</span>
      </motion.h3>

      {/* Matches list */}
      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        {matches.map((match, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 },
            }}
            whileHover={{ scale: 1.01, x: 4 }}
            className="rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-4 transition-all"
          >
            <div className="flex flex-col gap-2">
              {/* Problem */}
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold text-sm">Problème:</span>
                <span className="text-white/80 text-sm">{match.implicitProblem}</span>
              </div>

              {/* Solution */}
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold text-sm">Votre preuve:</span>
                <span className="text-white/80 text-sm">{match.candidateProof}</span>
              </div>

              {/* Evidence */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-white/40 italic">📍 {match.cvEvidence}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white/40">Pertinence:</span>
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-3 rounded-sm ${
                          i < match.relevanceScore
                            ? "bg-purple-400"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Encouragement */}
      <motion.div
        className="flex items-center justify-center gap-2 pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Lightbulb className="w-4 h-4 text-yellow-400" />
        <span className="text-sm text-white/50">
          Ces expériences prouvent que vous savez résoudre leurs défis !
        </span>
      </motion.div>
    </div>
  );
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
