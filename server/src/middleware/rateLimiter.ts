import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

const baseOptions = {
  standardHeaders: 'draft-7' as const,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    error: 'Too many requests. Please try again later.',
  },
};

/** Global API limiter: 300 requests per 15 minutes per IP. */
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 300,
});

/** Stricter limiter for login and password-reset endpoints. */
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
});

/** Payment callbacks can burst; allow a wider but still bounded window. */
export const paymentLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  limit: 60,
});
