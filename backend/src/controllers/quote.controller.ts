import type { Request, Response } from 'express';
import { Quote, type QuoteSource } from '../models/Quote';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { isValidObjectId } from '../utils/helpers';
import { removeUploadedMedia, sanitizePersistedUrl } from '../services/mediaService';

export const listQuotesHandler = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.includeInactive !== 'true') filter.isActive = true;
  if (req.query.source && req.query.source !== 'all') filter.source = req.query.source;

  const items = await Quote.find(filter).sort({ sortOrder: 1 }).exec();
  ok(res, items);
});

export const getQuoteHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Quote not found');
  const quote = await Quote.findById(req.params.id).exec();
  if (!quote) throw ApiError.notFound('Quote not found');
  ok(res, quote);
});

export const createQuoteHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const payload: Record<string, unknown> = {
    text: body.text,
    author: (body.author as string | undefined) ?? null,
    role: (body.role as string | undefined) ?? '',
    source: (body.source as string | undefined) ?? 'general',
    isActive: (body.isActive as boolean | undefined) ?? true,
    sortOrder: Number(body.sortOrder ?? 0),
  };

  const image = body.image as { url?: string; publicId?: string } | null | undefined;
  if (image && typeof image.url === 'string' && image.url) {
    payload.image = { url: sanitizePersistedUrl(image.url, 'Quote image URL'), publicId: image.publicId ?? '' };
  } else {
    payload.image = null;
  }

  const quote = await Quote.create(payload);
  created(res, quote, 'Quote created');
});

export const updateQuoteHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Quote not found');
  const existing = await Quote.findById(req.params.id).exec();
  if (!existing) throw ApiError.notFound('Quote not found');

  const body = req.body as Record<string, unknown>;
  const oldImage = existing.image?.publicId ? { ...existing.image } : null;

  if (body.text !== undefined) existing.text = body.text as string;
  if (body.author !== undefined) existing.author = (body.author as string | null) ?? null;
  if (body.role !== undefined) existing.role = (body.role as string) ?? '';
  if (body.source !== undefined) existing.source = (body.source as QuoteSource) ?? 'general';
  if (body.isActive !== undefined) existing.isActive = body.isActive as boolean;
  if (body.sortOrder !== undefined) existing.sortOrder = Number(body.sortOrder ?? 0);

  if (body.image !== undefined) {
    const image = body.image as { url?: string; publicId?: string } | null;
    if (image && typeof image?.url === 'string' && image.url) {
      existing.image = { url: sanitizePersistedUrl(image.url, 'Quote image URL'), publicId: image.publicId ?? '' };
    } else {
      existing.image = null;
    }
  }

  await existing.save();

  if (oldImage && oldImage.publicId && oldImage.publicId !== existing.image?.publicId) {
    await removeUploadedMedia({ ...oldImage, sourceType: 'upload', mediaType: 'image' });
  }

  ok(res, existing, 'Quote updated');
});

export const deleteQuoteHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Quote not found');
  const existing = await Quote.findByIdAndDelete(req.params.id).exec();
  if (existing?.image?.publicId) {
    await removeUploadedMedia({ ...existing.image, sourceType: 'upload', mediaType: 'image' });
  }
  ok(res, null, 'Quote deleted');
});
