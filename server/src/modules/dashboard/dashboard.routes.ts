import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requirePermissions } from '../../middleware/authorization.js';
import { tenant, requireTenant } from '../../middleware/tenant.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getDashboard } from './dashboard.service.js';

export const dashboardRouter: ExpressRouter = Router();

dashboardRouter.get(
  '/',
  authenticate,
  tenant,
  requireTenant,
  requirePermissions('student:read'),
  asyncHandler(async (req, res) => {
    const payload = await getDashboard(req.schoolId!);
    return sendSuccess(res, payload, 'Dashboard data fetched');
  }),
);
