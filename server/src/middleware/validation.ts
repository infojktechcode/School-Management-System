import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { sendError } from '../utils/apiResponse.js';

type RequestSource = 'body' | 'query' | 'params';

function fieldErrors(error: ZodError): Record<string, string[]> {
  const flattened = error.flatten();
  return flattened.fieldErrors as Record<string, string[]>;
}

/**
 * Parses and replaces the request segment with the schema output, so route
 * handlers receive coerced, trimmed and defaulted values — never raw input.
 */
export function validate(schema: ZodTypeAny, source: RequestSource = 'body'): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return sendError(res, 400, 'Validation failed', fieldErrors(result.error));
    }

    (req as unknown as Record<RequestSource, unknown>)[source] = result.data;
    return next();
  };
}

export const validateBody = (schema: ZodTypeAny): RequestHandler => validate(schema, 'body');
export const validateQuery = (schema: ZodTypeAny): RequestHandler => validate(schema, 'query');
export const validateParams = (schema: ZodTypeAny): RequestHandler => validate(schema, 'params');
