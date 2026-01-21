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
  Settings,
  ExternalLink,
  FolderGit2,
  Pencil,
} from "lucide-react";
import { AppNavbar } from "@/components/shared/app-navbar";
import {
  CoverageGauge,
  TopSkillsList,
  SkillsManager,
  LearnedSkillsSection,
  ExperienceList,
  ProjectList,
  EducationList,
  EditableField,
} from "@/components/profile";
import {
  getUserProfile,
  uploadCV,
  deleteCV,
  getCoverageMetrics,
  getLearnedGaps,
  updateSkills,
  updateProfileItem,
  addProfileItem,
  deleteProfileItem,
  type ProfileData,
  type ProfileStats,
  type CoverageMetrics,
} from "@/actions/profile-actions";
import { getSession } from "@/actions/auth-actions";
import type { CVData, Skills, LearnedGapsRecord, Experience, Project, Education, PersonalInfo } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [coverage, setCoverage] = useState<CoverageMetrics | null>(null);
  const [learnedGaps, setLearnedGaps] = useState<LearnedGapsRecord>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "learned">("overview");

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

      // Load learned gaps
      const learnedResult = await getLearnedGaps();
      if (learnedResult.success && learnedResult.data) {
        setLearnedGaps(learnedResult.data);
      }
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        toast.error("Seuls les fichiers PDF sont acceptes");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

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
    },
    [profile]
  );

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

  const handleUpdateSkills = async (newSkills: Skills) => {
    const result = await updateSkills(newSkills);
    if (result.success) {
      toast.success("Competences mises a jour");
      await loadData();
    } else {
      toast.error(result.error || "Erreur");
      throw new Error(result.error);
    }
  };

  // ==================== EXPERIENCE HANDLERS ====================
  const handleUpdateExperience = async (index: number, updates: Partial<Experience>) => {
    if (!profile?.cvData) return;
    // Optimistic update
    const newExperiences = [...profile.cvData.experiences];
    newExperiences[index] = { ...newExperiences[index], ...updates };
    setProfile({
      ...profile,
      cvData: { ...profile.cvData, experiences: newExperiences },
    });
    // Server update
    const result = await updateProfileItem("experiences", index, updates);
    if (!result.success) {
      toast.error(result.error || "Erreur de sauvegarde");
      await loadData(); // Rollback
    }
  };

  const handleAddExperience = async () => {
    if (!profile?.cvData) return;
    const newExp: Experience = {
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: [],
    };
    // Optimistic update
    setProfile({
      ...profile,
      cvData: {
        ...profile.cvData,
        experiences: [...profile.cvData.experiences, newExp],
      },
    });
    // Server update
    const result = await addProfileItem("experiences", newExp);
    if (result.success) {
      toast.success("Experience ajoutee");
    } else {
      toast.error(result.error || "Erreur");
      await loadData();
    }
  };

  const handleDeleteExperience = async (index: number) => {
    if (!profile?.cvData) return;
    // Optimistic update
    const newExperiences = profile.cvData.experiences.filter((_, i) => i !== index);
    setProfile({
      ...profile,
      cvData: { ...profile.cvData, experiences: newExperiences },
    });
    // Server update
    const result = await deleteProfileItem("experiences", index);
    if (result.success) {
      toast.success("Experience supprimee");
    } else {
      toast.error(result.error || "Erreur");
      await loadData();
    }
  };

  // ==================== PROJECT HANDLERS ====================
  const handleUpdateProject = async (index: number, updates: Partial<Project>) => {
    if (!profile?.cvData) return;
    const newProjects = [...profile.cvData.projects];
    newProjects[index] = { ...newProjects[index], ...updates };
    setProfile({
      ...profile,
      cvData: { ...profile.cvData, projects: newProjects },
    });
    const result = await updateProfileItem("projects", index, updates);
    if (!result.success) {
      toast.error(result.error || "Erreur de sauvegarde");
      await loadData();
    }
  };

  const handleAddProject = async () => {
    if (!profile?.cvData) return;
    const newProj: Project = {
      name: "",
      description: "",
      techStack: [],
      year: new Date().getFullYear().toString(),
    };
    setProfile({
      ...profile,
      cvData: {
        ...profile.cvData,
        projects: [...profile.cvData.projects, newProj],
      },
    });
    const result = await addProfileItem("projects", newProj);
    if (result.success) {
      toast.success("Projet ajoute");
    } else {
      toast.error(result.error || "Erreur");
      await loadData();
    }
  };

  const handleDeleteProject = async (index: number) => {
    if (!profile?.cvData) return;
    const newProjects = profile.cvData.projects.filter((_, i) => i !== index);
    setProfile({
      ...profile,
      cvData: { ...profile.cvData, projects: newProjects },
    });
    const result = await deleteProfileItem("projects", index);
    if (result.success) {
      toast.success("Projet supprime");
    } else {
      toast.error(result.error || "Erreur");
      await loadData();
    }
  };

  // ==================== EDUCATION HANDLERS ====================
  const handleUpdateEducation = async (index: number, updates: Partial<Education>) => {
    if (!profile?.cvData) return;
    const newEducation = [...profile.cvData.education];
    newEducation[index] = { ...newEducation[index], ...updates };
    setProfile({
      ...profile,
      cvData: { ...profile.cvData, education: newEducation },
    });
    const result = await updateProfileItem("education", index, updates);
    if (!result.success) {
      toast.error(result.error || "Erreur de sauvegarde");
      await loadData();
    }
  };

  const handleAddEducation = async () => {
    if (!profile?.cvData) return;
    const newEdu: Education = {
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
    };
    setProfile({
      ...profile,
      cvData: {
        ...profile.cvData,
        education: [...profile.cvData.education, newEdu],
      },
    });
    const result = await addProfileItem("education", newEdu);
    if (result.success) {
      toast.success("Formation ajoutee");
    } else {
      toast.error(result.error || "Erreur");
      await loadData();
    }
  };

  const handleDeleteEducation = async (index: number) => {
    if (!profile?.cvData) return;
    const newEducation = profile.cvData.education.filter((_, i) => i !== index);
    setProfile({
      ...profile,
      cvData: { ...profile.cvData, education: newEducation },
    });
    const result = await deleteProfileItem("education", index);
    if (result.success) {
      toast.success("Formation supprimee");
    } else {
      toast.error(result.error || "Erreur");
      await loadData();
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
    <div className="min-h-screen pb-24 md:pb-8 overflow-x-hidden w-full max-w-full">
      <AppNavbar />

      <main className="container-app py-4 sm:py-6 overflow-hidden w-full max-w-full">
        {/* Hero Header - Mobile First */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-white/10 p-4 sm:p-6 md:p-8 mb-6 md:mb-8"
        >
          {/* Subtle accent glow */}
          <div className="absolute top-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-cyan-500/10 rounded-full blur-2xl translate-y-1/2 translate-x-1/2" />

          <div className="relative flex flex-col gap-4 sm:gap-6">
            {/* User Info - Stack on mobile */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 md:w-20 sm:h-16 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold text-white shadow-lg shadow-indigo-500/20">
                {user?.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">{user?.fullName}</h1>
                <p className="text-white/60 text-sm truncate">{user?.email}</p>
                {cvData?.experiences?.[0]?.title && (
                  <p className="text-white/80 font-medium mt-0.5 sm:mt-1 text-sm sm:text-base truncate">
                    {cvData.experiences[0].title}
                  </p>
                )}
              </div>
            </div>

            {/* Quick stats - Responsive grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              <div className="text-center px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{stats?.totalApplications || 0}</p>
                <p className="text-[10px] sm:text-xs text-white/50">Candidatures</p>
              </div>
              <div className="text-center px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{stats?.interviewCount || 0}</p>
                <p className="text-[10px] sm:text-xs text-white/50">Entretiens</p>
              </div>
              <div className="text-center px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/5">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{Object.keys(learnedGaps).length}</p>
                <p className="text-[10px] sm:text-xs text-white/50">Skills appris</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs - Mobile optimized */}
        <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {[
            { id: "overview", label: "Apercu", labelFull: "Vue d'ensemble", icon: User },
            { id: "skills", label: "Skills", labelFull: "Competences", icon: Settings },
            { id: "learned", label: "Appris", labelFull: "Apprentissages", icon: Sparkles },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="sm:hidden">{tab.label}</span>
              <span className="hidden sm:inline">{tab.labelFull}</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full overflow-hidden">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* CV Upload Card */}
                  <div className="card-modern p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-500/20 flex items-center justify-center">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h2 className="font-semibold text-white text-sm sm:text-base">Mon CV</h2>
                          <p className="text-[10px] sm:text-xs text-white/50">
                            {profile ? "CV enregistre" : "Aucun CV"}
                          </p>
                        </div>
                      </div>
                      {profile && (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 sm:p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Upload Zone */}
                    <div
                      {...getRootProps()}
                      className={`
                        relative border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all
                        ${
                          isDragActive
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
                                cx="32"
                                cy="32"
                                r="28"
                                strokeWidth="4"
                                fill="none"
                                className="stroke-white/10"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                strokeWidth="4"
                                fill="none"
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
                          <p className="font-medium text-white mb-1">
                            {profile.fileName || "CV.pdf"}
                          </p>
                          <p className="text-xs text-white/50 mb-3">
                            {profile.fileSize ? formatFileSize(profile.fileSize) : ""} • Mis a jour
                            le {new Date(profile.updatedAt).toLocaleDateString("fr-FR")}
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

                    {/* Quick Action */}
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
                  </div>

                  {/* Personal Info Card */}
                  {cvData && (
                    <div className="card-modern p-4 sm:p-6">
                      <h3 className="font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                        Informations personnelles
                      </h3>

                      <div className="space-y-3 sm:space-y-4">
                        {/* Contact info - Stack on mobile */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                          {cvData.personalInfo?.email && (
                            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/5">
                              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-white/80 truncate">
                                {cvData.personalInfo.email}
                              </span>
                            </div>
                          )}
                          {cvData.personalInfo?.phone && (
                            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/5">
                              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-white/80">
                                {cvData.personalInfo.phone}
                              </span>
                            </div>
                          )}
                          {cvData.personalInfo?.location && (
                            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/5">
                              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-white/80">
                                {cvData.personalInfo.location}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Social links */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {cvData.personalInfo?.linkedinUrl && (
                            <a
                              href={cvData.personalInfo.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#0A66C2]/20 text-[#0A66C2] hover:bg-[#0A66C2]/30 transition-colors"
                            >
                              <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm">LinkedIn</span>
                              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </a>
                          )}
                          {cvData.personalInfo?.githubUrl && (
                            <a
                              href={cvData.personalInfo.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                              <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm">GitHub</span>
                              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </a>
                          )}
                          {cvData.personalInfo?.portfolioUrl && (
                            <a
                              href={cvData.personalInfo.portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                            >
                              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm">Portfolio</span>
                              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Experience Card - Editable */}
                  {cvData && (
                    <ExperienceList
                      experiences={cvData.experiences || []}
                      onUpdate={handleUpdateExperience}
                      onAdd={handleAddExperience}
                      onDelete={handleDeleteExperience}
                    />
                  )}

                  {/* Projects Card - Editable */}
                  {cvData && (
                    <ProjectList
                      projects={cvData.projects || []}
                      onUpdate={handleUpdateProject}
                      onAdd={handleAddProject}
                      onDelete={handleDeleteProject}
                    />
                  )}

                  {/* Education Card - Editable */}
                  {cvData && (
                    <EducationList
                      education={cvData.education || []}
                      onUpdate={handleUpdateEducation}
                      onAdd={handleAddEducation}
                      onDelete={handleDeleteEducation}
                    />
                  )}
                </motion.div>
              )}

              {/* Skills Tab */}
              {activeTab === "skills" && cvData?.skills && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card-modern p-3 sm:p-6"
                >
                  <SkillsManager
                    skills={cvData.skills}
                    onUpdateSkills={handleUpdateSkills}
                  />
                </motion.div>
              )}

              {/* Learned Skills Tab */}
              {activeTab === "learned" && (
                <motion.div
                  key="learned"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <LearnedSkillsSection learnedGaps={learnedGaps} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
            {/* Stats Cards - Hidden on mobile (shown in hero) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="hidden lg:grid grid-cols-2 gap-2 sm:gap-3"
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

            {/* Coverage Gauge */}
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
                transition={{ delay: 0.2 }}
                className="card-modern p-5"
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Commencez ici
                </h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3 text-white/70">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">
                      1
                    </span>
                    Uploadez votre CV une seule fois
                  </li>
                  <li className="flex items-start gap-3 text-white/70">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">
                      2
                    </span>
                    Collez une offre d'emploi
                  </li>
                  <li className="flex items-start gap-3 text-white/70">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">
                      3
                    </span>
                    Obtenez CV + lettre personnalises
                  </li>
                </ol>
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
                Cette action supprimera votre CV et toutes les donnees associees. Vos candidatures
                existantes seront conservees.
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
