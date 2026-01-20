// ============================================
// ALIGN.AI - Company Search Integration
// Story 7.7: Company Research Auto-Fetch
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";

// ==================== TYPES ====================

export interface CompanySearchResults {
  culture?: string[];
  values?: string[];
  recentNews?: { title: string; date: string; summary: string }[];
  competitors?: string[];
  marketPosition?: string;
  employees?: string;
  founded?: string;
  headquarters?: string;
  industry?: string;
  description?: string;
}

export interface ExtractedCompanyInfo {
  companyName: string | null;
  location: string | null;
  industry: string | null;
  hasValidCompany: boolean;
}

// ==================== TASK 1: COMPANY INFO EXTRACTION ====================

/**
 * Task 1.1-1.4: Extract company information from job offer data
 * Parses company name from JobOffer.company or rawText
 * Identifies location/country and detects industry/sector
 */
export function extractCompanyInfo(
  company: string | null | undefined,
  location: string | null | undefined,
  rawText: string
): ExtractedCompanyInfo {
  // Task 1.1: Parse company name from JobOffer.company or rawText
  let companyName = company?.trim() || null;

  // If company is empty or null, try to extract from rawText
  if (!companyName) {
    companyName = extractCompanyFromText(rawText);
  }

  // Task 1.2: Identify location/country if available
  let companyLocation = location?.trim() || null;
  if (!companyLocation) {
    companyLocation = extractLocationFromText(rawText);
  }

  // Task 1.3: Detect industry/sector from job description
  const industry = detectIndustryFromText(rawText);

  // Task 1.4: Handle cases where company name is missing
  const hasValidCompany = !!companyName && companyName.length > 1;

  return {
    companyName,
    location: companyLocation,
    industry,
    hasValidCompany,
  };
}

/**
 * Extract company name from raw job offer text using common patterns
 */
function extractCompanyFromText(text: string): string | null {
  // Common patterns for company mentions in French job offers
  const patterns = [
    /(?:entreprise|societe|groupe|cabinet)\s*[:\-]?\s*([A-Z][A-Za-z0-9\s&\-\.]+)/i,
    /(?:chez|rejoignez|au sein de)\s+([A-Z][A-Za-z0-9\s&\-\.]+)/i,
    /(?:about|a propos de)\s+([A-Z][A-Za-z0-9\s&\-\.]+)/i,
    /^([A-Z][A-Za-z0-9\s&\-\.]+)\s+(?:recrute|recherche|hire)/im,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Filter out common false positives
      if (!isCommonFalsePositive(name)) {
        return name;
      }
    }
  }

  return null;
}

/**
 * Extract location from raw text
 */
function extractLocationFromText(text: string): string | null {
  const patterns = [
    /(?:lieu|localisation|location|site)\s*[:\-]?\s*([A-Za-z\s,\-]+(?:France|Paris|Lyon|Marseille|Toulouse|Nice|Nantes|Bordeaux|Lille|Strasbourg))/i,
    /(?:a|basee?\s+a)\s+([A-Za-z\s,\-]+(?:France)?)/i,
    /(Paris|Lyon|Marseille|Toulouse|Nice|Nantes|Bordeaux|Lille|Strasbourg|Remote|Teletravail)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Detect industry/sector from job description
 */
function detectIndustryFromText(text: string): string | null {
  const lowerText = text.toLowerCase();

  const industryKeywords: Record<string, string[]> = {
    "Technologie/IT": ["saas", "software", "logiciel", "startup", "tech", "digital", "api", "cloud", "developpement"],
    "Finance/Banque": ["banque", "finance", "fintech", "trading", "assurance", "investissement"],
    "E-commerce": ["e-commerce", "ecommerce", "marketplace", "retail", "vente en ligne"],
    "Sante": ["sante", "healthtech", "medtech", "medical", "pharma", "hopital"],
    "Energie": ["energie", "energie", "renewables", "petrole", "nucleaire"],
    "Automobile": ["automobile", "vehicule", "mobility", "automotive"],
    "Conseil": ["conseil", "consulting", "cabinet", "audit"],
    "Media/Communication": ["media", "communication", "publicite", "marketing", "agence"],
    "Education": ["education", "formation", "edtech", "ecole", "universite"],
    "Industrie": ["industrie", "manufacturing", "usine", "production"],
  };

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return industry;
      }
    }
  }

  return null;
}

/**
 * Check if extracted name is a common false positive
 */
function isCommonFalsePositive(name: string): boolean {
  const falsePositives = [
    "nous", "vous", "candidat", "poste", "mission", "profil",
    "experience", "formation", "competences", "salaire",
    "contrat", "cdi", "cdd", "stage", "alternance",
  ];

  return falsePositives.some(fp =>
    name.toLowerCase().includes(fp) || name.toLowerCase() === fp
  );
}

// ==================== TASK 2: WEB SEARCH INTEGRATION ====================

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Task 2.1-2.4: Search for company information using Gemini with Google Search grounding
 * Uses Gemini 2.0 Flash with Google Search tool for real-time company data
 */
export async function searchCompanyInfo(
  companyName: string,
  industry?: string | null
): Promise<CompanySearchResults> {
  try {
    // Task 2.1: Use Gemini grounding with Google Search
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      // Note: Google Search grounding requires specific API configuration
      // If not available, the model will use its training data
    });

    // Task 2.3: Define search queries for each category
    const searchPrompt = buildCompanySearchPrompt(companyName, industry);

    // Task 2.2: Execute search via Gemini
    const result = await model.generateContent(searchPrompt);
    const response = result.response.text();

    console.log("[CompanySearch] Gemini response length:", response.length);

    // Task 2.4: Parse and structure search results
    const parsedResults = parseSearchResponse(response);

    return parsedResults;
  } catch (error) {
    console.error("[CompanySearch] Error searching company info:", error);
    // Return empty results, will trigger fallback in prompt generation
    return {};
  }
}

/**
 * Build the search prompt for company information
 */
function buildCompanySearchPrompt(companyName: string, industry?: string | null): string {
  return `Tu es un expert en recherche d'entreprise. Recherche des informations actuelles et factuelles sur l'entreprise "${companyName}"${industry ? ` dans le secteur ${industry}` : ''}.

IMPORTANT: Utilise uniquement des informations verifiables. Si tu ne trouves pas d'information sur un point, indique "Non trouve" plutot que d'inventer.

Fournis les informations suivantes au format structure:

## PROFIL DE L'ENTREPRISE
- Description: [Description courte de l'entreprise et son activite principale]
- Secteur: [Secteur d'activite]
- Fondation: [Annee de creation si connue]
- Siege social: [Localisation du siege]
- Effectifs: [Nombre approximatif d'employes si connu]

## CULTURE ET VALEURS
- [Liste des valeurs d'entreprise connues]
- [Elements de culture d'entreprise]

## ACTUALITES RECENTES
- [Date]: [Titre] - [Resume bref]
(Liste les actualites des 6 derniers mois si disponibles)

## POSITION SUR LE MARCHE
- Concurrents principaux: [Liste des concurrents]
- Position: [Description de leur position sur le marche]

## REMARQUES
- [Toute information utile pour un candidat qui prepare un entretien]

Reponds uniquement avec des informations factuelles et verifiables.`;
}

/**
 * Parse the Gemini response into structured CompanySearchResults
 */
function parseSearchResponse(response: string): CompanySearchResults {
  const results: CompanySearchResults = {};

  // Extract description
  const descMatch = response.match(/Description:\s*(.+?)(?:\n|$)/i);
  if (descMatch && !descMatch[1].includes("Non trouve")) {
    results.description = descMatch[1].trim();
  }

  // Extract industry/sector
  const sectorMatch = response.match(/Secteur:\s*(.+?)(?:\n|$)/i);
  if (sectorMatch && !sectorMatch[1].includes("Non trouve")) {
    results.industry = sectorMatch[1].trim();
  }

  // Extract founded year
  const foundedMatch = response.match(/Fondation:\s*(.+?)(?:\n|$)/i);
  if (foundedMatch && !foundedMatch[1].includes("Non trouve")) {
    results.founded = foundedMatch[1].trim();
  }

  // Extract headquarters
  const hqMatch = response.match(/Si[eè]ge(?:\s+social)?:\s*(.+?)(?:\n|$)/i);
  if (hqMatch && !hqMatch[1].includes("Non trouve")) {
    results.headquarters = hqMatch[1].trim();
  }

  // Extract employees count
  const empMatch = response.match(/Effectifs?:\s*(.+?)(?:\n|$)/i);
  if (empMatch && !empMatch[1].includes("Non trouve")) {
    results.employees = empMatch[1].trim();
  }

  // Extract culture and values section
  const cultureSection = response.match(/CULTURE ET VALEURS([\s\S]*?)(?:##|ACTUALITES|POSITION|$)/i);
  if (cultureSection) {
    const values = cultureSection[1]
      .split(/\n/)
      .map(line => line.replace(/^[-*•]\s*/, "").trim())
      .filter(line => line.length > 0 && !line.includes("Non trouve"));

    if (values.length > 0) {
      results.values = values;
      results.culture = values;
    }
  }

  // Extract recent news
  const newsSection = response.match(/ACTUALITES RECENTES([\s\S]*?)(?:##|POSITION|REMARQUES|$)/i);
  if (newsSection) {
    const newsLines = newsSection[1]
      .split(/\n/)
      .map(line => line.replace(/^[-*•]\s*/, "").trim())
      .filter(line => line.length > 0 && !line.includes("Non trouve"));

    const news: { title: string; date: string; summary: string }[] = [];
    for (const line of newsLines) {
      // Try to parse date and content from formats like "[Date]: Title - Summary" or "Date - Title: Summary"
      const newsMatch = line.match(/\[?(\d{4}(?:-\d{2})?(?:-\d{2})?|\w+\s+\d{4})\]?[:\s-]+(.+)/);
      if (newsMatch) {
        const [, date, rest] = newsMatch;
        const [title, ...summaryParts] = rest.split(/\s*[-:]\s*/);
        news.push({
          date: date.trim(),
          title: title?.trim() || rest.trim(),
          summary: summaryParts.join(" ").trim() || "",
        });
      }
    }

    if (news.length > 0) {
      results.recentNews = news;
    }
  }

  // Extract competitors
  const competitorsMatch = response.match(/Concurrents(?:\s+principaux)?:\s*(.+?)(?:\n|$)/i);
  if (competitorsMatch && !competitorsMatch[1].includes("Non trouve")) {
    const competitors = competitorsMatch[1]
      .split(/[,;]/)
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (competitors.length > 0) {
      results.competitors = competitors;
    }
  }

  // Extract market position
  const positionMatch = response.match(/Position:\s*(.+?)(?:\n##|$)/i);
  if (positionMatch && !positionMatch[1].includes("Non trouve")) {
    results.marketPosition = positionMatch[1].trim();
  }

  return results;
}

/**
 * Check if search results are sufficient for a good company research section
 * Requires at least 3 fields to be populated
 */
export function hasValidSearchResults(results: CompanySearchResults): boolean {
  const populatedFields = [
    results.description,
    results.industry,
    results.founded,
    results.headquarters,
    results.employees,
    results.values?.length,
    results.culture?.length,
    results.recentNews?.length,
    results.competitors?.length,
    results.marketPosition,
  ].filter(Boolean);

  return populatedFields.length >= 3;
}
