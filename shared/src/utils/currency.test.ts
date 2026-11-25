import { describe, expect, it } from 'vitest';
import {
  calculateInvoiceStatus,
  formatCurrency,
  parseAmount,
  roundMoney,
  sumAmounts,
} from './currency';

describe('roundMoney', () => {
  it('rounds half up to two decimal places', () => {
    expect(roundMoney(10.005)).toBe(10.01);
    expect(roundMoney(10.004)).toBe(10);
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });
});

describe('formatCurrency', () => {
  it('formats KES amounts with thousands separators and two decimals', () => {
    const formatted = formatCurrency(1234.5);
    expect(formatted).toMatch(/^KES\s1,234\.50$/);
  });

  it('supports an explicit currency', () => {
    expect(formatCurrency(99, 'USD')).toContain('99.00');
  });
});

describe('parseAmount', () => {
  it('parses numeric strings with separators', () => {
    expect(parseAmount('1,234.50')).toBe(1234.5);
    expect(parseAmount('KES 500')).toBe(500);
  });

  it('returns numbers unchanged', () => {
    expect(parseAmount(42.25)).toBe(42.25);
  });

  it('rejects non-numeric input', () => {
    expect(() => parseAmount('abc')).toThrow();
  });
});

describe('calculateInvoiceStatus', () => {
  it('marks an unpaid invoice', () => {
    expect(calculateInvoiceStatus(1000, 0)).toBe('UNPAID');
  });

  it('marks a partially paid invoice', () => {
    expect(calculateInvoiceStatus(1000, 250)).toBe('PARTIAL');
  });

  it('marks a fully paid invoice', () => {
    expect(calculateInvoiceStatus(1000, 1000)).toBe('PAID');
    expect(calculateInvoiceStatus(1000, 1200)).toBe('PAID');
  });
});

describe('sumAmounts', () => {
  it('sums decimals without floating point drift', () => {
    expect(sumAmounts([0.1, 0.2, 0.3])).toBe(0.6);
    expect(sumAmounts(['100.50', 200])).toBe(300.5);
  });
});
