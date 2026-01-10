"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, TrendingUp, FileSearch, Target, Sparkles } from "lucide-react";

// ==================== EDUCATIONAL LOADING MESSAGES ====================
// 5 rotating phrases that educate users while they wait

interface EducationalTip {
  icon: typeof Lightbulb;
  tip: string;
  detail: string;
}

const educationalTips: EducationalTip[] = [
  {
    icon: Target,
    tip: "Un recruteur passe 6 secondes sur un CV",
    detail: "C'est pourquoi on place vos points forts en premier !",
  },
  {
    icon: FileSearch,
    tip: "Les ATS scannent les mots-clés exacts",
    detail: "On reprend les termes de l'offre dans votre CV",
  },
  {
    icon: TrendingUp,
    tip: "Quantifier multiplie l'impact par 3",
    detail: "\"Augmentation de 40%\" > \"Amélioration significative\"",
  },
  {
    icon: Lightbulb,
    tip: "La lettre répond à \"Pourquoi vous ?\"",
    detail: "On y met vos arguments les plus convaincants",
  },
  {
    icon: Sparkles,
    tip: "Le CV parfait n'invente rien",
    detail: "Il réorganise vos vraies compétences stratégiquement",
  },
];

interface EducationalLoadingProps {
  /** Interval in ms between tip changes (default: 4000) */
  interval?: number;
  /** Custom tips to display instead of defaults */
  customTips?: EducationalTip[];
  /** Whether to show the component */
  isVisible?: boolean;
}

export function EducationalLoading({
  interval = 4000,
  customTips,
  isVisible = true,
}: EducationalLoadingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const tips = customTips || educationalTips;

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tips.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, tips.length, isVisible]);

  if (!isVisible) return null;

  const currentTip = tips[currentIndex];
  const Icon = currentTip.icon;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mb-4">
        {tips.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentIndex ? "bg-indigo-400" : "bg-white/20"
            }`}
            animate={index === currentIndex ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Tip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-white/5 border border-white/10 p-4"
        >
          <div className="flex items-start gap-3">
            <motion.div
              className="p-2 rounded-lg bg-indigo-500/20 flex-shrink-0"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              <Icon className="w-5 h-5 text-indigo-400" />
            </motion.div>
            <div>
              <motion.p
                className="font-medium text-white text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                {currentTip.tip}
              </motion.p>
              <motion.p
                className="text-xs text-white/50 mt-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currentTip.detail}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* "Le saviez-vous ?" label */}
      <motion.p
        className="text-center text-xs text-white/40 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Le saviez-vous ?
      </motion.p>
    </div>
  );
}

// ==================== ANALYSIS LOADING (specific tips) ====================

const analysisTips: EducationalTip[] = [
  {
    icon: Target,
    tip: "Analyse des compétences clés",
    detail: "On identifie les skills prioritaires pour ce poste",
  },
  {
    icon: FileSearch,
    tip: "Détection des mots-clés ATS",
    detail: "Ces termes sont scannés automatiquement par les recruteurs",
  },
  {
    icon: TrendingUp,
    tip: "Calcul du score de compatibilité",
    detail: "Basé sur vos expériences et les exigences du poste",
  },
  {
    icon: Lightbulb,
    tip: "Identification des gaps",
    detail: "On repère ce qui manque pour être le candidat idéal",
  },
  {
    icon: Sparkles,
    tip: "Stratégies de compensation",
    detail: "Vos forces peuvent compenser certaines lacunes",
  },
];

export function AnalysisLoading({ isVisible = true }: { isVisible?: boolean }) {
  return <EducationalLoading customTips={analysisTips} isVisible={isVisible} />;
}

// ==================== GENERATION LOADING (specific tips) ====================

const generationTips: EducationalTip[] = [
  {
    icon: Target,
    tip: "Création de la section \"Pourquoi Moi\"",
    detail: "Votre pitch en 2-3 lignes qui capte l'attention",
  },
  {
    icon: FileSearch,
    tip: "Optimisation ATS en cours",
    detail: "On intègre les mots-clés exacts de l'offre",
  },
  {
    icon: TrendingUp,
    tip: "Réorganisation des expériences",
    detail: "Les plus pertinentes pour ce poste en premier",
  },
  {
    icon: Lightbulb,
    tip: "Rédaction de la lettre de motivation",
    detail: "Arguments personnalisés basés sur vos réponses",
  },
  {
    icon: Sparkles,
    tip: "Mise en page professionnelle",
    detail: "Format LaTeX pour un rendu impeccable",
  },
];

export function GenerationLoading({ isVisible = true }: { isVisible?: boolean }) {
  return <EducationalLoading customTips={generationTips} isVisible={isVisible} />;
}
