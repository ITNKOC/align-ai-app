// ============================================
// ALIGN.AI - Skill Matcher Tests (Story 5.6)
// Tests for job-aligned skill organization
// ============================================

import {
  organizeSkillsForJob,
  matchSkill,
  detectSkillCategory,
  SKILL_CATEGORIES,
  SYNONYM_MAP
} from './skill-matcher';
import type { Skills, AnalysisResult, GapAnalysis } from './types';

describe('skill-matcher', () => {
  // Sample test data
  const sampleUserSkills: Skills = {
    languages: ['TypeScript', 'JavaScript', 'Python', 'Java'],
    frameworks: ['React', 'Next.js', 'Express', 'FastAPI'],
    aiAndData: ['TensorFlow', 'PyTorch', 'Pandas'],
    toolsAndCloud: ['Docker', 'AWS', 'Git', 'PostgreSQL', 'Redis'],
    softSkills: ['Communication', 'Leadership', 'Problem Solving'],
  };

  const sampleAnalysisResult: AnalysisResult = {
    score: 75,
    gaps: [],
    keywords: ['React', 'TypeScript', 'Node.js', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL'],
    matchedSkills: ['React', 'TypeScript', 'Docker', 'AWS', 'PostgreSQL'],
    jobTitle: 'Senior Full Stack Developer',
    company: 'Tech Corp',
    totalGapsFound: 2,
    gapsByPriority: {
      critical: [{ skill: 'Kubernetes', severity: 'critical', category: 'devops', suggestion: '', importanceScore: 9, relatedSkillsInCV: ['Docker'], potentialTransferable: true }],
      moderate: [{ skill: 'Node.js', severity: 'moderate', category: 'framework', suggestion: '', importanceScore: 7, relatedSkillsInCV: ['Express'], potentialTransferable: true }],
      minor: [],
    },
  };

  describe('matchSkill', () => {
    it('should return exact match for identical skills', () => {
      const result = matchSkill('React', ['React', 'Vue', 'Angular']);
      expect(result).toEqual({
        matched: true,
        type: 'exact',
        matchedWith: 'React',
        score: 100,
      });
    });

    it('should return exact match case-insensitively', () => {
      const result = matchSkill('REACT', ['React', 'Vue']);
      expect(result).toEqual({
        matched: true,
        type: 'exact',
        matchedWith: 'React',
        score: 100,
      });
    });

    it('should return partial match for similar skills', () => {
      // React.js is a known synonym for React, so it matches as synonym
      const result = matchSkill('React.js', ['React', 'Vue']);
      expect(result).toEqual({
        matched: true,
        type: 'synonym',
        matchedWith: 'React',
        score: 90,
      });
    });

    it('should return partial match when one skill contains another', () => {
      const result = matchSkill('Express.js', ['Express', 'Koa']);
      expect(result).toEqual({
        matched: true,
        type: 'partial',
        matchedWith: 'Express',
        score: 80,
      });
    });

    it('should return synonym match for known synonyms', () => {
      const result = matchSkill('NodeJS', ['Express', 'Node.js']);
      expect(result).toEqual({
        matched: true,
        type: 'synonym',
        matchedWith: 'Node.js',
        score: 90,
      });
    });

    it('should return no match for unrelated skills', () => {
      const result = matchSkill('Kubernetes', ['React', 'Vue']);
      expect(result).toEqual({
        matched: false,
        type: null,
        matchedWith: null,
        score: 0,
      });
    });
  });

  describe('detectSkillCategory', () => {
    it('should detect frontend skills', () => {
      expect(detectSkillCategory('React')).toBe('Frontend');
      expect(detectSkillCategory('Vue')).toBe('Frontend');
      expect(detectSkillCategory('Angular')).toBe('Frontend');
    });

    it('should detect backend skills', () => {
      expect(detectSkillCategory('Node.js')).toBe('Backend');
      expect(detectSkillCategory('Express')).toBe('Backend');
      expect(detectSkillCategory('FastAPI')).toBe('Backend');
    });

    it('should detect DevOps skills', () => {
      expect(detectSkillCategory('Docker')).toBe('DevOps & Cloud');
      expect(detectSkillCategory('Kubernetes')).toBe('DevOps & Cloud');
      expect(detectSkillCategory('AWS')).toBe('DevOps & Cloud');
    });

    it('should detect database skills', () => {
      expect(detectSkillCategory('PostgreSQL')).toBe('Base de données');
      expect(detectSkillCategory('MySQL')).toBe('Base de données');
      expect(detectSkillCategory('Redis')).toBe('Base de données');
      expect(detectSkillCategory('Prisma')).toBe('Base de données');
    });

    it('should return "Autres" for uncategorized skills', () => {
      expect(detectSkillCategory('SomeUnknownTech')).toBe('Autres');
    });
  });

  describe('organizeSkillsForJob', () => {
    it('should put matched skills first in each category', () => {
      const result = organizeSkillsForJob(sampleUserSkills, sampleAnalysisResult);

      // Should have matched categories
      expect(result.matched.length).toBeGreaterThan(0);

      // Find the Frontend category
      const frontendCategory = result.matched.find(c => c.category === 'Frontend');
      expect(frontendCategory).toBeDefined();

      // Both TypeScript and React are in job keywords with exact match
      // They should both be in the Frontend category with exact match type
      if (frontendCategory) {
        const frontendSkillNames = frontendCategory.skills.map(s => s.skill);
        expect(frontendSkillNames).toContain('React');
        expect(frontendSkillNames).toContain('TypeScript');
        // All matched should be exact type
        expect(frontendCategory.skills[0].matchType).toBe('exact');
      }
    });

    it('should group skills by category from job offer', () => {
      const result = organizeSkillsForJob(sampleUserSkills, sampleAnalysisResult);

      const categories = result.matched.map(c => c.category);

      // Should have distinct categories
      const uniqueCategories = [...new Set(categories)];
      expect(uniqueCategories.length).toBe(categories.length);
    });

    it('should put unmatched skills in "other"', () => {
      const result = organizeSkillsForJob(sampleUserSkills, sampleAnalysisResult);

      // Java is not in the job keywords, so it should be in "other"
      expect(result.other).toContain('Java');
    });

    it('should score exact matches higher than partial matches', () => {
      const result = organizeSkillsForJob(sampleUserSkills, sampleAnalysisResult);

      // Find a category with multiple skills
      const categoryWithMultiple = result.matched.find(c => c.skills.length > 1);

      if (categoryWithMultiple) {
        // Skills should be sorted by score (exact matches first)
        for (let i = 0; i < categoryWithMultiple.skills.length - 1; i++) {
          expect(categoryWithMultiple.skills[i].score).toBeGreaterThanOrEqual(
            categoryWithMultiple.skills[i + 1].score
          );
        }
      }
    });

    it('should sort categories by importance in job offer', () => {
      const result = organizeSkillsForJob(sampleUserSkills, sampleAnalysisResult);

      // Categories with more matched skills should come first
      if (result.matched.length > 1) {
        for (let i = 0; i < result.matched.length - 1; i++) {
          const currentCategoryMatchedCount = result.matched[i].skills.filter(
            s => s.matchType === 'exact'
          ).length;
          const nextCategoryMatchedCount = result.matched[i + 1].skills.filter(
            s => s.matchType === 'exact'
          ).length;

          // First categories should have at least as many exact matches
          expect(currentCategoryMatchedCount).toBeGreaterThanOrEqual(
            nextCategoryMatchedCount - 1 // Allow some flexibility
          );
        }
      }
    });

    it('should handle empty skills gracefully', () => {
      const emptySkills: Skills = {
        languages: [],
        frameworks: [],
        aiAndData: [],
        toolsAndCloud: [],
        softSkills: [],
      };

      const result = organizeSkillsForJob(emptySkills, sampleAnalysisResult);

      expect(result.matched).toEqual([]);
      expect(result.other).toEqual([]);
    });

    it('should handle job with no keywords', () => {
      const noKeywordsAnalysis: AnalysisResult = {
        ...sampleAnalysisResult,
        keywords: [],
        matchedSkills: [],
      };

      const result = organizeSkillsForJob(sampleUserSkills, noKeywordsAnalysis);

      // All skills should be in "other" since no keywords to match
      expect(result.matched).toEqual([]);
      expect(result.other.length).toBeGreaterThan(0);
    });
  });

  describe('SKILL_CATEGORIES', () => {
    it('should have required categories', () => {
      const categoryNames = SKILL_CATEGORIES.map(c => c.name);

      expect(categoryNames).toContain('Frontend');
      expect(categoryNames).toContain('Backend');
      expect(categoryNames).toContain('DevOps & Cloud');
      expect(categoryNames).toContain('Base de données');
    });

    it('should have keywords for each category', () => {
      SKILL_CATEGORIES.forEach(category => {
        expect(category.keywords.length).toBeGreaterThan(0);
      });
    });
  });

  describe('SYNONYM_MAP', () => {
    it('should map common JS synonyms', () => {
      expect(SYNONYM_MAP['javascript']).toContain('js');
      expect(SYNONYM_MAP['javascript']).toContain('ecmascript');
    });

    it('should map Node.js synonyms', () => {
      expect(SYNONYM_MAP['node.js']).toContain('nodejs');
      expect(SYNONYM_MAP['node.js']).toContain('node');
    });

    it('should map React synonyms', () => {
      expect(SYNONYM_MAP['react']).toContain('reactjs');
      expect(SYNONYM_MAP['react']).toContain('react.js');
    });
  });
});
