// ============================================
// ALIGN.AI - LaTeX Template Tests
// Story 5.8: LaTeX Template Optimization
// ============================================

import {
  escapeLatex,
  escapeLatexPreserveCommands,
  buildSkillsSection,
  buildExperienceSection,
  buildProjectsSection,
  buildEducationSection,
  buildLanguagesSection,
  buildWhyMeSection,
  fillTemplate,
} from "./latex-template";

describe("escapeLatex", () => {
  it("should escape ampersand", () => {
    expect(escapeLatex("R&D")).toBe("R\\&D");
  });

  it("should escape percent", () => {
    expect(escapeLatex("100% sure")).toBe("100\\% sure");
  });

  it("should escape dollar sign", () => {
    expect(escapeLatex("$100")).toBe("\\$100");
  });

  it("should escape hash", () => {
    expect(escapeLatex("C#")).toBe("C\\#");
  });

  it("should escape underscore", () => {
    expect(escapeLatex("file_name")).toBe("file\\_name");
  });

  it("should escape curly braces", () => {
    expect(escapeLatex("{test}")).toBe("\\{test\\}");
  });

  it("should handle multiple special characters", () => {
    expect(escapeLatex("100% of R&D")).toBe("100\\% of R\\&D");
  });

  it("should handle empty string", () => {
    expect(escapeLatex("")).toBe("");
  });

  it("should handle null/undefined", () => {
    expect(escapeLatex(null as unknown as string)).toBe("");
    expect(escapeLatex(undefined as unknown as string)).toBe("");
  });
});

describe("escapeLatexPreserveCommands", () => {
  it("should preserve keyword commands", () => {
    const input = "Expert in \\keyword{React} and \\keyword{Node.js}";
    const result = escapeLatexPreserveCommands(input);
    expect(result).toContain("\\keyword{React}");
    expect(result).toContain("\\keyword{Node.js}");
  });

  it("should escape text outside commands", () => {
    const input = "100% expert in \\keyword{R&D}";
    const result = escapeLatexPreserveCommands(input);
    expect(result).toContain("100\\%");
    expect(result).toContain("\\keyword{R&D}"); // Command content preserved
  });

  it("should handle text without commands", () => {
    const input = "Simple text with & special % chars";
    const result = escapeLatexPreserveCommands(input);
    expect(result).toBe("Simple text with \\& special \\% chars");
  });

  it("should preserve textbf commands", () => {
    const input = "Use \\textbf{bold} text";
    const result = escapeLatexPreserveCommands(input);
    expect(result).toContain("\\textbf{bold}");
  });
});

describe("buildSkillsSection", () => {
  it("should build skills section with matched skills highlighted", () => {
    const skills = {
      Languages: ["JavaScript", "Python", "Rust"],
      Frameworks: ["React", "Node.js", "FastAPI"],
    };
    const matched = ["React", "Python"];

    const result = buildSkillsSection(skills, matched, "en");

    expect(result).toContain("\\section{Technical Skills}");
    expect(result).toContain("\\keyword{React}");
    expect(result).toContain("\\keyword{Python}");
    expect(result).toContain("JavaScript"); // Not keyword-wrapped
    expect(result).toContain("\\begin{itemize}");
    expect(result).toContain("\\end{itemize}");
  });

  it("should use French headers when language is fr", () => {
    const skills = { Langages: ["JavaScript"] };
    const result = buildSkillsSection(skills, [], "fr");
    expect(result).toContain("\\section{Compétences Techniques}");
  });

  it("should skip empty categories", () => {
    const skills = {
      Languages: ["JavaScript"],
      Empty: [],
    };
    const result = buildSkillsSection(skills, [], "en");
    expect(result).not.toContain("\\textbf{Empty}");
  });
});

describe("buildExperienceSection", () => {
  const experiences = [
    {
      title: "Senior Developer",
      company: "Tech Corp",
      location: "Paris, France",
      startDate: "2020",
      endDate: "2023",
      bullets: ["Developed React applications", "Led team of 5 developers"],
    },
    {
      title: "Junior Developer",
      company: "Startup Inc",
      location: "Lyon, France",
      startDate: "2018",
      endDate: "2020",
      bullets: ["Built APIs with Node.js"],
    },
  ];

  it("should build experience section with jobheader command", () => {
    const result = buildExperienceSection(experiences, ["React"], "en");

    expect(result).toContain("\\section{Professional Experience}");
    expect(result).toContain("\\jobheader{Senior Developer}");
    expect(result).toContain("Tech Corp");
    expect(result).toContain("2020 -- 2023");
  });

  it("should highlight matched skills in bullets", () => {
    const result = buildExperienceSection(experiences, ["React"], "en");
    expect(result).toContain("\\keyword{React}");
  });

  it("should limit experiences to maxItems", () => {
    const result = buildExperienceSection(experiences, [], "en", 1);
    expect(result).toContain("Senior Developer");
    expect(result).not.toContain("Junior Developer");
  });

  it("should use Present for current position", () => {
    const current = [
      {
        title: "Developer",
        company: "Current Co",
        location: "Paris",
        startDate: "2023",
        endDate: "", // Current position
        bullets: [],
      },
    ];
    const resultFr = buildExperienceSection(current, [], "fr");
    expect(resultFr).toContain("Présent");

    const resultEn = buildExperienceSection(current, [], "en");
    expect(resultEn).toContain("Present");
  });

  it("should return empty string for no experiences", () => {
    const result = buildExperienceSection([], [], "en");
    expect(result).toBe("");
  });
});

describe("buildProjectsSection", () => {
  const projects = [
    {
      name: "AI Chat App",
      description: "A chatbot using LLM technology",
      techStack: ["React", "Python", "OpenAI"],
      year: "2023",
    },
    {
      name: "E-commerce Platform",
      description: "Full-stack e-commerce solution",
      techStack: ["Next.js", "PostgreSQL"],
      year: "2022",
    },
  ];

  it("should build projects section with projectheader command", () => {
    const result = buildProjectsSection(projects, ["React"], "en");

    expect(result).toContain("\\section{Projects}");
    expect(result).toContain("\\projectheader{AI Chat App}");
    expect(result).toContain("\\keyword{React}");
    expect(result).toContain("2023");
  });

  it("should highlight matched technologies", () => {
    const result = buildProjectsSection(projects, ["React", "Python"], "en");
    expect(result).toContain("\\keyword{React}");
    expect(result).toContain("\\keyword{Python}");
    expect(result).not.toContain("\\keyword{OpenAI}");
  });

  it("should limit projects to maxItems", () => {
    const result = buildProjectsSection(projects, [], "en", 1);
    expect(result).toContain("AI Chat App");
    expect(result).not.toContain("E-commerce Platform");
  });

  it("should return empty string for no projects", () => {
    const result = buildProjectsSection([], [], "en");
    expect(result).toBe("");
  });
});

describe("buildEducationSection", () => {
  const education = [
    {
      degree: "Master in Computer Science",
      school: "University of Paris",
      location: "Paris, France",
      startDate: "2016",
      endDate: "2018",
    },
  ];

  it("should build education section with educationheader command", () => {
    const result = buildEducationSection(education, "en");

    expect(result).toContain("\\section{Education}");
    expect(result).toContain("\\educationheader{Master in Computer Science}");
    expect(result).toContain("University of Paris");
    expect(result).toContain("2016 -- 2018");
  });

  it("should use French headers when language is fr", () => {
    const result = buildEducationSection(education, "fr");
    expect(result).toContain("\\section{Formation}");
  });

  it("should return empty string for no education", () => {
    const result = buildEducationSection([], "en");
    expect(result).toBe("");
  });
});

describe("buildLanguagesSection", () => {
  const languages = [
    { language: "French", level: "Native" },
    { language: "English", level: "Fluent" },
    { language: "Spanish", level: "Intermediate" },
  ];

  it("should build languages section", () => {
    const result = buildLanguagesSection(languages, "en");

    expect(result).toContain("\\section{Languages}");
    expect(result).toContain("\\textbf{French:}");
    expect(result).toContain("Native");
    expect(result).toContain("\\quad"); // Separator
  });

  it("should use French headers when language is fr", () => {
    const result = buildLanguagesSection(languages, "fr");
    expect(result).toContain("\\section{Langues}");
  });

  it("should return empty string for no languages", () => {
    const result = buildLanguagesSection([], "en");
    expect(result).toBe("");
  });

  it("should handle undefined languages", () => {
    const result = buildLanguagesSection(undefined as any, "en");
    expect(result).toBe("");
  });
});

describe("buildWhyMeSection", () => {
  it("should build why me section with content", () => {
    const content = "3 years of experience in \\keyword{React} and \\keyword{Node.js}";
    const result = buildWhyMeSection(content, "en");

    expect(result).toContain("\\section{Why Me}");
    expect(result).toContain("\\keyword{React}");
    expect(result).toContain("\\keyword{Node.js}");
  });

  it("should use French header when language is fr", () => {
    const result = buildWhyMeSection("Test content", "fr");
    expect(result).toContain("\\section{Pourquoi Moi}");
  });

  it("should return empty string for empty content", () => {
    const result = buildWhyMeSection("", "en");
    expect(result).toBe("");
  });
});

describe("fillTemplate", () => {
  const mockTemplate = `
\\begin{document}
{{NAME}}
{{CONTACT_LINE}}
{{WHY_ME_SECTION}}
{{SKILLS_SECTION}}
{{EXPERIENCE_SECTION}}
{{PROJECTS_SECTION}}
{{EDUCATION_SECTION}}
{{LANGUAGES_SECTION}}
\\end{document}
`;

  it("should replace all placeholders", () => {
    const sections = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+33 6 12 34 56 78",
      location: "Paris, France",
      linkedin: "https://linkedin.com/in/johndoe",
      whyMe: "\\section{Why Me}\nContent here",
      skills: "\\section{Skills}\nSkills here",
      experience: "\\section{Experience}\nExperience here",
      projects: "\\section{Projects}\nProjects here",
      education: "\\section{Education}\nEducation here",
      languages: "\\section{Languages}\nLanguages here",
    };

    const result = fillTemplate(mockTemplate, sections);

    expect(result).toContain("John Doe");
    expect(result).toContain("john@example.com");
    expect(result).toContain("\\section{Why Me}");
    expect(result).toContain("\\section{Skills}");
    expect(result).not.toContain("{{NAME}}");
    expect(result).not.toContain("{{CONTACT_LINE}}");
  });

  it("should escape special characters in name", () => {
    const sections = {
      name: "John & Jane O'Brien",
      whyMe: "",
      skills: "",
      experience: "",
      projects: "",
      education: "",
    };

    const result = fillTemplate(mockTemplate, sections);
    expect(result).toContain("John \\& Jane O"); // Ampersand escaped, apostrophe converted
  });

  it("should handle missing optional fields", () => {
    const sections = {
      name: "John Doe",
      email: "john@example.com",
      whyMe: "",
      skills: "",
      experience: "",
      projects: "",
      education: "",
    };

    const result = fillTemplate(mockTemplate, sections);
    expect(result).toContain("John Doe");
    expect(result).not.toContain("undefined");
  });
});

describe("ATS Compatibility", () => {
  it("should not use tables for layout in experience section", () => {
    const experiences = [
      {
        title: "Developer",
        company: "Tech Corp",
        location: "Paris",
        startDate: "2020",
        endDate: "2023",
        bullets: ["Developed apps"],
      },
    ];

    const result = buildExperienceSection(experiences, [], "en");
    expect(result).not.toContain("\\begin{table}");
    expect(result).not.toContain("\\begin{tabular}");
  });

  it("should use single-column layout", () => {
    const skills = { Languages: ["JavaScript", "Python"] };
    const result = buildSkillsSection(skills, [], "en");

    // Should not use minipage or columns
    expect(result).not.toContain("\\begin{minipage}");
    expect(result).not.toContain("\\begin{multicols}");
  });

  it("should not include complex graphics commands", () => {
    const projects = [
      {
        name: "Project",
        description: "Description",
        techStack: ["React"],
        year: "2023",
      },
    ];

    const result = buildProjectsSection(projects, [], "en");
    expect(result).not.toContain("\\includegraphics");
    expect(result).not.toContain("\\begin{tikzpicture}");
  });
});
