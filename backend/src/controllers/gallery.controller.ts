import type { Request, Response } from 'express';
import { GalleryItem, type GalleryItemDocument } from '../models/GalleryItem';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { isValidObjectId } from '../utils/helpers';
import type { AuthRequest } from '../middleware/auth';
import {
  resolveMediaValue,
  removeUploadedMedia,
  type MediaValue,
} from '../services/mediaService';

export const listGalleryHandler = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.includeInactive !== 'true') filter.isActive = true;
  if (req.query.category) filter.category = String(req.query.category);

  const items = await GalleryItem.find(filter).sort({ sortOrder: 1, createdAt: -1 }).exec();
  ok(res, items);
});

function applyMedia(item: GalleryItemDocument, media: MediaValue): void {
  item.media = {
    ...item.media,
    mediaType: media.mediaType,
    sourceType: media.sourceType,
    url: media.url,
    publicId: media.publicId,
    width: media.width,
    height: media.height,
    bytes: media.bytes,
    format: media.format,
    resourceType: media.resourceType,
  };
  // Keep the legacy fields in sync for backward compatibility.
  item.imageUrl = media.mediaType === 'image' ? media.url : '';
  if (media.mediaType === 'image') item.publicId = media.publicId;
}

export const createGalleryHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as Record<string, any>;
  const mediaInput = body.media ?? body;
  const media = await resolveMediaValue({
    mediaType: mediaInput?.mediaType,
    sourceType: mediaInput?.sourceType,
    url: mediaInput?.url ?? body.imageUrl,
    localPath: mediaInput?.localPath,
    publicId: mediaInput?.publicId,
    file: req.file ?? null,
    createdBy: req.user?.id,
  });

  const sortOrder = Number(body.sortOrder ?? 0);
  const isActive = body.isActive !== false;
  const title = body.title ?? '';
  let item: GalleryItemDocument;
  try {
    item = await GalleryItem.create({
      title,
      description: body.description ?? '',
      category: body.category ?? 'salon-interior',
      sortOrder,
      isActive,
      media: {
        mediaType: media.mediaType,
        sourceType: media.sourceType,
        url: media.url,
        publicId: media.publicId,
        title,
        alt: mediaInput?.alt ?? title,
        isActive,
        order: sortOrder,
        width: media.width,
        height: media.height,
        bytes: media.bytes,
        format: media.format,
        resourceType: media.resourceType,
        createdBy: req.user?.id,
        updatedBy: req.user?.id,
      },
      imageUrl: media.mediaType === 'image' ? media.url : '',
      publicId: media.mediaType === 'image' ? media.publicId : '',
    });
  } catch (err) {
    // Don't leave an orphaned file if the database write fails.
    await removeUploadedMedia(media);
    throw err;
  }
  created(res, item, 'Media added');
});

export const updateGalleryHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Media not found');
  const item = await GalleryItem.findById(req.params.id).exec();
  if (!item) throw ApiError.notFound('Media not found');

  const body = req.body as Record<string, any>;
  const mediaInput = body.media ?? body;
  const hasMediaChange =
    req.file ||
    mediaInput?.sourceType ||
    mediaInput?.url ||
    mediaInput?.mediaType ||
    mediaInput?.localPath ||
    body.imageUrl;

  if (hasMediaChange) {
    const oldMedia = item.media ? { ...item.media } : null;
    const media = await resolveMediaValue({
      mediaType: mediaInput?.mediaType,
      sourceType: mediaInput?.sourceType,
      url: mediaInput?.url ?? body.imageUrl,
      localPath: mediaInput?.localPath,
      publicId: mediaInput?.publicId,
      file: req.file ?? null,
      createdBy: req.user?.id,
    });
    try {
      applyMedia(item, media);
      item.media.updatedBy = req.user?.id ?? '';
      await item.save();
    } catch (err) {
      // New media was saved to storage but the record update failed.
      await removeUploadedMedia(media);
      throw err;
    }

    // Only remove the previous file after the new media has been saved — and only
    // if it is a genuinely different upload (the same publicId means it's kept).
    if (oldMedia?.sourceType === 'upload' && oldMedia.publicId && oldMedia.publicId !== media.publicId) {
      await removeUploadedMedia(oldMedia);
    }
  }

  if (body.title !== undefined) {
    item.title = body.title;
    if (item.media) item.media.title = body.title;
    if (!item.media?.alt) item.media.alt = body.title;
  }
  if (body.description !== undefined) item.description = body.description;
  if (body.category !== undefined) item.category = body.category;
  if (body.sortOrder !== undefined) {
    item.sortOrder = Number(body.sortOrder);
    if (item.media) item.media.order = Number(body.sortOrder);
  }
  if (body.isActive !== undefined) {
    item.isActive = Boolean(body.isActive);
    if (item.media) item.media.isActive = Boolean(body.isActive);
  }
  if (mediaInput?.alt !== undefined && item.media) item.media.alt = mediaInput.alt;

  await item.save();
  ok(res, item, 'Media updated');
});

export const deleteGalleryHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Media not found');
  const item = await GalleryItem.findById(req.params.id).exec();
  if (!item) throw ApiError.notFound('Media not found');

  // Delete the physical file only when it is an application-owned upload.
  await removeUploadedMedia(item.media);
  await item.deleteOne();
  ok(res, null, 'Media deleted');
});