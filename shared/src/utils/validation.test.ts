import { describe, expect, it } from 'vitest';
import {
  calculateGrade,
  isValidEmail,
  isValidKenyanPhone,
  normalizeKenyanPhone,
  validatePasswordStrength,
} from './validation';

describe('isValidEmail', () => {
  it('accepts normal addresses', () => {
    expect(isValidEmail('teacher@school.ac.ke')).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
  });
});

describe('isValidKenyanPhone', () => {
  it('accepts local and international formats', () => {
    expect(isValidKenyanPhone('0712345678')).toBe(true);
    expect(isValidKenyanPhone('+254712345678')).toBe(true);
    expect(isValidKenyanPhone('254712345678')).toBe(true);
    expect(isValidKenyanPhone('0112345678')).toBe(true);
  });

  it('rejects invalid prefixes and lengths', () => {
    expect(isValidKenyanPhone('071234567')).toBe(false);
    expect(isValidKenyanPhone('0812345678')).toBe(false);
    expect(isValidKenyanPhone('+255712345678')).toBe(false);
  });
});

describe('normalizeKenyanPhone', () => {
  it('normalizes all accepted formats to +254', () => {
    expect(normalizeKenyanPhone('0712345678')).toBe('+254712345678');
    expect(normalizeKenyanPhone('254712345678')).toBe('+254712345678');
    expect(normalizeKenyanPhone('+254712345678')).toBe('+254712345678');
    expect(normalizeKenyanPhone('0112345678')).toBe('+254112345678');
  });

  it('returns null for invalid numbers', () => {
    expect(normalizeKenyanPhone('12345')).toBeNull();
  });
});

describe('validatePasswordStrength', () => {
  it('accepts a strong password', () => {
    expect(validatePasswordStrength('Str0ng!pass').valid).toBe(true);
  });

  it('reports each missing requirement', () => {
    const result = validatePasswordStrength('short');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('rejects passwords without a special character', () => {
    expect(validatePasswordStrength('Str0ngpass').valid).toBe(false);
  });
});

describe('calculateGrade', () => {
  it('maps marks onto the Kenya grading scale', () => {
    expect(calculateGrade(100)?.gradeName).toBe('A');
    expect(calculateGrade(80)?.gradeName).toBe('A');
    expect(calculateGrade(79)?.gradeName).toBe('A-');
    expect(calculateGrade(30)?.gradeName).toBe('D-');
    expect(calculateGrade(0)?.gradeName).toBe('E');
  });

  it('returns undefined outside the scale', () => {
    expect(calculateGrade(101)).toBeUndefined();
    expect(calculateGrade(-1)).toBeUndefined();
  });
});
