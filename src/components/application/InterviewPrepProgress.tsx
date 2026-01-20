"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Download, RefreshCw, FileText } from "lucide-react";
import { getInterviewPrepStatus, resetInterviewPrep, downloadInterviewPrepPdf, downloadInterviewPrepLatex, type PrepStatus } from "@/actions/interview-prep-actions";
import { pulseScale, fadeIn, buttonHover } from "@/lib/animations";

interface InterviewPrepProgressProps {
  applicationId: string;
  initialStatus?: PrepStatus;
  onStatusChange?: (status: PrepStatus) => void;
}

const statusConfig = {
  pending: {
    icon: null,
    label: "En attente",
    description: "La preparation n'a pas encore ete lancee",
    color: "text-white/50",
  },
  generating: {
    icon: Loader2,
    label: "Generation en cours...",
    description: "Votre document de preparation est en cours de creation",
    color: "text-indigo-400",
  },
  ready: {
    icon: CheckCircle2,
    label: "Preparation prete",
    description: "Votre document de preparation est disponible",
    color: "text-green-400",
  },
  failed: {
    icon: XCircle,
    label: "Erreur",
    description: "Une erreur est survenue lors de la generation",
    color: "text-red-400",
  },
};

export function InterviewPrepProgress({
  applicationId,
  initialStatus = "pending",
  onStatusChange,
}: InterviewPrepProgressProps) {
  const [status, setStatus] = useState<PrepStatus>(initialStatus);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasLatexFallback, setHasLatexFallback] = useState(false);

  // Poll for status updates when generating (AC3 - polling every 2 seconds)
  const checkStatus = useCallback(async () => {
    const result = await getInterviewPrepStatus(applicationId);

    if (result.success) {
      const newStatus = result.status || "pending";
      setStatus(newStatus);

      if (result.pdfBase64) {
        setPdfBase64(result.pdfBase64);
      }

      if (result.error) {
        setError(result.error);
        // If status is failed but we might have LaTeX, set the fallback flag
        if (newStatus === "failed") {
          setHasLatexFallback(true);
        }
      }

      onStatusChange?.(newStatus);
    }
  }, [applicationId, onStatusChange]);

  useEffect(() => {
    // Initial check
    checkStatus();

    // Only poll while generating
    let interval: NodeJS.Timeout | null = null;

    if (status === "generating") {
      interval = setInterval(checkStatus, 2000); // Poll every 2 seconds (AC3)
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [status, checkStatus]);

  const handleDownloadPdf = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const result = await downloadInterviewPrepPdf(applicationId);
      if (result.success && result.pdfBase64) {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${result.pdfBase64}`;
        link.download = result.filename || "preparation-entretien.pdf";
        link.click();
      }
    } catch (err) {
      console.error("Download PDF error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadLatex = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const result = await downloadInterviewPrepLatex(applicationId);
      if (result.success && result.latex) {
        const blob = new Blob([result.latex], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename || "preparation-entretien.tex";
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download LaTeX error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    const result = await resetInterviewPrep(applicationId);

    if (result.success) {
      setStatus("pending");
      setPdfBase64(null);
      setError(null);
      onStatusChange?.("pending");
    }

    setIsResetting(false);
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Don't show anything if pending (no generation started)
  if (status === "pending") {
    return null;
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="p-4 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div
          className={`p-3 rounded-xl ${
            status === "generating"
              ? "bg-indigo-500/20"
              : status === "ready"
              ? "bg-green-500/20"
              : status === "failed"
              ? "bg-red-500/20"
              : "bg-white/5"
          }`}
        >
          {Icon && (
            <motion.div
              variants={status === "generating" ? pulseScale : undefined}
              animate={status === "generating" ? "animate" : undefined}
            >
              <Icon
                className={`h-6 w-6 ${config.color} ${
                  status === "generating" ? "animate-spin" : ""
                }`}
              />
            </motion.div>
          )}
        </div>

        {/* Status Info */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${config.color}`}>{config.label}</h4>
          <p className="text-sm text-white/50 mt-0.5">{config.description}</p>

          {error && status === "failed" && (
            <p className="text-sm text-red-400/80 mt-2">{error}</p>
          )}

          {/* Progress bar for generating status */}
          {status === "generating" && (
            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: "0%" }}
                animate={{
                  width: ["0%", "30%", "60%", "90%", "100%"],
                }}
                transition={{
                  duration: 10,
                  times: [0, 0.2, 0.5, 0.8, 1],
                  ease: "easeInOut",
                }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Download PDF button - shown when ready */}
          {status === "ready" && (
            <motion.button
              {...buttonHover}
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download className={`h-4 w-4 ${isDownloading ? "animate-pulse" : ""}`} />
              Telecharger PDF
            </motion.button>
          )}

          {/* Download LaTeX fallback button - shown when failed (AC3) */}
          {status === "failed" && hasLatexFallback && (
            <motion.button
              {...buttonHover}
              onClick={handleDownloadLatex}
              disabled={isDownloading}
              className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FileText className={`h-4 w-4 ${isDownloading ? "animate-pulse" : ""}`} />
              Telecharger LaTeX
            </motion.button>
          )}

          {(status === "ready" || status === "failed") && (
            <motion.button
              {...buttonHover}
              onClick={handleReset}
              disabled={isResetting || isDownloading}
              className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isResetting ? "animate-spin" : ""}`}
              />
              Regenerer
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
