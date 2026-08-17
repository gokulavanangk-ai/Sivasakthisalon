import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.isProduction ? 'info' : 'debug',
  base: { service: 'sivasakthi-salon-api' },
  redact: {
    paths: [
      'req.headers.authorization',
      'password',
      '*.password',
      'req.body.password',
      'req.body.confirmPassword',
    ],
    censor: '[REDACTED]',
  },
  transport:
    env.nodeEnv === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
      : undefined,
});