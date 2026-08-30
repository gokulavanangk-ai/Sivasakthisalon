import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * JWT secret is required for admin auth. In dev/test a missing value fails
 * fast. On a serverless deploy a missing secret must NOT take the entire site
 * down in a FUNCTION_INVOCATION_FAILED crash — public endpoints (services,
 * gallery, bookings, health) don't need JWT. We degrade to an ephemeral secret
 * and log a very loud warning instead; admin sessions will not survive across
 * instances until JWT_SECRET is configured.
 */
function readJwtSecret(): string {
  const value = process.env.JWT_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === 'test') return 'test-secret';
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[sivasakthi-salon-api] CRITICAL: JWT_SECRET is not set in production. ' +
        'Admin authentication is degraded until Vercel environment variable JWT_SECRET is configured.',
    );
    return crypto.randomBytes(32).toString('hex');
  }
  throw new Error('Missing required environment variable: JWT_SECRET');
}

export const env = {
  port: parseInt(process.env.PORT ?? '5000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongodbUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/sivasakthi_salon',
  jwtSecret: readJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  adminEmail: process.env.ADMIN_EMAIL ?? '',
  adminPassword: process.env.ADMIN_PASSWORD ?? '',
  storageProvider: (process.env.STORAGE_PROVIDER ?? 'local') as 'local' | 'cloudinary',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
  isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
};