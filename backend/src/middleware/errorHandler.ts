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

function isDbConnectionError(err: Error): boolean {
  return (
    err.name === 'MongooseServerSelectionError' ||
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongoNetworkError' ||
    err.name === 'MongoTimeoutError' ||
    (typeof err.message === 'string' && err.message.includes('buffering timed out'))
  );
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
    // Database connectivity problems make the service temporarily unavailable.
    if (isDbConnectionError(err)) {
      status = 503;
      errorCode = 'DB_UNAVAILABLE';
    } else if (err.name === 'ValidationError') {
      status = 400;
      errorCode = 'VALIDATION_ERROR';
    }
    // Never leak internal error messages or stack traces to the browser in
    // production. The real cause is logged server-side below.
    if (!env.isProduction) {
      message = err.message;
      details = err.stack;
    }
  }

  if (status >= 500) {
    logger.error(
      { err, method: req.method, url: req.originalUrl, errorCode },
      'Request failed',
    );
  } else {
    logger.warn({ message, errorCode, url: req.originalUrl }, 'Request rejected');
  }

  res.status(status).json({
    success: false,
    message,
    ...(errorCode ? { errorCode } : {}),
    ...(details && !env.isProduction ? { details } : {}),
  });
}