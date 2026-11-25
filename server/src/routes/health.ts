import { Router, type Router as ExpressRouter } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const healthRouter: ExpressRouter = Router();

healthRouter.get('/', (_req, res) => {
  return sendSuccess(res, {
    status: 'healthy',
    service: 'school-management-api',
    version: process.env.npm_package_version ?? '1.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get(
  '/db',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    return sendSuccess(res, { status: 'healthy', database: 'connected' });
  }),
);
