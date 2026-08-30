import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { getUploadDir } from '../middleware/upload';

export type StoredMediaType = 'image' | 'video';

export interface StoredImage {
  url: string;
  publicId: string;
}

export interface StoredMedia extends StoredImage {
  mediaType: StoredMediaType;
}

type UploadInput = { path: string; filename: string; originalName: string };

function mediaTypeOf(mime: string): StoredMediaType {
  return mime.startsWith('video/') ? 'video' : 'image';
}

async function uploadCloudinary(
  input: UploadInput,
  mediaType: StoredMediaType,
): Promise<StoredMedia> {
  const cloudinary = await import('cloudinary');
  cloudinary.v2.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
  const result = await cloudinary.v2.uploader.upload(input.path, {
    folder: 'sivasakthi-salon',
    resource_type: mediaType,
    ...(mediaType === 'image'
      ? { transformation: [{ width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] }
      : {}),
  });
  return { url: result.secure_url, publicId: result.public_id, mediaType };
}

async function uploadLocal(input: UploadInput, mediaType: StoredMediaType): Promise<StoredMedia> {
  const base = env.isProduction
    ? '/uploads'
    : `http://localhost:${env.port}/uploads`;
  return { url: `${base}/${input.filename}`, publicId: input.filename, mediaType };
}

export async function storeMedia(file: Express.Multer.File): Promise<StoredMedia> {
  const mediaType = mediaTypeOf(file.mimetype);
  const input: UploadInput = {
    path: file.path,
    filename: file.filename,
    originalName: file.originalname,
  };
  try {
    if (env.storageProvider === 'cloudinary' && env.cloudinary.cloudName) {
      return await uploadCloudinary(input, mediaType);
    }
    return await uploadLocal(input, mediaType);
  } catch (err) {
    logger.error({ err }, 'Media upload failed');
    throw err;
  }
}

export async function storeImage(file: Express.Multer.File): Promise<StoredImage> {
  const stored = await storeMedia(file);
  return { url: stored.url, publicId: stored.publicId };
}

/**
 * Deletes an uploaded file. Only ever deletes files that live inside the
 * configured upload directory; the publicId is reduced to its basename so a
 * malicious publicId can never escape the upload directory.
 */
export async function deleteMedia(publicId: string, mediaType: StoredMediaType = 'image'): Promise<void> {
  if (!publicId) return;
  try {
    if (env.storageProvider === 'cloudinary' && env.cloudinary.cloudName) {
      const cloudinary = await import('cloudinary');
      cloudinary.v2.config({
        cloud_name: env.cloudinary.cloudName,
        api_key: env.cloudinary.apiKey,
        api_secret: env.cloudinary.apiSecret,
      });
      await cloudinary.v2.uploader.destroy(publicId, { resource_type: mediaType });
      return;
    }
    const target = path.join(getUploadDir(), path.basename(publicId));
    if (fs.existsSync(target)) fs.unlinkSync(target);
  } catch (err) {
    logger.warn({ err, publicId }, 'Media delete failed');
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  return deleteMedia(publicId, 'image');
}