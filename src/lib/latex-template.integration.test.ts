// ============================================
// ALIGN.AI - LaTeX Template Integration Tests
// Story 5.8: LaTeX Template Optimization
// Tests compilation with Latexia API
// ============================================

import {
  loadCVTemplate,
  fillTemplate,
  buildCVLatex,
  buildSkillsSection,
  buildExperienceSection,
  buildProjectsSection,
  buildEducationSection,
  buildLanguagesSection,
  buildWhyMeSection,
} from "./latex-template";
import type { CVData } from "./types";

// Mock CV data for testing
const mockCVData: CVData = {
  personalInfo: {
    fullName: "Jean Dupont",
    email: "jean.dupont@example.com",
    phone: "+33 6 12 34 56 78",
    location: "Paris, France",
    linkedinUrl: "https://linkedin.com/in/jeandupont",
    githubUrl: "https://github.com/jeandupont",
  },
  experiences: [
    {
      title: "Développeur Full Stack Senior",
      company: "Tech Solutions",
      location: "Paris, France",
      startDate: "2021",
      endDate: "2024",
      bullets: [
        "Développement d'applications React et Node.js avec TypeScript",
        "Architecture microservices avec Docker et Kubernetes",
        "Amélioration des performances et de la scalabilité",
      ],
    },
    {
      title: "Développeur Web",
      company: "Startup Innovation",
      location: "Lyon, France",
      startDate: "2019",
      endDate: "2021",
      bullets: [
        "Création de sites web avec Next.js et Tailwind CSS",
        "Intégration d'APIs REST et GraphQL",
      ],
    },
  ],
  education: [
    {
      degree: "Master en Informatique",
      school: "Université Paris-Saclay",
      location: "Paris, France",
      startDate: "2017",
      endDate: "2019",
    },
  ],
  projects: [
    {
      name: "AI Chat Platform",
      description: "Plateforme de chatbot utilisant GPT-4 et RAG",
      techStack: ["React", "Python", "FastAPI", "OpenAI"],
      year: "2023",
    },
    {
      name: "E-commerce Dashboard",
      description: "Dashboard analytics pour e-commerce avec temps réel",
      techStack: ["Next.js", "PostgreSQL", "Redis"],
      year: "2022",
    },
  ],
  skills: {
    languages: ["TypeScript", "Python", "JavaScript", "SQL"],
    frameworks: ["React", "Node.js", "Next.js", "FastAPI"],
    aiAndData: ["OpenAI API", "LangChain", "PostgreSQL"],
    toolsAndCloud: ["Docker", "Kubernetes", "AWS", "Git"],
    softSkills: ["Leadership", "Communication", "Agile"],
  },
  languages: [
    { language: "Français", level: "Natif" },
    { language: "Anglais", level: "Courant (C1)" },
  ],
};

const matchedSkills = ["React", "Node.js", "TypeScript", "Python", "Docker"];

describe("LaTeX Template Integration", () => {
  describe("loadCVTemplate", () => {
    it("should load the template file successfully", () => {
      const template = loadCVTemplate();
      expect(template).toBeDefined();
      expect(template.length).toBeGreaterThan(0);
      expect(template).toContain("\\documentclass");
      expect(template).toContain("{{NAME}}");
    });

    it("should contain required LaTeX packages", () => {
      const template = loadCVTemplate();
      expect(template).toContain("\\usepackage[utf8]{inputenc}");
      expect(template).toContain("\\usepackage{fontawesome5}");
      expect(template).toContain("\\usepackage{hyperref}");
      expect(template).toContain("\\usepackage{enumitem}");
      expect(template).toContain("\\usepackage{titlesec}");
    });

    it("should contain custom commands", () => {
      const template = loadCVTemplate();
      expect(template).toContain("\\newcommand{\\keyword}");
      expect(template).toContain("\\newcommand{\\jobheader}");
      expect(template).toContain("\\newcommand{\\projectheader}");
      expect(template).toContain("\\newcommand{\\educationheader}");
    });
  });

  describe("buildCVLatex", () => {
    it("should generate complete valid LaTeX document", () => {
      const whyMeContent = "3 ans d'expérience en développement full-stack avec \\keyword{React} et \\keyword{Node.js}.";
      const latex = buildCVLatex(mockCVData, whyMeContent, matchedSkills, { language: "fr" });

      // Should be valid LaTeX structure
      expect(latex).toContain("\\documentclass");
      expect(latex).toContain("\\begin{document}");
      expect(latex).toContain("\\end{document}");

      // Should contain candidate info
      expect(latex).toContain("Jean Dupont");
      expect(latex).toContain("jean.dupont@example.com");

      // Should contain sections
      expect(latex).toContain("\\section{Pourquoi Moi}");
      expect(latex).toContain("\\section{Compétences Techniques}");
      expect(latex).toContain("\\section{Expérience Professionnelle}");
      expect(latex).toContain("\\section{Projets}");
      expect(latex).toContain("\\section{Formation}");
      expect(latex).toContain("\\section{Langues}");
    });

    it("should highlight matched skills with keyword command", () => {
      const whyMeContent = "Expert in \\keyword{React}.";
      const latex = buildCVLatex(mockCVData, whyMeContent, matchedSkills, { language: "en" });

      // Skills should be keyword-highlighted
      expect(latex).toContain("\\keyword{React}");
      expect(latex).toContain("\\keyword{Node.js}");
      expect(latex).toContain("\\keyword{TypeScript}");
    });

    it("should use English headers when language is en", () => {
      const latex = buildCVLatex(mockCVData, "Test content", matchedSkills, { language: "en" });

      expect(latex).toContain("\\section{Why Me}");
      expect(latex).toContain("\\section{Technical Skills}");
      expect(latex).toContain("\\section{Professional Experience}");
      expect(latex).toContain("\\section{Projects}");
      expect(latex).toContain("\\section{Education}");
    });

    it("should limit experiences and projects when specified", () => {
      const latex = buildCVLatex(mockCVData, "Test", matchedSkills, {
        language: "fr",
        maxExperiences: 1,
        maxProjects: 1,
      });

      // Should only include first experience
      expect(latex).toContain("Tech Solutions");
      expect(latex).not.toContain("Startup Innovation");

      // Should only include first project
      expect(latex).toContain("AI Chat Platform");
      expect(latex).not.toContain("E-commerce Dashboard");
    });
  });

  describe("ATS Compatibility", () => {
    it("should use single-column layout (no multicols)", () => {
      const latex = buildCVLatex(mockCVData, "Test", matchedSkills, { language: "fr" });
      expect(latex).not.toContain("\\begin{multicols}");
      expect(latex).not.toContain("\\begin{minipage}");
    });

    it("should not use tables for main layout", () => {
      const latex = buildCVLatex(mockCVData, "Test", matchedSkills, { language: "fr" });
      // Allow tabular only for contact info, not for sections
      const sections = latex.split("\\section{");
      for (const section of sections.slice(1)) { // Skip preamble
        expect(section).not.toMatch(/\\begin\{tabular\}[\s\S]*\\jobheader/);
      }
    });

    it("should not use complex graphics", () => {
      const latex = buildCVLatex(mockCVData, "Test", matchedSkills, { language: "fr" });
      expect(latex).not.toContain("\\includegraphics");
      expect(latex).not.toContain("\\begin{tikzpicture}");
      expect(latex).not.toContain("\\progressbar");
    });

    it("should use standard fonts", () => {
      const template = loadCVTemplate();
      // Should not require exotic fonts
      expect(template).not.toContain("\\usepackage{fontspec}");
      expect(template).not.toContain("\\setmainfont");
    });
  });

  describe("Special Character Escaping", () => {
    it("should escape ampersand in company names", () => {
      const cvWithAmpersand: CVData = {
        ...mockCVData,
        experiences: [
          {
            ...mockCVData.experiences[0],
            company: "Research & Development Inc",
          },
        ],
      };

      const latex = buildCVLatex(cvWithAmpersand, "Test", [], { language: "en" });
      expect(latex).toContain("Research \\& Development Inc");
    });

    it("should escape percent in descriptions", () => {
      const cvWithPercent: CVData = {
        ...mockCVData,
        experiences: [
          {
            ...mockCVData.experiences[0],
            bullets: ["Improved performance by 50%"],
          },
        ],
      };

      const latex = buildCVLatex(cvWithPercent, "Test", [], { language: "en" });
      expect(latex).toContain("50\\%");
    });

    it("should escape hash and underscore", () => {
      const cvWithSpecialChars: CVData = {
        ...mockCVData,
        projects: [
          {
            name: "Project_Alpha #1",
            description: "Test project",
            techStack: ["C#", "F#"],
            year: "2023",
          },
        ],
      };

      const latex = buildCVLatex(cvWithSpecialChars, "Test", [], { language: "en" });
      expect(latex).toContain("Project\\_Alpha \\#1");
      expect(latex).toContain("C\\#");
    });
  });

  describe("Empty Data Handling", () => {
    it("should handle empty projects gracefully", () => {
      const cvNoProjects: CVData = {
        ...mockCVData,
        projects: [],
      };

      const latex = buildCVLatex(cvNoProjects, "Test", matchedSkills, { language: "fr" });
      expect(latex).toContain("\\begin{document}");
      expect(latex).toContain("\\end{document}");
      // Projects section should not appear
      expect(latex).not.toContain("\\section{Projets}");
    });

    it("should handle empty languages gracefully", () => {
      const cvNoLanguages: CVData = {
        ...mockCVData,
        languages: [],
      };

      const latex = buildCVLatex(cvNoLanguages, "Test", matchedSkills, { language: "fr" });
      expect(latex).toContain("\\begin{document}");
      // Languages section should not appear
      expect(latex).not.toContain("\\section{Langues}");
    });

    it("should handle minimal CV data", () => {
      const minimalCV: CVData = {
        personalInfo: {
          fullName: "Test User",
          email: "test@example.com",
          phone: "",
          location: "",
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

      const latex = buildCVLatex(minimalCV, "", [], { language: "en" });
      expect(latex).toContain("\\begin{document}");
      expect(latex).toContain("Test User");
      expect(latex).toContain("\\end{document}");
    });
  });
});
