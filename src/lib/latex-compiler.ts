const LATEX_API_URL =
  process.env.LATEX_API_URL || "https://latex.ytotech.com/builds/sync";

interface LatexResource {
  path: string;
  content: string;
}

interface LatexBuildRequest {
  compiler: string;
  resources: LatexResource[];
}

export async function compileLatexToPdf(latexContent: string, retries = 2): Promise<Buffer> {
  // Log first 500 chars of LaTeX for debugging
  console.log("LaTeX content preview:", latexContent.substring(0, 500));

  const request: LatexBuildRequest = {
    compiler: "pdflatex",
    resources: [
      {
        path: "main.tex",
        content: latexContent,
      },
    ],
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      console.log(`Retry attempt ${attempt}/${retries}...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Wait longer each retry
    }

    try {
      const response = await fetch(LATEX_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }

      const errorText = await response.text();
      console.error("LaTeX API status:", response.status);
      console.error("LaTeX API full error:", errorText);

      // Server error (5xx) - retry
      if (response.status >= 500 && attempt < retries) {
        lastError = new Error(`LaTeX API server error: ${response.status}`);
        continue;
      }

      // Client error (4xx) - parse and show details
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.log_files) {
          const logContent = Object.values(errorJson.log_files)[0] as string;
          console.error("LaTeX log (last 2000 chars):", logContent?.slice(-2000));
        }
      } catch {
        // Not JSON, just log as text
      }

      throw new Error(`LaTeX compilation failed: ${response.status}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("LaTeX compilation failed")) {
        throw error;
      }
      lastError = error as Error;
      if (attempt === retries) {
        throw new Error(`LaTeX API unreachable after ${retries + 1} attempts: ${lastError.message}`);
      }
    }
  }

  throw lastError || new Error("LaTeX compilation failed");
}

export async function compileDocuments(
  cvLatex: string,
  coverLetterLatex: string
): Promise<{ cvPdf: Buffer; coverPdf: Buffer }> {
  const [cvPdf, coverPdf] = await Promise.all([
    compileLatexToPdf(cvLatex),
    compileLatexToPdf(coverLetterLatex),
  ]);

  return { cvPdf, coverPdf };
}
