import type { Request, Response } from 'express';
import {
  getOrCreateBusinessHours,
  updateBusinessHours,
} from '../services/salonService';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';

export const getBusinessHoursHandler = asyncHandler(async (_req: Request, res: Response) => {
  const hours = await getOrCreateBusinessHours();
  ok(res, hours);
});

export const updateBusinessHoursHandler = asyncHandler(async (req: Request, res: Response) => {
  const hours = await updateBusinessHours(req.body);
  ok(res, hours, 'Business hours updated');
});