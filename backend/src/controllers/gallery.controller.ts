import type { Request, Response } from 'express';
import { GalleryItem } from '../models/GalleryItem';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { isValidObjectId } from '../utils/helpers';
import { storeImage, deleteImage } from '../services/fileStorage';

export const listGalleryHandler = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.includeInactive !== 'true') filter.isActive = true;
  if (req.query.category) filter.category = String(req.query.category);

  const items = await GalleryItem.find(filter).sort({ sortOrder: 1, createdAt: -1 }).exec();
  ok(res, items);
});

export const createGalleryHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('Gallery image is required', 'FILE_REQUIRED');
  const stored = await storeImage(req.file);
  const item = await GalleryItem.create({
    title: req.body.title ?? '',
    description: req.body.description ?? '',
    category: req.body.category,
    imageUrl: stored.url,
    publicId: stored.publicId,
    sortOrder: Number(req.body.sortOrder ?? 0),
  });
  created(res, item, 'Image added');
});

export const updateGalleryHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Image not found');
  const item = await GalleryItem.findById(req.params.id).exec();
  if (!item) throw ApiError.notFound('Image not found');

  if (req.file) {
    if (item.publicId) await deleteImage(item.publicId);
    const stored = await storeImage(req.file);
    item.imageUrl = stored.url;
    item.publicId = stored.publicId;
  }
  const { title, description, category, sortOrder, isActive } = req.body;
  if (title !== undefined) item.title = title;
  if (description !== undefined) item.description = description;
  if (category !== undefined) item.category = category;
  if (sortOrder !== undefined) item.sortOrder = Number(sortOrder);
  if (isActive !== undefined) item.isActive = Boolean(isActive);
  await item.save();
  ok(res, item, 'Image updated');
});

export const deleteGalleryHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Image not found');
  const item = await GalleryItem.findById(req.params.id).exec();
  if (!item) throw ApiError.notFound('Image not found');
  if (item.publicId) await deleteImage(item.publicId);
  await item.deleteOne();
  ok(res, null, 'Image deleted');
});