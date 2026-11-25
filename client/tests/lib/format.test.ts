import { describe, expect, it } from 'vitest';
import { formatKes, formatNumber, formatPercent, getInitials } from '@/lib/format';

describe('getInitials', () => {
  it('uses the first and last name', () => {
    expect(getInitials('Grace Wanjiku Kimani')).toBe('GK');
  });

  it('handles a single name and blanks', () => {
    expect(getInitials('Grace')).toBe('G');
    expect(getInitials('   ')).toBe('U');
  });
});

describe('Kenyan formatting', () => {
  it('formats money as KES without decimals', () => {
    expect(formatKes(12500)).toContain('12,500');
    expect(formatKes(12500)).toContain('KES');
  });

  it('formats counts and percentages', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatPercent(87.456)).toBe('87.5%');
  });
});
