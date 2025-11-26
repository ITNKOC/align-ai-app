"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FileText, Lightbulb, ExternalLink } from "lucide-react";
import { PhaseIndicator } from "@/components/shared/phase-indicator";
import { PageTransition } from "@/components/shared/page-transition";
import { DocumentPreview } from "@/components/generation/document-preview";
import {
  generateDocuments,
  getGeneratedDocuments,
  regenerateDocuments,
} from "@/actions/generation-actions";

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
      const result = await getGeneratedDocuments(appId);

      if (result.success && result.cvPdfBase64 && result.coverPdfBase64) {
        // Documents already exist
        setCvPdfUrl(createPdfUrl(result.cvPdfBase64));
        setCoverPdfUrl(createPdfUrl(result.coverPdfBase64));
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
        toast.success("Documents générés avec succès !");
      } else if (result.partialSuccess) {
        // LaTeX generated but PDF compilation failed
        setPartialSuccess(true);
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

  const handleRegenerate = useCallback(async () => {
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
      const result = await regenerateDocuments(applicationId);

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

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (cvPdfUrl) URL.revokeObjectURL(cvPdfUrl);
      if (coverPdfUrl) URL.revokeObjectURL(coverPdfUrl);
    };
  }, [cvPdfUrl, coverPdfUrl]);

  if (isLoading) {
    return (
      <PageTransition className="min-h-screen safe-top safe-bottom">
        <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
          <PhaseIndicator currentPhase={4} />
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
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        <PhaseIndicator currentPhase={4} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 md:mt-8 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Vos documents <span className="gradient-text">optimisés</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/50">
            CV et lettre de motivation personnalisés pour l&apos;offre
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 md:mt-8 rounded-2xl glass border border-white/10 p-4 md:p-6"
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
            onStartNew={handleStartNew}
          />
        </motion.div>

        {/* Tips */}
        {!isGenerating && (cvPdfUrl || cvLatex) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`mt-4 md:mt-6 rounded-xl glass border p-4 ${
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
                      <li className="flex items-center gap-1">
                        • Rendez-vous sur{" "}
                        <a href="https://www.overleaf.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-400 hover:underline">
                          Overleaf.com <ExternalLink className="h-3 w-3" />
                        </a>{" "}
                        et créez un nouveau projet
                      </li>
                      <li>• Collez le code LaTeX et compilez pour obtenir le PDF</li>
                      <li>• Téléchargez ensuite vos documents finaux</li>
                    </>
                  ) : (
                    <>
                      <li>• Relisez attentivement les documents avant de les envoyer</li>
                      <li>• Personnalisez l&apos;accroche de la lettre si nécessaire</li>
                      <li>• Vérifiez que vos coordonnées sont correctes</li>
                      <li>• Envoyez votre candidature dans les 48h pour maximiser vos chances</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
