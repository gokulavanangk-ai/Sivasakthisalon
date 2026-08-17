import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { Admin } from '../models/Admin';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    name?: string;
    email?: string;
    username?: string;
  };
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies?.token) return req.cookies.token as string;
  return null;
}

export const authenticate: RequestHandler = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized('Authentication required');

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    } catch {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const admin = await Admin.findById(payload.sub).select('-passwordHash -__v').lean();
    if (!admin || !admin.isActive) {
      throw ApiError.unauthorized('Account not found or disabled');
    }

    req.user = {
      id: String(admin._id),
      role: admin.role,
      name: admin.name,
      email: admin.email,
      username: admin.username,
    };
    next();
  },
);

export const isAdmin: RequestHandler = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
};