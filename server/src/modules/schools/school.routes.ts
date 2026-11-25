import { Router, type Router as ExpressRouter } from 'express';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { authenticate } from '../../middleware/auth.js';
import { tenant, requireTenant } from '../../middleware/tenant.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const schoolRouter: ExpressRouter = Router();

schoolRouter.get(
  '/public',
  asyncHandler(async (_req, res) => {
    const schools = await prisma.school.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, schools, 'Schools fetched');
  }),
);

schoolRouter.get(
  '/current',
  authenticate,
  tenant,
  requireTenant,
  asyncHandler(async (req, res) => {
    const school = await prisma.school.findUnique({
      where: { id: req.schoolId! },
      select: { id: true, name: true, code: true },
    });

    if (!school) {
      throw new AppError(404, 'School not found');
    }

    return sendSuccess(res, school, 'School fetched');
  }),
);
