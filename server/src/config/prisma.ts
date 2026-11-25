import { Prisma, PrismaClient } from '@prisma/client';
import { config } from './index.js';

const softDeleteModels = new Set(
  Prisma.dmmf.datamodel.models
    .filter((model) => model.fields.some((field) => field.name === 'deletedAt'))
    .map((model) => model.name),
);

function withSoftDeleteFilter(model: string, args: Record<string, unknown>): Record<string, unknown> {
  if (!softDeleteModels.has(model)) return args;

  const where = (args.where ?? {}) as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(where, 'deletedAt')) return args;

  return { ...args, where: { ...where, deletedAt: null } };
}

const basePrisma = new PrismaClient({
  log: config.isProduction ? ['error', 'warn'] : ['error', 'warn'],
});

/**
 * Global read filter for soft-deletable models. Services can still read
 * deleted rows explicitly by passing `deletedAt` in their where clause.
 */
export const prisma = basePrisma.$extends({
  name: 'softDelete',
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        return query(withSoftDeleteFilter(model, args as Record<string, unknown>) as typeof args);
      },
      async findFirst({ model, args, query }) {
        return query(withSoftDeleteFilter(model, args as Record<string, unknown>) as typeof args);
      },
      async count({ model, args, query }) {
        return query(withSoftDeleteFilter(model, args as Record<string, unknown>) as typeof args);
      },
      async aggregate({ model, args, query }) {
        return query(withSoftDeleteFilter(model, args as Record<string, unknown>) as typeof args);
      },
    },
  },
});

export type ExtendedPrismaClient = typeof prisma;
export { Prisma };
