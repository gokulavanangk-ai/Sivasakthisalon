import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

/**
 * True while the Mongoose driver is connecting or already connected.
 * `readyState` is 1 = connected, 2 = connecting. We rely on it instead of a
 * local flag so the connection is reused across Vercel serverless warm
 * invocations and re-established if the pool ever drops mid-process.
 */
function isDbConnected(): boolean {
  const state = mongoose.connection.readyState;
  return state === 1 || state === 2;
}

export async function connectDb(): Promise<void> {
  if (isDbConnected()) return;
  if (env.nodeEnv === 'test') {
    logger.info('Skipping DB connection in test environment');
    return;
  }
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed');
    throw err;
  }
}

export async function disconnectDb(): Promise<void> {
  if (!isDbConnected()) return;
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

export function handleExit(): void {
  process.on('SIGINT', async () => {
    await disconnectDb();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await disconnectDb();
    process.exit(0);
  });
}