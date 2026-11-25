import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as authService from './auth.service.js';

export async function login(req: Request, res: Response): Promise<Response> {
  const result = await authService.login(req.body);
  return sendSuccess(res, result, 'Signed in successfully');
}

export async function register(req: Request, res: Response): Promise<Response> {
  const result = await authService.register(req.body);
  return sendSuccess(res, result, 'Account created successfully', 201);
}

export async function refresh(req: Request, res: Response): Promise<Response> {
  const tokens = await authService.refreshTokens(req.body.refreshToken);
  return sendSuccess(res, { tokens }, 'Session refreshed');
}

export async function logout(req: Request, res: Response): Promise<Response> {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  await authService.logout(token);
  return sendSuccess(res, null, 'Signed out');
}

export async function forgotPassword(req: Request, res: Response): Promise<Response> {
  await authService.forgotPassword(req.body);
  return sendSuccess(
    res,
    null,
    'If that email is registered, a password reset link has been sent',
  );
}

export async function resetPassword(req: Request, res: Response): Promise<Response> {
  await authService.resetPassword(req.body);
  return sendSuccess(res, null, 'Password updated successfully');
}

export async function me(req: Request, res: Response): Promise<Response> {
  const profile = await authService.getProfile(req.user!.id);
  return sendSuccess(res, profile, 'Profile fetched');
}

export async function updateMe(req: Request, res: Response): Promise<Response> {
  const profile = await authService.updateProfile(req.user!.id, req.body);
  return sendSuccess(res, profile, 'Profile updated');
}

export async function changePassword(req: Request, res: Response): Promise<Response> {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user!.id, currentPassword, newPassword);
  return sendSuccess(res, null, 'Password changed successfully');
}
