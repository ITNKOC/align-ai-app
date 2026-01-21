"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  FileText,
  Lightbulb,
  ExternalLink,
  Mail,
  Copy,
  Check,
  RefreshCw,
  Calendar,
  LayoutDashboard,
  CheckCircle,
  Rocket,
} from "lucide-react";
import { AppNavbar } from "@/components/shared/app-navbar";
import { PhaseIndicator } from "@/components/shared/phase-indicator";
import { DocumentPreview } from "@/components/generation/document-preview";
import { BeforeAfterComparison } from "@/components/generation/before-after-comparison";
import {
  generateDocuments,
  getGeneratedDocuments,
  regenerateDocuments,
  regenerateFollowUpEmail,
  getComparisonData,
  retryPDFCompilation,
} from "@/actions/generation-actions";
import type { FollowUpEmail, CVData, AnalysisResult, Strategy } from "@/lib/types";

export default function GeneratePage() {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [cvPdfUrl, setCvPdfUrl] = useState<string | undefined>();
  const [coverPdfUrl, setCoverPdfUrl] = useState<string | undefined>();
  const [cvLatex, setCvLatex] = useState<string | undefined>();
  const [coverLetterLatex, setCoverLetterLatex] = useState<string | undefined>();
  const [partialSuccess, setPartialSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [followUpEmail, setFollowUpEmail] = useState<FollowUpEmail | undefined>();
  const [isRegeneratingEmail, setIsRegeneratingEmail] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isRetryingPDF, setIsRetryingPDF] = useState(false);
  // Comparison data for Avant/Après
  const [comparisonData, setComparisonData] = useState<{
    cvData: CVData;
    analysisResult: AnalysisResult;
    strategies: Record<string, Strategy>;
  } | null>(null);

  useEffect(() => {
    const storedApplicationId = localStorage.getItem("currentApplicationId");
    if (!storedApplicationId) {
      toast.error("Veuillez compléter les étapes précédentes");
      router.push("/upload");
      return;
    }

    setApplicationId(storedApplicationId);
    checkExistingDocuments(storedApplicationId);
  }, [router]);

  const checkExistingDocuments = async (appId: string) => {
    try {
      // Fetch documents and comparison data in parallel
      const [result, comparisonResult] = await Promise.all([
        getGeneratedDocuments(appId),
        getComparisonData(appId),
      ]);

      // Set comparison data if available
      if (comparisonResult.success && comparisonResult.cvData) {
        setComparisonData({
          cvData: comparisonResult.cvData,
          analysisResult: comparisonResult.analysisResult!,
          strategies: comparisonResult.strategies!,
        });
      }

      if (result.success && result.cvPdfBase64 && result.coverPdfBase64) {
        // Documents already exist
        setCvPdfUrl(createPdfUrl(result.cvPdfBase64));
        setCoverPdfUrl(createPdfUrl(result.coverPdfBase64));
        if (result.followUpEmail) {
          setFollowUpEmail(result.followUpEmail);
        }
      } else {
        // Need to generate documents
        await startGeneration(appId);
      }
    } catch (error) {
      // Start generation if checking fails
      await startGeneration(appId);
    } finally {
      setIsLoading(false);
    }
  };

  const createPdfUrl = (base64: string): string => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

  const startGeneration = async (appId: string) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setPartialSuccess(false);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const result = await generateDocuments(appId);

      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Always store LaTeX if available
      if (result.cvLatex) setCvLatex(result.cvLatex);
      if (result.coverLetterLatex) setCoverLetterLatex(result.coverLetterLatex);

      if (result.success && result.cvPdfBase64 && result.coverPdfBase64) {
        setCvPdfUrl(createPdfUrl(result.cvPdfBase64));
        setCoverPdfUrl(createPdfUrl(result.coverPdfBase64));
        if (result.followUpEmail) {
          setFollowUpEmail(result.followUpEmail);
        }
        toast.success("Documents generés avec succes !");
      } else if (result.partialSuccess) {
        // LaTeX generated but PDF compilation failed
        setPartialSuccess(true);
        if (result.followUpEmail) {
          setFollowUpEmail(result.followUpEmail);
        }
        toast.warning("PDF non disponible. Code LaTeX généré - utilisez Overleaf pour compiler.");
      } else {
        throw new Error(result.error || "Échec de la génération");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la génération"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = useCallback(async (instructions?: string) => {
    if (!applicationId) return;

    // Clear existing URLs and data
    if (cvPdfUrl) URL.revokeObjectURL(cvPdfUrl);
    if (coverPdfUrl) URL.revokeObjectURL(coverPdfUrl);
    setCvPdfUrl(undefined);
    setCoverPdfUrl(undefined);
    setCvLatex(undefined);
    setCoverLetterLatex(undefined);
    setPartialSuccess(false);

    setIsGenerating(true);
    setGenerationProgress(0);

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const result = await regenerateDocuments(applicationId, instructions);

      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Always store LaTeX if available
      if (result.cvLatex) setCvLatex(result.cvLatex);
      if (result.coverLetterLatex) setCoverLetterLatex(result.coverLetterLatex);

      if (result.success && result.cvPdfBase64 && result.coverPdfBase64) {
        setCvPdfUrl(createPdfUrl(result.cvPdfBase64));
        setCoverPdfUrl(createPdfUrl(result.coverPdfBase64));
        toast.success("Documents régénérés avec succès !");
      } else if (result.partialSuccess) {
        setPartialSuccess(true);
        toast.warning("PDF non disponible. Code LaTeX généré - utilisez Overleaf pour compiler.");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la régénération"
      );
    } finally {
      setIsGenerating(false);
    }
  }, [applicationId, cvPdfUrl, coverPdfUrl]);

  const handleStartNew = useCallback(() => {
    // Clean up blob URLs
    if (cvPdfUrl) URL.revokeObjectURL(cvPdfUrl);
    if (coverPdfUrl) URL.revokeObjectURL(coverPdfUrl);

    // Clear localStorage
    localStorage.removeItem("currentProfileId");
    localStorage.removeItem("currentApplicationId");

    // Navigate to upload
    router.push("/upload");
  }, [router, cvPdfUrl, coverPdfUrl]);

  const handleRegenerateEmail = useCallback(async (tone?: "formal" | "professional" | "friendly") => {
    if (!applicationId) return;

    setIsRegeneratingEmail(true);
    try {
      const result = await regenerateFollowUpEmail(applicationId, tone);
      if (result.success && result.followUpEmail) {
        setFollowUpEmail(result.followUpEmail);
        toast.success("Email de suivi régénéré !");
      } else {
        throw new Error(result.error || "Échec de la régénération");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la régénération"
      );
    } finally {
      setIsRegeneratingEmail(false);
    }
  }, [applicationId]);

  const handleCopyEmail = useCallback(() => {
    if (!followUpEmail) return;

    const emailText = `Objet: ${followUpEmail.subject}\n\n${followUpEmail.body}`;
    navigator.clipboard.writeText(emailText);
    setCopiedEmail(true);
    toast.success("Email copié !");
    setTimeout(() => setCopiedEmail(false), 2000);
  }, [followUpEmail]);

  const handleRetryPDF = useCallback(async () => {
    if (!applicationId) return;

    setIsRetryingPDF(true);
    try {
      const result = await retryPDFCompilation(applicationId);

      if (result.success && result.cvPdfBase64 && result.coverPdfBase64) {
        setCvPdfUrl(createPdfUrl(result.cvPdfBase64));
        setCoverPdfUrl(createPdfUrl(result.coverPdfBase64));
        setPartialSuccess(false);
        toast.success("PDF compiles avec succes !");
      } else if (result.partialSuccess) {
        toast.error("La compilation a echoue. Utilisez Overleaf pour compiler manuellement.");
      } else {
        toast.error(result.error || "Erreur lors de la compilation");
      }
    } catch (error) {
      toast.error("Erreur lors de la tentative de compilation");
    } finally {
      setIsRetryingPDF(false);
    }
  }, [applicationId]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (cvPdfUrl) URL.revokeObjectURL(cvPdfUrl);
      if (coverPdfUrl) URL.revokeObjectURL(coverPdfUrl);
    };
  }, [cvPdfUrl, coverPdfUrl]);

  const handleGoToDashboard = useCallback(() => {
    // Clean up blob URLs
    if (cvPdfUrl) URL.revokeObjectURL(cvPdfUrl);
    if (coverPdfUrl) URL.revokeObjectURL(coverPdfUrl);

    // Clear localStorage for this application
    localStorage.removeItem("currentApplicationId");

    // Navigate to dashboard
    router.push("/dashboard");
  }, [router, cvPdfUrl, coverPdfUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 md:pb-8">
        <AppNavbar />
        <main className="container-app py-6">
          <div className="mt-16 md:mt-20 flex flex-col items-center justify-center">
            {/* Loading animation */}
            <div className="relative h-20 w-20 md:h-24 md:w-24">
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
              <div className="absolute inset-3 md:inset-4 rounded-full glass flex items-center justify-center">
                <FileText className="h-8 w-8 md:h-10 md:w-10 text-indigo-400" />
              </div>
            </div>
            <motion.p
              className="mt-6 text-base md:text-lg font-medium text-white"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Chargement...
            </motion.p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <AppNavbar />
      <main className="container-app py-6">
        <PhaseIndicator currentPhase={4} />
        {/* Header */}
        <div className="page-header text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="badge badge-success mb-4">Etape finale</span>
            <h1 className="page-title text-2xl sm:text-3xl md:text-4xl">
              Vos documents <span className="gradient-text">optimises</span>
            </h1>
            <p className="page-subtitle mt-2 max-w-md mx-auto">
              CV et lettre de motivation personnalises pour l&apos;offre
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 card-modern p-4 md:p-6"
        >
          <DocumentPreview
            cvPdfUrl={cvPdfUrl}
            coverPdfUrl={coverPdfUrl}
            cvLatex={cvLatex}
            coverLetterLatex={coverLetterLatex}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            partialSuccess={partialSuccess}
            onRegenerate={handleRegenerate}
            onRetryPDF={handleRetryPDF}
            isRetryingPDF={isRetryingPDF}
            onStartNew={handleStartNew}
          />
        </motion.div>

        {/* Avant/Après Comparison */}
        {!isGenerating && (cvPdfUrl || cvLatex) && comparisonData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6"
          >
            <BeforeAfterComparison
              cvData={comparisonData.cvData}
              analysisResult={comparisonData.analysisResult}
              strategies={comparisonData.strategies}
            />
          </motion.div>
        )}

        {/* Tips */}
        {!isGenerating && (cvPdfUrl || cvLatex) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`mt-6 rounded-xl border p-4 ${
              partialSuccess
                ? "border-amber-500/30 bg-amber-500/10"
                : "border-emerald-500/30 bg-emerald-500/10"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-lg p-2 ${partialSuccess ? "bg-amber-500/20" : "bg-emerald-500/20"}`}>
                <Lightbulb className={`h-4 w-4 ${partialSuccess ? "text-amber-400" : "text-emerald-400"}`} />
              </div>
              <div>
                <h3 className={`font-medium ${partialSuccess ? "text-amber-400" : "text-emerald-400"}`}>
                  {partialSuccess ? "Comment obtenir vos PDF" : "Conseils pour votre candidature"}
                </h3>
                <ul className={`mt-2 space-y-1 text-sm ${partialSuccess ? "text-amber-400/70" : "text-emerald-400/70"}`}>
                  {partialSuccess ? (
                    <>
                      <li>• Cliquez sur &quot;Copier LaTeX&quot; pour chaque document</li>
                      <li className="flex items-center gap-1 flex-wrap">
                        • Rendez-vous sur{" "}
                        <a href="https://www.overleaf.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-400 hover:underline">
                          Overleaf.com <ExternalLink className="h-3 w-3" />
                        </a>{" "}
                        et creez un nouveau projet
                      </li>
                      <li>• Collez le code LaTeX et compilez pour obtenir le PDF</li>
                      <li>• Telechargez ensuite vos documents finaux</li>
                    </>
                  ) : (
                    <>
                      <li>• Relisez attentivement les documents avant de les envoyer</li>
                      <li>• Personnalisez l&apos;accroche de la lettre si necessaire</li>
                      <li>• Verifiez que vos coordonnees sont correctes</li>
                      <li>• Envoyez votre candidature dans les 48h pour maximiser vos chances</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Follow-up Email Section */}
        {!isGenerating && followUpEmail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 card-modern p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/20 p-2.5">
                  <Mail className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email de suivi</h3>
                  <p className="text-xs text-white/50 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    À envoyer dans {followUpEmail.sendAfterDays} jours
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyEmail}
                  className="btn-ghost text-sm py-1.5 px-3"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">Copie</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copier
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleRegenerateEmail()}
                  disabled={isRegeneratingEmail}
                  className="btn-ghost text-sm py-1.5 px-3 disabled:opacity-50"
                >
                  {isRegeneratingEmail ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Regenerer
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Email content */}
            <div className="space-y-4">
              {/* Subject */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs text-white/40 mb-1">Objet</p>
                <p className="text-white font-medium">{followUpEmail.subject}</p>
              </div>

              {/* Body */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs text-white/40 mb-2">Corps de l&apos;email</p>
                <div className="text-white/80 text-sm whitespace-pre-line leading-relaxed">
                  {followUpEmail.body}
                </div>
              </div>

              {/* Tone indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">Ton :</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    followUpEmail.tone === "formal"
                      ? "bg-blue-500/20 text-blue-300"
                      : followUpEmail.tone === "friendly"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-indigo-500/20 text-indigo-300"
                  }`}>
                    {followUpEmail.tone === "formal"
                      ? "Formel"
                      : followUpEmail.tone === "friendly"
                        ? "Amical"
                        : "Professionnel"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/40">Changer le ton :</span>
                  {(["formal", "professional", "friendly"] as const).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => handleRegenerateEmail(tone)}
                      disabled={isRegeneratingEmail || followUpEmail.tone === tone}
                      className={`text-xs px-2 py-1 rounded-full transition-all ${
                        followUpEmail.tone === tone
                          ? "bg-white/20 text-white cursor-default"
                          : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                      } disabled:opacity-50`}
                    >
                      {tone === "formal" ? "Formel" : tone === "friendly" ? "Amical" : "Pro"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Action Section - Go to Dashboard */}
        {/* Only show when PDF is successfully generated (not in partialSuccess state) */}
        {!isGenerating && cvPdfUrl && !partialSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 card-modern p-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Candidature prete !
            </h3>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
              Vos documents sont generes. Envoyez votre candidature et suivez son avancement depuis votre dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleGoToDashboard}
                className="btn-primary py-3 px-6"
              >
                <LayoutDashboard className="w-5 h-5" />
                Voir le Dashboard
              </button>
              <button
                onClick={handleStartNew}
                className="btn-secondary py-3 px-6"
              >
                <Rocket className="w-5 h-5" />
                Nouvelle candidature
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
