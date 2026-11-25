import { KENYA_GRADING_SYSTEM } from '../constants/grading.js';
import type { GradingScaleEntry } from '../types/examination.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const KENYAN_PHONE_PATTERN = /^(?:\+254|254|0)(?:7\d{8}|1\d{8})$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/**
 * Accepts +2547XXXXXXXX, 2547XXXXXXXX, 07XXXXXXXX and the equivalent
 * Airtel/Telkom 01XXXXXXXX ranges.
 */
export function isValidKenyanPhone(value: string): boolean {
  return KENYAN_PHONE_PATTERN.test(value.replace(/[\s-]/g, ''));
}

/** Returns the number in E.164 form (+2547XXXXXXXX) or null when invalid. */
export function normalizeKenyanPhone(value: string): string | null {
  const cleaned = value.replace(/[\s-]/g, '');
  if (!isValidKenyanPhone(cleaned)) return null;

  if (cleaned.startsWith('+254')) return cleaned;
  if (cleaned.startsWith('254')) return `+${cleaned}`;
  return `+254${cleaned.slice(1)}`;
}

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

export function validatePasswordStrength(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Password must be at least 8 characters long');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain a number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain a special character');

  return { valid: errors.length === 0, errors };
}

/** Maps a percentage score onto a configurable grading scale. */
export function calculateGrade(
  marks: number,
  scale: GradingScaleEntry[] = KENYA_GRADING_SYSTEM,
): GradingScaleEntry | undefined {
  return scale.find((entry) => marks >= entry.minMarks && marks <= entry.maxMarks);
}
