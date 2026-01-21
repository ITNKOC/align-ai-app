"use client";

// ============================================
// ALIGN.AI - Language Selector Component
// Story 5.7: Multilingual CV Generation
// ============================================

import { useState } from "react";
import { motion } from "framer-motion";
import { Languages, Check, AlertCircle } from "lucide-react";
import type { SupportedLanguage, LanguageDetectionResult } from "@/lib/types";

interface LanguageSelectorProps {
  detectionResult: LanguageDetectionResult;
  onLanguageSelect: (language: SupportedLanguage) => void;
  className?: string;
}

const LANGUAGE_OPTIONS: Record<SupportedLanguage, { label: string; flag: string }> = {
  fr: { label: "Francais", flag: "FR" },
  en: { label: "English", flag: "EN" },
};

// Confidence threshold for showing warning
const CONFIDENCE_THRESHOLD = 0.7;

export function LanguageSelector({
  detectionResult,
  onLanguageSelect,
  className = "",
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    detectionResult.language
  );

  const isLowConfidence = detectionResult.confidence < CONFIDENCE_THRESHOLD;

  const handleSelect = (language: SupportedLanguage) => {
    setSelectedLanguage(language);
    onLanguageSelect(language);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Languages className="w-4 h-4" />
        <span>Langue du document</span>
        {isLowConfidence && (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
            <AlertCircle className="w-3 h-3" />
            Detection incertaine
          </span>
        )}
      </div>

      {/* Language buttons */}
      <div className="flex gap-2">
        {(Object.entries(LANGUAGE_OPTIONS) as [SupportedLanguage, { label: string; flag: string }][]).map(
          ([lang, { label, flag }]) => {
            const isSelected = selectedLanguage === lang;
            const isDetected = detectionResult.language === lang;

            return (
              <motion.button
                key={lang}
                onClick={() => handleSelect(lang)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
                  ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }
                `}
              >
                {/* Flag */}
                <span className="font-mono text-xs font-bold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  {flag}
                </span>

                {/* Label */}
                <span className="font-medium">{label}</span>

                {/* Selected indicator */}
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-indigo-500"
                  >
                    <Check className="w-4 h-4" />
                  </motion.span>
                )}

                {/* Auto-detected badge */}
                {isDetected && !isSelected && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    (detecte)
                  </span>
                )}
              </motion.button>
            );
          }
        )}
      </div>

      {/* Confidence indicator */}
      <div className="text-xs text-gray-500 dark:text-gray-500">
        {isLowConfidence ? (
          <span>
            La langue detectee ({LANGUAGE_OPTIONS[detectionResult.language].label})
            a une confiance de {Math.round(detectionResult.confidence * 100)}%.
            Vous pouvez changer si necessaire.
          </span>
        ) : (
          <span>
            Detecte automatiquement: {LANGUAGE_OPTIONS[detectionResult.language].label}
            ({Math.round(detectionResult.confidence * 100)}% confiance)
          </span>
        )}
      </div>
    </div>
  );
}

// Simplified badge for inline display
export function LanguageBadge({
  language,
  confidence,
  showConfidence = false,
}: {
  language: SupportedLanguage;
  confidence?: number;
  showConfidence?: boolean;
}) {
  const isLowConfidence = confidence !== undefined && confidence < CONFIDENCE_THRESHOLD;
  const { label, flag } = LANGUAGE_OPTIONS[language];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
        ${
          isLowConfidence
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
        }
      `}
    >
      <span className="font-mono font-bold">{flag}</span>
      <span>{label}</span>
      {showConfidence && confidence !== undefined && (
        <span className="opacity-70">({Math.round(confidence * 100)}%)</span>
      )}
      {isLowConfidence && <AlertCircle className="w-3 h-3" />}
    </span>
  );
}
