import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    errorCode: 'RATE_LIMITED',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please wait and try again.',
    errorCode: 'RATE_LIMITED',
  },
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.includes('available'),
  message: {
    success: false,
    message: 'Too many booking requests. Please contact us on WhatsApp.',
    errorCode: 'RATE_LIMITED',
  },
});

/**
 * Stricter limit for authenticated media upload endpoints — each request pushes
 * a full file to Cloudinary, so a slow/per-IP flood is expensive and pointless.
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many uploads, please wait and try again.',
    errorCode: 'RATE_LIMITED',
  },
});