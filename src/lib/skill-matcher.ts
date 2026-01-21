// ============================================
// ALIGN.AI - Skill Matcher (Story 5.6)
// Organizes skills for job-aligned CV generation
// ============================================

import type { Skills, AnalysisResult, SkillMatch, OrganizedSkills, SkillCategory } from './types';

// ==================== SKILL CATEGORIES ====================

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'Frontend',
    nameEn: 'Frontend',
    keywords: ['react', 'vue', 'angular', 'svelte', 'css', 'html', 'javascript', 'typescript', 'next.js', 'nextjs', 'nuxt', 'tailwind', 'sass', 'scss', 'redux', 'zustand', 'jquery', 'webpack', 'vite', 'framer'],
  },
  {
    name: 'Backend',
    nameEn: 'Backend',
    keywords: ['node', 'node.js', 'nodejs', 'python', 'java', 'go', 'golang', 'rust', 'php', 'ruby', 'c#', 'csharp', '.net', 'dotnet', 'express', 'fastapi', 'django', 'flask', 'spring', 'api', 'rest', 'graphql', 'grpc', 'nest', 'nestjs', 'koa', 'hapi'],
  },
  {
    name: 'DevOps & Cloud',
    nameEn: 'DevOps & Cloud',
    keywords: ['docker', 'kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'google cloud', 'ci/cd', 'cicd', 'jenkins', 'github actions', 'gitlab ci', 'terraform', 'ansible', 'helm', 'linux', 'nginx', 'apache', 'vercel', 'netlify', 'heroku', 'digitalocean'],
  },
  {
    name: 'Base de données',
    nameEn: 'Database',
    keywords: ['sql', 'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'prisma', 'sequelize', 'typeorm', 'oracle', 'sqlite', 'cassandra', 'dynamodb', 'firebase', 'supabase', 'nosql', 'mariadb'],
  },
  {
    name: 'IA & Data',
    nameEn: 'AI & Data',
    keywords: ['tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'machine learning', 'ml', 'deep learning', 'nlp', 'llm', 'openai', 'langchain', 'rag', 'huggingface', 'transformers', 'data science', 'analytics'],
  },
  {
    name: 'Outils',
    nameEn: 'Tools',
    keywords: ['git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'figma', 'vscode', 'vim', 'postman', 'swagger', 'notion', 'slack', 'trello', 'asana'],
  },
  {
    name: 'Testing',
    nameEn: 'Testing',
    keywords: ['jest', 'cypress', 'playwright', 'selenium', 'mocha', 'chai', 'testing', 'tdd', 'bdd', 'unit test', 'e2e', 'integration test', 'vitest', 'pytest', 'junit'],
  },
  {
    name: 'Mobile',
    nameEn: 'Mobile',
    keywords: ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'expo', 'ionic', 'capacitor', 'xamarin'],
  },
];

// ==================== SYNONYM MAPPING ====================

export const SYNONYM_MAP: Record<string, string[]> = {
  'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'vanilla js'],
  'typescript': ['ts'],
  'node.js': ['nodejs', 'node', 'node js'],
  'react': ['reactjs', 'react.js', 'react js'],
  'vue': ['vuejs', 'vue.js', 'vue 3'],
  'angular': ['angularjs', 'angular.js'],
  'next.js': ['nextjs', 'next'],
  'postgresql': ['postgres', 'psql'],
  'mongodb': ['mongo'],
  'kubernetes': ['k8s'],
  'docker': ['containerization', 'containers'],
  'ci/cd': ['cicd', 'continuous integration', 'continuous deployment', 'devops pipeline'],
  'aws': ['amazon web services', 'amazon aws'],
  'gcp': ['google cloud', 'google cloud platform'],
  'python': ['python3', 'py'],
  'machine learning': ['ml'],
  'deep learning': ['dl'],
  'rest': ['restful', 'rest api'],
  'graphql': ['gql'],
};

// ==================== MATCHING FUNCTIONS ====================

export interface MatchResult {
  matched: boolean;
  type: 'exact' | 'partial' | 'synonym' | null;
  matchedWith: string | null;
  score: number;
}

/**
 * Match a required skill against user's skills
 * Returns match type and score
 */
export function matchSkill(requiredSkill: string, userSkills: string[]): MatchResult {
  const normalizedRequired = requiredSkill.toLowerCase().trim();

  // 1. Check for exact match (case-insensitive)
  for (const userSkill of userSkills) {
    const normalizedUser = userSkill.toLowerCase().trim();
    if (normalizedRequired === normalizedUser) {
      return {
        matched: true,
        type: 'exact',
        matchedWith: userSkill,
        score: 100,
      };
    }
  }

  // 2. Check for synonym match
  for (const [canonical, synonyms] of Object.entries(SYNONYM_MAP)) {
    const allVariants = [canonical, ...synonyms];
    const requiredIsVariant = allVariants.some(v => v.toLowerCase() === normalizedRequired);

    if (requiredIsVariant) {
      for (const userSkill of userSkills) {
        const normalizedUser = userSkill.toLowerCase().trim();
        if (allVariants.some(v => v.toLowerCase() === normalizedUser)) {
          return {
            matched: true,
            type: 'synonym',
            matchedWith: userSkill,
            score: 90,
          };
        }
      }
    }
  }

  // 3. Check for partial match (contains)
  for (const userSkill of userSkills) {
    const normalizedUser = userSkill.toLowerCase().trim();

    // Check if one contains the other
    if (normalizedRequired.includes(normalizedUser) || normalizedUser.includes(normalizedRequired)) {
      // Exclude very short matches to avoid false positives
      if (Math.min(normalizedRequired.length, normalizedUser.length) >= 2) {
        return {
          matched: true,
          type: 'partial',
          matchedWith: userSkill,
          score: 80,
        };
      }
    }
  }

  // 4. No match found
  return {
    matched: false,
    type: null,
    matchedWith: null,
    score: 0,
  };
}

/**
 * Detect the category of a skill based on keywords
 * Uses exact match first, then prefix/suffix match, then includes match
 */
export function detectSkillCategory(skill: string): string {
  const normalizedSkill = skill.toLowerCase().trim();

  // First pass: exact match (highest priority)
  for (const category of SKILL_CATEGORIES) {
    if (category.keywords.some(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      return normalizedSkill === normalizedKeyword;
    })) {
      return category.name;
    }
  }

  // Second pass: word boundary match (skill starts with or ends with keyword)
  for (const category of SKILL_CATEGORIES) {
    if (category.keywords.some(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      // Check if keyword is at word boundary
      return normalizedSkill.startsWith(normalizedKeyword) ||
        normalizedSkill.endsWith(normalizedKeyword) ||
        normalizedKeyword.startsWith(normalizedSkill) ||
        normalizedKeyword.endsWith(normalizedSkill);
    })) {
      return category.name;
    }
  }

  // Third pass: includes match (lowest priority, requires min 3 chars to avoid false positives)
  for (const category of SKILL_CATEGORIES) {
    if (category.keywords.some(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      if (Math.min(normalizedSkill.length, normalizedKeyword.length) < 3) {
        return false;
      }
      return normalizedSkill.includes(normalizedKeyword) ||
        normalizedKeyword.includes(normalizedSkill);
    })) {
      return category.name;
    }
  }

  return 'Autres';
}

/**
 * Get all user skills as a flat array
 */
function flattenUserSkills(skills: Skills): string[] {
  return [
    ...(skills.languages || []),
    ...(skills.frameworks || []),
    ...(skills.aiAndData || []),
    ...(skills.toolsAndCloud || []),
  ];
}

/**
 * Main function: Organize user skills for job alignment
 *
 * Returns:
 * - matched: Skills grouped by category, with job-matching skills first
 * - other: Skills that don't match any job requirements
 */
export function organizeSkillsForJob(
  userSkills: Skills,
  analysisResult: AnalysisResult
): OrganizedSkills {
  const allUserSkills = flattenUserSkills(userSkills);
  const jobKeywords = analysisResult.keywords || [];
  const matchedJobSkills = analysisResult.matchedSkills || [];

  // If no job keywords, all skills go to "other"
  if (jobKeywords.length === 0) {
    return {
      matched: [],
      other: allUserSkills,
    };
  }

  // Combine job keywords and matched skills for reference
  const jobRequirements = [...new Set([...jobKeywords, ...matchedJobSkills])];

  // Track which user skills have been matched
  const matchedUserSkills = new Set<string>();

  // Group matched skills by category
  const categoryMap = new Map<string, SkillMatch[]>();

  // Process each user skill
  for (const userSkill of allUserSkills) {
    // Check if this skill matches any job requirement
    const matchResult = matchSkill(userSkill, jobRequirements);

    if (matchResult.matched) {
      matchedUserSkills.add(userSkill);

      const category = detectSkillCategory(userSkill);
      const skillMatch: SkillMatch = {
        skill: userSkill,
        matchType: matchResult.type!,
        category,
        score: matchResult.score,
      };

      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(skillMatch);
    }
  }

  // Also check if job requirements directly match categories
  // (in case the user has skills under different names)
  for (const jobReq of jobRequirements) {
    const matchResult = matchSkill(jobReq, allUserSkills);

    if (matchResult.matched && matchResult.matchedWith && !matchedUserSkills.has(matchResult.matchedWith)) {
      matchedUserSkills.add(matchResult.matchedWith);

      const category = detectSkillCategory(jobReq);
      const skillMatch: SkillMatch = {
        skill: matchResult.matchedWith,
        matchType: matchResult.type!,
        category,
        score: matchResult.score,
      };

      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }

      // Check if this skill isn't already added
      const existing = categoryMap.get(category)!;
      if (!existing.some(s => s.skill === matchResult.matchedWith)) {
        existing.push(skillMatch);
      }
    }
  }

  // Convert to array and sort
  const matchedCategories: { category: string; skills: SkillMatch[] }[] = [];

  for (const [category, skills] of categoryMap.entries()) {
    // Sort skills within category by score (highest first)
    skills.sort((a, b) => b.score - a.score);

    matchedCategories.push({
      category,
      skills,
    });
  }

  // Sort categories by importance (more exact matches = more important)
  matchedCategories.sort((a, b) => {
    const aExactCount = a.skills.filter(s => s.matchType === 'exact').length;
    const bExactCount = b.skills.filter(s => s.matchType === 'exact').length;

    if (bExactCount !== aExactCount) {
      return bExactCount - aExactCount;
    }

    // If tied, sort by total skills count
    return b.skills.length - a.skills.length;
  });

  // Collect unmatched skills
  const otherSkills = allUserSkills.filter(skill => !matchedUserSkills.has(skill));

  return {
    matched: matchedCategories,
    other: otherSkills,
  };
}

/**
 * Format organized skills for LaTeX generation prompt
 * Returns a string representation for the WRITER prompt
 */
export function formatOrganizedSkillsForPrompt(organized: OrganizedSkills): string {
  let result = '## COMPÉTENCES ORGANISÉES POUR LE CV\n\n';

  if (organized.matched.length > 0) {
    result += '### Compétences alignées avec l\'offre (À METTRE EN PREMIER avec \\keyword{})\n';

    for (const { category, skills } of organized.matched) {
      const skillStrings = skills.map(s => {
        const marker = s.matchType === 'exact' ? '**EXACT**' : s.matchType === 'synonym' ? '*synonym*' : '_partial_';
        return `${s.skill} (${marker})`;
      });
      result += `- **${category}:** ${skillStrings.join(', ')}\n`;
    }

    result += '\n';
  }

  if (organized.other.length > 0) {
    result += '### Autres compétences (section "Autres")\n';
    result += `${organized.other.join(', ')}\n`;
  }

  return result;
}
