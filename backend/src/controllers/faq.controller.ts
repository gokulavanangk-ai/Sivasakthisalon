import type { Request, Response } from 'express';
import { Faq } from '../models/Faq';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { isValidObjectId } from '../utils/helpers';

export const listFaqsHandler = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.includeInactive !== 'true') filter.isActive = true;

  const items = await Faq.find(filter).sort({ sortOrder: 1 }).exec();
  ok(res, items);
});

export const createFaqHandler = asyncHandler(async (req: Request, res: Response) => {
  const faq = await Faq.create({ ...req.body, sortOrder: req.body.sortOrder ?? 0 });
  created(res, faq, 'FAQ created');
});

export const updateFaqHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('FAQ not found');
  const item = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  if (!item) throw ApiError.notFound('FAQ not found');
  ok(res, item, 'FAQ updated');
});

export const deleteFaqHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('FAQ not found');
  await Faq.findByIdAndDelete(req.params.id).exec();
  ok(res, null, 'FAQ deleted');
});