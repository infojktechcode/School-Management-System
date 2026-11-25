import { describe, expect, it } from 'vitest';
import {
  calculateAge,
  daysBetween,
  formatDate,
  formatDateTime,
  getCurrentTerm,
  isDateInRange,
} from './date';

describe('formatDate', () => {
  it('formats dates in Africa/Nairobi timezone by default', () => {
    expect(formatDate(new Date('2026-01-05T10:00:00Z'))).toBe('05/01/2026');
  });

  it('rolls over the calendar day for late UTC times', () => {
    expect(formatDate('2026-01-05T22:30:00Z')).toBe('06/01/2026');
  });

  it('supports a custom pattern', () => {
    expect(formatDate('2026-01-05T10:00:00Z', 'yyyy-MM-dd')).toBe('2026-01-05');
  });
});

describe('formatDateTime', () => {
  it('includes the time in Nairobi time', () => {
    expect(formatDateTime('2026-01-05T10:00:00Z')).toBe('05/01/2026 13:00');
  });
});

describe('calculateAge', () => {
  it('counts completed years', () => {
    expect(calculateAge('2008-01-01', new Date('2026-01-01'))).toBe(18);
    expect(calculateAge('2008-06-01', new Date('2026-01-01'))).toBe(17);
  });
});

describe('isDateInRange', () => {
  it('includes both boundary dates', () => {
    expect(isDateInRange('2026-01-01', '2026-01-01', '2026-04-10')).toBe(true);
    expect(isDateInRange('2026-04-10', '2026-01-01', '2026-04-10')).toBe(true);
    expect(isDateInRange('2026-04-11', '2026-01-01', '2026-04-10')).toBe(false);
  });
});

describe('daysBetween', () => {
  it('returns whole days between dates', () => {
    expect(daysBetween('2026-01-01', '2026-01-10')).toBe(9);
  });
});

describe('getCurrentTerm', () => {
  const terms = [
    { name: 'Term 1', startDate: '2026-01-05', endDate: '2026-04-10' },
    { name: 'Term 2', startDate: '2026-05-04', endDate: '2026-08-07' },
    { name: 'Term 3', startDate: '2026-09-01', endDate: '2026-11-27' },
  ];

  it('returns the term containing the date', () => {
    expect(getCurrentTerm(terms, new Date('2026-05-20'))?.name).toBe('Term 2');
  });

  it('returns undefined outside every term', () => {
    expect(getCurrentTerm(terms, new Date('2026-12-15'))).toBeUndefined();
  });
});
