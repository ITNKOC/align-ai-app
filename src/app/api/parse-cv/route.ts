import { NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { generateJSON } from "@/lib/gemini";
import { getCVExtractionPrompt } from "@/lib/prompts";
import type { CVData } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("cv") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Seuls les fichiers PDF sont acceptes" },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Le fichier ne doit pas depasser 10 Mo" },
        { status: 400 }
      );
    }

    console.log("[Parse CV] Extracting text from PDF...");

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const rawText = await extractTextFromPDF(buffer);

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: "Le PDF semble vide ou illisible" },
        { status: 400 }
      );
    }

    console.log(`[Parse CV] Extracted ${rawText.length} chars, calling Gemini...`);

    // Use Gemini to extract structured data
    const prompt = getCVExtractionPrompt(rawText);
    const cvData = await generateJSON<CVData>(prompt);

    console.log("[Parse CV] Extraction complete:", {
      name: cvData.personalInfo?.fullName,
      experiences: cvData.experiences?.length,
      education: cvData.education?.length,
      projects: cvData.projects?.length,
      profileType: cvData.profileType,
    });

    return NextResponse.json({
      success: true,
      cvData,
      rawText: rawText.substring(0, 500) + "...", // Preview only
    });
  } catch (error) {
    console.error("[Parse CV] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de l'extraction",
      },
      { status: 500 }
    );
  }
}
