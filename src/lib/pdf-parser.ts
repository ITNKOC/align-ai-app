import { extractText } from "unpdf";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const result = await extractText(uint8Array);
    // unpdf returns text as string or array of strings
    let text = Array.isArray(result.text)
      ? result.text.join("\n")
      : String(result.text || "");
    // Remove null bytes and other invalid UTF-8 characters for PostgreSQL
    text = text.replace(/\x00/g, "").replace(/[\uFFFD]/g, "");
    return text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF file");
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  return extractTextFromPDF(Buffer.from(uint8Array));
}
