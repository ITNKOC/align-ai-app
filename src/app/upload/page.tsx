"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Shield,
  Zap,
  Loader2,
  CheckCircle,
  X,
  ArrowRight,
  User,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { AppNavbar } from "@/components/shared/app-navbar";
import { uploadAndParseCV } from "@/actions/cv-actions";
import { hasExistingCV, uploadCV } from "@/actions/profile-actions";
import { getSession } from "@/actions/auth-actions";
import type { CVData } from "@/lib/types";

export default function UploadPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasCV, setHasCV] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState<string | null>(null);
  const [existingCVData, setExistingCVData] = useState<CVData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Preparation...");
  const [showUploadNew, setShowUploadNew] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        toast.error("Vous devez etre connecte");
        router.push("/login");
        return;
      }

      // Check if user has existing CV
      const cvCheck = await hasExistingCV();
      if (cvCheck.success && cvCheck.hasCV && cvCheck.profileId) {
        setHasCV(true);
        setExistingProfileId(cvCheck.profileId);
        setExistingCVData(cvCheck.cvData || null);
      }

      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Seuls les fichiers PDF sont acceptes");
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return Math.min(prev + Math.random() * 15, 90);
      });
    }, 500);

    setTimeout(() => setStatus("Extraction du texte..."), 500);
    setTimeout(() => setStatus("Analyse par l'IA..."), 2000);
    setTimeout(() => setStatus("Structuration du profil..."), 4000);

    try {
      const formData = new FormData();
      formData.append("cv", selectedFile);

      // Use the new uploadCV that saves to profile
      const result = await uploadCV(formData);

      clearInterval(progressInterval);

      if (result.success && result.profileId) {
        setProgress(100);
        setStatus("Analyse terminee !");
        toast.success("CV analyse et sauvegarde !");
        localStorage.setItem("currentProfileId", result.profileId);

        setTimeout(() => {
          router.push("/analyze");
        }, 800);
      } else {
        throw new Error(result.error || "Echec de l'analyse");
      }
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setProgress(0);
      setSelectedFile(null);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  const handleUseExistingCV = () => {
    if (existingProfileId) {
      localStorage.setItem("currentProfileId", existingProfileId);
      router.push("/analyze");
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const tips = [
    { icon: FileText, text: "Utilisez un CV au format PDF standard" },
    { icon: Shield, text: "Le texte doit etre selectionnable" },
    { icon: Zap, text: "Francais ou anglais recommande" },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <AppNavbar />

      <main className="container-app py-6">
        {/* Header */}
        <div className="page-header text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="badge badge-primary mb-4">
              {hasCV && !showUploadNew ? "CV detecte" : "Etape 1"}
            </span>
            <h1 className="page-title text-2xl sm:text-3xl md:text-4xl">
              {hasCV && !showUploadNew ? (
                <>Votre <span className="gradient-text">CV</span> est pret</>
              ) : (
                <>Uploadez votre <span className="gradient-text">CV</span></>
              )}
            </h1>
            <p className="page-subtitle mt-2 max-w-md mx-auto">
              {hasCV && !showUploadNew
                ? "Utilisez votre CV existant ou uploadez-en un nouveau"
                : "Notre IA analyse et structure vos competences"
              }
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-lg mx-auto mt-8"
        >
          <AnimatePresence mode="wait">
            {/* Has existing CV - Show options */}
            {hasCV && !showUploadNew && !isUploading && (
              <motion.div
                key="existing-cv"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Existing CV Card */}
                <div className="card-modern p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg">CV enregistre</h3>
                      {existingCVData?.personalInfo?.fullName && (
                        <p className="text-white/70 mt-1">
                          {existingCVData.personalInfo.fullName}
                        </p>
                      )}
                      {existingCVData?.experiences?.[0]?.title && (
                        <p className="text-sm text-white/50">
                          {existingCVData.experiences[0].title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Skills preview */}
                  {existingCVData?.skills && (
                    <div className="mb-6">
                      <p className="text-xs text-white/40 mb-2">Competences detectees</p>
                      {(() => {
                        const allSkills = [
                          ...(existingCVData.skills.languages || []),
                          ...(existingCVData.skills.frameworks || []),
                          ...(existingCVData.skills.aiAndData || []),
                          ...(existingCVData.skills.toolsAndCloud || []),
                          ...(existingCVData.skills.softSkills || []),
                        ];
                        return (
                          <div className="flex flex-wrap gap-1.5">
                            {allSkills.slice(0, 8).map((skill, i) => (
                              <span key={i} className="px-2 py-1 rounded-md bg-white/[0.06] text-xs text-white/70">
                                {skill}
                              </span>
                            ))}
                            {allSkills.length > 8 && (
                              <span className="px-2 py-1 rounded-md bg-white/[0.03] text-xs text-white/40">
                                +{allSkills.length - 8}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <button
                    onClick={handleUseExistingCV}
                    className="btn-primary w-full py-3"
                  >
                    <Sparkles className="w-5 h-5" />
                    Continuer avec ce CV
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Upload new option */}
                <button
                  onClick={() => setShowUploadNew(true)}
                  className="w-full p-4 rounded-xl border border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-3 text-white/60 hover:text-white/80"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Uploader un nouveau CV</span>
                </button>
              </motion.div>
            )}

            {/* Uploading State */}
            {isUploading && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card-modern p-6 sm:p-8"
              >
                <div className="flex flex-col items-center">
                  {/* Progress Circle */}
                  <div className="relative w-24 h-24 mb-6">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="48" cy="48" r="42"
                        strokeWidth="6" fill="none"
                        className="stroke-white/10"
                      />
                      <circle
                        cx="48" cy="48" r="42"
                        strokeWidth="6" fill="none"
                        className="stroke-indigo-500"
                        strokeLinecap="round"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * progress) / 100}
                        style={{ transition: "stroke-dashoffset 0.5s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-white font-medium mb-1">{status}</p>
                  <p className="text-sm text-white/50">Veuillez patienter...</p>
                </div>
              </motion.div>
            )}

            {/* File Selected State */}
            {selectedFile && !isUploading && (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card-modern p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-white/50">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="btn-icon w-8 h-8 hover:bg-red-500/20 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <button onClick={handleUpload} className="btn-primary w-full py-3">
                  <Upload className="w-4 h-4" />
                  {hasCV ? "Remplacer mon CV" : "Analyser mon CV"}
                </button>

                {hasCV && (
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setShowUploadNew(false);
                    }}
                    className="w-full mt-3 text-sm text-white/50 hover:text-white/70 transition-colors"
                  >
                    Annuler et garder mon CV actuel
                  </button>
                )}
              </motion.div>
            )}

            {/* Dropzone - Show if no existing CV or user wants to upload new */}
            {(!hasCV || showUploadNew) && !selectedFile && !isUploading && (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div
                  {...getRootProps()}
                  className={`
                    card-modern p-8 cursor-pointer text-center
                    border-2 border-dashed transition-all
                    ${isDragActive
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-white/10 hover:border-indigo-500/50"
                    }
                  `}
                >
                  <input {...getInputProps()} />

                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-indigo-400" />
                  </div>

                  <p className="text-white font-medium mb-1">
                    {isDragActive ? "Deposez ici..." : "Glissez votre CV ici"}
                  </p>
                  <p className="text-sm text-white/50 mb-4">ou cliquez pour parcourir</p>

                  <span className="badge badge-neutral">PDF uniquement</span>
                </div>

                {hasCV && showUploadNew && (
                  <button
                    onClick={() => setShowUploadNew(false)}
                    className="w-full mt-4 text-sm text-white/50 hover:text-white/70 transition-colors"
                  >
                    Annuler et utiliser mon CV existant
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tips - Only show when no CV exists */}
        {!hasCV && !isUploading && !selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-lg mx-auto mt-8"
          >
            <p className="text-xs text-white/40 uppercase tracking-wider text-center mb-4">
              Conseils
            </p>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm text-white/60"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <tip.icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  {tip.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
