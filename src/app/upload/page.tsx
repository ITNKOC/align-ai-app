"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PhaseIndicator } from "@/components/shared/phase-indicator";
import { PageTransition } from "@/components/shared/page-transition";
import { CVDropzone } from "@/components/upload/cv-dropzone";
import { BiometricLoader } from "@/components/upload/biometric-loader";
import { uploadAndParseCV } from "@/actions/cv-actions";
import { FileText, Shield, Zap } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Préparation...");

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 90);
      });
    }, 500);

    // Update status messages
    setTimeout(() => setStatus("Extraction du texte..."), 500);
    setTimeout(() => setStatus("Analyse par l'IA..."), 2000);
    setTimeout(() => setStatus("Structuration du profil..."), 4000);

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const result = await uploadAndParseCV(formData);

      clearInterval(progressInterval);

      if (result.success && result.profileId) {
        setProgress(100);
        setStatus("Analyse terminée !");

        toast.success("CV analysé avec succès !");

        // Store profile ID for next steps
        localStorage.setItem("currentProfileId", result.profileId);

        // Navigate to analysis page
        setTimeout(() => {
          router.push("/analyze");
        }, 1000);
      } else {
        throw new Error(result.error || "Échec de l'analyse");
      }
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setProgress(0);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'analyse"
      );
    }
  };

  const tips = [
    {
      icon: FileText,
      text: "Utilisez un CV au format PDF standard (pas de scan d'image)",
    },
    {
      icon: Shield,
      text: "Assurez-vous que le texte est sélectionnable dans votre PDF",
    },
    {
      icon: Zap,
      text: "Un CV en français ou anglais sera mieux analysé",
    },
  ];

  return (
    <PageTransition className="min-h-screen safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        <PhaseIndicator currentPhase={1} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 md:mt-8 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Uploadez votre <span className="gradient-text">CV</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/50">
            Notre IA va analyser et structurer vos compétences
          </p>
        </motion.div>

        <div className="mt-8 md:mt-12 flex justify-center">
          {isUploading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl glass rounded-2xl p-6 md:p-8"
            >
              <BiometricLoader progress={progress} status={status} />
            </motion.div>
          ) : (
            <CVDropzone
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
            />
          )}
        </div>

        {/* Tips */}
        {!isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-8 md:mt-12 max-w-xl"
          >
            <h3 className="text-sm font-medium text-white/70 mb-4">
              Conseils pour un meilleur résultat :
            </h3>
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 glass rounded-xl p-3 md:p-4"
                >
                  <div className="rounded-lg bg-indigo-500/20 p-2">
                    <tip.icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="text-sm text-white/60 pt-1">{tip.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
