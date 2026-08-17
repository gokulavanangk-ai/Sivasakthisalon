import { z } from 'zod';

const emailSchema = z.string().email('Valid email is required').max(120);

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(3, 'Username or email is required').max(120),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
    confirmPassword: z.string(),
  }),
  // rear: validated manually for equality
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    email: emailSchema.optional(),
    username: z.string().trim().min(3).max(40).optional(),
  }),
});