import type { Request, Response } from 'express';
import { Review } from '../models/Review';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { isValidObjectId } from '../utils/helpers';

export const listReviewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.includeInactive !== 'true') filter.isActive = true;

  const items = await Review.find(filter).sort({ sortOrder: -1, createdAt: -1 }).exec();
  ok(res, items);
});

export const createReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.create({ ...req.body, sortOrder: req.body.sortOrder ?? 0 });
  created(res, review, 'Review created');
});

export const updateReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Review not found');
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  if (!review) throw ApiError.notFound('Review not found');
  ok(res, review, 'Review updated');
});

export const deleteReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Review not found');
  await Review.findByIdAndDelete(req.params.id).exec();
  ok(res, null, 'Review deleted');
});