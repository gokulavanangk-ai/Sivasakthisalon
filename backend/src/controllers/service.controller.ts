import type { Request, Response } from 'express';
import { Service } from '../models/Service';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok, paginated } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { isValidObjectId } from '../utils/helpers';

export const listServicesHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));

  const filter: Record<string, unknown> = {};
  if (req.query.includeInactive !== 'true') filter.isActive = true;

  const [items, total] = await Promise.all([
    Service.find(filter).sort({ sortOrder: 1 }).skip((page - 1) * limit).limit(limit).exec(),
    Service.countDocuments(filter),
  ]);

  paginated(res, { items, page, pages: Math.ceil(total / limit), total, limit });
});

export const getServiceHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Service not found');
  const service = await Service.findById(req.params.id).exec();
  if (!service) throw ApiError.notFound('Service not found');
  ok(res, service);
});

export const createServiceHandler = asyncHandler(async (req: Request, res: Response) => {
  const service = await Service.create({ ...req.body, sortOrder: req.body.sortOrder ?? 0 });
  created(res, service, 'Service created');
});

export const updateServiceHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Service not found');
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  if (!service) throw ApiError.notFound('Service not found');
  ok(res, service, 'Service updated');
});

export const deleteServiceHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Service not found');
  await Service.findByIdAndDelete(req.params.id).exec();
  ok(res, null, 'Service deleted');
});