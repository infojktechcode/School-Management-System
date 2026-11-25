export const SCHOOL_TYPES = ['KINDERGARTEN', 'PRIMARY', 'SECONDARY', 'COMBINED'] as const;
export type SchoolType = (typeof SCHOOL_TYPES)[number];

export type ClassLevelSection =
  | 'PRE_PRIMARY'
  | 'PRIMARY'
  | 'JUNIOR_SECONDARY'
  | 'SENIOR_SECONDARY';

export interface ClassLevelDefinition {
  name: string;
  code: string;
  levelOrder: number;
  section: ClassLevelSection;
}

/**
 * Kenya's 2-6-3-3 competency based curriculum structure.
 * Pre-primary (2 years), primary (Grades 1-6), junior secondary (Grades 7-9)
 * and senior secondary (Grades 10-12).
 */
export const KENYA_CLASS_LEVELS: ClassLevelDefinition[] = [
  { name: 'PP1', code: 'PP1', levelOrder: 0, section: 'PRE_PRIMARY' },
  { name: 'PP2', code: 'PP2', levelOrder: 1, section: 'PRE_PRIMARY' },
  ...Array.from({ length: 6 }, (_, index) => ({
    name: `Grade ${index + 1}`,
    code: `G${index + 1}`,
    levelOrder: index + 2,
    section: 'PRIMARY' as const,
  })),
  ...Array.from({ length: 3 }, (_, index) => ({
    name: `Grade ${index + 7}`,
    code: `G${index + 7}`,
    levelOrder: index + 8,
    section: 'JUNIOR_SECONDARY' as const,
  })),
  ...Array.from({ length: 3 }, (_, index) => ({
    name: `Grade ${index + 10}`,
    code: `G${index + 10}`,
    levelOrder: index + 11,
    section: 'SENIOR_SECONDARY' as const,
  })),
];

export interface AcademicTermWindow {
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

/** Typical Kenyan school calendar. Schools may override these per academic year. */
export const KENYA_ACADEMIC_TERMS: AcademicTermWindow[] = [
  { name: 'Term 1', startMonth: 1, startDay: 5, endMonth: 4, endDay: 10 },
  { name: 'Term 2', startMonth: 5, startDay: 4, endMonth: 8, endDay: 7 },
  { name: 'Term 3', startMonth: 9, startDay: 1, endMonth: 11, endDay: 27 },
];

export const DEFAULT_SCHOOL_SETTINGS = {
  currency: 'KES',
  timezone: 'Africa/Nairobi',
  dateFormat: 'DD/MM/YYYY',
  locale: 'en-KE',
} as const;

/** Kenyan mobile money and bank payment channels supported at launch. */
export const PAYMENT_METHODS = ['MPESA', 'BANK', 'CASH', 'CHEQUE'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Convenience lookup used by enrolment and report card screens. */
export const CLASS_LEVEL_BY_NAME = new Map(
  KENYA_CLASS_LEVELS.map((level) => [level.name, level]),
);
