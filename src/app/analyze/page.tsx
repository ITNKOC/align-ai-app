"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Search, Sparkles, Target, Loader2, Link2 } from "lucide-react";
import { AppNavbar } from "@/components/shared/app-navbar";
import { PhaseIndicator } from "@/components/shared/phase-indicator";
import { AnimatedCard } from "@/components/shared/animated-card";
import { ScoreGauge } from "@/components/analysis/score-gauge";
import { GapList, KeywordCloud } from "@/components/analysis/gap-list";
import { analyzeJobOffer } from "@/actions/analysis-actions";
import type { AnalysisResult } from "@/lib/types";

export default function AnalyzePage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
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
      const result = await analyzeJobOffer(profileId, jobDescription, jobUrl || undefined);

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
    <div className="min-h-screen pb-20 md:pb-8">
      <AppNavbar />
      <main className="container-app py-6">
        <PhaseIndicator currentPhase={2} />
        {/* Header */}
        <div className="page-header text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="badge badge-primary mb-4">Etape 2</span>
            <h1 className="page-title text-2xl sm:text-3xl md:text-4xl">
              Analysez l&apos;<span className="gradient-text">offre d&apos;emploi</span>
            </h1>
            <p className="page-subtitle mt-2 max-w-md mx-auto">
              Collez le texte de l&apos;offre pour obtenir votre score de compatibilite
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mt-8 ${
            analysisResult || isAnalyzing
              ? "grid gap-6 lg:grid-cols-2"
              : "flex justify-center"
          }`}
        >
          {/* Left column - Input Card */}
          <div className={`${!analysisResult && !isAnalyzing ? "w-full max-w-2xl" : ""}`}>
            <div className="card-modern p-5 md:p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Offre d&apos;emploi</h2>
                  <p className="text-xs text-white/50">Copiez-collez le texte complet</p>
                </div>
              </div>

              {/* URL Input */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-xs text-white/50 mb-2">
                  <Link2 className="w-3 h-3" />
                  Lien vers l&apos;offre (optionnel)
                </label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  className="input-modern w-full h-10 text-sm"
                  disabled={isAnalyzing || !!analysisResult}
                />
              </div>

              {/* Textarea */}
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Collez ici le texte de l'offre d'emploi...

Exemple:
Nous recherchons un Developpeur Full Stack...

Competences requises:
- React, Node.js
- PostgreSQL
- Docker..."
                className={`input-modern resize-none w-full ${
                  !analysisResult && !isAnalyzing
                    ? "min-h-[300px] md:min-h-[400px]"
                    : "min-h-[200px] md:min-h-[280px]"
                }`}
                disabled={isAnalyzing || !!analysisResult}
              />

              {/* Character count */}
              {jobDescription && (
                <p className="mt-2 text-xs text-white/40 text-right">
                  {jobDescription.length} caracteres
                </p>
              )}

              {/* Button */}
              {!analysisResult && (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !jobDescription.trim()}
                  className="btn-primary w-full mt-4 py-3 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyser l&apos;offre
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right column - Results */}
          <div className="space-y-6">
            {isAnalyzing && (
              <div className="card-modern p-8 md:p-10">
                <div className="flex flex-col items-center justify-center">
                  {/* Loading animation */}
                  <div className="relative w-24 h-24 mb-6">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-indigo-500/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-3 rounded-full bg-white/5 flex items-center justify-center">
                      <Target className="w-10 h-10 text-indigo-400" />
                    </div>
                  </div>

                  <p className="text-lg font-semibold text-white mb-1">
                    Analyse en cours...
                  </p>
                  <p className="text-sm text-white/50">
                    Comparaison avec votre profil
                  </p>
                </div>
              </div>
            )}

            {analysisResult && (
              <>
                {/* Score */}
                <AnimatedCard className="card-modern flex flex-col items-center p-6 md:p-8">
                  <h2 className="mb-4 text-lg font-semibold text-white">
                    Score de compatibilite
                  </h2>
                  <ScoreGauge score={analysisResult.score} />

                  {analysisResult.jobTitle && (
                    <div className="mt-4 text-center">
                      <p className="font-semibold text-white">
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
                <AnimatedCard delay={0.1} className="card-modern p-5">
                  <GapList gaps={analysisResult.gaps} />
                </AnimatedCard>

                {/* Keywords */}
                <AnimatedCard delay={0.2} className="card-modern p-5">
                  <KeywordCloud
                    keywords={analysisResult.keywords}
                    matchedSkills={analysisResult.matchedSkills}
                  />
                </AnimatedCard>

                {/* Continue button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    onClick={handleContinue}
                    className="btn-primary w-full py-3"
                  >
                    Continuer vers le chat
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="mt-3 text-center text-xs text-white/50">
                    Explorez vos competences pour combler les gaps identifies
                  </p>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
