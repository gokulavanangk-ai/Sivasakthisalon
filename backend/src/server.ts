import { env } from './config/env';
import { logger } from './config/logger';
import { connectDb, handleExit } from './config/db';
import { app } from './app';

async function bootstrap(): Promise<void> {
  await connectDb();

  app.listen(env.port, () => {
    logger.info(`API listening on http://localhost:${env.port}`);
  });

  handleExit();
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});