import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

export const geminiPro = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

export async function generateContent(
  prompt: string,
  useProModel: boolean = false
): Promise<string> {
  const model = useProModel ? geminiPro : geminiFlash;
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

export async function generateJSON<T>(
  prompt: string,
  useProModel: boolean = false
): Promise<T> {
  const model = useProModel ? geminiPro : geminiFlash;
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();

  return JSON.parse(jsonString) as T;
}

// Special function for generating LaTeX documents without JSON escaping issues
export async function generateLatexDocuments(
  prompt: string,
  useProModel: boolean = false
): Promise<{ cvLatex: string; coverLetterLatex: string }> {
  const model = useProModel ? geminiPro : geminiFlash;
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  console.log("[LaTeX Generation] Response length:", text.length);
  console.log("[LaTeX Generation] First 500 chars:", text.substring(0, 500));

  // Try multiple extraction patterns for CV
  let cvContent: string | null = null;
  let coverContent: string | null = null;

  // Pattern 1: Original markers (strict)
  const cvMatch1 = text.match(/===CV_START===([\s\S]*?)===CV_END===/);
  const coverMatch1 = text.match(/===COVER_START===([\s\S]*?)===COVER_END===/);

  if (cvMatch1) cvContent = cvMatch1[1];
  if (coverMatch1) coverContent = coverMatch1[1];

  // Pattern 2: Markers with whitespace/newlines
  if (!cvContent) {
    const cvMatch2 = text.match(/===\s*CV_START\s*===([\s\S]*?)===\s*CV_END\s*===/i);
    if (cvMatch2) cvContent = cvMatch2[1];
  }
  if (!coverContent) {
    const coverMatch2 = text.match(/===\s*COVER_START\s*===([\s\S]*?)===\s*COVER_END\s*===/i);
    if (coverMatch2) coverContent = coverMatch2[1];
  }

  // Pattern 3: Look for \documentclass blocks (LaTeX documents)
  if (!cvContent || !coverContent) {
    const documentBlocks = text.match(/\\documentclass[\s\S]*?\\end\{document\}/g);
    if (documentBlocks && documentBlocks.length >= 2) {
      // First document is usually CV, second is cover letter
      if (!cvContent) cvContent = documentBlocks[0];
      if (!coverContent) coverContent = documentBlocks[1];
      console.log("[LaTeX Generation] Extracted using documentclass pattern");
    } else if (documentBlocks && documentBlocks.length === 1) {
      // Only one document found, try to use it as CV
      if (!cvContent) cvContent = documentBlocks[0];
    }
  }

  // Pattern 4: Look for latex/tex code blocks
  if (!cvContent || !coverContent) {
    const codeBlocks = text.match(/```(?:latex|tex)\s*([\s\S]*?)```/gi);
    if (codeBlocks && codeBlocks.length >= 2) {
      const extractCode = (block: string) => block.replace(/```(?:latex|tex)?\s*/gi, "").replace(/\s*```$/gi, "");
      if (!cvContent) cvContent = extractCode(codeBlocks[0]);
      if (!coverContent) coverContent = extractCode(codeBlocks[1]);
      console.log("[LaTeX Generation] Extracted using code block pattern");
    }
  }

  // Pattern 5: Last resort - look for any content after specific headers
  if (!cvContent) {
    const cvHeaderMatch = text.match(/(?:CV|CURRICULUM|Resume)[:\s]*\n([\s\S]*?)(?=(?:LETTRE|COVER|Letter)|$)/i);
    if (cvHeaderMatch && cvHeaderMatch[1].includes("\\documentclass")) {
      cvContent = cvHeaderMatch[1].match(/\\documentclass[\s\S]*?\\end\{document\}/)?.[0] || null;
    }
  }

  // Validate we have both documents
  if (!cvContent || !coverContent) {
    console.error("[LaTeX Generation] Failed to extract documents");
    console.error("[LaTeX Generation] CV found:", !!cvContent);
    console.error("[LaTeX Generation] Cover found:", !!coverContent);
    console.error("[LaTeX Generation] Full response (first 3000 chars):", text.substring(0, 3000));

    // If we have at least the CV, create a minimal cover letter
    if (cvContent && !coverContent) {
      console.log("[LaTeX Generation] Creating minimal cover letter");
      coverContent = createMinimalCoverLetter();
    }

    // If we still don't have CV, throw error
    if (!cvContent) {
      throw new Error("Could not extract LaTeX documents from response. Please try again.");
    }
  }

  // Clean up the extracted LaTeX
  const cleanLatex = (latex: string): string => {
    let cleaned = latex.trim();
    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```(?:latex|tex)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/gi, "");
    // Remove any remaining markers
    cleaned = cleaned.replace(/===(?:CV|COVER)_(?:START|END)===/gi, "");
    // Ensure document starts with \documentclass
    const docStart = cleaned.indexOf("\\documentclass");
    if (docStart > 0) {
      cleaned = cleaned.substring(docStart);
    }
    // Ensure document ends with \end{document}
    const docEnd = cleaned.lastIndexOf("\\end{document}");
    if (docEnd > 0) {
      cleaned = cleaned.substring(0, docEnd + "\\end{document}".length);
    }
    return cleaned.trim();
  };

  return {
    cvLatex: cleanLatex(cvContent!),
    coverLetterLatex: cleanLatex(coverContent!),
  };
}

// Create minimal cover letter if extraction fails
function createMinimalCoverLetter(): string {
  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[margin=2.5cm]{geometry}
\\usepackage{parskip}
\\pagestyle{empty}

\\begin{document}

\\begin{flushleft}
\\textbf{Candidat}\\\\
Ville, France\\\\
email@exemple.com
\\end{flushleft}

\\vspace{1cm}

\\textbf{Objet : Candidature}

\\vspace{0.5cm}

Madame, Monsieur,

Je me permets de vous adresser ma candidature pour le poste proposé.

Mon profil et mon parcours correspondent aux exigences du poste. Je reste à votre disposition pour tout entretien.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

\\vspace{1cm}

\\textbf{Signature}

\\end{document}`;
}
