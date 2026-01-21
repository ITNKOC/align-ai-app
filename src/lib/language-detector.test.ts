// ============================================
// ALIGN.AI - Language Detector Tests
// Story 5.7: Multilingual CV Generation
// ============================================

import {
  detectLanguageByPattern,
  detectLanguageSync,
  type SupportedLanguage,
  type LanguageDetectionResult,
} from "./language-detector";

// Sample French job offer
const FRENCH_JOB_OFFER = `
Nous recherchons un Développeur Full Stack H/F
CDI - Paris - 45-55K€

Votre mission:
- Développer de nouvelles fonctionnalités
- Participer à la conception de l'architecture
- Assurer la qualité du code

Votre profil:
- 3 ans d'expérience minimum
- Maîtrise de React et Node.js
- Autonomie et rigueur
- Vous êtes passionné(e) par le développement

Avantages:
- Télétravail 2 jours/semaine
- Tickets restaurant
- RTT
`;

// Sample English job offer
const ENGLISH_JOB_OFFER = `
We are looking for a Full Stack Developer
Full-time - London - £55-70K

Your responsibilities:
- Develop new features
- Participate in architecture design
- Ensure code quality

Requirements:
- Minimum 3 years of experience
- Proficiency in React and Node.js
- Self-motivated and attention to detail
- You will work with a talented team

Benefits:
- Remote work 2 days/week
- Health insurance
- Stock options
`;

// Mixed/bilingual job offer
const MIXED_JOB_OFFER = `
Développeur Full Stack / Full Stack Developer
CDI - Paris

Requirements / Profil recherché:
- React, Node.js, TypeScript
- 3+ years experience / 3+ ans d'expérience
- English fluent / Anglais courant

We offer / Nous offrons:
- Competitive salary
- Télétravail possible
`;

// Technical-only job offer (mostly code)
const TECHNICAL_JOB_OFFER = `
Senior Software Engineer

Tech stack:
- React, Next.js, TypeScript
- Node.js, PostgreSQL, Redis
- Docker, Kubernetes, AWS
- GraphQL, REST API

CI/CD: GitHub Actions
Testing: Jest, Cypress
`;

describe("Language Detector", () => {
  describe("detectLanguageByPattern", () => {
    it("should detect French with high confidence for French job offers", () => {
      const result = detectLanguageByPattern(FRENCH_JOB_OFFER);

      expect(result.language).toBe("fr");
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.method).toBe("pattern");
    });

    it("should detect English with high confidence for English job offers", () => {
      const result = detectLanguageByPattern(ENGLISH_JOB_OFFER);

      expect(result.language).toBe("en");
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.method).toBe("pattern");
    });

    it("should return lower confidence for mixed/bilingual job offers", () => {
      const result = detectLanguageByPattern(MIXED_JOB_OFFER);

      // Should still detect a language but with lower confidence
      expect(["fr", "en"]).toContain(result.language);
      expect(result.confidence).toBeLessThan(0.9);
      expect(result.method).toBe("pattern");
    });

    it("should default to French with low confidence for technical-only offers", () => {
      const result = detectLanguageByPattern(TECHNICAL_JOB_OFFER);

      // Default to French when no clear indicators
      expect(result.language).toBe("fr");
      expect(result.confidence).toBeLessThanOrEqual(0.7);
      expect(result.method).toBe("pattern");
    });

    it("should handle empty text", () => {
      const result = detectLanguageByPattern("");

      expect(result.language).toBe("fr");
      expect(result.confidence).toBe(0.5);
      expect(result.method).toBe("pattern");
    });

    it("should be case insensitive", () => {
      const upperFrench = FRENCH_JOB_OFFER.toUpperCase();
      const result = detectLanguageByPattern(upperFrench);

      expect(result.language).toBe("fr");
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe("detectLanguageSync", () => {
    it("should return same result as detectLanguageByPattern", () => {
      const patternResult = detectLanguageByPattern(FRENCH_JOB_OFFER);
      const syncResult = detectLanguageSync(FRENCH_JOB_OFFER);

      expect(syncResult.language).toBe(patternResult.language);
      expect(syncResult.confidence).toBe(patternResult.confidence);
      expect(syncResult.method).toBe(patternResult.method);
    });
  });

  describe("confidence scoring", () => {
    it("should return confidence between 0.5 and 1", () => {
      const testTexts = [
        FRENCH_JOB_OFFER,
        ENGLISH_JOB_OFFER,
        MIXED_JOB_OFFER,
        TECHNICAL_JOB_OFFER,
        "",
        "Random text without indicators",
      ];

      testTexts.forEach((text) => {
        const result = detectLanguageByPattern(text);
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
        expect(result.confidence).toBeLessThanOrEqual(1);
      });
    });

    it("should return high confidence for clear-cut cases", () => {
      // Very clearly French
      const clearFrench =
        "Nous recherchons un candidat avec de l'expérience. Vous serez responsable des missions suivantes. Le profil idéal maîtrise les compétences requises.";
      const frenchResult = detectLanguageByPattern(clearFrench);
      expect(frenchResult.language).toBe("fr");
      expect(frenchResult.confidence).toBeGreaterThanOrEqual(0.8);

      // Very clearly English
      const clearEnglish =
        "We are looking for a candidate with experience. You will be responsible for the following responsibilities. The ideal profile has proficiency in required skills.";
      const englishResult = detectLanguageByPattern(clearEnglish);
      expect(englishResult.language).toBe("en");
      expect(englishResult.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("specific French indicators", () => {
    const frenchPhrases = [
      "Nous recherchons un développeur",
      "Votre profil idéal",
      "CDI basé à Paris",
      "Maîtrise de React",
      "Autonomie et rigueur",
      "Télétravail possible",
      "Années d'expérience requises",
    ];

    frenchPhrases.forEach((phrase) => {
      it(`should detect French for: "${phrase.slice(0, 30)}..."`, () => {
        const result = detectLanguageByPattern(phrase);
        expect(result.language).toBe("fr");
      });
    });
  });

  describe("specific English indicators", () => {
    const englishPhrases = [
      "We are looking for a developer",
      "Your ideal profile",
      "Full-time position in London",
      "Proficiency in React",
      "Self-motivated and detail-oriented",
      "Remote work available",
      "Years of experience required",
    ];

    englishPhrases.forEach((phrase) => {
      it(`should detect English for: "${phrase.slice(0, 30)}..."`, () => {
        const result = detectLanguageByPattern(phrase);
        expect(result.language).toBe("en");
      });
    });
  });
});

describe("Type safety", () => {
  it("should return SupportedLanguage type", () => {
    const result = detectLanguageByPattern(FRENCH_JOB_OFFER);

    // Type check - should compile
    const lang: SupportedLanguage = result.language;
    expect(["fr", "en"]).toContain(lang);
  });

  it("should return LanguageDetectionResult type", () => {
    const result: LanguageDetectionResult =
      detectLanguageByPattern(FRENCH_JOB_OFFER);

    expect(result).toHaveProperty("language");
    expect(result).toHaveProperty("confidence");
    expect(result).toHaveProperty("method");
  });
});
