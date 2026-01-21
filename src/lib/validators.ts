/**
 * Validation Schemas for Align.ai
 * Centralized Zod validators for all input validation
 * @module lib/validators
 */

import { z } from "zod";

// ============================================================================
// FILE UPLOAD VALIDATORS
// ============================================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_PDF_TYPES = ["application/pdf"];

/**
 * CV Upload validation schema
 * Validates PDF files with max 10MB size
 */
export const cvUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => ACCEPTED_PDF_TYPES.includes(file.type),
      "Le fichier doit etre un PDF"
    )
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "Le fichier ne doit pas depasser 10 Mo"
    ),
});

/**
 * Validate a file for CV upload
 * @param file - The file to validate
 * @returns Validation result with success boolean and optional error
 */
export function validateCVFile(file: File): { success: boolean; error?: string } {
  if (!ACCEPTED_PDF_TYPES.includes(file.type)) {
    return { success: false, error: "Seuls les fichiers PDF sont acceptes" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "Le fichier ne doit pas depasser 10 Mo" };
  }

  return { success: true };
}

// ============================================================================
// JOB OFFER VALIDATORS
// ============================================================================

/**
 * Job offer input validation
 * Ensures the job description has sufficient content
 */
export const jobOfferSchema = z.object({
  description: z
    .string()
    .min(100, "La description de l'offre doit contenir au moins 100 caracteres")
    .max(50000, "La description est trop longue (max 50000 caracteres)"),
  title: z.string().optional(),
  company: z.string().optional(),
});

// ============================================================================
// PROFILE VALIDATORS
// ============================================================================

/**
 * Profile name validation
 */
export const profileNameSchema = z
  .string()
  .min(1, "Le nom du profil est requis")
  .max(100, "Le nom du profil est trop long");

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

export const FILE_CONSTANTS = {
  MAX_FILE_SIZE,
  ACCEPTED_PDF_TYPES,
  MAX_FILE_SIZE_MB: 10,
} as const;
