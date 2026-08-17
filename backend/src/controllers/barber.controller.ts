import type { Request, Response } from 'express';
import { Barber } from '../models/Barber';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok, paginated } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { isValidObjectId } from '../utils/helpers';

export const listBarbersHandler = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.includeInactive !== 'true') filter.isActive = true;

  const items = await Barber.find(filter).sort({ sortOrder: 1 }).exec();
  paginated(res, { items, page: 1, pages: 1, total: items.length, limit: items.length });
});

export const createBarberHandler = asyncHandler(async (req: Request, res: Response) => {
  const barber = await Barber.create({ ...req.body, sortOrder: req.body.sortOrder ?? 0 });
  created(res, barber, 'Barber created');
});

export const updateBarberHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Barber not found');
  const barber = await Barber.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  if (!barber) throw ApiError.notFound('Barber not found');
  ok(res, barber, 'Barber updated');
});

export const deleteBarberHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Barber not found');
  await Barber.findByIdAndDelete(req.params.id).exec();
  ok(res, null, 'Barber deleted');
});