import type { Response } from 'express';
import type { ApiResponse, Paginated } from '../types';

export function ok<T>(res: Response, data: T, message = 'Success', status = 200): Response {
  const body: ApiResponse<T> = { success: true, message, data };
  return res.status(status).json(body);
}

export function created<T>(res: Response, data: T, message = 'Created'): Response {
  return ok(res, data, message, 201);
}

export function paginated<T>(
  res: Response,
  data: Paginated<T>,
  message = 'Success',
): Response {
  return res.status(200).json({ success: true, message, data });
}