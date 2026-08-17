import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../utils/ApiError';

export function validate(schema: ZodType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      throw ApiError.badRequest('Validation failed', 'VALIDATION_ERROR', issues);
    }
    if (result.data && typeof result.data === 'object' && 'body' in result.data) {
      req.body = (result.data as { body: Record<string, unknown> }).body;
    }
    next();
  };
}