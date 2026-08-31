import { env } from './config/env';
import { logger } from './config/logger';
import { connectDb, handleExit } from './config/db';
import { app } from './app';
import { cloudinaryConfigured } from './services/fileStorage';

async function bootstrap(): Promise<void> {
  // Storage credential startup check. Deliberately a warning, NEVER a crash:
  // public endpoints (health, services, gallery, bookings) keep working while
  // only the Cloudinary-backed local-file upload path is affected. Without this
  // an admin only discovers the missing creds on the first real upload.
  if (env.storageProvider === 'cloudinary' && !cloudinaryConfigured()) {
    logger.error(
      'STORAGE_PROVIDER=cloudinary but CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET are not all set. ' +
        'Local image/file uploads to Cloudinary will fail until all three are configured in the Render ' +
        'Environment tab (they are sync:false in render.yaml, so they must be entered manually). ' +
        'Pasting an external image URL still works because that path does not use Cloudinary upload.',
    );
  }

  try {
    await connectDb();
  } catch (err) {
    // Do not exit: keep /api/health alive and surface a clear 503 + log for
    // every DB-backed route so misconfiguration is visible in the logs.
    logger.error({ err }, 'MongoDB connection failed at startup; continuing without DB');
  }

  app.listen(env.port, () => {
    logger.info(env.isProduction ? `API listening on port ${env.port}` : `API listening on http://localhost:${env.port}`);
  });

  handleExit();
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});