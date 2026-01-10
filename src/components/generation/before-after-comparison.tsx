"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  FileText,
  Layers,
  Zap,
  Target,
} from "lucide-react";
import type { CVData, AnalysisResult, Strategy } from "@/lib/types";

// ==================== AVANT/APRÈS COMPARISON ====================
// Shows what was improved in the optimized CV compared to the original

interface BeforeAfterComparisonProps {
  cvData: CVData;
  analysisResult: AnalysisResult;
  strategies: Record<string, Strategy>;
}

interface ImprovementItem {
  category: string;
  icon: typeof FileText;
  before: string;
  after: string;
  impact: string;
}

export function BeforeAfterComparison({
  cvData,
  analysisResult,
  strategies,
}: BeforeAfterComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate improvement items based on what was done
  const improvements: ImprovementItem[] = [];

  // 1. "Pourquoi Moi" section added
  improvements.push({
    category: "Section \"Pourquoi Moi\"",
    icon: Target,
    before: "Pas de résumé personnalisé",
    after: `Pitch ciblé pour ${analysisResult.jobTitle} avec vos 3 forces clés`,
    impact: "Capte l'attention en 6 secondes",
  });

  // 2. Experience ordering
  if (cvData.experiences.length > 1) {
    improvements.push({
      category: "Ordre des expériences",
      icon: Layers,
      before: "Ordre chronologique standard",
      after: `Réorganisé par pertinence pour ${analysisResult.company || "le poste"}`,
      impact: "L'expérience la plus pertinente en premier",
    });
  }

  // 3. Keywords optimization
  const keywordCount = analysisResult.keywords.length;
  const matchedCount = analysisResult.matchedSkills.length;
  improvements.push({
    category: "Mots-clés ATS",
    icon: Zap,
    before: `${matchedCount} mots-clés de l'offre présents`,
    after: `Optimisé avec les ${keywordCount} mots-clés exacts de l'offre`,
    impact: "+40% de chances de passer les filtres ATS",
  });

  // 4. Gap strategies applied
  const strategiesApplied = Object.entries(strategies).filter(
    ([_, s]) => s.validated
  );
  if (strategiesApplied.length > 0) {
    improvements.push({
      category: "Compétences valorisées",
      icon: Sparkles,
      before: `${strategiesApplied.length} compétences non mises en avant`,
      after: `${strategiesApplied.length} stratégies appliquées pour combler les gaps`,
      impact: "Chaque gap transformé en argument positif",
    });
  }

  // 5. Problem-solution matches
  if (analysisResult.problemSolutionMatches && analysisResult.problemSolutionMatches.length > 0) {
    improvements.push({
      category: "Preuves de résolution",
      icon: CheckCircle2,
      before: "Expériences listées sans contexte",
      after: `${analysisResult.problemSolutionMatches.length} problèmes similaires résolus mis en avant`,
      impact: "Prouve que vous savez résoudre leurs défis",
    });
  }

  // Score improvement estimate
  const estimatedImprovement = Math.min(
    analysisResult.score + strategiesApplied.length * 3 + 10,
    98
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.08] overflow-hidden">
      {/* Header - Always visible */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-white text-sm md:text-base">
              Avant / Après : Ce qui a été amélioré
            </h4>
            <p className="text-xs text-white/50">
              {improvements.length} optimisations appliquées
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Score improvement badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <span className="text-xs text-white/50">Score estimé:</span>
            <span className="text-sm font-bold text-emerald-400">
              {analysisResult.score}% → {estimatedImprovement}%
            </span>
          </div>

          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-white/50" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/50" />
          )}
        </div>
      </motion.button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3">
              {/* Mobile score badge */}
              <div className="sm:hidden flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <span className="text-xs text-white/50">Score estimé:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {analysisResult.score}% → {estimatedImprovement}%
                </span>
              </div>

              {/* Improvement items */}
              {improvements.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-xl bg-white/5 border border-white/10 p-3"
                  >
                    {/* Category header */}
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-semibold text-white">
                        {item.category}
                      </span>
                    </div>

                    {/* Before / After */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 items-center">
                      {/* Before */}
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <span className="text-xs font-bold text-rose-400 uppercase">
                          Avant
                        </span>
                        <span className="text-xs text-white/70">{item.before}</span>
                      </div>

                      {/* Arrow */}
                      <div className="hidden md:flex justify-center">
                        <ArrowRight className="w-5 h-5 text-indigo-400" />
                      </div>

                      {/* After */}
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-xs font-bold text-emerald-400 uppercase">
                          Après
                        </span>
                        <span className="text-xs text-white/70">{item.after}</span>
                      </div>
                    </div>

                    {/* Impact */}
                    <div className="mt-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-yellow-300/70 italic">
                        {item.impact}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center pt-2"
              >
                <p className="text-xs text-white/40">
                  Ces optimisations sont conçues pour{" "}
                  <span className="text-indigo-400 font-medium">
                    minimiser les raisons de rejet
                  </span>{" "}
                  et maximiser vos chances d'entretien.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
