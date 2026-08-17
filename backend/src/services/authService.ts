import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Admin } from '../models/Admin';
import { ApiError } from '../utils/ApiError';

export interface AdminPayload {
  id: string;
  role: string;
  name: string;
  username: string;
  email: string;
}

export async function login(identifier: string, password: string): Promise<{ token: string; admin: AdminPayload }> {
  const admin = await Admin.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier },
    ],
  });

  if (!admin || !admin.isActive) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const valid = await admin.comparePassword(password);
  if (!valid) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  await Admin.updateOne({ _id: admin._id }, { lastLoginAt: new Date() });

  const adminPayload: AdminPayload = {
    id: admin._id.toString(),
    role: admin.role,
    name: admin.name,
    username: admin.username,
    email: admin.email,
  };

  const token = jwt.sign({ sub: admin._id.toString(), role: admin.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

  return { token, admin: adminPayload };
}

export async function changePassword(
  adminId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const admin = await Admin.findById(adminId);
  if (!admin) throw ApiError.notFound('Admin not found');

  const valid = await admin.comparePassword(currentPassword);
  if (!valid) throw ApiError.badRequest('Current password is incorrect', 'INVALID_PASSWORD');

  admin.passwordHash = await argon2.hash(newPassword);
  await admin.save();
}

export async function updateProfile(
  adminId: string,
  input: { name?: string; email?: string; username?: string },
): Promise<AdminPayload> {
  const admin = await Admin.findById(adminId);
  if (!admin) throw ApiError.notFound('Admin not found');

  if (input.name) admin.name = input.name;
  if (input.email) admin.email = input.email;
  if (input.username) admin.username = input.username;

  try {
    await admin.save();
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code === 11000) throw ApiError.conflict('Email or username already in use');
    throw err;
  }

  return {
    id: admin._id.toString(),
    role: admin.role,
    name: admin.name,
    username: admin.username,
    email: admin.email,
  };
}

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}