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
    <PageTransition className="min-h-screen safe-top safe-bottom relative overflow-hidden">
      {/* Premium background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 relative">
        <PhaseIndicator currentPhase={2} />

        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8 md:mt-12 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="inline-flex items-center gap-2 rounded-full glass border border-white/10 backdrop-blur-xl px-4 py-2 mb-6"
          >
            <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-sm font-semibold text-white/80">Phase 2 - Analyse Compatibilité</span>
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            Analysez l&apos;
            <span className="relative inline-block">
              <span className="gradient-text">offre d&apos;emploi</span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 md:h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            Collez le texte de l&apos;offre pour obtenir votre{" "}
            <span className="text-white font-bold">score de compatibilité</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={`mt-10 md:mt-16 ${
            analysisResult || isAnalyzing
              ? "grid gap-6 lg:grid-cols-2"
              : "flex justify-center"
          }`}
        >
          {/* Left column - Premium Input Card */}
          <div className={`relative group h-fit ${
            !analysisResult && !isAnalyzing ? "w-full max-w-3xl" : ""
          }`}>
            {/* Hover glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[28px] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />

            {/* Card */}
            <div className={`relative glass rounded-[28px] border border-white/10 backdrop-blur-xl overflow-hidden ${
              !analysisResult && !isAnalyzing ? "p-8 md:p-10" : "p-6 md:p-8"
            }`}>
              {/* Top gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {/* Icon glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-40" />

                  {/* Icon container with border */}
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px]">
                    <div className="h-full w-full rounded-2xl glass flex items-center justify-center backdrop-blur-xl">
                      <Search className="h-6 w-6 text-indigo-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    Offre d&apos;emploi
                  </h2>
                  <p className="text-sm text-white/60">
                    Copiez-collez le texte complet
                  </p>
                </div>
              </div>

              {/* Textarea */}
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
                className={`resize-none glass border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-base ${
                  !analysisResult && !isAnalyzing
                    ? "min-h-[350px] md:min-h-[450px]"
                    : "min-h-[280px] md:min-h-[350px]"
                }`}
                disabled={isAnalyzing || !!analysisResult}
              />

              {/* Character count */}
              {jobDescription && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-xs text-white/40 text-right"
                >
                  {jobDescription.length} caractères
                </motion.p>
              )}

              {/* Button */}
              {!analysisResult && (
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !jobDescription.trim()}
                  className="mt-6 w-full btn-futuristic py-7 text-base md:text-lg font-bold shadow-2xl shadow-indigo-500/50"
                >
                  {isAnalyzing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2 h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                      />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Analyser l&apos;offre
                    </>
                  )}
                </Button>
              )}

              {/* Bottom shine */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>

          {/* Right column - Results */}
          <div className="space-y-6">
            {isAnalyzing && (
              <div className="relative glass rounded-[28px] p-8 md:p-12 border border-white/10 backdrop-blur-xl overflow-hidden">
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

                <div className="flex flex-col items-center justify-center">
                  {/* Premium scanning animation */}
                  <div className="relative h-32 w-32 md:h-40 md:w-40 mb-8">
                    {/* Static glow */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8 }}
                    />

                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/10" />

                    {/* Animated scanning overlay */}
                    <motion.div
                      className="absolute inset-3 rounded-full glass border border-indigo-500/30 overflow-hidden backdrop-blur-xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                    >
                      {/* Gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10" />

                      {/* Vertical scanning line */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent"
                        animate={{ y: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, type: "spring", delay: 0.3 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50" />
                        <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl">
                          <Target className="h-6 w-6 md:h-7 md:w-7 text-white" />
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Status text */}
                  <p className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 mb-3">
                    Analyse de la compatibilité...
                  </p>
                  <p className="text-base text-white/60">
                    Comparaison avec votre profil
                  </p>
                </div>

                {/* Bottom shine */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              </div>
            )}

            {analysisResult && (
              <>
                {/* Score */}
                <AnimatedCard className="flex flex-col items-center py-8 md:py-10">
                  <h2 className="mb-6 md:mb-8 text-xl font-bold text-white">
                    Score de compatibilité
                  </h2>
                  <ScoreGauge score={analysisResult.score} />

                  {analysisResult.jobTitle && (
                    <div className="mt-6 md:mt-8 text-center">
                      <p className="text-lg font-bold text-white mb-1">
                        {analysisResult.jobTitle}
                      </p>
                      {analysisResult.company && (
                        <p className="text-sm text-white/60">
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
                    className="w-full btn-futuristic py-7 text-base md:text-lg font-bold shadow-2xl shadow-indigo-500/50"
                    size="lg"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <span>Continuer vers le chat stratégique</span>
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </Button>
                  <p className="mt-4 text-center text-sm text-white/60 leading-relaxed">
                    Explorez vos compétences pour{" "}
                    <span className="text-white font-semibold">combler les gaps</span> identifiés
                  </p>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
