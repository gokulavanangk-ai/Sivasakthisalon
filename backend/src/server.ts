import { env } from './config/env';
import { logger } from './config/logger';
import { connectDb, handleExit } from './config/db';
import { app } from './app';

async function bootstrap(): Promise<void> {
  try {
    await connectDb();
  } catch (err) {
    // Do not exit: keep /api/health alive and surface a clear 503 + log for
    // every DB-backed route so misconfiguration is visible in the logs.
    logger.error({ err }, 'MongoDB connection failed at startup; continuing without DB');
  }

  app.listen(env.port, () => {
    logger.info(`API listening on http://localhost:${env.port}`);
  });

  handleExit();
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});