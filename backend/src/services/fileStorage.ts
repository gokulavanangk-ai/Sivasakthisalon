import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { getUploadDir } from '../middleware/upload';

export type StoredMediaType = 'image' | 'video';

export interface StoredImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  resourceType?: string;
}

export interface StoredMedia extends StoredImage {
  mediaType: StoredMediaType;
}

type UploadInput = { path: string; filename: string; originalName: string };

function mediaTypeOf(mime: string): StoredMediaType {
  return mime.startsWith('video/') ? 'video' : 'image';
}

/** Reads image dimensions from a JPEG/PNG/WEBP/GIF/BMP byte buffer (best effort). */
export function readImageDimensions(buffer: Buffer): { width: number; height: number } | null {
  try {
    const b = buffer;
    // PNG: IHDR at offset 16 (width/height big-endian u32)
    if (b.length > 24 && b.toString('ascii', 0, 4) === '\x89PNG') {
      return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    }
    // JPEG: scan SOF0/SOF2 segments
    if (b.length > 6 && b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) {
          i += 1;
          continue;
        }
        const marker = b[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
        }
        const len = b.readUInt16BE(i + 2);
        i += 2 + len;
      }
    }
    // WEBP: VP8/VP8L/VP8X
    if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
      const chunk = b.toString('ascii', 12, 16);
      if (chunk === 'VP8X' && b.length > 30) {
        const w = 1 + b.readUIntLE(24, 3);
        const h = 1 + b.readUIntLE(27, 3);
        return { width: w, height: h };
      }
      if (chunk === 'VP8L' && b.length > 25) {
        const bits = b.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if ((chunk === 'VP8 ' || chunk === 'VP8X') && b.length > 30) {
        const w = b.readUInt16LE(26) & 0x3fff;
        const h = b.readUInt16LE(28) & 0x3fff;
        if (w && h) return { width: w, height: h };
      }
    }
    // GIF: logical screen descriptor at offset 6
    if (b.length > 10 && b.toString('ascii', 0, 3) === 'GIF') {
      return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
    }
    // BMP: DIB header width/height (little-endian, pixels)
    if (b.length > 26 && b.toString('ascii', 0, 2) === 'BM') {
      const w = b.readInt32LE(18);
      const abs = Math.abs(b.readInt32LE(22));
      if (w > 0 && abs > 0) return { width: w, height: abs };
    }
  } catch {
    return null;
  }
  return null;
}

async function uploadCloudinary(
  input: UploadInput,
  mediaType: StoredMediaType,
  filePath: string,
): Promise<StoredMedia> {
  const cloudinary = await import('cloudinary');
  cloudinary.v2.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
  // Never expose the API secret in thrown errors / logs.
  cloudinary.v2.config({ secure: true });
  let result;
  try {
    result = await cloudinary.v2.uploader.upload(
      input.path,
      {
        folder: 'sivasakthi-salon',
        resource_type: mediaType,
        ...(mediaType === 'image'
          ? { transformation: [{ width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] }
          : {}),
      },
      undefined,
    );
  } catch (err) {
    throw normalizeCloudinaryError(err);
  }

  let dimensions: { width: number; height: number } | null = null;
  if (mediaType === 'image') {
    try {
      const fs = await import('fs');
      dimensions = readImageDimensions(fs.readFileSync(filePath));
    } catch {
      dimensions = null;
    }
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
    mediaType,
    width: result.width ?? dimensions?.width,
    height: result.height ?? dimensions?.height,
    bytes: result.bytes,
    format: result.format,
    resourceType: result.resource_type ?? mediaType,
  };
}

/**
 * normalizes a Cloudinary error into an ApiError without leaking credentials
 * (Cloudinary responses can embed the request config, including api_secret).
 */
function normalizeCloudinaryError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  const sanitized = msg
    .replace(/api[_ -]?secret[=:"'\s]*[^\s,}]+/gi, 'api_secret=[REDACTED]')
    .replace(/api_key[=:"'\s]+[^\s,}]+/gi, 'api_key=[REDACTED]');
  const error = new Error(sanitized);
  error.name = 'CloudinaryError';
  return error;
}

/**
 * Local disk storage is provided for local development only. The returned URL
 * never leaks a localhost/host or a Render temp-filesystem path into the
 * database — production uploads must always go through Cloudinary so the saved
 * URL is a durable, publicly reachable https URL that survives redeploys.
 */
async function uploadLocal(input: UploadInput, mediaType: StoredMediaType): Promise<StoredMedia> {
  if (env.isProduction) {
    logger.error(
      { path: input.path },
      'Local media storage is not allowed in production. Configure STORAGE_PROVIDER=cloudinary and CLOUDINARY_* so uploads persist.',
    );
    throw new Error(
      'Media storage is not configured for production. Set STORAGE_PROVIDER=cloudinary and the CLOUDINARY_* environment variables.',
    );
  }
  const base = `http://localhost:${env.port}/uploads`;
  return { url: `${base}/${input.filename}`, publicId: input.filename, mediaType };
}

function cloudinaryConfigured(): boolean {
  return Boolean(
    env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret,
  );
}

export async function storeMedia(file: Express.Multer.File): Promise<StoredMedia> {
  const mediaType = mediaTypeOf(file.mimetype);
  const input: UploadInput = {
    path: file.path,
    filename: file.filename,
    originalName: file.originalname,
  };
  try {
    if (env.storageProvider === 'cloudinary') {
      if (!cloudinaryConfigured()) {
        // Never silently fall back to local disk — that writes a temporary
        // Render filesystem path (or a localhost URL) into the database and
        // produces broken images after the next deploy. Fail loudly instead.
        logger.error(
          'STORAGE_PROVIDER=cloudinary but CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET are not all set.',
        );
        throw new Error(
          'Cloudinary storage is required but is missing its credentials. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
        );
      }
      return await uploadCloudinary(input, mediaType, file.path);
    }
    return await uploadLocal(input, mediaType);
  } catch (err) {
    logger.error({ err }, 'Media upload failed');
    throw err;
  }
}

export async function storeImage(file: Express.Multer.File): Promise<StoredImage> {
  const stored = await storeMedia(file);
  return {
    url: stored.url,
    publicId: stored.publicId,
    width: stored.width,
    height: stored.height,
    bytes: stored.bytes,
    format: stored.format,
    resourceType: stored.resourceType,
  };
}

/**
 * Deletes an uploaded file. Only ever deletes files that live inside the
 * configured upload directory; the publicId is reduced to its basename so a
 * malicious publicId can never escape the upload directory.
 */
export async function deleteMedia(publicId: string, mediaType: StoredMediaType = 'image'): Promise<void> {
  if (!publicId) return;
  try {
    if (env.storageProvider === 'cloudinary') {
      const cloudinary = await import('cloudinary');
      cloudinary.v2.config({
        cloud_name: env.cloudinary.cloudName,
        api_key: env.cloudinary.apiKey,
        api_secret: env.cloudinary.apiSecret,
      });
      await cloudinary.v2.uploader.destroy(publicId, { resource_type: mediaType });
      return;
    }
    if (env.isProduction) {
      logger.warn({ publicId }, 'Skipping local media delete in production');
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

export interface LibraryAsset {
  url: string;
  publicId: string;
  mediaType: StoredMediaType;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  resourceType?: string;
}

/**
 * Lists previously uploaded media that is eligible for reuse from a shared
 * media library. Uses Cloudinary when that provider is configured; otherwise
 * returns an empty list (local uploads are dev-only and not a durable source).
 * Never throws on missing credentials — the admin just sees an empty library.
 */
export async function listMediaLibrary(): Promise<LibraryAsset[]> {
  if (env.storageProvider !== 'cloudinary') return [];
  if (!cloudinaryConfigured()) {
    logger.warn('listMediaLibrary: STORAGE_PROVIDER=cloudinary but Cloudinary credentials are incomplete.');
    return [];
  }
  try {
    const cloudinary = await import('cloudinary');
    cloudinary.v2.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
    });
    const result = await cloudinary.v2.api.resources({
      type: 'upload',
      prefix: 'sivasakthi-salon/',
      resource_type: 'image',
      max_results: 500,
    });
    const assets = (result?.resources ?? []) as Array<{
      public_id: string;
      secure_url?: string;
      url?: string;
      width?: number;
      height?: number;
      bytes?: number;
      format?: string;
      resource_type?: string;
    }>;
    return assets.map((a) => ({
      url: a.secure_url ?? a.url ?? '',
      publicId: a.public_id,
      mediaType: 'image' as StoredMediaType,
      width: a.width,
      height: a.height,
      bytes: a.bytes,
      format: a.format,
      resourceType: a.resource_type,
    }));
  } catch (err) {
    logger.warn({ err }, 'listMediaLibrary: Cloudinary resource listing failed');
    return [];
  }
}

/**
 * Fetches a single Cloudinary asset by publicId and returns its metadata.
 * Returns null when the asset does not exist or the provider is not configured.
 */
export async function getMediaAsset(publicId: string): Promise<LibraryAsset | null> {
  if (!publicId) return null;
  if (env.storageProvider !== 'cloudinary') return null;
  if (!cloudinaryConfigured()) {
    logger.warn('getMediaAsset: Cloudinary credentials are incomplete.');
    return null;
  }
  try {
    const cloudinary = await import('cloudinary');
    cloudinary.v2.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
      secure: true,
    });
    const a = await cloudinary.v2.api.resource(publicId, {
      type: 'upload',
      resource_type: 'image',
    }) as {
      public_id: string;
      secure_url?: string;
      width?: number;
      height?: number;
      bytes?: number;
      format?: string;
      resource_type?: string;
    };
    return {
      url: a.secure_url ?? '',
      publicId: a.public_id,
      mediaType: 'image' as StoredMediaType,
      width: a.width,
      height: a.height,
      bytes: a.bytes,
      format: a.format,
      resourceType: a.resource_type,
    };
  } catch (err) {
    logger.warn({ err, publicId }, 'getMediaAsset: Cloudinary resource fetch failed');
    return null;
  }
}