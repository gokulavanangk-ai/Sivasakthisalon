import type { Request, Response } from 'express';
import { login, changePassword, updateProfile } from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import type { AuthRequest } from '../middleware/auth';

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  const result = await login(identifier, password);

  res.setHeader(
    'Set-Cookie',
    `token=${result.token}; HttpOnly; ${
      env.isProduction ? 'SameSite=None; Secure;' : 'SameSite=Lax;'
    } Path=/; Max-Age=${7 * 24 * 60 * 60}`,
  );

  // `token` is the same JWT as the cookie. Cross-site deployments (e.g.
  // Vercel frontend -> Render API) can hit it back via `Authorization:
  // Bearer` when the browser rejects the third-party cookie.
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result.admin,
    token: result.token,
  });
});

export const logoutHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.setHeader(
    'Set-Cookie',
    `token=; HttpOnly; ${env.isProduction ? 'SameSite=None; Secure;' : 'SameSite=Lax;'} Path=/; Max-Age=0`,
  );
  ok(res, null, 'Logged out');
});

export const meHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  ok(res, req.user);
});

export const changePasswordHandler = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      throw ApiError.badRequest('New password and confirm password do not match', 'PASSWORD_MISMATCH');
    }
    await changePassword(req.user.id, currentPassword, newPassword);
    ok(res, null, 'Password updated');
  },
);

export const updateProfileHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { name, email, username } = req.body;
  const updated = await updateProfile(req.user.id, { name, email, username });
  ok(res, updated, 'Profile updated');
});