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

      <div className="mx-auto max-w-4xl px-4 py-6 md:py-8 relative">
        <PhaseIndicator currentPhase={1} />

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
            <span className="text-sm font-semibold text-white/80">Phase 1 - Analyse CV</span>
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            Uploadez votre{" "}
            <span className="relative inline-block">
              <span className="gradient-text">CV</span>
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
            Notre IA va analyser et structurer{" "}
            <span className="text-white font-bold">vos compétences</span> en quelques secondes
          </p>
        </motion.div>

        {/* Main content area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 md:mt-16 flex justify-center"
        >
          {isUploading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl glass rounded-[28px] p-6 md:p-10 border border-white/10 backdrop-blur-xl relative overflow-hidden"
            >
              {/* Top gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

              <BiometricLoader progress={progress} status={status} />

              {/* Bottom shine */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            </motion.div>
          ) : (
            <CVDropzone
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
            />
          )}
        </motion.div>

        {/* Premium Tips Section */}
        {!isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mx-auto mt-12 md:mt-16 max-w-2xl"
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">
                Conseils pour un meilleur résultat
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Tips cards */}
            <div className="grid gap-4">
              {tips.map((tip, index) => {
                const gradients = [
                  "from-cyan-500 to-indigo-500",
                  "from-indigo-500 to-purple-500",
                  "from-purple-500 to-violet-500",
                ];
                const gradient = gradients[index % gradients.length];

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                    whileHover={{ x: 5 }}
                    className="relative group"
                  >
                    {/* Hover glow */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300`} />

                    {/* Card */}
                    <div className="relative flex items-start gap-4 glass rounded-2xl p-4 md:p-5 border border-white/10 backdrop-blur-xl group-hover:border-white/20 transition-all">
                      {/* Icon with gradient */}
                      <div className="relative flex-shrink-0">
                        <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-xl blur opacity-30`} />
                        <div className={`relative h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
                          <tip.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                      </div>

                      {/* Text */}
                      <div className="flex-1 pt-1">
                        <p className="text-sm md:text-base text-white/70 leading-relaxed">
                          {tip.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
