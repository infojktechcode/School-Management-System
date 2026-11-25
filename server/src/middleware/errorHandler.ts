import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { config } from '../config/index.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    options: { code?: string; details?: Record<string, string[]> } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

export function notFoundHandler(req: Request, res: Response): Response {
  return sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
}

function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
  status: number;
  message: string;
} {
  switch (error.code) {
    case 'P2002':
      return { status: 409, message: 'A record with these details already exists' };
    case 'P2025':
      return { status: 404, message: 'The requested record was not found' };
    case 'P2003':
      return { status: 400, message: 'The request references a record that does not exist' };
    default:
      return { status: 400, message: 'The database rejected this request' };
  }
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  if (res.headersSent) return next(error);

  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.message, error.details);
  }

  if (error instanceof ZodError) {
    return sendError(
      res,
      400,
      'Validation failed',
      error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { status, message } = handlePrismaError(error);
    return sendError(res, status, message);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    logger.error('Prisma validation error', { error: error.message });
    return sendError(res, 400, 'Invalid database query');
  }

  logger.error('Unhandled request error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  const message = config.isProduction ? 'Internal server error' : String(error);
  return sendError(res, 500, message);
}
