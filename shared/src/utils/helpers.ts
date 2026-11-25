import { formatInTimeZone } from 'date-fns-tz';
import { DEFAULT_SCHOOL_SETTINGS } from '../constants/academic.js';
import { roundMoney } from './currency.js';

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts.at(-1)!.charAt(0)}`.toUpperCase();
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(' ');
}

export function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculatePercentage(obtained: number, maximum: number, decimals = 2): number {
  if (!Number.isFinite(obtained) || !Number.isFinite(maximum) || maximum <= 0) return 0;
  return roundTo((obtained / maximum) * 100, decimals);
}

export function calculateMeanScore(scores: number[], decimals = 2): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, score) => sum + score, 0);
  return roundTo(total / scores.length, decimals);
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function calculatePagination(page: number, limit: number, total: number): PaginationMeta {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.max(1, Math.floor(limit));
  const safeTotal = Math.max(0, Math.floor(total));
  const totalPages = Math.ceil(safeTotal / safeLimit);

  return {
    page: safePage,
    limit: safeLimit,
    total: safeTotal,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}

export function chunk<T>(items: T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error('Chunk size must be a positive integer');
  }

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export function uniqueBy<T, K>(items: T[], key: (item: T) => K): T[] {
  const seen = new Set<K>();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Builds a human-readable, sortable invoice number: INV-20260105-0007.
 * The sequence is supplied by the caller so it can be allocated in a
 * database transaction without collisions.
 */
export function generateInvoiceNumber(
  prefix: string,
  date: Date,
  sequence: number,
  timeZone: string = DEFAULT_SCHOOL_SETTINGS.timezone,
): string {
  const datePart = formatInTimeZone(date, timeZone, 'yyyyMMdd');
  return `${prefix.toUpperCase()}-${datePart}-${String(sequence).padStart(4, '0')}`;
}

/** Safely divides a money amount across weights, keeping the total exact. */
export function allocateMoney(total: number, weights: number[]): number[] {
  if (weights.length === 0) return [];
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightTotal <= 0) return weights.map(() => 0);

  const allocation = weights.map((weight) => roundMoney((total * weight) / weightTotal));
  const allocated = allocation.reduce((sum, amount) => sum + amount, 0);
  allocation[allocation.length - 1] = roundMoney(
    allocation[allocation.length - 1]! + (roundMoney(total) - allocated),
  );
  return allocation;
}
