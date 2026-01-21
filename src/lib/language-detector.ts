// ============================================
// ALIGN.AI - Language Detection v1.0
// Story 5.7: Multilingual CV Generation
// ============================================

import { generateJSON } from "./gemini";
import type { SupportedLanguage, LanguageDetectionResult } from "./types";

// Re-export types for convenience
export type { SupportedLanguage, LanguageDetectionResult };

// ==================== CONSTANTS ====================

// French indicators - common words in French job offers
const FRENCH_INDICATORS = [
  "nous recherchons",
  "poste",
  "entreprise",
  "compétences",
  "expérience",
  "formation",
  "salaire",
  "télétravail",
  "candidature",
  "profil",
  "mission",
  "équipe",
  "rejoindre",
  "cdi",
  "cdd",
  "stage",
  "alternance",
  "rémunération",
  "avantages",
  "responsabilités",
  "environnement",
  "qualités",
  "maîtrise",
  "connaissance",
  "aisance",
  "autonomie",
  "rigueur",
  "vous êtes",
  "vous avez",
  "vous serez",
  "vos missions",
  "votre profil",
  "pour ce poste",
  "de préférence",
  "souhaitée",
  "requis",
  "obligatoire",
  "idéalement",
  "minimum",
  "années d'expérience",
  "ans d'expérience",
];

// English indicators - common words in English job offers
const ENGLISH_INDICATORS = [
  "we are looking",
  "position",
  "company",
  "skills",
  "experience",
  "education",
  "salary",
  "remote",
  "application",
  "profile",
  "responsibilities",
  "team",
  "join",
  "full-time",
  "part-time",
  "internship",
  "compensation",
  "benefits",
  "environment",
  "qualifications",
  "proficiency",
  "knowledge",
  "fluent",
  "self-motivated",
  "attention to detail",
  "you will",
  "you have",
  "your role",
  "your responsibilities",
  "requirements",
  "required",
  "preferred",
  "must have",
  "nice to have",
  "years of experience",
  "minimum",
  "ideally",
  "bachelor",
  "master",
  "degree",
];

// Confidence threshold for pattern-based detection
const CONFIDENCE_THRESHOLD = 0.7;

// ==================== PATTERN-BASED DETECTION ====================

/**
 * Detect language using pattern matching
 * Fast and reliable for clear-cut cases
 */
export function detectLanguageByPattern(text: string): LanguageDetectionResult {
  const lowerText = text.toLowerCase();

  // Count matches for each language
  const frenchMatches = FRENCH_INDICATORS.filter((indicator) =>
    lowerText.includes(indicator)
  );
  const englishMatches = ENGLISH_INDICATORS.filter((indicator) =>
    lowerText.includes(indicator)
  );

  const frenchScore = frenchMatches.length;
  const englishScore = englishMatches.length;
  const total = frenchScore + englishScore;

  // No indicators found - low confidence, default to French
  if (total === 0) {
    return {
      language: "fr",
      confidence: 0.5,
      method: "pattern",
    };
  }

  // Calculate confidence based on ratio
  const frenchRatio = frenchScore / total;

  // Confidence formula: distance from 50/50 split
  // 100% one language = 1.0 confidence
  // 50/50 split = 0.5 confidence
  const rawConfidence = Math.abs(frenchRatio - 0.5) * 2 + 0.5;

  // Clamp confidence to [0.5, 1.0] range
  const confidence = Math.min(1, Math.max(0.5, rawConfidence));

  return {
    language: frenchRatio > 0.5 ? "fr" : "en",
    confidence: Math.round(confidence * 100) / 100,
    method: "pattern",
  };
}

// ==================== GEMINI-BASED DETECTION ====================

/**
 * Detect language using Gemini AI
 * Used as fallback when pattern detection is uncertain
 */
export async function detectLanguageByGemini(
  text: string
): Promise<LanguageDetectionResult> {
  const prompt = `Analyze this job offer text and determine if it is primarily written in French or English.

TEXT TO ANALYZE:
"""
${text.slice(0, 2000)}
"""

Respond with a JSON object containing:
- language: "fr" for French, "en" for English
- confidence: a number between 0 and 1 (1 = very confident)
- reasoning: brief explanation (1 sentence)

Consider:
- The main language of the text, not code snippets or tech terms
- Job-specific terminology and phrasing
- If bilingual, choose the dominant language

JSON Response:`;

  try {
    const result = await generateJSON<{
      language: "fr" | "en";
      confidence: number;
      reasoning: string;
    }>(prompt);

    return {
      language: result.language === "en" ? "en" : "fr",
      confidence: Math.min(1, Math.max(0, result.confidence)),
      method: "gemini",
    };
  } catch (error) {
    console.error("[LanguageDetector] Gemini detection failed:", error);
    // Fallback to French with low confidence
    return {
      language: "fr",
      confidence: 0.5,
      method: "gemini",
    };
  }
}

// ==================== MAIN DETECTION FUNCTION ====================

/**
 * Detect the language of a job offer text
 * Uses pattern matching first, falls back to Gemini if uncertain
 *
 * @param text - The job offer text to analyze
 * @param useGeminiFallback - Whether to use Gemini for uncertain cases (default: true)
 * @returns Language detection result with confidence score
 */
export async function detectLanguage(
  text: string,
  useGeminiFallback: boolean = true
): Promise<LanguageDetectionResult> {
  // First try pattern-based detection (fast)
  const patternResult = detectLanguageByPattern(text);

  console.log(
    `[LanguageDetector] Pattern detection: ${patternResult.language} (${Math.round(patternResult.confidence * 100)}% confidence)`
  );

  // If confidence is high enough, use pattern result
  if (patternResult.confidence >= CONFIDENCE_THRESHOLD) {
    return patternResult;
  }

  // If Gemini fallback is disabled, return pattern result
  if (!useGeminiFallback) {
    return patternResult;
  }

  // Use Gemini for uncertain cases
  console.log(
    "[LanguageDetector] Confidence too low, using Gemini fallback..."
  );
  const geminiResult = await detectLanguageByGemini(text);

  console.log(
    `[LanguageDetector] Gemini detection: ${geminiResult.language} (${Math.round(geminiResult.confidence * 100)}% confidence)`
  );

  return geminiResult;
}

// ==================== SYNC DETECTION (for synchronous contexts) ====================

/**
 * Synchronous language detection using only pattern matching
 * Use this when async is not available (e.g., in prompts)
 */
export function detectLanguageSync(text: string): LanguageDetectionResult {
  return detectLanguageByPattern(text);
}
