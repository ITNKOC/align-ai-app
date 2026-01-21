"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Play,
  FileText,
  Code,
  Download,
  Copy,
  Check,
  Loader2,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Wrench,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
} from "lucide-react";
import type { CVData, Experience, Education, Project, Skills } from "@/lib/types";

// Empty job description
const emptyJobDescription = "";

// Empty CV template
const emptyCVData: CVData = {
  profileType: "developer",
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  },
  experiences: [],
  education: [],
  projects: [],
  skills: {
    languages: [],
    frameworks: [],
    aiAndData: [],
    toolsAndCloud: [],
    softSkills: [],
  },
  languages: [],
};

export default function TestPage() {
  const [cvData, setCvData] = useState<CVData>(emptyCVData);
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [cvLatex, setCvLatex] = useState<string | null>(null);
  const [cvPdfUrl, setCvPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [generatedWhyMe, setGeneratedWhyMe] = useState<string | null>(null);

  // Section collapse states
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    experiences: true,
    education: false,
    projects: false,
    skills: true,
    languages: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Personal Info handlers
  const updatePersonalInfo = (field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  // Experience handlers
  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { title: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] },
      ],
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeExperience = (index: number) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
  };

  const addBullet = (expIndex: number) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) =>
        i === expIndex ? { ...exp, bullets: [...exp.bullets, ""] } : exp
      ),
    }));
  };

  const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) =>
        i === expIndex
          ? { ...exp, bullets: exp.bullets.map((b, bi) => (bi === bulletIndex ? value : b)) }
          : exp
      ),
    }));
  };

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    setCvData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) =>
        i === expIndex
          ? { ...exp, bullets: exp.bullets.filter((_, bi) => bi !== bulletIndex) }
          : exp
      ),
    }));
  };

  // Education handlers
  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "", school: "", location: "", startDate: "", endDate: "" },
      ],
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (index: number) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Project handlers
  const addProject = () => {
    setCvData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { name: "", description: "", techStack: [], year: "" },
      ],
    }));
  };

  const updateProject = (index: number, field: keyof Project, value: string | string[]) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) =>
        i === index ? { ...proj, [field]: value } : proj
      ),
    }));
  };

  const removeProject = (index: number) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  // Skills handlers
  const updateSkills = (category: keyof Skills, value: string) => {
    const skills = value.split(",").map(s => s.trim()).filter(s => s);
    setCvData(prev => ({
      ...prev,
      skills: { ...prev.skills, [category]: skills },
    }));
  };

  // Language handlers
  const addLanguage = () => {
    setCvData(prev => ({
      ...prev,
      languages: [...prev.languages, { language: "", level: "" }],
    }));
  };

  const updateLanguage = (index: number, field: "language" | "level", value: string) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) =>
        i === index ? { ...lang, [field]: value } : lang
      ),
    }));
  };

  const removeLanguage = (index: number) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  // Handle CV upload and parsing
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Seuls les fichiers PDF sont acceptes");
      return;
    }

    setIsParsing(true);
    setError(null);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const response = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.cvData) {
        // Pre-fill the form with extracted data
        setCvData(prev => ({
          ...prev,
          profileType: result.cvData.profileType || "developer",
          personalInfo: {
            fullName: result.cvData.personalInfo?.fullName || "",
            email: result.cvData.personalInfo?.email || "",
            phone: result.cvData.personalInfo?.phone || "",
            location: result.cvData.personalInfo?.location || "",
            linkedinUrl: result.cvData.personalInfo?.linkedinUrl || "",
            githubUrl: result.cvData.personalInfo?.githubUrl || "",
            portfolioUrl: result.cvData.personalInfo?.portfolioUrl || "",
          },
          experiences: result.cvData.experiences || [],
          education: result.cvData.education || [],
          projects: result.cvData.projects || [],
          skills: {
            languages: result.cvData.skills?.languages || [],
            frameworks: result.cvData.skills?.frameworks || [],
            aiAndData: result.cvData.skills?.aiAndData || [],
            toolsAndCloud: result.cvData.skills?.toolsAndCloud || [],
            softSkills: result.cvData.skills?.softSkills || [],
            dynamicCategories: result.cvData.skills?.dynamicCategories || [],
          },
          languages: result.cvData.languages || [],
        }));

        // Expand all sections to show imported data
        setExpandedSections({
          personal: true,
          experiences: true,
          education: true,
          projects: true,
          skills: true,
          languages: true,
        });

        toast.success(`CV "${file.name}" importe avec succes !`);
      } else {
        setError(result.error || "Erreur lors de l'extraction");
        toast.error(result.error || "Erreur lors de l'extraction du CV");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMsg);
      toast.error("Erreur: " + errorMsg);
    } finally {
      setIsParsing(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!cvData.personalInfo.fullName) {
      toast.error("Veuillez entrer au moins votre nom");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCvLatex(null);
    if (cvPdfUrl) {
      URL.revokeObjectURL(cvPdfUrl);
      setCvPdfUrl(null);
    }

    try {
      const response = await fetch("/api/test-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData, jobDescription: jobDescription || undefined }),
      });

      const result = await response.json();

      if (result.success) {
        setCvLatex(result.cvLatex);
        setGeneratedWhyMe(result.whyMe || null);
        if (result.cvPdfBase64) {
          const binary = atob(result.cvPdfBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "application/pdf" });
          setCvPdfUrl(URL.createObjectURL(blob));
        }
        toast.success("Generation reussie !");
      } else {
        setError(result.error || "Erreur de generation");
        setGeneratedWhyMe(result.whyMe || null);
        if (result.cvLatex) {
          setCvLatex(result.cvLatex);
        }
        toast.error("Erreur: " + (result.error || "Generation echouee"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      toast.error("Erreur de connexion");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (cvLatex) {
      navigator.clipboard.writeText(cvLatex);
      setCopied(true);
      toast.success("Code LaTeX copie !");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Section Header Component
  const SectionHeader = ({
    icon,
    title,
    section,
    count,
  }: {
    icon: React.ReactNode;
    title: string;
    section: keyof typeof expandedSections;
    count?: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
          {icon}
        </div>
        <span className="font-medium text-white">{title}</span>
        {count !== undefined && (
          <span className="text-xs text-white/40">({count})</span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-white/40" />
      ) : (
        <ChevronDown className="w-5 h-5 text-white/40" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="flex flex-col lg:flex-row">
        {/* Left Panel - Form */}
        <div className="lg:w-1/2 p-4 md:p-6 lg:h-screen lg:overflow-y-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300">Mode Test</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Generateur de CV
            </h1>
            <p className="text-white/60 text-sm">
              Importe ton CV ou remplis le formulaire manuellement
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <label
              className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                isParsing
                  ? "border-indigo-500/50 bg-indigo-500/10"
                  : "border-white/20 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10"
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isParsing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              {isParsing ? (
                <>
                  <Loader2 className="w-10 h-10 text-indigo-400 mb-3 animate-spin" />
                  <span className="text-white font-medium">Analyse en cours...</span>
                  <span className="text-white/50 text-sm mt-1">Extraction des donnees avec l'IA</span>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-indigo-400 mb-3" />
                  <span className="text-white font-medium">Importer un CV (PDF)</span>
                  <span className="text-white/50 text-sm mt-1">
                    {uploadedFileName ? `Dernier: ${uploadedFileName}` : "Glisse ton fichier ou clique ici"}
                  </span>
                </>
              )}
            </label>

            {uploadedFileName && !isParsing && (
              <p className="text-center text-emerald-400 text-sm mt-2">
                <Check className="w-4 h-4 inline mr-1" />
                Donnees importees - modifie si necessaire
              </p>
            )}
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-sm">ou remplis manuellement</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form Sections */}
          <div className="space-y-4">
            {/* Personal Info */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <SectionHeader
                icon={<User className="w-4 h-4" />}
                title="Informations Personnelles"
                section="personal"
              />
              <AnimatePresence>
                {expandedSections.personal && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 space-y-3"
                  >
                    <input
                      type="text"
                      placeholder="Nom complet *"
                      value={cvData.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="email"
                        placeholder="Email"
                        value={cvData.personalInfo.email}
                        onChange={(e) => updatePersonalInfo("email", e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                      />
                      <input
                        type="tel"
                        placeholder="Telephone"
                        value={cvData.personalInfo.phone}
                        onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Localisation (ex: Paris, France)"
                      value={cvData.personalInfo.location}
                      onChange={(e) => updatePersonalInfo("location", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                    />
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={cvData.personalInfo.linkedinUrl || ""}
                      onChange={(e) => updatePersonalInfo("linkedinUrl", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                    />
                    <input
                      type="url"
                      placeholder="GitHub URL"
                      value={cvData.personalInfo.githubUrl || ""}
                      onChange={(e) => updatePersonalInfo("githubUrl", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Experiences */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <SectionHeader
                icon={<Briefcase className="w-4 h-4" />}
                title="Experiences"
                section="experiences"
                count={cvData.experiences.length}
              />
              <AnimatePresence>
                {expandedSections.experiences && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 space-y-4"
                  >
                    {cvData.experiences.map((exp, index) => (
                      <div key={index} className="p-4 rounded-xl bg-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white/60">
                            Experience {index + 1}
                          </span>
                          <button
                            onClick={() => removeExperience(index)}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Titre du poste"
                          value={exp.title}
                          onChange={(e) => updateExperience(index, "title", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Entreprise"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, "company", e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                          />
                          <input
                            type="text"
                            placeholder="Lieu"
                            value={exp.location}
                            onChange={(e) => updateExperience(index, "location", e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Date debut (ex: 2020)"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                          />
                          <input
                            type="text"
                            placeholder="Date fin (ou Present)"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs text-white/40">Points cles:</span>
                          {exp.bullets.map((bullet, bi) => (
                            <div key={bi} className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Point cle..."
                                value={bullet}
                                onChange={(e) => updateBullet(index, bi, e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                              />
                              <button
                                onClick={() => removeBullet(index, bi)}
                                className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addBullet(index)}
                            className="text-xs text-indigo-400 hover:text-indigo-300"
                          >
                            + Ajouter un point
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addExperience}
                      className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une experience
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Education */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <SectionHeader
                icon={<GraduationCap className="w-4 h-4" />}
                title="Formation"
                section="education"
                count={cvData.education.length}
              />
              <AnimatePresence>
                {expandedSections.education && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 space-y-4"
                  >
                    {cvData.education.map((edu, index) => (
                      <div key={index} className="p-4 rounded-xl bg-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white/60">
                            Formation {index + 1}
                          </span>
                          <button
                            onClick={() => removeEducation(index)}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Diplome"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, "degree", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                        />
                        <input
                          type="text"
                          placeholder="Ecole/Universite"
                          value={edu.school}
                          onChange={(e) => updateEducation(index, "school", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Lieu"
                            value={edu.location}
                            onChange={(e) => updateEducation(index, "location", e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                          />
                          <input
                            type="text"
                            placeholder="Debut"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                          />
                          <input
                            type="text"
                            placeholder="Fin"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addEducation}
                      className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une formation
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Projects */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <SectionHeader
                icon={<FolderOpen className="w-4 h-4" />}
                title="Projets"
                section="projects"
                count={cvData.projects.length}
              />
              <AnimatePresence>
                {expandedSections.projects && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 space-y-4"
                  >
                    {cvData.projects.map((proj, index) => (
                      <div key={index} className="p-4 rounded-xl bg-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white/60">
                            Projet {index + 1}
                          </span>
                          <button
                            onClick={() => removeProject(index)}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Nom du projet"
                            value={proj.name}
                            onChange={(e) => updateProject(index, "name", e.target.value)}
                            className="col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                          />
                          <input
                            type="text"
                            placeholder="Annee"
                            value={proj.year}
                            onChange={(e) => updateProject(index, "year", e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <textarea
                          placeholder="Description..."
                          value={proj.description}
                          onChange={(e) => updateProject(index, "description", e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50 resize-none"
                        />
                        <input
                          type="text"
                          placeholder="Technologies (separees par des virgules)"
                          value={proj.techStack.join(", ")}
                          onChange={(e) =>
                            updateProject(
                              index,
                              "techStack",
                              e.target.value.split(",").map((s) => s.trim()).filter((s) => s)
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                        />
                      </div>
                    ))}
                    <button
                      onClick={addProject}
                      className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un projet
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Skills */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <SectionHeader
                icon={<Wrench className="w-4 h-4" />}
                title="Competences"
                section="skills"
              />
              <AnimatePresence>
                {expandedSections.skills && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 space-y-3"
                  >
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Langages</label>
                      <input
                        type="text"
                        placeholder="Python, JavaScript, TypeScript..."
                        value={cvData.skills.languages.join(", ")}
                        onChange={(e) => updateSkills("languages", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Frameworks</label>
                      <input
                        type="text"
                        placeholder="React, Next.js, Node.js..."
                        value={cvData.skills.frameworks.join(", ")}
                        onChange={(e) => updateSkills("frameworks", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">IA & Data</label>
                      <input
                        type="text"
                        placeholder="TensorFlow, PyTorch, Pandas..."
                        value={cvData.skills.aiAndData.join(", ")}
                        onChange={(e) => updateSkills("aiAndData", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Outils & Cloud</label>
                      <input
                        type="text"
                        placeholder="Docker, AWS, Git..."
                        value={cvData.skills.toolsAndCloud.join(", ")}
                        onChange={(e) => updateSkills("toolsAndCloud", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Soft Skills</label>
                      <input
                        type="text"
                        placeholder="Leadership, Communication..."
                        value={cvData.skills.softSkills.join(", ")}
                        onChange={(e) => updateSkills("softSkills", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Languages */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <SectionHeader
                icon={<span className="text-sm">🌍</span>}
                title="Langues"
                section="languages"
                count={cvData.languages.length}
              />
              <AnimatePresence>
                {expandedSections.languages && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 space-y-3"
                  >
                    {cvData.languages.map((lang, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Langue"
                          value={lang.language}
                          onChange={(e) => updateLanguage(index, "language", e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                        />
                        <input
                          type="text"
                          placeholder="Niveau"
                          value={lang.level}
                          onChange={(e) => updateLanguage(index, "level", e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50"
                        />
                        <button
                          onClick={() => removeLanguage(index)}
                          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addLanguage}
                      className="w-full py-2 rounded-xl border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une langue
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Job Description */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-white">Offre d'emploi</span>
                    <span className="text-xs text-white/40 ml-2">(optionnel - ameliore le "Pourquoi Moi")</span>
                  </div>
                </div>
                <textarea
                  placeholder="Colle ici l'offre d'emploi pour generer un 'Pourquoi Moi' personnalise..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !cvData.personalInfo.fullName}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generation...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Generer le CV
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:w-1/2 p-4 md:p-6 lg:h-screen lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-white/10">
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300"
            >
              <p className="font-medium">Erreur:</p>
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {/* Results */}
          {cvLatex || cvPdfUrl ? (
            <div className="space-y-4">
              {/* Generated Why Me */}
              {generatedWhyMe && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-amber-500/10 border border-amber-500/30 overflow-hidden"
                >
                  <div className="p-4 border-b border-amber-500/20 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="font-medium text-amber-300">Pourquoi Moi (genere par IA)</span>
                  </div>
                  <div className="p-4">
                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                      {generatedWhyMe}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* PDF Preview */}
              <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <span className="font-medium text-white">Apercu PDF</span>
                  </div>
                  {cvPdfUrl && (
                    <a
                      href={cvPdfUrl}
                      download="cv.pdf"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Telecharger
                    </a>
                  )}
                </div>
                <div className="aspect-[3/4] bg-white/5">
                  {cvPdfUrl ? (
                    <iframe
                      src={cvPdfUrl}
                      className="w-full h-full bg-white"
                      title="CV Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/30 p-8 text-center">
                      <div>
                        <p className="mb-2">PDF non disponible</p>
                        <p className="text-sm">Copie le code LaTeX et utilise Overleaf.com</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* LaTeX Code */}
              <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium text-white">Code LaTeX</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      copied
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copie !
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copier
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 max-h-[400px] overflow-auto">
                  <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono">
                    {cvLatex}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-white/40">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Apercu du CV</p>
                <p className="text-sm mt-1">Remplis le formulaire et clique sur Generer</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
