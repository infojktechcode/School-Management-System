import type { Prisma } from '@prisma/client';

/**
 * Always scope a tenant-owned query by school. Spreading this helper into a
 * where clause is the supported way to keep multi-tenant isolation explicit
 * at every call site.
 */
export function tenantWhere<T extends Record<string, unknown>>(
  schoolId: string,
  where: T = {} as T,
): T & { schoolId: string } {
  if (!schoolId) {
    throw new Error('tenantWhere requires a schoolId');
  }
  return { ...where, schoolId };
}

/** Adds `deletedAt: null` to reads that should exclude soft-deleted rows. */
export function activeWhere<T extends Record<string, unknown>>(
  where: T = {} as T,
): T & { deletedAt: null } {
  return { ...where, deletedAt: null };
}

export function softDeleteData(): { deletedAt: Date } {
  return { deletedAt: new Date() };
}

export function restoreData(): { deletedAt: null } {
  return { deletedAt: null };
}

/**
 * Prisma's transaction helper. Wrapped so services can compose multi-tenant
 * writes atomically without importing the client directly.
 */
export type TransactionClient = Prisma.TransactionClient;
