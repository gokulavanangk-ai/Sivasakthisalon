import { ApiError } from '../utils/ApiError';
import { storeMedia, deleteMedia, type StoredMediaType } from './fileStorage';
import {
  IMAGE_MIME,
  VIDEO_MIME,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from '../middleware/upload';

export type MediaType = 'image' | 'video';
export type MediaSource = 'upload' | 'url' | 'local';

export interface MediaValue {
  mediaType: MediaType;
  sourceType: MediaSource;
  url: string;
  publicId: string;
}

/**
 * Web-accessible local media directories (relative to the frontend public dir).
 * NOTE: /uploads/ is intentionally NOT included — that prefix belongs to backend
 * uploads (Render temp storage), which is never a valid public media source.
 */
export const LOCAL_MEDIA_PREFIXES = ['/images/', '/videos/'] as const;

export function detectMediaType(mime: string): MediaType {
  if ((IMAGE_MIME as readonly string[]).includes(mime)) return 'image';
  if ((VIDEO_MIME as readonly string[]).includes(mime)) return 'video';
  throw ApiError.badRequest(
    'Unsupported file type. Allowed: JPG, JPEG, PNG, WEBP, MP4, WEBM, MOV',
    'INVALID_FILE_TYPE',
  );
}

/** Server-side validation of an uploaded media file (MIME + size). */
export function validateMediaFile(file: Express.Multer.File): MediaType {
  const mediaType = detectMediaType(file.mimetype);
  if (mediaType === 'image' && file.size > MAX_IMAGE_SIZE) {
    throw ApiError.badRequest(`Image must be ${MAX_IMAGE_SIZE / (1024 * 1024)} MB or smaller`, 'FILE_TOO_LARGE');
  }
  if (mediaType === 'video' && file.size > MAX_VIDEO_SIZE) {
    throw ApiError.badRequest(`Video must be ${MAX_VIDEO_SIZE / (1024 * 1024)} MB or smaller`, 'FILE_TOO_LARGE');
  }
  return mediaType;
}

export async function storeUploadedMedia(file: Express.Multer.File): Promise<MediaValue> {
  let mediaType: MediaType;
  try {
    mediaType = validateMediaFile(file);
  } catch (err) {
    // Validation failed — don't leave the half-written file on disk.
    const { unlink } = await import('fs/promises');
    try {
      await unlink(file.path);
    } catch {
      /* best effort */
    }
    throw err;
  }
  const stored = await storeMedia(file);
  return { mediaType, sourceType: 'upload', url: stored.url, publicId: stored.publicId };
}

export function isWebUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

export function validateWebUrl(value?: string): string {
  const v = value?.trim() ?? '';
  if (!v) throw ApiError.badRequest('Media URL is required', 'URL_REQUIRED');
  if (!isWebUrl(v)) {
    throw ApiError.badRequest('Invalid media URL. Use a full http(s) URL.', 'INVALID_URL');
  }
  return v;
}

export function isLocalMediaPath(value: string): boolean {
  const v = value.trim();
  if (!v.startsWith('/')) return false;
  if (!LOCAL_MEDIA_PREFIXES.some((prefix) => v.startsWith(prefix))) return false;
  // Reject traversal, absolute Windows paths and protocol-relative URLs.
  if (v.includes('\\') || v.includes('..') || /^[a-zA-Z]:/.test(v) || v.startsWith('//')) {
    return false;
  }
  return true;
}

export function validateLocalPath(value?: string): string {
  const v = value?.trim() ?? '';
  if (!v) throw ApiError.badRequest('Local media path is required', 'LOCAL_PATH_REQUIRED');
  if (!isLocalMediaPath(v)) {
    throw ApiError.badRequest(
      'Invalid local media path. Use /images/... or /videos/...',
      'INVALID_LOCAL_PATH',
    );
  }
  return v;
}

export interface MediaInput {
  mediaType?: string;
  sourceType?: string;
  url?: string;
  localPath?: string;
  publicId?: string;
  file?: Express.Multer.File | null;
}

/**
 * Resolves a media value from an uploaded file, an external URL or a local
 * web-accessible path. Never trusts the raw input — every source is validated.
 */
export async function resolveMediaValue(input: MediaInput): Promise<MediaValue> {
  if (input.file) {
    return storeUploadedMedia(input.file);
  }

  const sourceType: MediaSource = input.sourceType === 'local' ? 'local' : 'url';
  const mediaType: MediaType = input.mediaType === 'video' ? 'video' : 'image';

  if (sourceType === 'url') {
    // A previously-uploaded file whose reference is being carried in a JSON
    // update (url + publicId) is preserved as-is when sourceType is 'upload'.
    if (input.sourceType === 'upload' && input.url && input.publicId) {
      // Only ever preserve a genuine public https URL (Cloudinary secure_urls
      // are always https). Localhost, local device paths and temporary Render
      // filesystem URLs (plain http or non-https) must never be re-persisted.
      if (!/^https:\/\/[^\s/$.?#].[^\s]*$/i.test(input.url.trim())) {
        throw ApiError.badRequest(
          'Invalid stored media reference. Uploads must be a full https URL',
          'INVALID_URL',
        );
      }
      return { mediaType, sourceType: 'upload', url: input.url, publicId: input.publicId };
    }
    return { mediaType, sourceType, url: validateWebUrl(input.url), publicId: '' };
  }

  if (sourceType === 'local') {
    return {
      mediaType,
      sourceType,
      url: validateLocalPath(input.localPath ?? input.url),
      publicId: '',
    };
  }

  throw ApiError.badRequest('Select a file, provide a URL, or choose local media', 'MEDIA_REQUIRED');
}

/** Removes a file only when it is an application-owned upload; external URLs are never touched. */
export async function removeUploadedMedia(
  media: { sourceType?: string; publicId?: string; mediaType?: string } | null | undefined,
): Promise<void> {
  if (!media || media.sourceType !== 'upload' || !media.publicId) return;
  await deleteMedia(media.publicId, media.mediaType === 'video' ? 'video' : 'image');
}

export type { StoredMediaType };