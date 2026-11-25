import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { validateBody } from '../../middleware/validation.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as controller from './auth.controller.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from './dto/auth.dto.js';

export const authRouter: ExpressRouter = Router();

authRouter.post('/register', authLimiter, validateBody(registerSchema), asyncHandler(controller.register));
authRouter.post('/login', authLimiter, validateBody(loginSchema), asyncHandler(controller.login));
authRouter.post('/refresh', authLimiter, validateBody(refreshTokenSchema), asyncHandler(controller.refresh));
authRouter.post('/logout', authenticate, asyncHandler(controller.logout));
authRouter.post(
  '/forgot-password',
  authLimiter,
  validateBody(forgotPasswordSchema),
  asyncHandler(controller.forgotPassword),
);
authRouter.post(
  '/reset-password',
  authLimiter,
  validateBody(resetPasswordSchema),
  asyncHandler(controller.resetPassword),
);
authRouter.get('/me', authenticate, asyncHandler(controller.me));
authRouter.patch('/me', authenticate, validateBody(updateProfileSchema), asyncHandler(controller.updateMe));
authRouter.post(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  asyncHandler(controller.changePassword),
);
