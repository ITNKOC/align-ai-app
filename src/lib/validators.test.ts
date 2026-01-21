/**
 * Tests for lib/validators.ts
 * @module lib/validators.test
 */

import { validateCVFile, cvUploadSchema, FILE_CONSTANTS } from './validators';

describe('validateCVFile', () => {
  it('should accept valid PDF file under 10MB', () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

    const result = validateCVFile(file);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject non-PDF file', () => {
    const file = new File(['test content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const result = validateCVFile(file);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Seuls les fichiers PDF sont acceptes');
  });

  it('should reject file larger than 10MB', () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB

    const result = validateCVFile(file);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Le fichier ne doit pas depasser 10 Mo');
  });

  it('should accept file exactly at 10MB limit', () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // Exactly 10MB

    const result = validateCVFile(file);

    expect(result.success).toBe(true);
  });
});

describe('cvUploadSchema', () => {
  it('should validate correct PDF file', () => {
    const file = new File(['test'], 'cv.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 });

    const result = cvUploadSchema.safeParse({ file });

    expect(result.success).toBe(true);
  });

  it('should reject invalid file type', () => {
    const file = new File(['test'], 'cv.txt', { type: 'text/plain' });

    const result = cvUploadSchema.safeParse({ file });

    expect(result.success).toBe(false);
  });
});

describe('FILE_CONSTANTS', () => {
  it('should have correct max file size', () => {
    expect(FILE_CONSTANTS.MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    expect(FILE_CONSTANTS.MAX_FILE_SIZE_MB).toBe(10);
  });

  it('should only accept PDF types', () => {
    expect(FILE_CONSTANTS.ACCEPTED_PDF_TYPES).toContain('application/pdf');
    expect(FILE_CONSTANTS.ACCEPTED_PDF_TYPES.length).toBe(1);
  });
});
