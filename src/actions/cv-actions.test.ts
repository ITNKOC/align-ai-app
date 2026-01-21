/**
 * Tests for cv-actions.ts Server Actions
 * @module actions/cv-actions.test
 */

// Mock dependencies before importing the module
jest.mock('@/lib/db', () => ({
  prisma: {
    masterProfile: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/gemini', () => ({
  generateJSON: jest.fn(),
}));

jest.mock('@/lib/pdf-parser', () => ({
  extractTextFromPDF: jest.fn(),
}));

jest.mock('./auth-actions', () => ({
  getSession: jest.fn(),
}));

import { uploadAndParseCV, getProfile, getUserProfiles } from './cv-actions';
import { prisma } from '@/lib/db';
import { generateJSON } from '@/lib/gemini';
import { extractTextFromPDF } from '@/lib/pdf-parser';
import { getSession } from './auth-actions';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGenerateJSON = generateJSON as jest.MockedFunction<typeof generateJSON>;
const mockExtractText = extractTextFromPDF as jest.MockedFunction<typeof extractTextFromPDF>;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe('uploadAndParseCV', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject unauthenticated users', async () => {
    mockGetSession.mockResolvedValue(null);

    const formData = new FormData();
    formData.append('cv', new File(['test'], 'test.pdf', { type: 'application/pdf' }));

    const result = await uploadAndParseCV(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Vous devez être connecté pour télécharger un CV');
  });

  it('should reject missing file', async () => {
    mockGetSession.mockResolvedValue({ id: 'user-123', email: 'test@test.com', fullName: 'Test User' });

    const formData = new FormData();
    // No file appended

    const result = await uploadAndParseCV(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Aucun fichier fourni');
  });

  it('should reject non-PDF files', async () => {
    mockGetSession.mockResolvedValue({ id: 'user-123', email: 'test@test.com', fullName: 'Test User' });

    const formData = new FormData();
    formData.append('cv', new File(['test'], 'test.docx', { type: 'application/msword' }));

    const result = await uploadAndParseCV(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Seuls les fichiers PDF sont acceptés');
  });

  it('should reject files larger than 10MB', async () => {
    mockGetSession.mockResolvedValue({ id: 'user-123', email: 'test@test.com', fullName: 'Test User' });

    // Create a mock file with size > 10MB
    const largeFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    const formData = new FormData();
    formData.append('cv', largeFile);

    const result = await uploadAndParseCV(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Le fichier ne doit pas dépasser 10 Mo');
  });

  it('should reject empty or unreadable PDFs', async () => {
    mockGetSession.mockResolvedValue({ id: 'user-123', email: 'test@test.com', fullName: 'Test User' });
    mockExtractText.mockResolvedValue('short'); // Less than 100 chars

    const formData = new FormData();
    formData.append('cv', new File(['test'], 'test.pdf', { type: 'application/pdf' }));

    const result = await uploadAndParseCV(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Le PDF semble vide ou illisible. Veuillez vérifier votre fichier.');
  });

  it('should successfully parse and save a valid CV', async () => {
    const mockCVData = {
      personalInfo: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        location: 'Paris',
      },
      experiences: [],
      education: [],
      projects: [],
      skills: {
        languages: ['JavaScript'],
        frameworks: ['React'],
        aiAndData: [],
        toolsAndCloud: [],
        softSkills: [],
      },
      languages: [],
    };

    mockGetSession.mockResolvedValue({ id: 'user-123', email: 'test@test.com', fullName: 'Test User' });
    mockExtractText.mockResolvedValue('A'.repeat(150)); // Valid length
    mockGenerateJSON.mockResolvedValue(mockCVData);
    (mockPrisma.masterProfile.create as jest.Mock).mockResolvedValue({
      id: 'profile-123',
      userId: 'user-123',
      name: 'CV - John Doe',
      rawText: 'A'.repeat(150),
      structuredData: mockCVData,
    });

    const formData = new FormData();
    formData.append('cv', new File(['test'], 'test.pdf', { type: 'application/pdf' }));

    const result = await uploadAndParseCV(formData);

    expect(result.success).toBe(true);
    expect(result.profileId).toBe('profile-123');
    expect(result.cvData).toEqual(mockCVData);
  });
});

describe('getProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject unauthenticated users', async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await getProfile('profile-123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Non authentifié');
  });

  it('should return error for non-existent profile', async () => {
    mockGetSession.mockResolvedValue({ id: 'user-123', email: 'test@test.com', fullName: 'Test User' });
    (mockPrisma.masterProfile.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await getProfile('non-existent');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Profil non trouvé');
  });

  it('should return profile for valid request', async () => {
    const mockProfile = {
      id: 'profile-123',
      name: 'Mon CV',
      structuredData: { personalInfo: { fullName: 'John' } },
      rawText: 'CV content',
    };

    mockGetSession.mockResolvedValue({ id: 'user-123', email: 'test@test.com', fullName: 'Test User' });
    (mockPrisma.masterProfile.findFirst as jest.Mock).mockResolvedValue(mockProfile);

    const result = await getProfile('profile-123');

    expect(result.success).toBe(true);
    expect(result.profile?.id).toBe('profile-123');
  });
});

describe('getUserProfiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject unauthenticated users', async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await getUserProfiles();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Non authentifié');
  });

  it('should return empty array for user with no profiles', async () => {
    mockGetSession.mockResolvedValue({ id: 'user-123', email: 'test@test.com', fullName: 'Test User' });
    (mockPrisma.masterProfile.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getUserProfiles();

    expect(result.success).toBe(true);
    expect(result.profiles).toEqual([]);
  });

  it('should return all profiles for authenticated user', async () => {
    const mockProfiles = [
      { id: 'p1', name: 'CV 1', structuredData: {}, createdAt: new Date() },
      { id: 'p2', name: 'CV 2', structuredData: {}, createdAt: new Date() },
    ];

    mockGetSession.mockResolvedValue({ id: 'user-123', email: 'test@test.com', fullName: 'Test User' });
    (mockPrisma.masterProfile.findMany as jest.Mock).mockResolvedValue(mockProfiles);

    const result = await getUserProfiles();

    expect(result.success).toBe(true);
    expect(result.profiles?.length).toBe(2);
  });
});
