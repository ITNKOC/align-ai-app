"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import {
  User,
  FileText,
  Upload,
  Trash2,
  RefreshCw,
  Briefcase,
  GraduationCap,
  Code,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  CheckCircle,
  Calendar,
  TrendingUp,
  Award,
  Loader2,
  ChevronRight,
  Sparkles,
  Edit3,
  X,
} from "lucide-react";
import { AppNavbar } from "@/components/shared/app-navbar";
import { CoverageGauge, TopSkillsList } from "@/components/profile";
import {
  getUserProfile,
  uploadCV,
  deleteCV,
  getCoverageMetrics,
  type ProfileData,
  type ProfileStats,
  type CoverageMetrics,
} from "@/actions/profile-actions";
import { getSession } from "@/actions/auth-actions";
import type { CVData } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [coverage, setCoverage] = useState<CoverageMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const session = await getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser({ fullName: session.fullName, email: session.email });

      const result = await getUserProfile();
      if (result.success) {
        setProfile(result.profile || null);
        setStats(result.stats || null);
      }

      // Load coverage metrics
      const coverageResult = await getCoverageMetrics();
      if (coverageResult.success && coverageResult.data) {
        setCoverage(coverageResult.data);
      }
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Seuls les fichiers PDF sont acceptes");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + Math.random() * 15, 90));
    }, 300);

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const result = await uploadCV(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        toast.success(profile ? "CV mis a jour !" : "CV ajoute avec succes !");
        await loadData();
      } else {
        toast.error(result.error || "Erreur lors de l'upload");
      }
    } catch {
      clearInterval(progressInterval);
      toast.error("Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [profile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCV();
      if (result.success) {
        toast.success("CV supprime");
        setProfile(null);
        setStats(null);
      } else {
        toast.error(result.error || "Erreur");
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const cvData = profile?.cvData;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <AppNavbar />

      <main className="container-app py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/25">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.fullName}</h1>
              <p className="text-white/50">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - CV Upload & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* CV Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-modern p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Mon CV</h2>
                    <p className="text-xs text-white/50">
                      {profile ? "CV enregistre" : "Aucun CV"}
                    </p>
                  </div>
                </div>
                {profile && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload Zone */}
              <div
                {...getRootProps()}
                className={`
                  relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                  ${isDragActive
                    ? "border-indigo-500 bg-indigo-500/10"
                    : profile
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                      : "border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/5"
                  }
                  ${isUploading ? "pointer-events-none" : ""}
                `}
              >
                <input {...getInputProps()} />

                {isUploading ? (
                  <div className="py-4">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="32" cy="32" r="28"
                          strokeWidth="4" fill="none"
                          className="stroke-white/10"
                        />
                        <circle
                          cx="32" cy="32" r="28"
                          strokeWidth="4" fill="none"
                          className="stroke-indigo-500"
                          strokeLinecap="round"
                          strokeDasharray={176}
                          strokeDashoffset={176 - (176 * uploadProgress) / 100}
                          style={{ transition: "stroke-dashoffset 0.3s ease" }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>
                    <p className="text-white/70">Analyse en cours...</p>
                  </div>
                ) : profile ? (
                  <div className="py-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="font-medium text-white mb-1">{profile.fileName || "CV.pdf"}</p>
                    <p className="text-xs text-white/50 mb-3">
                      {profile.fileSize ? formatFileSize(profile.fileSize) : ""} •
                      Mis a jour le {new Date(profile.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-indigo-400">
                      <RefreshCw className="w-4 h-4" />
                      Glissez un nouveau CV pour le remplacer
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-7 h-7 text-indigo-400" />
                    </div>
                    <p className="font-medium text-white mb-1">
                      {isDragActive ? "Deposez votre CV ici..." : "Glissez votre CV ici"}
                    </p>
                    <p className="text-sm text-white/50 mb-3">ou cliquez pour parcourir</p>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-xs text-white/60">
                      PDF uniquement
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {profile && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={() => {
                      localStorage.setItem("currentProfileId", profile.id);
                      router.push("/analyze");
                    }}
                    className="btn-primary w-full py-3"
                  >
                    <Sparkles className="w-5 h-5" />
                    Nouvelle candidature
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>

            {/* CV Preview */}
            {cvData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-modern p-6"
              >
                <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  Informations extraites
                </h3>

                <div className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {cvData.personalInfo?.fullName || user?.fullName}
                    </h4>
                    {cvData.experiences?.[0]?.title && (
                      <p className="text-indigo-400">{cvData.experiences[0].title}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3">
                      {cvData.personalInfo?.email && (
                        <span className="flex items-center gap-1.5 text-xs text-white/60">
                          <Mail className="w-3.5 h-3.5" />
                          {cvData.personalInfo.email}
                        </span>
                      )}
                      {cvData.personalInfo?.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-white/60">
                          <Phone className="w-3.5 h-3.5" />
                          {cvData.personalInfo.phone}
                        </span>
                      )}
                      {cvData.personalInfo?.location && (
                        <span className="flex items-center gap-1.5 text-xs text-white/60">
                          <MapPin className="w-3.5 h-3.5" />
                          {cvData.personalInfo.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Experience Summary */}
                  {cvData.experiences && cvData.experiences.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-amber-400" />
                        Experience ({cvData.experiences.length})
                      </h4>
                      <div className="space-y-3">
                        {cvData.experiences.slice(0, 3).map((exp, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03]">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                              <Briefcase className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-white text-sm truncate">{exp.title}</p>
                              <p className="text-xs text-white/50">{exp.company} • {exp.startDate} - {exp.endDate}</p>
                            </div>
                          </div>
                        ))}
                        {cvData.experiences.length > 3 && (
                          <p className="text-xs text-white/40 text-center">
                            +{cvData.experiences.length - 3} autres experiences
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {cvData.skills && (
                    <div>
                      <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                        <Code className="w-4 h-4 text-emerald-400" />
                        Competences
                      </h4>
                      {(() => {
                        const allSkills = [
                          ...(cvData.skills.languages || []),
                          ...(cvData.skills.frameworks || []),
                          ...(cvData.skills.aiAndData || []),
                          ...(cvData.skills.toolsAndCloud || []),
                          ...(cvData.skills.softSkills || []),
                        ];
                        return (
                          <div className="flex flex-wrap gap-2">
                            {allSkills.slice(0, 12).map((skill, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg bg-white/[0.06] text-xs text-white/80">
                                {skill}
                              </span>
                            ))}
                            {allSkills.length > 12 && (
                              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] text-xs text-white/40">
                                +{allSkills.length - 12}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Education */}
                  {cvData.education && cvData.education.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-purple-400" />
                        Formation
                      </h4>
                      <div className="space-y-2">
                        {cvData.education.slice(0, 2).map((edu, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <GraduationCap className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-white text-sm truncate">{edu.degree}</p>
                              <p className="text-xs text-white/50">{edu.school}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <StatCard
                icon={<Briefcase className="w-5 h-5" />}
                label="Candidatures"
                value={stats?.totalApplications || 0}
                color="indigo"
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Postulees"
                value={stats?.appliedCount || 0}
                color="emerald"
              />
              <StatCard
                icon={<Calendar className="w-5 h-5" />}
                label="Entretiens"
                value={stats?.interviewCount || 0}
                color="cyan"
              />
              <StatCard
                icon={<Award className="w-5 h-5" />}
                label="Offres"
                value={stats?.offersCount || 0}
                color="amber"
              />
            </motion.div>

            {/* Coverage Gauge - Progressive Intelligence */}
            {profile && coverage && (
              <CoverageGauge
                percentage={coverage.percentage}
                learnedGapsCount={coverage.learnedGapsCount}
                totalJobsAnalyzed={coverage.totalJobsAnalyzed}
              />
            )}

            {/* Top Skills List */}
            {profile && coverage && coverage.topRequestedSkills.length > 0 && (
              <TopSkillsList skills={coverage.topRequestedSkills} />
            )}

            {/* Quick Tips */}
            {!profile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-modern p-5"
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Commencez ici
                </h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3 text-white/70">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">1</span>
                    Uploadez votre CV une seule fois
                  </li>
                  <li className="flex items-start gap-3 text-white/70">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">2</span>
                    Collez une offre d'emploi
                  </li>
                  <li className="flex items-start gap-3 text-white/70">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">3</span>
                    Obtenez CV + lettre personnalises
                  </li>
                </ol>
              </motion.div>
            )}

            {/* Social Links */}
            {cvData?.personalInfo && (cvData.personalInfo.linkedinUrl || cvData.personalInfo.githubUrl || cvData.personalInfo.portfolioUrl) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-modern p-5"
              >
                <h3 className="font-semibold text-white mb-4">Liens</h3>
                <div className="space-y-2">
                  {cvData.personalInfo.linkedinUrl && (
                    <a
                      href={cvData.personalInfo.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                      <span className="text-sm text-white/70 truncate">LinkedIn</span>
                    </a>
                  )}
                  {cvData.personalInfo.githubUrl && (
                    <a
                      href={cvData.personalInfo.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Github className="w-4 h-4 text-white" />
                      <span className="text-sm text-white/70 truncate">GitHub</span>
                    </a>
                  )}
                  {cvData.personalInfo.portfolioUrl && (
                    <a
                      href={cvData.personalInfo.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm text-white/70 truncate">Portfolio</span>
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-modern p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-white">Supprimer le CV ?</h3>
              </div>
              <p className="text-sm text-white/60 mb-6">
                Cette action supprimera votre CV et toutes les donnees associees. Vos candidatures existantes seront conservees.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-ghost flex-1 py-2.5"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "indigo" | "emerald" | "cyan" | "amber";
}) {
  const colors = {
    indigo: "bg-indigo-500/20 text-indigo-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    cyan: "bg-cyan-500/20 text-cyan-400",
    amber: "bg-amber-500/20 text-amber-400",
  };

  return (
    <div className="card-modern p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-white/50">{label}</p>
        </div>
      </div>
    </div>
  );
}
