"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  Mail,
  Eye,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Copy,
  Code,
  AlertCircle,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentPreviewProps {
  cvPdfUrl?: string;
  coverPdfUrl?: string;
  cvLatex?: string;
  coverLetterLatex?: string;
  isGenerating: boolean;
  generationProgress: number;
  partialSuccess?: boolean;
  onRegenerate: () => void;
  onStartNew: () => void;
}

export function DocumentPreview({
  cvPdfUrl,
  coverPdfUrl,
  cvLatex,
  coverLetterLatex,
  isGenerating,
  generationProgress,
  partialSuccess,
  onRegenerate,
  onStartNew,
}: DocumentPreviewProps) {
  const [activeTab, setActiveTab] = useState("cv");

  if (isGenerating) {
    return <GenerationLoader progress={generationProgress} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      {/* Success/Partial Success header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "mb-4 md:mb-6 flex items-center gap-3 rounded-xl border p-3 md:p-4",
          partialSuccess
            ? "bg-amber-500/10 border-amber-500/30"
            : "bg-emerald-500/10 border-emerald-500/30"
        )}
      >
        <div className={cn(
          "rounded-lg p-2",
          partialSuccess ? "bg-amber-500/20" : "bg-emerald-500/20"
        )}>
          {partialSuccess ? (
            <AlertCircle className="h-5 w-5 text-amber-400" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          )}
        </div>
        <div>
          <h3 className={cn(
            "font-semibold text-sm md:text-base",
            partialSuccess ? "text-amber-400" : "text-emerald-400"
          )}>
            {partialSuccess
              ? "LaTeX généré - PDF indisponible"
              : "Documents générés avec succès !"}
          </h3>
          <p className={cn(
            "text-xs md:text-sm",
            partialSuccess ? "text-amber-400/70" : "text-emerald-400/70"
          )}>
            {partialSuccess
              ? "Copiez le code LaTeX et compilez-le sur Overleaf.com"
              : "Votre CV et lettre de motivation sont prêts à être téléchargés."}
          </p>
        </div>
      </motion.div>

      {/* Document tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/5 border border-white/10">
          <TabsTrigger
            value="cv"
            className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 text-white/60"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">CV Optimisé</span>
            <span className="sm:hidden">CV</span>
          </TabsTrigger>
          <TabsTrigger
            value="cover"
            className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 text-white/60"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Lettre de Motivation</span>
            <span className="sm:hidden">Lettre</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="cv" className="flex-1">
            <DocumentCard
              title="CV Optimisé"
              description="Votre CV a été reformulé pour correspondre aux mots-clés de l'offre d'emploi."
              pdfUrl={cvPdfUrl}
              latexCode={cvLatex}
              downloadName="CV_Optimise.pdf"
            />
          </TabsContent>

          <TabsContent value="cover" className="flex-1">
            <DocumentCard
              title="Lettre de Motivation"
              description="Lettre personnalisée basée sur les stratégies définies dans le chat."
              pdfUrl={coverPdfUrl}
              latexCode={coverLetterLatex}
              downloadName="Lettre_Motivation.pdf"
            />
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3"
      >
        <Button
          variant="outline"
          onClick={onRegenerate}
          className="flex-1 glass border-white/10 text-white hover:bg-white/10"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Régénérer
        </Button>
        <Button
          onClick={onStartNew}
          className="flex-1 btn-futuristic"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Nouvelle candidature
        </Button>
      </motion.div>
    </motion.div>
  );
}

interface DocumentCardProps {
  title: string;
  description: string;
  pdfUrl?: string;
  latexCode?: string;
  downloadName: string;
}

function DocumentCard({
  title,
  description,
  pdfUrl,
  latexCode,
  downloadName,
}: DocumentCardProps) {
  const [showLatex, setShowLatex] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
    >
      {/* Preview area */}
      <div className="relative aspect-[3/4] max-h-[400px] md:max-h-[500px] bg-white/10">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="h-full w-full bg-white"
            title={title}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-white/30">
            <Eye className="h-10 w-10 md:h-12 md:w-12" />
            <p className="mt-2 text-sm">Aperçu non disponible</p>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="border-t border-white/10 p-3 md:p-4">
        <h4 className="font-semibold text-white text-sm md:text-base">{title}</h4>
        <p className="mt-1 text-xs md:text-sm text-white/50">{description}</p>

        <div className="mt-3 md:mt-4 flex flex-col sm:flex-row gap-2">
          {pdfUrl && (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 glass border-white/10 text-white hover:bg-white/10 text-xs md:text-sm"
              >
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Ouvrir
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                className="flex-1 btn-futuristic text-xs md:text-sm"
              >
                <a href={pdfUrl} download={downloadName}>
                  <Download className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Télécharger
                </a>
              </Button>
            </>
          )}
        </div>

        {/* LaTeX code section */}
        {latexCode && (
          <div className="mt-3 md:mt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 glass border-white/10 text-white hover:bg-white/10 text-xs md:text-sm"
                onClick={() => setShowLatex(!showLatex)}
              >
                <Code className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                {showLatex ? "Masquer LaTeX" : "Voir LaTeX"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 glass border-white/10 text-white hover:bg-white/10 text-xs md:text-sm"
                onClick={() => {
                  navigator.clipboard.writeText(latexCode);
                  toast.success("Code LaTeX copié !");
                }}
              >
                <Copy className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                Copier LaTeX
              </Button>
            </div>

            <AnimatePresence>
              {showLatex && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="rounded-lg bg-black/50 border border-white/10 p-3 md:p-4 max-h-48 md:max-h-64 overflow-auto">
                    <pre className="text-xs text-white/70 whitespace-pre-wrap break-all font-mono">
                      {latexCode}
                    </pre>
                  </div>
                  <p className="mt-2 text-xs text-white/40">
                    Copiez ce code et collez-le sur{" "}
                    <a
                      href="https://www.overleaf.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline"
                    >
                      Overleaf.com
                    </a>{" "}
                    pour compiler le PDF.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface GenerationLoaderProps {
  progress: number;
}

function GenerationLoader({ progress }: GenerationLoaderProps) {
  const steps = [
    { label: "Analyse des stratégies", threshold: 20 },
    { label: "Génération du CV LaTeX", threshold: 40 },
    { label: "Génération de la lettre LaTeX", threshold: 60 },
    { label: "Compilation PDF", threshold: 80 },
    { label: "Finalisation", threshold: 100 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-8 md:py-12"
    >
      {/* Animated document icon */}
      <div className="relative mb-6 md:mb-8">
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <motion.div
          className="relative h-20 w-16 md:h-24 md:w-20 rounded-lg glass border border-white/20"
          animate={{
            boxShadow: [
              "0 0 20px rgba(99, 102, 241, 0.2)",
              "0 0 40px rgba(99, 102, 241, 0.4)",
              "0 0 20px rgba(99, 102, 241, 0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute inset-2 space-y-1.5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="h-1 md:h-1.5 rounded bg-white/20"
                style={{ width: `${60 + Math.random() * 30}%` }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute -right-2 -top-2 h-5 w-5 md:h-6 md:w-6 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-2 -left-2 h-4 w-4 md:h-5 md:w-5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
      </div>

      <h3 className="text-lg md:text-xl font-semibold text-white">
        Génération en cours...
      </h3>
      <p className="mt-1 text-sm text-white/50">
        Création de vos documents personnalisés
      </p>

      {/* Progress bar */}
      <div className="mt-6 w-full max-w-xs md:max-w-sm">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="mt-2 text-center text-sm font-medium text-indigo-400">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Steps */}
      <div className="mt-6 md:mt-8 space-y-2 w-full max-w-xs md:max-w-sm">
        {steps.map((step, index) => {
          const isComplete = progress >= step.threshold;
          const isActive = progress >= (steps[index - 1]?.threshold || 0) && progress < step.threshold;

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div
                className={cn(
                  "flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full transition-all",
                  isComplete
                    ? "bg-emerald-500/20 ring-2 ring-emerald-500/50"
                    : isActive
                      ? "bg-indigo-500/20 ring-2 ring-indigo-500/50"
                      : "bg-white/5 ring-1 ring-white/10"
                )}
              >
                {isComplete ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isActive ? "bg-indigo-400 animate-pulse" : "bg-white/30"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-xs md:text-sm transition-colors",
                  isComplete
                    ? "text-emerald-400"
                    : isActive
                      ? "text-white"
                      : "text-white/40"
                )}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
