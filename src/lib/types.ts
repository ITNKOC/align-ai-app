// CV Structured Data Types
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface Project {
  name: string;
  description: string;
  techStack: string[];
  year: string;
}

export interface Skills {
  languages: string[];
  frameworks: string[];
  aiAndData: string[];
  toolsAndCloud: string[];
  softSkills: string[];
}

export interface CVData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skills;
  languages: { language: string; level: string }[];
}

// Analysis Types
export interface GapAnalysis {
  skill: string;
  severity: "critical" | "moderate" | "minor";
  category: string;
  suggestion: string;
}

export interface AnalysisResult {
  score: number;
  gaps: GapAnalysis[];
  keywords: string[];
  matchedSkills: string[];
  jobTitle: string;
  company: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: number;
}

export interface Strategy {
  gapSkill: string;
  approach: "add_skill" | "fast_learner" | "transferable";
  details: string;
  validated: boolean;
}

// Generation Types
export interface GenerationData {
  cvLatex: string;
  coverLetterLatex: string;
}
