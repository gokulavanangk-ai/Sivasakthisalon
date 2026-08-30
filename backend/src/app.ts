import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { apiLimiter } from './middleware/rateLimiter';
import { connectDb, isDbConnected } from './config/db';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import salonRoutes from './routes/salon.routes';
import serviceRoutes from './routes/service.routes';
import hairstyleRoutes from './routes/hairstyle.routes';
import galleryRoutes from './routes/gallery.routes';
import reviewRoutes from './routes/review.routes';
import bookingRoutes from './routes/booking.routes';
import businessHoursRoutes from './routes/businessHours.routes';
import barberRoutes from './routes/barber.routes';
import faqRoutes from './routes/faq.routes';
import quoteRoutes from './routes/quote.routes';
import mediaRoutes from './routes/media.routes';
import { getUploadDir } from './middleware/upload';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '').toLowerCase();
}

// Allowed browser origins come from CLIENT_URL (comma-separated).
const configuredOrigins = env.clientUrl.split(',').map(normalizeOrigin).filter(Boolean);

// If CLIENT_URL was left at the dev default (http://localhost:5173) in a
// production deploy, strict CORS would block the real frontend with a
// confusing "No Access-Control-Allow-Origin" error. Fall back to allowing
// *.vercel.app origins (the documented platform pairing) so the site works
// out of the box; the moment an explicit CLIENT_URL is configured the lenient
// fallback is disabled and only the exact origins are allowed.
const isClientUrlConfigured =
  configuredOrigins.length > 0 &&
  !(configuredOrigins.length === 1 && configuredOrigins[0] === 'http://localhost:5173');
const autoAllowVercelApp = env.isProduction && !isClientUrlConfigured;
const loggedOrigins = new Set<string>();

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (configuredOrigins.includes(origin)) return callback(null, true);
      if (autoAllowVercelApp && origin.endsWith('.vercel.app')) {
        if (!loggedOrigins.has(origin)) {
          loggedOrigins.add(origin);
          logger.warn(
            { origin },
            'CORS fallback: allowed *.vercel.app origin. Set CLIENT_URL on Render to the exact frontend origin to enable strict CORS.',
          );
        }
        return callback(null, true);
      }
      if (!loggedOrigins.has(origin)) {
        loggedOrigins.add(origin);
        logger.warn({ origin, configuredOrigins }, 'CORS: request origin is not allowed');
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use(pinoHttp({ logger }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(getUploadDir()));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'ok', data: { status: 'up', time: new Date().toISOString() } });
});

// Selective rate limiting: skip the health endpoint.
app.use(['/api'], (req, res, next) => {
  if (req.path === '/health') return next();
  return apiLimiter(req, res, next);
});

// Connect to MongoDB on demand for every DB-backed request. The long-running
// `server.ts` bootstrap already calls connectDb() before listening; this
// middleware is what lets the same Express app work as a Vercel serverless
// function, where only the app module is imported and there is no bootstrap
// step. connectDb() is idempotent, so in the long-running path this is a no-op.
app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDb();
    if (!isDbConnected()) {
      res.status(503).json({
        success: false,
        message: 'Database temporarily unavailable',
        errorCode: 'DB_UNAVAILABLE',
      });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/salon', salonRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/hairstyles', hairstyleRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hours', businessHoursRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/admin/media', mediaRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
export { getUploadDir as UPLOAD_DIR };