"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Search, Sparkles, Target } from "lucide-react";
import { PhaseIndicator } from "@/components/shared/phase-indicator";
import { PageTransition } from "@/components/shared/page-transition";
import { AnimatedCard } from "@/components/shared/animated-card";
import { ScoreGauge } from "@/components/analysis/score-gauge";
import { GapList, KeywordCloud } from "@/components/analysis/gap-list";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeJobOffer } from "@/actions/analysis-actions";
import type { AnalysisResult } from "@/lib/types";

export default function AnalyzePage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    const storedProfileId = localStorage.getItem("currentProfileId");
    if (!storedProfileId) {
      toast.error("Veuillez d'abord uploader votre CV");
      router.push("/upload");
      return;
    }
    setProfileId(storedProfileId);
  }, [router]);

  const handleAnalyze = async () => {
    if (!profileId || !jobDescription.trim()) {
      toast.error("Veuillez coller une offre d'emploi");
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzeJobOffer(profileId, jobDescription);

      if (result.success && result.analysisResult) {
        setAnalysisResult(result.analysisResult);
        setApplicationId(result.applicationId || null);
        localStorage.setItem("currentApplicationId", result.applicationId || "");
        toast.success("Analyse terminée !");
      } else {
        throw new Error(result.error || "Échec de l'analyse");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'analyse"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinue = () => {
    if (applicationId) {
      router.push("/chat");
    }
  };

  return (
    <PageTransition className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <PhaseIndicator currentPhase={2} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 md:mt-8 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Analysez l&apos;<span className="gradient-text">offre d&apos;emploi</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/50">
            Collez le texte de l&apos;offre pour obtenir votre score de compatibilité
          </p>
        </motion.div>

        <div className="mt-8 md:mt-12 grid gap-6 lg:grid-cols-2">
          {/* Left column - Input */}
          <AnimatedCard className="h-fit">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 p-3 ring-1 ring-white/10">
                <Search className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Offre d&apos;emploi
                </h2>
                <p className="text-sm text-white/50">
                  Copiez-collez le texte complet
                </p>
              </div>
            </div>

            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Collez ici le texte de l'offre d'emploi...

Exemple:
Nous recherchons un Développeur Full Stack pour rejoindre notre équipe...

Compétences requises:
- React, Node.js
- PostgreSQL
- Docker..."
              className="mt-4 min-h-[250px] md:min-h-[300px] resize-none glass border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20"
              disabled={isAnalyzing || !!analysisResult}
            />

            {!analysisResult && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !jobDescription.trim()}
                className="mt-4 w-full btn-futuristic"
              >
                {isAnalyzing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                    />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyser l&apos;offre
                  </>
                )}
              </Button>
            )}
          </AnimatedCard>

          {/* Right column - Results */}
          <div className="space-y-4 md:space-y-6">
            {isAnalyzing && (
              <AnimatedCard className="flex flex-col items-center justify-center py-8 md:py-12">
                {/* Scanning animation */}
                <div className="relative h-24 w-24 md:h-32 md:w-32">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-indigo-500/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-2 md:inset-3 rounded-full"
                    style={{
                      background: `conic-gradient(from 0deg, transparent, rgba(99, 102, 241, 0.5), transparent)`,
                    }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-4 md:inset-6 rounded-full glass flex items-center justify-center">
                    <Target className="h-8 w-8 md:h-10 md:w-10 text-indigo-400" />
                  </div>
                </div>
                <motion.p
                  className="mt-6 text-base md:text-lg font-medium text-white"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Analyse de la compatibilité...
                </motion.p>
                <p className="mt-2 text-sm text-white/50">
                  Comparaison avec votre profil
                </p>
              </AnimatedCard>
            )}

            {analysisResult && (
              <>
                {/* Score */}
                <AnimatedCard className="flex flex-col items-center py-6 md:py-8">
                  <h2 className="mb-4 md:mb-6 text-lg font-semibold text-white">
                    Score de compatibilité
                  </h2>
                  <ScoreGauge score={analysisResult.score} />

                  {analysisResult.jobTitle && (
                    <div className="mt-4 md:mt-6 text-center">
                      <p className="font-medium text-white">
                        {analysisResult.jobTitle}
                      </p>
                      {analysisResult.company && (
                        <p className="text-sm text-white/50">
                          {analysisResult.company}
                        </p>
                      )}
                    </div>
                  )}
                </AnimatedCard>

                {/* Gaps */}
                <AnimatedCard delay={0.1}>
                  <GapList gaps={analysisResult.gaps} />
                </AnimatedCard>

                {/* Keywords */}
                <AnimatedCard delay={0.2}>
                  <KeywordCloud
                    keywords={analysisResult.keywords}
                    matchedSkills={analysisResult.matchedSkills}
                  />
                </AnimatedCard>

                {/* Continue button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={handleContinue}
                    className="w-full btn-futuristic py-6"
                    size="lg"
                  >
                    Continuer vers le chat stratégique
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="mt-3 text-center text-sm text-white/50">
                    Explorez vos compétences pour combler les gaps identifiés
                  </p>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
