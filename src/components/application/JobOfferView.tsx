"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, AlignLeft, LayoutList } from "lucide-react";

interface JobOfferViewProps {
  title: string | null;
  company: string | null;
  description: string;
  gaps: { skill: string; severity: string }[];
}

// Escape special regex characters
const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Parse job description into sections for structured view
interface Section {
  title: string;
  content: string;
}

const parseJobOffer = (description: string): Section[] => {
  const sections: Section[] = [];

  // Common section header patterns (French and English)
  const sectionPatterns = [
    /(?:^|\n)#{1,3}\s*(.*?)(?:\n|$)/gm, // Markdown headers
    /(?:^|\n)([A-Z][A-Za-zÀ-ÿ\s]+)\s*[:]\s*(?:\n|$)/gm, // "Title:" format
    /(?:^|\n)(Responsabilités|Responsibilities|Missions|Profil|Profile|Exigences|Requirements|Qualifications|Compétences|Skills|Avantages|Benefits|À propos|About|Description|Votre mission|Vos missions|Nous offrons|Ce que nous offrons|What we offer)\s*[:]*\s*(?:\n|$)/gim,
  ];

  // Try to split by common patterns
  let foundSections = false;

  // First try markdown-style headers
  const headerMatches = description.match(/(?:^|\n)#{1,3}\s*.+/gm);
  if (headerMatches && headerMatches.length >= 2) {
    const parts = description.split(/(?=\n#{1,3}\s+)/);
    parts.forEach((part) => {
      const headerMatch = part.match(/^[\n]*#{1,3}\s*(.+)/);
      if (headerMatch) {
        const title = headerMatch[1].trim();
        const content = part.replace(/^[\n]*#{1,3}\s*.+\n?/, "").trim();
        if (content) {
          sections.push({ title, content });
        }
      } else if (part.trim() && sections.length === 0) {
        sections.push({ title: "Description", content: part.trim() });
      }
    });
    foundSections = sections.length >= 2;
  }

  // Try "Title:" format if markdown didn't work
  if (!foundSections) {
    const titleColonPattern = /(?:^|\n)([A-ZÀ-Ÿ][A-Za-zÀ-ÿ\s]{2,30})\s*:\s*\n/g;
    const matches = [...description.matchAll(titleColonPattern)];
    if (matches.length >= 2) {
      let lastIndex = 0;
      matches.forEach((match, idx) => {
        const matchStart = match.index!;
        // Add content before this header (if any)
        if (idx === 0 && matchStart > 0) {
          const intro = description.slice(0, matchStart).trim();
          if (intro) {
            sections.push({ title: "Introduction", content: intro });
          }
        }
        // Find content until next header or end
        const nextMatch = matches[idx + 1];
        const contentEnd = nextMatch ? nextMatch.index! : description.length;
        const content = description.slice(matchStart + match[0].length, contentEnd).trim();
        if (content) {
          sections.push({ title: match[1].trim(), content });
        }
        lastIndex = contentEnd;
      });
      foundSections = sections.length >= 2;
    }
  }

  // If no structured format found, return single section
  if (!foundSections) {
    // Try to at least split by double newlines into paragraphs
    const paragraphs = description.split(/\n\n+/).filter((p) => p.trim());
    if (paragraphs.length > 1) {
      // First paragraph is usually the intro/description
      sections.push({ title: "Description du poste", content: paragraphs[0].trim() });
      // Rest combined as "Details"
      sections.push({ title: "Détails", content: paragraphs.slice(1).join("\n\n").trim() });
    } else {
      sections.push({ title: "Description complète", content: description.trim() });
    }
  }

  return sections;
};

export function JobOfferView({ title, company, description, gaps }: JobOfferViewProps) {
  const [viewMode, setViewMode] = useState<"full" | "structured">("full");

  // Memoize sections parsing
  const sections = useMemo(() => parseJobOffer(description), [description]);

  // Highlight function - wraps matched skills in mark tags with appropriate styling
  const highlightText = useMemo(() => {
    return (text: string): string => {
      if (!gaps || gaps.length === 0) return text;

      let result = text;

      // Sort gaps by skill length (longest first) to avoid partial matches
      const sortedGaps = [...gaps].sort((a, b) => b.skill.length - a.skill.length);

      sortedGaps.forEach((gap) => {
        // Create regex for word boundary matching (case insensitive)
        const regex = new RegExp(`\\b(${escapeRegex(gap.skill)})\\b`, "gi");

        // Determine color based on severity
        let className: string;
        switch (gap.severity) {
          case "critical":
            className = "job-highlight-critical";
            break;
          case "moderate":
            className = "job-highlight-moderate";
            break;
          default:
            className = "job-highlight-minor";
        }

        result = result.replace(regex, `<mark class="${className}">$1</mark>`);
      });

      return result;
    };
  }, [gaps]);

  return (
    <div className="space-y-4">
      {/* Header with title and company */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          {title && <h3 className="text-lg font-semibold text-white truncate">{title}</h3>}
          {company && (
            <p className="text-sm text-white/60 flex items-center gap-1.5 mt-1">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{company}</span>
            </p>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setViewMode("full")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === "full"
                ? "bg-indigo-500/20 text-indigo-400"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <AlignLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Texte complet</span>
          </button>
          <button
            onClick={() => setViewMode("structured")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === "structured"
                ? "bg-indigo-500/20 text-indigo-400"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <LayoutList className="h-4 w-4" />
            <span className="hidden sm:inline">Vue structurée</span>
          </button>
        </div>
      </div>

      {/* Gap skills legend */}
      {gaps && gaps.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
          <span>Légende :</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50" />
            Critique
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50" />
            Modéré
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-zinc-500/30 border border-zinc-500/50" />
            Mineur
          </span>
        </div>
      )}

      {/* Content with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="max-h-[60vh] overflow-y-auto rounded-lg bg-white/5 border border-white/10 p-4"
        >
          {viewMode === "full" ? (
            <div
              className="job-offer-text whitespace-pre-wrap text-white/80 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightText(description) }}
            />
          ) : (
            <div className="space-y-6">
              {sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <h4 className="text-sm font-semibold text-indigo-400 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {section.title}
                  </h4>
                  <div
                    className="job-offer-text whitespace-pre-wrap text-white/80 text-sm leading-relaxed pl-3 border-l border-white/10"
                    dangerouslySetInnerHTML={{ __html: highlightText(section.content) }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CSS for highlighting - using Tailwind classes via style tag */}
      <style jsx global>{`
        .job-highlight-critical {
          background-color: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 0 0.25rem;
          border-radius: 0.25rem;
          font-weight: 500;
        }
        .job-highlight-moderate {
          background-color: rgba(245, 158, 11, 0.2);
          color: #fcd34d;
          padding: 0 0.25rem;
          border-radius: 0.25rem;
          font-weight: 500;
        }
        .job-highlight-minor {
          background-color: rgba(113, 113, 122, 0.2);
          color: #a1a1aa;
          padding: 0 0.25rem;
          border-radius: 0.25rem;
          font-weight: 500;
        }
        .job-offer-text mark {
          display: inline;
        }
      `}</style>
    </div>
  );
}
