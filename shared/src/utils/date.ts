import {
  differenceInCalendarDays,
  differenceInYears,
  format,
  isValid,
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { DEFAULT_SCHOOL_SETTINGS } from '../constants/academic.js';

export type DateInput = Date | string | number;

export const SCHOOL_TIMEZONE = DEFAULT_SCHOOL_SETTINGS.timezone;
export const DEFAULT_DATE_FORMAT = 'dd/MM/yyyy';
export const DEFAULT_DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

function toDate(value: DateInput): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (!isValid(date)) {
    throw new Error(`Invalid date: ${String(value)}`);
  }
  return date;
}

/** Formats an instant in the school's timezone (Africa/Nairobi by default). */
export function formatDate(
  value: DateInput,
  pattern: string = DEFAULT_DATE_FORMAT,
  timeZone: string = SCHOOL_TIMEZONE,
): string {
  return formatInTimeZone(toDate(value), timeZone, pattern);
}

export function formatDateTime(
  value: DateInput,
  pattern: string = DEFAULT_DATETIME_FORMAT,
  timeZone: string = SCHOOL_TIMEZONE,
): string {
  return formatInTimeZone(toDate(value), timeZone, pattern);
}

export function calculateAge(dateOfBirth: DateInput, asOf: DateInput = new Date()): number {
  return differenceInYears(toDate(asOf), toDate(dateOfBirth));
}

/** Inclusive date-range check. Accepts Date, ISO or YYYY-MM-DD strings. */
export function isDateInRange(value: DateInput, start: DateInput, end: DateInput): boolean {
  const time = toDate(value).getTime();
  return time >= toDate(start).getTime() && time <= toDate(end).getTime();
}

export function daysBetween(start: DateInput, end: DateInput): number {
  return differenceInCalendarDays(toDate(end), toDate(start));
}

export function getCurrentTerm<T extends { name: string; startDate: DateInput; endDate: DateInput }>(
  terms: T[],
  date: DateInput = new Date(),
): T | undefined {
  return terms.find((term) => isDateInRange(date, term.startDate, term.endDate));
}

/** Formats a Date as YYYY-MM-DD in the school timezone (for <input type="date">). */
export function toDateInputValue(value: DateInput, timeZone: string = SCHOOL_TIMEZONE): string {
  return formatInTimeZone(toDate(value), timeZone, 'yyyy-MM-dd');
}

export { format, toDate };
