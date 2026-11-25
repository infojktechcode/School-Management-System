import Decimal from 'decimal.js';
import { DEFAULT_SCHOOL_SETTINGS } from '../constants/academic.js';

export type MoneyInput = number | string;
export type CurrencyCode = 'KES' | 'USD' | 'EUR' | 'GBP' | 'UGX' | 'TZS';
export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

/**
 * All monetary values are stored as decimal(12,2). Round with banker-safe
 * half-up semantics so invoice totals never drift through floating point.
 */
export function roundMoney(amount: MoneyInput): number {
  return new Decimal(amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

/** Parses "KES 1,234.50" style user input into a number. */
export function parseAmount(value: MoneyInput): number {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Amount must be a finite number');
    }
    return value;
  }

  const cleaned = value.replace(/[^0-9.-]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.') {
    throw new Error(`Cannot parse amount from "${value}"`);
  }

  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Cannot parse amount from "${value}"`);
  }
  return parsed;
}

/** Formats a monetary value for display, e.g. `KES 1,234.50`. */
export function formatCurrency(
  amount: MoneyInput,
  currency: CurrencyCode = DEFAULT_SCHOOL_SETTINGS.currency,
  locale: string = DEFAULT_SCHOOL_SETTINGS.locale,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundMoney(amount));
}

export function calculateInvoiceStatus(total: MoneyInput, paid: MoneyInput): InvoiceStatus {
  const totalAmount = new Decimal(total);
  const paidAmount = new Decimal(paid);

  if (paidAmount.lte(0)) return 'UNPAID';
  if (paidAmount.lt(totalAmount)) return 'PARTIAL';
  return 'PAID';
}

export function sumAmounts(amounts: MoneyInput[]): number {
  return amounts
    .reduce((total, amount) => total.plus(new Decimal(amount)), new Decimal(0))
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toNumber();
}

export { Decimal };
