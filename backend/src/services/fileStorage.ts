import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { UPLOAD_DIR } from '../middleware/upload';

export interface StoredImage {
  url: string;
  publicId: string;
}

type UploadInput = { path: string; filename: string; originalName: string };

async function uploadCloudinary(input: UploadInput): Promise<StoredImage> {
  const cloudinary = await import('cloudinary');
  cloudinary.v2.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
  const result = await cloudinary.v2.uploader.upload(input.path, {
    folder: 'sivasakthi-salon',
    resource_type: 'image',
    transformation: [
      { width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
    ],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

async function uploadLocal(input: UploadInput): Promise<StoredImage> {
  const base = env.isProduction
    ? '/uploads'
    : `http://localhost:${env.port}/uploads`;
  return { url: `${base}/${input.filename}`, publicId: input.filename };
}

export async function storeImage(file: Express.Multer.File): Promise<StoredImage> {
  const input: UploadInput = {
    path: file.path,
    filename: file.filename,
    originalName: file.originalname,
  };
  try {
    if (env.storageProvider === 'cloudinary' && env.cloudinary.cloudName) {
      return await uploadCloudinary(input);
    }
    return await uploadLocal(input);
  } catch (err) {
    logger.error({ err }, 'Image upload failed');
    throw err;
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId) return;
  try {
    if (env.storageProvider === 'cloudinary' && env.cloudinary.cloudName) {
      const cloudinary = await import('cloudinary');
      cloudinary.v2.config({
        cloud_name: env.cloudinary.cloudName,
        api_key: env.cloudinary.apiKey,
        api_secret: env.cloudinary.apiSecret,
      });
      await cloudinary.v2.uploader.destroy(publicId);
      return;
    }
    if (!env.isProduction) {
      const target = path.join(UPLOAD_DIR, path.basename(publicId));
      if (fs.existsSync(target)) fs.unlinkSync(target);
    }
  } catch (err) {
    logger.warn({ err, publicId }, 'Image delete failed');
  }
}