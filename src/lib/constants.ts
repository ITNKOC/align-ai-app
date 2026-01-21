// ============================================
// ALIGN.AI - Constants v1.0
// Story 5.7: Multilingual CV Generation
// ============================================

import type { SupportedLanguage } from "./types";

// ==================== CV SECTION HEADERS ====================

/**
 * Multilingual section headers for CV generation
 * Used to generate documents in the same language as the job offer
 */
export const CV_SECTION_HEADERS: Record<SupportedLanguage, CVSectionHeadersType> = {
  fr: {
    whyMe: "POURQUOI MOI POUR CE POSTE",
    skills: "COMPETENCES TECHNIQUES",
    experience: "EXPERIENCE PROFESSIONNELLE",
    projects: "PROJETS SIGNIFICATIFS",
    education: "FORMATION",
    qualities: "QUALITES PROFESSIONNELLES",
    languages: "LANGUES",
    contact: "COORDONNEES",
    summary: "PROFIL",
  },
  en: {
    whyMe: "WHY ME FOR THIS ROLE",
    skills: "TECHNICAL SKILLS",
    experience: "PROFESSIONAL EXPERIENCE",
    projects: "SIGNIFICANT PROJECTS",
    education: "EDUCATION",
    qualities: "PROFESSIONAL QUALITIES",
    languages: "LANGUAGES",
    contact: "CONTACT",
    summary: "PROFILE",
  },
};

export interface CVSectionHeadersType {
  whyMe: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
  qualities: string;
  languages: string;
  contact: string;
  summary: string;
}

export type CVSectionKey = keyof CVSectionHeadersType;

// ==================== COVER LETTER SECTION HEADERS ====================

/**
 * Multilingual section headers for cover letter generation
 */
export const COVER_LETTER_HEADERS: Record<SupportedLanguage, CoverLetterHeadersType> = {
  fr: {
    greeting: "Madame, Monsieur,",
    closing: "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    closingShort: "Cordialement,",
    subject: "Objet : Candidature au poste de",
    ps: "P.S.",
  },
  en: {
    greeting: "Dear Hiring Manager,",
    closing: "Sincerely,",
    closingShort: "Best regards,",
    subject: "Re: Application for the position of",
    ps: "P.S.",
  },
};

export interface CoverLetterHeadersType {
  greeting: string;
  closing: string;
  closingShort: string;
  subject: string;
  ps: string;
}

// ==================== LANGUAGE LABELS ====================

/**
 * Human-readable language names
 */
export const LANGUAGE_LABELS = {
  fr: {
    fr: "Fran\u00e7ais",
    en: "Anglais",
    native: "Natif",
    fluent: "Courant",
    intermediate: "Interm\u00e9diaire",
    beginner: "D\u00e9butant",
  },
  en: {
    fr: "French",
    en: "English",
    native: "Native",
    fluent: "Fluent",
    intermediate: "Intermediate",
    beginner: "Beginner",
  },
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Get CV section headers for a given language
 */
export function getCVSectionHeaders(language: SupportedLanguage): CVSectionHeadersType {
  return CV_SECTION_HEADERS[language];
}

/**
 * Get cover letter headers for a given language
 */
export function getCoverLetterHeaders(language: SupportedLanguage): CoverLetterHeadersType {
  return COVER_LETTER_HEADERS[language];
}

/**
 * Get a specific CV section header by key and language
 */
export function getCVHeader(
  language: SupportedLanguage,
  section: CVSectionKey
): string {
  return CV_SECTION_HEADERS[language][section];
}

/**
 * Get language labels for a given document language
 */
export function getLanguageLabels(language: SupportedLanguage) {
  return LANGUAGE_LABELS[language];
}

// ==================== DATE FORMATTING ====================

/**
 * Date format strings by language
 */
export const DATE_FORMATS = {
  fr: {
    full: "d MMMM yyyy",
    short: "dd/MM/yyyy",
    monthYear: "MMMM yyyy",
  },
  en: {
    full: "MMMM d, yyyy",
    short: "MM/dd/yyyy",
    monthYear: "MMMM yyyy",
  },
} as const;

// ==================== PROMPT LANGUAGE INSTRUCTIONS ====================

/**
 * Instructions to include in prompts for language-specific generation
 */
export const LANGUAGE_INSTRUCTIONS = {
  fr: {
    tone: "Utilise un ton professionnel et formel, typique du march\u00e9 du travail fran\u00e7ais.",
    formality: "Utilisez le vouvoiement et les formules de politesse fran\u00e7aises.",
    culturalNotes: "Respectez les conventions fran\u00e7aises: pas de photo obligatoire, \u00e2ge optionnel, accent sur les dipl\u00f4mes.",
  },
  en: {
    tone: "Use a professional and confident tone, typical of the English-speaking job market.",
    formality: "Use professional English with action verbs and quantified achievements.",
    culturalNotes: "Follow English CV conventions: focus on achievements, use bullet points, be concise.",
  },
} as const;

/**
 * Get language-specific prompt instructions
 */
export function getLanguageInstructions(language: SupportedLanguage) {
  return LANGUAGE_INSTRUCTIONS[language];
}
