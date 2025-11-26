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

  // Extract CV LaTeX between markers
  const cvMatch = text.match(/===CV_START===([\s\S]*?)===CV_END===/);
  const coverMatch = text.match(/===COVER_START===([\s\S]*?)===COVER_END===/);

  if (!cvMatch || !coverMatch) {
    console.error("Raw Gemini response:", text.substring(0, 1000));
    throw new Error("Could not extract LaTeX documents from response");
  }

  // Clean up the extracted LaTeX
  const cleanLatex = (latex: string): string => {
    let cleaned = latex.trim();
    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```(?:latex|tex)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");
    // Fix common unescaped special characters (but not already escaped ones)
    // Only escape & that are not already escaped and not in tabularx context
    cleaned = cleaned.replace(/(?<!\\)&(?!\s*\\\\)/g, (match, offset, str) => {
      // Check if we're likely in a tabularx table (has \begin{tabularx} before)
      const before = str.substring(Math.max(0, offset - 200), offset);
      if (before.includes("\\begin{tabularx}") && !before.includes("\\end{tabularx}")) {
        return match; // Keep & as is in tables
      }
      return "\\&";
    });
    return cleaned.trim();
  };

  return {
    cvLatex: cleanLatex(cvMatch[1]),
    coverLetterLatex: cleanLatex(coverMatch[1]),
  };
}
