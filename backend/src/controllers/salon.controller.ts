import type { Request, Response } from 'express';
import { getOrCreateSalonSettings, updateSalonSettings } from '../services/salonService';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';
import { storeImage, deleteImage } from '../services/fileStorage';
import { ApiError } from '../utils/ApiError';

export const getSalonHandler = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getOrCreateSalonSettings();
  ok(res, settings, 'Salon fetched');
});

export const updateSalonHandler = asyncHandler(async (req: Request, res: Response) => {
  const settings = await updateSalonSettings(req.body);
  ok(res, settings, 'Salon updated');
});

export const uploadLogoHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('Logo image is required', 'FILE_REQUIRED');
  const settings = await getOrCreateSalonSettings();
  if (settings.logo?.publicId) {
    await deleteImage(settings.logo.publicId);
  }
  const stored = await storeImage(req.file);
  settings.logo = { url: stored.url, publicId: stored.publicId };
  await settings.save();
  ok(res, settings.logo, 'Logo uploaded');
});

export const deleteLogoHandler = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getOrCreateSalonSettings();
  if (settings.logo?.publicId) {
    await deleteImage(settings.logo.publicId);
  }
  settings.logo = null;
  await settings.save();
  ok(res, null, 'Logo removed');
});