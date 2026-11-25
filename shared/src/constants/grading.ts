import type { GradingScaleEntry } from '../types/examination.js';

/** Traditional Kenyan 8-4-4 style KCSE grading scale (configurable per school). */
export const KENYA_GRADING_SYSTEM: GradingScaleEntry[] = [
  { gradeName: 'A', minMarks: 80, maxMarks: 100, points: 12, remarks: 'Excellent' },
  { gradeName: 'A-', minMarks: 75, maxMarks: 79, points: 11, remarks: 'Very Good' },
  { gradeName: 'B+', minMarks: 70, maxMarks: 74, points: 10, remarks: 'Very Good' },
  { gradeName: 'B', minMarks: 65, maxMarks: 69, points: 9, remarks: 'Good' },
  { gradeName: 'B-', minMarks: 60, maxMarks: 64, points: 8, remarks: 'Fairly Good' },
  { gradeName: 'C+', minMarks: 55, maxMarks: 59, points: 7, remarks: 'Above Average' },
  { gradeName: 'C', minMarks: 50, maxMarks: 54, points: 6, remarks: 'Average' },
  { gradeName: 'C-', minMarks: 45, maxMarks: 49, points: 5, remarks: 'Below Average' },
  { gradeName: 'D+', minMarks: 40, maxMarks: 44, points: 4, remarks: 'Fair' },
  { gradeName: 'D', minMarks: 35, maxMarks: 39, points: 3, remarks: 'Low' },
  { gradeName: 'D-', minMarks: 30, maxMarks: 34, points: 2, remarks: 'Very Low' },
  { gradeName: 'E', minMarks: 0, maxMarks: 29, points: 1, remarks: 'Poor' },
];

/**
 * Kenya Competency Based Curriculum performance levels.
 * EE = Exceeding Expectation, ME = Meeting Expectation,
 * AE = Approaching Expectation, BE = Below Expectation.
 */
export const CBC_GRADING_SYSTEM: GradingScaleEntry[] = [
  { gradeName: 'EE', minMarks: 80, maxMarks: 100, points: 4, remarks: 'Exceeding Expectation' },
  { gradeName: 'ME', minMarks: 60, maxMarks: 79, points: 3, remarks: 'Meeting Expectation' },
  { gradeName: 'AE', minMarks: 40, maxMarks: 59, points: 2, remarks: 'Approaching Expectation' },
  { gradeName: 'BE', minMarks: 0, maxMarks: 39, points: 1, remarks: 'Below Expectation' },
];

/** CBC sub-strand rubric used for competency assessment. */
export const CBC_PERFORMANCE_LEVELS = [
  { level: 4, code: 'EE', label: 'Exceeding Expectation' },
  { level: 3, code: 'ME', label: 'Meeting Expectation' },
  { level: 2, code: 'AE', label: 'Approaching Expectation' },
  { level: 1, code: 'BE', label: 'Below Expectation' },
] as const;

export const DEFAULT_GRADING_SYSTEM = KENYA_GRADING_SYSTEM;
