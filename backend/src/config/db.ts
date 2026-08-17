import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

let isConnected = false;

export async function connectDb(): Promise<void> {
  if (isConnected) return;
  if (env.nodeEnv === 'test') {
    logger.info('Skipping DB connection in test environment');
    return;
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });
  isConnected = true;
  logger.info('MongoDB connected');
}

export async function disconnectDb(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
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