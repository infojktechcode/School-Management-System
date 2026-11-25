import { describe, expect, it } from 'vitest';
import {
  calculateMeanScore,
  calculatePagination,
  calculatePercentage,
  chunk,
  generateInvoiceNumber,
  getInitials,
  slugify,
  titleCase,
  uniqueBy,
} from './helpers';

describe('getInitials', () => {
  it('uses the first and last name', () => {
    expect(getInitials('John Kamau Doe')).toBe('JD');
    expect(getInitials('  mary  ')).toBe('M');
  });
});

describe('slugify', () => {
  it('builds URL safe slugs', () => {
    expect(slugify('Moi Avenue Primary School')).toBe('moi-avenue-primary-school');
    expect(slugify('  St. Mary`s  Academy! ')).toBe('st-marys-academy');
  });
});

describe('titleCase', () => {
  it('normalizes casing', () => {
    expect(titleCase('john DOE')).toBe('John Doe');
  });
});

describe('calculatePercentage', () => {
  it('returns a rounded percentage', () => {
    expect(calculatePercentage(45, 50)).toBe(90);
    expect(calculatePercentage(1, 3)).toBe(33.33);
  });

  it('returns 0 when the maximum is zero', () => {
    expect(calculatePercentage(10, 0)).toBe(0);
  });
});

describe('calculateMeanScore', () => {
  it('averages scores to two decimals', () => {
    expect(calculateMeanScore([50, 60, 70])).toBe(60);
    expect(calculateMeanScore([50, 61, 70])).toBe(60.33);
    expect(calculateMeanScore([])).toBe(0);
  });
});

describe('calculatePagination', () => {
  it('returns pagination metadata', () => {
    expect(calculatePagination(2, 10, 35)).toEqual({
      page: 2,
      limit: 10,
      total: 35,
      totalPages: 4,
      hasNext: true,
      hasPrev: true,
    });
  });

  it('handles empty result sets', () => {
    expect(calculatePagination(1, 20, 0)).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });
  });
});

describe('chunk', () => {
  it('splits arrays into groups', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe('uniqueBy', () => {
  it('keeps the first item for each key', () => {
    const items = [
      { id: 'a', value: 1 },
      { id: 'b', value: 2 },
      { id: 'a', value: 3 },
    ];
    expect(uniqueBy(items, (item) => item.id)).toEqual([
      { id: 'a', value: 1 },
      { id: 'b', value: 2 },
    ]);
  });
});

describe('generateInvoiceNumber', () => {
  it('builds a dated sequence number in Nairobi time', () => {
    expect(generateInvoiceNumber('INV', new Date('2026-01-05T10:00:00Z'), 7)).toBe(
      'INV-20260105-0007',
    );
  });
});
