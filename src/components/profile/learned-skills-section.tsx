"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import type { LearnedGapsRecord } from "@/lib/types";

interface LearnedSkillsSectionProps {
  learnedGaps: LearnedGapsRecord;
}

const strategyLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  add_skill: {
    label: "Competence ajoutee",
    icon: <Target className="w-3 h-3" />,
    color: "text-emerald-400 bg-emerald-500/20",
  },
  transferable: {
    label: "Transferable",
    icon: <TrendingUp className="w-3 h-3" />,
    color: "text-blue-400 bg-blue-500/20",
  },
  fast_learner: {
    label: "Apprentissage rapide",
    icon: <Zap className="w-3 h-3" />,
    color: "text-amber-400 bg-amber-500/20",
  },
  project_based: {
    label: "Base projet",
    icon: <Lightbulb className="w-3 h-3" />,
    color: "text-purple-400 bg-purple-500/20",
  },
  reframe: {
    label: "Reformule",
    icon: <Brain className="w-3 h-3" />,
    color: "text-cyan-400 bg-cyan-500/20",
  },
  acknowledge_gap: {
    label: "Gap reconnu",
    icon: <Clock className="w-3 h-3" />,
    color: "text-rose-400 bg-rose-500/20",
  },
};

export function LearnedSkillsSection({ learnedGaps }: LearnedSkillsSectionProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const skills = Object.entries(learnedGaps).sort((a, b) => {
    // Sort by usage count descending, then by last used
    if (b[1].usageCount !== a[1].usageCount) {
      return b[1].usageCount - a[1].usageCount;
    }
    return new Date(b[1].lastUsed).getTime() - new Date(a[1].lastUsed).getTime();
  });

  if (skills.length === 0) {
    return (
      <div className="p-3 sm:p-6 rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">Competences Apprises</h3>
            <p className="text-[10px] sm:text-xs text-white/50">Via le chatbot strategique</p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-white/40 text-center py-3 sm:py-4">
          Aucune competence apprise pour le moment. Completez des sessions de chat pour enrichir votre profil.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm sm:text-base">Competences Apprises</h3>
          <p className="text-[10px] sm:text-xs text-white/50">
            {skills.length} strategies via le chatbot
          </p>
        </div>
      </div>

      {/* Skills list */}
      <div className="space-y-1.5 sm:space-y-2">
        {skills.map(([skill, data]) => {
          const isExpanded = expandedSkill === skill;
          const strategyConfig = strategyLabels[data.strategy.approach] || {
            label: data.strategy.approach,
            icon: <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3" />,
            color: "text-gray-400 bg-gray-500/20",
          };

          return (
            <motion.div
              key={skill}
              layout
              className="rounded-md sm:rounded-lg bg-white/[0.03] border border-white/5 overflow-hidden"
            >
              {/* Skill header */}
              <button
                onClick={() => setExpandedSkill(isExpanded ? null : skill)}
                className="w-full p-2 sm:p-3 flex items-center justify-between hover:bg-white/5 transition-colors gap-2"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap">
                  <span className="font-medium text-white text-sm sm:text-base truncate">{skill}</span>
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1 flex-shrink-0 ${strategyConfig.color}`}
                  >
                    {strategyConfig.icon}
                    <span className="hidden sm:inline">{strategyConfig.label}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <span className="text-[10px] sm:text-xs text-white/40">
                    {data.usageCount}x
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/40" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/40" />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                      {/* Strategy details */}
                      {data.strategy.details && (
                        <div>
                          <p className="text-[10px] sm:text-xs text-white/40 mb-1">Strategie</p>
                          <p className="text-xs sm:text-sm text-white/70">{data.strategy.details}</p>
                        </div>
                      )}

                      {/* Evidence */}
                      {data.evidence.length > 0 && (
                        <div>
                          <p className="text-[10px] sm:text-xs text-white/40 mb-1">Preuves</p>
                          <ul className="space-y-1">
                            {data.evidence.slice(0, 3).map((e, i) => (
                              <li
                                key={i}
                                className="text-xs sm:text-sm text-white/60 flex items-start gap-1.5 sm:gap-2"
                              >
                                <span className="text-indigo-400 mt-0.5 sm:mt-1">•</span>
                                {e}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Suggested phrasing */}
                      {data.strategy.suggestedPhrasing && (
                        <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                          <p className="text-[10px] sm:text-xs text-indigo-400 mb-1">Formulation suggeree</p>
                          <p className="text-xs sm:text-sm text-white/80 italic">
                            "{data.strategy.suggestedPhrasing}"
                          </p>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2 border-t border-white/5">
                        <span className="text-[10px] sm:text-xs text-white/30">
                          Confiance: {Math.round(data.confidence * 100)}%
                        </span>
                        <span className="text-[10px] sm:text-xs text-white/30">
                          {new Date(data.lastUsed).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
