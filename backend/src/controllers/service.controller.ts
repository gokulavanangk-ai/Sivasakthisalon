import type { Request, Response } from 'express';
import { Service, type ServiceDocument } from '../models/Service';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok, paginated } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { isValidObjectId } from '../utils/helpers';
import { resolveMediaValue, removeUploadedMedia } from '../services/mediaService';

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
  const body = req.body as Record<string, any>;
  const payload: Record<string, any> = { ...body, sortOrder: body.sortOrder ?? 0 };
  if (body.media) {
    const media = await resolveMediaValue({
      mediaType: body.media.mediaType,
      sourceType: body.media.sourceType,
      url: body.media.url,
      localPath: body.media.localPath,
      publicId: body.media.publicId,
    });
    payload.media = {
      ...media,
      alt: body.media.alt ?? '',
      isActive: body.media.isActive !== false,
      order: Number(body.media.order ?? 0),
    };
    if (media.mediaType === 'image') payload.imageUrl = media.url;
  }
  const service = await Service.create(payload);
  created(res, service, 'Service created');
});

export const updateServiceHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Service not found');
  const item = await Service.findById(req.params.id).exec();
  if (!item) throw ApiError.notFound('Service not found');

  const body = req.body as Record<string, any>;
  const oldMedia = item.media?.sourceType === 'upload' ? { ...item.media } : null;

  if (body.media !== undefined) {
    if (body.media === null) {
      item.media = {
        mediaType: 'image',
        sourceType: 'url',
        url: '',
        publicId: '',
        alt: '',
        isActive: true,
        order: 0,
      };
      item.imageUrl = '';
    } else {
      const media = await resolveMediaValue({
        mediaType: body.media.mediaType,
        sourceType: body.media.sourceType,
        url: body.media.url,
        localPath: body.media.localPath,
        publicId: body.media.publicId,
      });
      item.media = {
        ...media,
        alt: body.media.alt ?? '',
        isActive: body.media.isActive !== false,
        order: Number(body.media.order ?? 0),
      };
      item.imageUrl = media.mediaType === 'image' ? media.url : item.imageUrl;
    }
  }

  const scalarKeys: (keyof ServiceDocument)[] = [
    'tamilName',
    'englishName',
    'subtitle',
    'description',
    'durationMinutes',
    'price',
    'priceVisible',
    'imageUrl',
    'category',
    'isActive',
    'isSignature',
    'sortOrder',
  ];
  for (const key of scalarKeys) {
    if (body[key] !== undefined && key !== 'imageUrl') {
      (item as Record<string, any>)[key] = body[key];
    }
  }

  await item.save();

  // Remove the replaced file only after the database update succeeded — and only
  // if it is a genuinely different upload (an unchanged upload is kept as-is).
  if (oldMedia && oldMedia.publicId && oldMedia.publicId !== item.media?.publicId) {
    await removeUploadedMedia(oldMedia);
  }

  ok(res, item, 'Service updated');
});

export const deleteServiceHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Service not found');
  const item = await Service.findById(req.params.id).exec();
  if (!item) throw ApiError.notFound('Service not found');
  await removeUploadedMedia(item.media);
  await item.deleteOne();
  ok(res, null, 'Service deleted');
});