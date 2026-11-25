import { z } from 'zod';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
} from '@school-mgmt/shared';

export {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
};

export type {
  LoginInput,
  RegisterInput,
};

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(2).max(100).optional(),
    middleName: z.string().trim().max(100).optional(),
    lastName: z.string().trim().min(2).max(100).optional(),
    phone: z
      .string()
      .refine((value) => /^(?:\+254|254|0)(?:7\d{8}|1\d{8})$/.test(value.replace(/[\s-]/g, '')), {
        message: 'Must be a valid Kenyan phone number',
      })
      .optional(),
    avatarUrl: z.string().url().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

export const resetPasswordTokenSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
