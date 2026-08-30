import type { Request, Response } from 'express';
import { Hairstyle, type HairstyleDocument } from '../models/Hairstyle';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { isValidObjectId } from '../utils/helpers';
import {
  resolveMediaValue,
  removeUploadedMedia,
  type MediaValue,
} from '../services/mediaService';

const MEDIA_FIELDS = ['image', 'thumbnail', 'video'] as const;
type MediaField = (typeof MEDIA_FIELDS)[number];

export const listHairstylesHandler = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.includeInactive !== 'true') filter.isActive = true;
  if (req.query.category) filter.category = String(req.query.category);

  const items = await Hairstyle.find(filter).sort({ sortOrder: 1 }).exec();
  ok(res, items);
});

export const createHairstyleHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Record<string, any>;
  const payload: Record<string, any> = { ...body, sortOrder: body.sortOrder ?? 0 };

  for (const field of MEDIA_FIELDS) {
    const input = body[field];
    if (input) {
      const media = await resolveMediaValue({
        mediaType: input.mediaType,
        sourceType: input.sourceType,
        url: input.url,
        localPath: input.localPath,
        publicId: input.publicId,
      });
      payload[field] = { ...media, alt: input.alt ?? '', isActive: input.isActive !== false, order: Number(input.order ?? 0) };
    }
  }

  const hairstyle = await Hairstyle.create(payload);
  syncImageUrl(hairstyle);
  await hairstyle.save();
  created(res, hairstyle, 'Hairstyle created');
});

export const updateHairstyleHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Hairstyle not found');
  const item = await Hairstyle.findById(req.params.id).exec();
  if (!item) throw ApiError.notFound('Hairstyle not found');

  const body = req.body as Record<string, any>;
  const oldMedia: Partial<Record<MediaField, MediaValue>> = {};

  for (const field of MEDIA_FIELDS) {
    const input = body[field];
    if (input === undefined) continue;
    if (item[field]) oldMedia[field] = { ...item[field] };
    if (input === null) {
      item[field] = {
        mediaType: 'image',
        sourceType: 'url',
        url: '',
        publicId: '',
        alt: '',
        isActive: true,
        order: 0,
      };
      continue;
    }
    const media = await resolveMediaValue({
      mediaType: input.mediaType,
      sourceType: input.sourceType,
      url: input.url,
      localPath: input.localPath,
      publicId: input.publicId,
    });
    item[field] = {
      ...media,
      alt: input.alt ?? '',
      isActive: input.isActive !== false,
      order: Number(input.order ?? 0),
    };
  }

  const scalarKeys: (keyof HairstyleDocument)[] = [
    'tamilName',
    'englishName',
    'category',
    'description',
    'faceShapes',
    'styleTypes',
    'hairTypes',
    'isActive',
    'sortOrder',
  ];
  for (const key of scalarKeys) {
    if (body[key] !== undefined) (item as Record<string, any>)[key] = body[key];
  }

  syncImageUrl(item);
  await item.save();

  // Remove replaced files only after the database update succeeded — and only when
  // a field's upload genuinely changed (an unchanged upload is kept as-is).
  for (const field of MEDIA_FIELDS) {
    const old = oldMedia[field];
    if (old && old.publicId && old.publicId !== item[field]?.publicId) {
      await removeUploadedMedia(old);
    }
  }

  ok(res, item, 'Hairstyle updated');
});

export const deleteHairstyleHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Hairstyle not found');
  const item = await Hairstyle.findById(req.params.id).exec();
  if (!item) throw ApiError.notFound('Hairstyle not found');
  for (const field of MEDIA_FIELDS) {
    await removeUploadedMedia(item[field]);
  }
  await item.deleteOne();
  ok(res, null, 'Hairstyle deleted');
});

/** Keeps the legacy `imageUrl` field in sync with the new `image.url`. */
function syncImageUrl(hairstyle: HairstyleDocument): void {
  hairstyle.imageUrl = hairstyle.image?.url ?? '';
}