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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  onRegenerate: (instructions?: string) => Promise<void>;
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
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const [regenerateInstructions, setRegenerateInstructions] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!regenerateInstructions.trim() && showRegenerateForm) {
      toast.error("Veuillez décrire les modifications souhaitées");
      return;
    }

    setIsRegenerating(true);
    try {
      await onRegenerate(regenerateInstructions.trim() || undefined);
      setRegenerateInstructions("");
      setShowRegenerateForm(false);
      toast.success("Documents régénérés avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la régénération");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isGenerating) {
    return <GenerationLoader progress={generationProgress} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      {/* Enhanced Success/Partial Success header - Mobile First */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mb-4 md:mb-6"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border p-4 md:p-5",
            partialSuccess
              ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30"
              : "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30"
          )}
        >
          {/* Animated background */}
          <motion.div
            className={cn(
              "absolute inset-0 opacity-30",
              partialSuccess
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20"
                : "bg-gradient-to-r from-emerald-500/20 to-teal-500/20"
            )}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: "200% 100%" }}
          />

          <div className="relative flex items-start gap-3 md:gap-4">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.3 }}
              className={cn(
                "flex-shrink-0 rounded-xl p-2.5 md:p-3 shadow-lg",
                partialSuccess
                  ? "bg-amber-500/20 shadow-amber-500/30"
                  : "bg-emerald-500/20 shadow-emerald-500/30"
              )}
            >
              {partialSuccess ? (
                <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-amber-400" />
              ) : (
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />
              )}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-bold text-sm md:text-lg flex items-center gap-2",
                  partialSuccess ? "text-amber-400" : "text-emerald-400"
                )}
              >
                {partialSuccess
                  ? "LaTeX généré - PDF indisponible"
                  : "Documents générés avec succès !"}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
              </h3>
              <p
                className={cn(
                  "mt-1 text-xs md:text-sm leading-relaxed",
                  partialSuccess ? "text-amber-400/70" : "text-emerald-400/70"
                )}
              >
                {partialSuccess
                  ? "Copiez le code LaTeX et compilez-le sur Overleaf.com pour générer vos PDF."
                  : "Vos documents sont prêts ! Téléchargez-les ou copiez le code LaTeX pour les modifier."}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Document tabs - Mobile First */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/5 border border-white/10 p-1 h-auto">
          <TabsTrigger
            value="cv"
            className="flex items-center justify-center gap-2 py-3 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-300 text-white/60 font-semibold rounded-lg transition-all data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden xs:inline text-sm">CV Optimisé</span>
            <span className="xs:hidden text-sm">CV</span>
          </TabsTrigger>
          <TabsTrigger
            value="cover"
            className="flex items-center justify-center gap-2 py-3 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-300 text-white/60 font-semibold rounded-lg transition-all data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden xs:inline text-sm">Lettre</span>
            <span className="xs:hidden text-sm">Lettre</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="cv" className="flex-1 mt-0">
            <DocumentCard
              title="CV Optimisé"
              description="Votre CV a été reformulé pour correspondre aux mots-clés de l'offre d'emploi."
              pdfUrl={cvPdfUrl}
              latexCode={cvLatex}
              downloadName="CV_Optimise.pdf"
            />
          </TabsContent>

          <TabsContent value="cover" className="flex-1 mt-0">
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

      {/* Enhanced Regenerate Form - Mobile First */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4 md:mt-6 space-y-3"
      >
        {/* Regenerate Form */}
        <AnimatePresence>
          {showRegenerateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-4 space-y-3 backdrop-blur-xl">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="flex-shrink-0 mt-1"
                  >
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm md:text-base">
                      Régénération intelligente
                    </h4>
                    <p className="mt-1 text-xs md:text-sm text-white/60 leading-relaxed">
                      Décrivez les modifications que vous souhaitez apporter au contenu,
                      à la forme, au style ou à la structure du document.
                    </p>
                  </div>
                </div>

                {/* Textarea */}
                <Textarea
                  value={regenerateInstructions}
                  onChange={(e) => setRegenerateInstructions(e.target.value)}
                  placeholder="Ex: Rendre le CV plus moderne avec des couleurs, ajouter une section projets personnels, reformuler l'expérience X de manière plus concise..."
                  className="min-h-[100px] sm:min-h-[120px] resize-none glass border-indigo-500/30 bg-white/5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm md:text-base"
                  disabled={isRegenerating}
                  rows={4}
                />

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRegenerateForm(false);
                      setRegenerateInstructions("");
                    }}
                    disabled={isRegenerating}
                    className="flex-1 glass border-white/20 text-white hover:bg-white/10 rounded-xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="flex-1 btn-futuristic rounded-xl shadow-lg shadow-indigo-500/30"
                  >
                    {isRegenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </motion.div>
                        Régénération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Régénérer
                      </>
                    )}
                  </Button>
                </div>

                {/* Tips */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3"
                >
                  <p className="text-xs text-indigo-300 leading-relaxed">
                    💡 <span className="font-semibold">Exemples de modifications :</span>
                    <br />
                    • Contenu : "Mettre plus l'accent sur mes compétences en leadership"
                    <br />
                    • Style : "Utiliser une police plus moderne et des couleurs subtiles"
                    <br />
                    • Structure : "Inverser les sections expérience et formation"
                    <br />
                    • Format : "Passer de 2 colonnes à 1 colonne"
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => setShowRegenerateForm(!showRegenerateForm)}
            disabled={isRegenerating}
            className="glass border-white/20 text-white hover:bg-white/10 py-6 text-base font-semibold rounded-xl group"
          >
            <RefreshCw className={cn(
              "mr-2 h-5 w-5 transition-transform",
              showRegenerateForm && "rotate-180"
            )} />
            {showRegenerateForm ? "Masquer" : "Régénérer avec modifications"}
          </Button>
          <Button
            onClick={onStartNew}
            className="btn-futuristic py-6 text-base font-semibold rounded-xl shadow-2xl shadow-indigo-500/50"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Nouvelle candidature
          </Button>
        </div>
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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (latexCode) {
      navigator.clipboard.writeText(latexCode);
      setCopied(true);
      toast.success("Code LaTeX copié dans le presse-papier !");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.08] overflow-hidden backdrop-blur-xl"
    >
      {/* Enhanced Preview area - Mobile First */}
      <div className="relative aspect-[3/4] max-h-[350px] sm:max-h-[450px] md:max-h-[550px] bg-gradient-to-br from-white/10 to-white/5">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="h-full w-full bg-white rounded-t-2xl"
            title={title}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-white/30 p-6">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Eye className="h-12 w-12 md:h-16 md:w-16" />
            </motion.div>
            <p className="mt-4 text-sm font-medium">Aperçu non disponible</p>
            <p className="mt-1 text-xs text-white/20 text-center max-w-xs">
              Utilisez le code LaTeX ci-dessous pour compiler le PDF
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Card footer - Mobile First */}
      <div className="border-t border-white/10 p-4 md:p-5 space-y-4">
        {/* Title and description */}
        <div>
          <h4 className="font-bold text-white text-base md:text-lg">{title}</h4>
          <p className="mt-1 text-xs md:text-sm text-white/50 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Primary action buttons - Enhanced with LaTeX copy */}
        <div className="space-y-2 sm:space-y-3">
          {/* PDF Actions */}
          {pdfUrl && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="glass border-white/20 text-white hover:bg-white/10 rounded-xl py-6"
              >
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base font-semibold">Ouvrir</span>
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                className="btn-futuristic rounded-xl py-6 shadow-lg shadow-indigo-500/30"
              >
                <a href={pdfUrl} download={downloadName}>
                  <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base font-semibold">Télécharger</span>
                </a>
              </Button>
            </div>
          )}

          {/* LaTeX Actions - Always visible */}
          {latexCode && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="lg"
                className="glass border-white/20 text-white hover:bg-white/10 rounded-xl py-6"
                onClick={() => setShowLatex(!showLatex)}
              >
                {showLatex ? (
                  <>
                    <X className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-sm md:text-base font-semibold">Masquer</span>
                  </>
                ) : (
                  <>
                    <Code className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-sm md:text-base font-semibold">Voir Code</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "glass hover:bg-white/10 rounded-xl py-6 transition-all font-semibold",
                  copied
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20"
                    : "border-indigo-500/30 text-indigo-300 hover:border-indigo-500/50"
                )}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-sm md:text-base">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-sm md:text-base">Copier LaTeX</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* LaTeX code section - Enhanced */}
        {latexCode && (
          <div className="space-y-3">

            {/* LaTeX code display */}
            <AnimatePresence>
              {showLatex && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl bg-black/60 border border-white/10 p-3 md:p-4 max-h-60 sm:max-h-80 overflow-auto backdrop-blur-sm">
                    <pre className="text-[10px] sm:text-xs text-white/70 whitespace-pre-wrap break-all font-mono leading-relaxed">
                      {latexCode}
                    </pre>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3"
                  >
                    <p className="text-xs text-indigo-300 leading-relaxed">
                      💡 <span className="font-semibold">Astuce :</span> Copiez ce code et collez-le sur{" "}
                      <a
                        href="https://www.overleaf.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline font-semibold"
                      >
                        Overleaf.com
                      </a>{" "}
                      pour compiler le PDF ou le modifier avant téléchargement.
                    </p>
                  </motion.div>
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
      className="flex flex-col items-center justify-center py-8 md:py-12 px-4"
    >
      {/* Enhanced Animated document icon - Mobile First */}
      <div className="relative mb-8 md:mb-10">
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <motion.div
          className="relative h-24 w-20 md:h-32 md:w-24 rounded-xl glass border border-white/20 shadow-2xl shadow-indigo-500/30"
          animate={{
            boxShadow: [
              "0 0 20px rgba(99, 102, 241, 0.2)",
              "0 0 40px rgba(99, 102, 241, 0.5)",
              "0 0 20px rgba(99, 102, 241, 0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute inset-3 space-y-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="h-1.5 md:h-2 rounded bg-white/20"
                style={{ width: `${60 + Math.random() * 30}%` }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute -right-3 -top-3 h-6 w-6 md:h-8 md:w-8 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-3 -left-3 h-5 w-5 md:h-7 md:w-7 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-white">
        Génération en cours...
      </h3>
      <p className="mt-2 text-sm md:text-base text-white/50 text-center max-w-sm">
        Création de vos documents personnalisés
      </p>

      {/* Enhanced Progress bar - Mobile First */}
      <div className="mt-8 w-full max-w-sm md:max-w-md">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
        <p className="mt-3 text-center text-base md:text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Enhanced Steps - Mobile First */}
      <div className="mt-8 md:mt-10 space-y-3 w-full max-w-sm md:max-w-md">
        {steps.map((step, index) => {
          const isComplete = progress >= step.threshold;
          const isActive = progress >= (steps[index - 1]?.threshold || 0) && progress < step.threshold;

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 md:gap-4"
            >
              <div
                className={cn(
                  "flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-xl transition-all shadow-lg",
                  isComplete
                    ? "bg-emerald-500/20 ring-2 ring-emerald-500/50 shadow-emerald-500/30"
                    : isActive
                      ? "bg-indigo-500/20 ring-2 ring-indigo-500/50 shadow-indigo-500/30"
                      : "bg-white/5 ring-1 ring-white/10"
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      isActive ? "bg-indigo-400 animate-pulse" : "bg-white/30"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-sm md:text-base font-medium transition-colors",
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
