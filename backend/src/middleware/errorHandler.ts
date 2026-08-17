import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { ApiError } from '../utils/ApiError';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errorCode: 'NOT_FOUND',
  });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let status = 500;
  let message = 'Internal server error';
  let errorCode = 'INTERNAL_ERROR';
  let details: unknown;

  if (err instanceof ApiError) {
    status = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 422;
    message = 'Validation failed';
    errorCode = 'VALIDATION_ERROR';
    details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  } else if (err instanceof Error && 'code' in err && (err as { code: number }).code === 11000) {
    status = 409;
    message = 'Duplicate value already exists';
    errorCode = 'DUPLICATE_ENTRY';
  } else if (err instanceof Error) {
    message = err.message;
    if (!env.isProduction) {
      details = err.stack;
    }
  }

  if (status >= 500) {
    logger.error({ err: message, url: req.originalUrl }, 'Request failed');
  } else {
    logger.warn({ message, url: req.originalUrl }, 'Request rejected');
  }

  res.status(status).json({
    success: false,
    message,
    ...(errorCode ? { errorCode } : {}),
    ...(details && !env.isProduction ? { details } : {}),
  });
}