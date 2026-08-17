import type { Request, Response } from 'express';
import { Hairstyle } from '../models/Hairstyle';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { isValidObjectId } from '../utils/helpers';

export const listHairstylesHandler = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.includeInactive !== 'true') filter.isActive = true;
  if (req.query.category) filter.category = String(req.query.category);

  const items = await Hairstyle.find(filter).sort({ sortOrder: 1 }).exec();
  ok(res, items);
});

export const createHairstyleHandler = asyncHandler(async (req: Request, res: Response) => {
  const hairstyle = await Hairstyle.create({ ...req.body, sortOrder: req.body.sortOrder ?? 0 });
  created(res, hairstyle, 'Hairstyle created');
});

export const updateHairstyleHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Hairstyle not found');
  const item = await Hairstyle.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  if (!item) throw ApiError.notFound('Hairstyle not found');
  ok(res, item, 'Hairstyle updated');
});

export const deleteHairstyleHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Hairstyle not found');
  await Hairstyle.findByIdAndDelete(req.params.id).exec();
  ok(res, null, 'Hairstyle deleted');
});