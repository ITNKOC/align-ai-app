/**
 * Unit tests for profile-actions.ts
 * Story 2.2 - Profile View & Manual Edit
 */

import type { CVData, Experience, Project, Education } from '@/lib/types';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    masterProfile: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('./auth-actions', () => ({
  getSession: jest.fn(),
}));

import { prisma } from '@/lib/db';
import { getSession } from './auth-actions';
import {
  updateProfileItem,
  addProfileItem,
  deleteProfileItem,
} from './profile-actions';

const mockSession = { id: 'user-123', fullName: 'Test User', email: 'test@example.com' };

const mockCVData: CVData = {
  personalInfo: {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '+33612345678',
    location: 'Paris, France',
  },
  experiences: [
    {
      title: 'Software Engineer',
      company: 'TechCorp',
      location: 'Paris',
      startDate: 'Jan 2022',
      endDate: 'Present',
      bullets: ['Built features', 'Led team'],
    },
  ],
  projects: [
    {
      name: 'My Project',
      description: 'A cool project',
      techStack: ['React', 'TypeScript'],
      year: '2024',
    },
  ],
  education: [
    {
      degree: 'Master in CS',
      school: 'University X',
      location: 'Paris',
      startDate: '2018',
      endDate: '2022',
    },
  ],
  skills: {
    languages: ['JavaScript', 'Python'],
    frameworks: ['React', 'Next.js'],
    aiAndData: ['TensorFlow'],
    toolsAndCloud: ['AWS'],
    softSkills: ['Leadership'],
  },
  languages: [{ language: 'French', level: 'Native' }],
};

const mockProfile = {
  id: 'profile-123',
  userId: 'user-123',
  name: 'Mon CV',
  structuredData: mockCVData,
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('profile-actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.masterProfile.findFirst as jest.Mock).mockResolvedValue(mockProfile as any);
    (prisma.masterProfile.update as jest.Mock).mockResolvedValue(mockProfile as any);
  });

  describe('updateProfileItem', () => {
    it('should update an experience item', async () => {
      const updates: Partial<Experience> = { title: 'Senior Engineer' };

      const result = await updateProfileItem('experiences', 0, updates);

      expect(result.success).toBe(true);
      expect(prisma.masterProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'profile-123' },
          data: expect.objectContaining({
            structuredData: expect.objectContaining({
              experiences: expect.arrayContaining([
                expect.objectContaining({ title: 'Senior Engineer' }),
              ]),
            }),
          }),
        })
      );
    });

    it('should return error if not authenticated', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const result = await updateProfileItem('experiences', 0, { title: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Non authentifie');
    });

    it('should return error if profile not found', async () => {
      (prisma.masterProfile.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await updateProfileItem('experiences', 0, { title: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Profil non trouve');
    });

    it('should return error for invalid index', async () => {
      const result = await updateProfileItem('experiences', 99, { title: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Index invalide');
    });
  });

  describe('addProfileItem', () => {
    it('should add a new experience', async () => {
      const newExp: Experience = {
        title: 'New Role',
        company: 'New Company',
        location: 'Remote',
        startDate: 'Jan 2024',
        endDate: '',
        bullets: [],
      };

      const result = await addProfileItem('experiences', newExp);

      expect(result.success).toBe(true);
      expect(prisma.masterProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            structuredData: expect.objectContaining({
              experiences: expect.arrayContaining([
                expect.objectContaining({ title: 'New Role' }),
              ]),
            }),
          }),
        })
      );
    });

    it('should add a new project', async () => {
      const newProject: Project = {
        name: 'New Project',
        description: 'Description',
        techStack: ['Node.js'],
        year: '2024',
      };

      const result = await addProfileItem('projects', newProject);

      expect(result.success).toBe(true);
    });

    it('should add a new education entry', async () => {
      const newEdu: Education = {
        degree: 'PhD',
        school: 'MIT',
        location: 'Boston',
        startDate: '2024',
        endDate: '2028',
      };

      const result = await addProfileItem('education', newEdu);

      expect(result.success).toBe(true);
    });
  });

  describe('deleteProfileItem', () => {
    it('should delete an experience', async () => {
      const result = await deleteProfileItem('experiences', 0);

      expect(result.success).toBe(true);
      expect(prisma.masterProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            structuredData: expect.objectContaining({
              experiences: [],
            }),
          }),
        })
      );
    });

    it('should return error for invalid index', async () => {
      const result = await deleteProfileItem('experiences', 99);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Index invalide');
    });

    it('should delete a project', async () => {
      const result = await deleteProfileItem('projects', 0);

      expect(result.success).toBe(true);
    });

    it('should delete education', async () => {
      const result = await deleteProfileItem('education', 0);

      expect(result.success).toBe(true);
    });
  });
});
