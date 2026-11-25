import type { Response } from 'express';
import type { ApiResponse } from '@school-mgmt/shared';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function successResponse<T>(
  data?: T,
  message = 'OK',
  meta?: ApiResponse<T>['meta'],
): ApiResponse<T> {
  return { success: true, message, data, meta };
}

export function errorResponse(
  message: string,
  errors?: Record<string, string[]>,
): ApiResponse<never> {
  return { success: false, message, error: message, errors };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'OK',
  statusCode = 200,
  meta?: ApiResponse<T>['meta'],
): Response {
  return res.status(statusCode).json(successResponse(data, message, meta));
}

export function sendCreated<T>(res: Response, data: T, message = 'Created'): Response {
  return sendSuccess(res, data, message, 201);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: Record<string, string[]>,
): Response {
  return res.status(statusCode).json(errorResponse(message, errors));
}

export function sendPaginated<T>(
  res: Response,
  data: T,
  meta: PaginationMeta,
  message = 'OK',
): Response {
  return res.status(200).json(successResponse(data, message, meta));
}
