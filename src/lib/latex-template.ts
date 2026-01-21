// ============================================
// ALIGN.AI - LaTeX Template System v1.0
// Story 5.8: LaTeX Template Optimization
// ATS-Friendly, Minimalist, Single-Column
// ============================================

import { readFileSync } from "fs";
import { join } from "path";
import type {
  CVData,
  Experience,
  Project,
  Education,
  SupportedLanguage,
  DynamicSkillCategory,
} from "./types";

// ==================== TYPES ====================

export interface CVSections {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  whyMe: string;      // LaTeX content
  skills: string;     // LaTeX content
  experience: string; // LaTeX content
  projects: string;   // LaTeX content
  education: string;  // LaTeX content
  languages?: string; // LaTeX content
}

export interface TemplateOptions {
  language?: SupportedLanguage;
  includeWhyMe?: boolean;
  maxExperiences?: number;
  maxProjects?: number;
}

// ==================== CONSTANTS ====================

const TEMPLATE_PATH = join(process.cwd(), "src/lib/templates/cv-template.tex");

// Section headers by language
const SECTION_HEADERS = {
  fr: {
    whyMe: "Pourquoi Moi",
    skills: "Compétences Techniques",
    experience: "Expérience Professionnelle",
    projects: "Projets",
    education: "Formation",
    languages: "Langues",
  },
  en: {
    whyMe: "Why Me",
    skills: "Technical Skills",
    experience: "Professional Experience",
    projects: "Projects",
    education: "Education",
    languages: "Languages",
  },
};

// ==================== LATEX ESCAPING ====================

/**
 * Escape special LaTeX characters to prevent compilation errors
 */
export function escapeLatex(text: string): string {
  if (!text) return "";

  return text
    // Order matters: backslash must be first
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/</g, "\\textless{}")
    .replace(/>/g, "\\textgreater{}")
    // Handle smart quotes
    .replace(/"/g, "''")
    .replace(/"/g, "``")
    .replace(/'/g, "'")
    .replace(/'/g, "`");
}

/**
 * Escape text but preserve LaTeX commands (like \keyword{})
 * This is used for content that may already contain LaTeX formatting
 */
export function escapeLatexPreserveCommands(text: string): string {
  if (!text) return "";

  // Split by LaTeX commands, escape the text parts, rejoin
  const commandPattern = /(\\(?:keyword|textbf|textit|emph)\{[^}]*\})/g;
  const parts = text.split(commandPattern);

  return parts.map((part, index) => {
    // Odd indices are the commands (captured groups)
    if (index % 2 === 1) return part;
    // Even indices are regular text - escape them
    return escapeLatex(part);
  }).join("");
}

// ==================== TEMPLATE LOADING ====================

/**
 * Load the CV template from file
 */
export function loadCVTemplate(): string {
  try {
    return readFileSync(TEMPLATE_PATH, "utf-8");
  } catch (error) {
    console.error("Failed to load CV template:", error);
    throw new Error("CV template file not found");
  }
}

// ==================== CONTACT LINE BUILDER ====================

/**
 * Build the contact line with FontAwesome icons
 */
function buildContactLine(sections: CVSections): string {
  const parts: string[] = [];

  if (sections.email) {
    parts.push(`\\faEnvelope\\ ${escapeLatex(sections.email)}`);
  }
  if (sections.phone) {
    parts.push(`\\faPhone\\ ${escapeLatex(sections.phone)}`);
  }
  if (sections.location) {
    parts.push(`\\faMapMarker*\\ ${escapeLatex(sections.location)}`);
  }
  if (sections.linkedin) {
    const linkedinDisplay = sections.linkedin
      .replace("https://www.", "")
      .replace("https://", "")
      .replace("linkedin.com/in/", "");
    parts.push(`\\faLinkedin\\ \\href{${sections.linkedin}}{${escapeLatex(linkedinDisplay)}}`);
  }
  if (sections.github) {
    const githubDisplay = sections.github
      .replace("https://", "")
      .replace("github.com/", "");
    parts.push(`\\faGithub\\ \\href{${sections.github}}{${escapeLatex(githubDisplay)}}`);
  }
  if (sections.portfolio) {
    const portfolioDisplay = sections.portfolio
      .replace("https://", "")
      .replace("http://", "");
    parts.push(`\\faGlobe\\ \\href{${sections.portfolio}}{${escapeLatex(portfolioDisplay)}}`);
  }

  // Join with separators, max 3 per line for readability
  if (parts.length <= 3) {
    return parts.join(" \\quad ");
  }

  // Split into two lines if more than 3 items
  const firstLine = parts.slice(0, 3).join(" \\quad ");
  const secondLine = parts.slice(3).join(" \\quad ");
  return `${firstLine}\\\\[4pt]\n  ${secondLine}`;
}

// ==================== TEMPLATE FILLING ====================

/**
 * Fill the template with CV sections
 */
export function fillTemplate(
  template: string,
  sections: CVSections,
  _options: TemplateOptions = {}
): string {
  let result = template;

  // Replace name
  result = result.replace("{{NAME}}", escapeLatex(sections.name));

  // Replace contact line
  const contactLine = buildContactLine(sections);
  result = result.replace("{{CONTACT_LINE}}", contactLine);

  // Replace section content (already formatted as LaTeX)
  result = result.replace("{{WHY_ME_SECTION}}", sections.whyMe || "");
  result = result.replace("{{SKILLS_SECTION}}", sections.skills || "");
  result = result.replace("{{EXPERIENCE_SECTION}}", sections.experience || "");
  result = result.replace("{{PROJECTS_SECTION}}", sections.projects || "");
  result = result.replace("{{EDUCATION_SECTION}}", sections.education || "");
  result = result.replace("{{LANGUAGES_SECTION}}", sections.languages || "");

  return result;
}

// ==================== SECTION BUILDERS ====================

/**
 * Build the "Why Me" section LaTeX
 */
export function buildWhyMeSection(
  content: string,
  language: SupportedLanguage = "fr"
): string {
  const header = SECTION_HEADERS[language].whyMe;

  if (!content) return "";

  return `\\section{${header}}
${escapeLatexPreserveCommands(content)}

`;
}

/**
 * Build the skills section LaTeX
 * Uses ALL user skills, with matched skills prioritized first and highlighted
 */
export function buildSkillsSection(
  skillsByCategory: Record<string, string[]>,
  matchedSkills: string[],
  language: SupportedLanguage = "fr"
): string {
  const header = SECTION_HEADERS[language].skills;
  const matchedSet = new Set(matchedSkills.map(s => s.toLowerCase()));

  // Helper to check if a skill matches
  const isSkillMatched = (skill: string): boolean => {
    const skillLower = skill.toLowerCase();
    return matchedSet.has(skillLower) ||
      matchedSkills.some(m => skillLower.includes(m.toLowerCase()) || m.toLowerCase().includes(skillLower));
  };

  const lines: string[] = [`\\section{${header}}`];
  lines.push("\\begin{itemize}[leftmargin=*, itemsep=1pt, parsep=0pt]");

  for (const [category, skills] of Object.entries(skillsByCategory)) {
    if (skills.length === 0) continue;

    // Sort skills: matched ones first, then others
    const sortedSkills = [...skills].sort((a, b) => {
      const aMatched = isSkillMatched(a);
      const bMatched = isSkillMatched(b);
      if (aMatched && !bMatched) return -1;
      if (!aMatched && bMatched) return 1;
      return 0;
    });

    const formattedSkills = sortedSkills.map(skill => {
      const isMatched = isSkillMatched(skill);
      return isMatched ? `\\keyword{${escapeLatex(skill)}}` : escapeLatex(skill);
    }).join(", ");

    lines.push(`  \\item \\textbf{${escapeLatex(category)}:} ${formattedSkills}`);
  }

  lines.push("\\end{itemize}");
  lines.push("");

  return lines.join("\n");
}

/**
 * Build dynamic skills section for non-developer profiles (Feature 2)
 * Uses the dynamicCategories from CV extraction
 * Matched skills are prioritized first and highlighted
 */
export function buildDynamicSkillsSection(
  dynamicCategories: DynamicSkillCategory[],
  matchedSkills: string[],
  language: SupportedLanguage = "fr"
): string {
  const header = SECTION_HEADERS[language].skills;
  const matchedSet = new Set(matchedSkills.map(s => s.toLowerCase()));

  // Helper to check if a skill matches
  const isSkillMatched = (skill: string): boolean => {
    const skillLower = skill.toLowerCase();
    return matchedSet.has(skillLower) ||
      matchedSkills.some(m => skillLower.includes(m.toLowerCase()) || m.toLowerCase().includes(skillLower));
  };

  const lines: string[] = [`\\section{${header}}`];
  lines.push("\\begin{itemize}[leftmargin=*, itemsep=1pt, parsep=0pt]");

  // Sort by priority
  const sortedCategories = [...dynamicCategories].sort((a, b) => a.priority - b.priority);

  for (const category of sortedCategories) {
    if (!category.skills || category.skills.length === 0) continue;

    const categoryName = language === "fr" ? category.name : category.nameEn;

    // Sort skills: matched ones first
    const sortedSkills = [...category.skills].sort((a, b) => {
      const aMatched = isSkillMatched(a);
      const bMatched = isSkillMatched(b);
      if (aMatched && !bMatched) return -1;
      if (!aMatched && bMatched) return 1;
      return 0;
    });

    const formattedSkills = sortedSkills.map(skill => {
      const isMatched = isSkillMatched(skill);
      return isMatched ? `\\keyword{${escapeLatex(skill)}}` : escapeLatex(skill);
    }).join(", ");

    lines.push(`  \\item \\textbf{${escapeLatex(categoryName)}:} ${formattedSkills}`);
  }

  lines.push("\\end{itemize}");
  lines.push("");

  return lines.join("\n");
}

/**
 * Build experience section LaTeX
 */
export function buildExperienceSection(
  experiences: Experience[],
  matchedSkills: string[],
  language: SupportedLanguage = "fr",
  maxItems: number = 4
): string {
  const header = SECTION_HEADERS[language].experience;

  if (experiences.length === 0) return "";

  const lines: string[] = [`\\section{${header}}`];
  const matchedSet = new Set(matchedSkills.map(s => s.toLowerCase()));

  // Limit to maxItems most recent/relevant
  const limitedExperiences = experiences.slice(0, maxItems);

  for (const exp of limitedExperiences) {
    // Format dates
    const dateRange = `${exp.startDate} -- ${exp.endDate || (language === "fr" ? "Présent" : "Present")}`;

    lines.push(`\\jobheader{${escapeLatex(exp.title)}}{${dateRange}}{${escapeLatex(exp.company)}}{${escapeLatex(exp.location)}}`);

    if (exp.bullets && exp.bullets.length > 0) {
      lines.push("\\begin{itemize}[leftmargin=*, itemsep=1pt, parsep=0pt]");

      for (const bullet of exp.bullets.slice(0, 4)) { // Max 4 bullets per experience
        // Highlight matched skills in bullets
        let processedBullet = bullet;
        for (const skill of matchedSkills) {
          // Escape special regex characters (e.g., C++, C#, .NET)
          const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          try {
            const regex = new RegExp(`\\b(${escapedSkill})\\b`, "gi");
            processedBullet = processedBullet.replace(regex, "\\keyword{$1}");
          } catch {
            // If regex fails, skip this skill
          }
        }
        lines.push(`  \\item ${escapeLatexPreserveCommands(processedBullet)}`);
      }

      lines.push("\\end{itemize}");
    }

    lines.push("\\vspace{6pt}");
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Build projects section LaTeX
 */
export function buildProjectsSection(
  projects: Project[],
  matchedSkills: string[],
  language: SupportedLanguage = "fr",
  maxItems: number = 3
): string {
  const header = SECTION_HEADERS[language].projects;

  if (projects.length === 0) return "";

  const lines: string[] = [`\\section{${header}}`];
  const matchedSet = new Set(matchedSkills.map(s => s.toLowerCase()));

  // Limit to maxItems
  const limitedProjects = projects.slice(0, maxItems);

  for (const project of limitedProjects) {
    // Format tech stack with keyword highlighting
    const techList = project.techStack.map(tech => {
      const isMatched = matchedSet.has(tech.toLowerCase()) ||
        matchedSkills.some(m => tech.toLowerCase().includes(m.toLowerCase()));
      return isMatched ? `\\keyword{${escapeLatex(tech)}}` : escapeLatex(tech);
    }).join(", ");

    lines.push(`\\projectheader{${escapeLatex(project.name)}}{${techList}}{${escapeLatex(project.year || "")}}`);

    if (project.description) {
      lines.push(`{\\small ${escapeLatexPreserveCommands(project.description)}}`);
    }

    lines.push("\\vspace{6pt}");
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Build education section LaTeX
 */
export function buildEducationSection(
  education: Education[],
  language: SupportedLanguage = "fr"
): string {
  const header = SECTION_HEADERS[language].education;

  if (education.length === 0) return "";

  const lines: string[] = [`\\section{${header}}`];

  for (const edu of education) {
    const dateRange = `${edu.startDate} -- ${edu.endDate || (language === "fr" ? "Présent" : "Present")}`;
    lines.push(`\\educationheader{${escapeLatex(edu.degree)}}{${escapeLatex(edu.school)}}{${dateRange}}`);

    if (edu.location) {
      lines.push(`{\\small ${escapeLatex(edu.location)}}`);
    }

    lines.push("\\vspace{6pt}");
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Build languages section LaTeX
 */
export function buildLanguagesSection(
  languages: { language: string; level: string }[],
  language: SupportedLanguage = "fr"
): string {
  const header = SECTION_HEADERS[language].languages;

  if (!languages || languages.length === 0) return "";

  const lines: string[] = [`\\section{${header}}`];

  const langPairs = languages.map(l =>
    `\\textbf{${escapeLatex(l.language)}:} ${escapeLatex(l.level)}`
  ).join(" \\quad ");

  lines.push(langPairs);
  lines.push("");

  return lines.join("\n");
}

// ==================== MAIN BUILDER ====================

/**
 * Build complete CV LaTeX from CVData and analysis results
 * Supports dynamic skill categories for non-developer profiles (Feature 2)
 */
export function buildCVLatex(
  cvData: CVData,
  whyMeContent: string,
  matchedSkills: string[],
  options: TemplateOptions = {}
): string {
  const { language = "fr", maxExperiences = 4, maxProjects = 3 } = options;

  // Determine skill section based on profile type
  let skillsContent: string;
  const profileType = cvData.profileType || "developer";

  // Use dynamic categories if available and profile is non-developer
  if (profileType !== "developer" && cvData.skills.dynamicCategories?.length) {
    skillsContent = buildDynamicSkillsSection(
      cvData.skills.dynamicCategories,
      matchedSkills,
      language
    );
  } else {
    // Default developer-oriented skill categories
    const skillsByCategory: Record<string, string[]> = {};

    if (cvData.skills.languages?.length) {
      skillsByCategory[language === "fr" ? "Langages" : "Languages"] = cvData.skills.languages;
    }
    if (cvData.skills.frameworks?.length) {
      skillsByCategory["Frameworks"] = cvData.skills.frameworks;
    }
    if (cvData.skills.aiAndData?.length) {
      skillsByCategory[language === "fr" ? "IA & Data" : "AI & Data"] = cvData.skills.aiAndData;
    }
    if (cvData.skills.toolsAndCloud?.length) {
      skillsByCategory[language === "fr" ? "Outils & Cloud" : "Tools & Cloud"] = cvData.skills.toolsAndCloud;
    }
    if (cvData.skills.softSkills?.length) {
      skillsByCategory[language === "fr" ? "Soft Skills" : "Soft Skills"] = cvData.skills.softSkills;
    }

    skillsContent = buildSkillsSection(skillsByCategory, matchedSkills, language);
  }

  // Determine max projects (Feature 2: minimum 3 if user has them)
  const actualMaxProjects = Math.max(
    maxProjects,
    Math.min(cvData.projects?.length || 0, 3)
  );

  // Build sections
  const sections: CVSections = {
    name: cvData.personalInfo.fullName,
    email: cvData.personalInfo.email,
    phone: cvData.personalInfo.phone,
    location: cvData.personalInfo.location,
    linkedin: cvData.personalInfo.linkedinUrl,
    github: cvData.personalInfo.githubUrl,
    portfolio: cvData.personalInfo.portfolioUrl,
    whyMe: buildWhyMeSection(whyMeContent, language),
    skills: skillsContent,
    experience: buildExperienceSection(cvData.experiences, matchedSkills, language, maxExperiences),
    projects: buildProjectsSection(cvData.projects, matchedSkills, language, actualMaxProjects),
    education: buildEducationSection(cvData.education, language),
    languages: buildLanguagesSection(cvData.languages, language),
  };

  // Load template and fill
  const template = loadCVTemplate();
  return fillTemplate(template, sections, options);
}

// ==================== EXPORTS ====================

export {
  SECTION_HEADERS,
};
