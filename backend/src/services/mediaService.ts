import { ApiError } from '../utils/ApiError';
import {
  storeMedia,
  deleteMedia,
  type StoredMediaType,
  type StoredMedia,
} from './fileStorage';
import {
  IMAGE_MIME,
  VIDEO_MIME,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  detectImageFormat,
  isUnsafeHost,
  readUploadedFile,
} from '../middleware/upload';

export type MediaType = 'image' | 'video';
export type MediaSource = 'upload' | 'url' | 'local';

export interface MediaValue {
  mediaType: MediaType;
  sourceType: MediaSource;
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  resourceType?: string;
  createdBy?: string;
  updatedBy?: string;
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
    throw ApiError.badRequest(`Image must be ${Math.ceil(MAX_IMAGE_SIZE / (1024 * 1024))} MB or smaller`, 'FILE_TOO_LARGE');
  }
  if (mediaType === 'video' && file.size > MAX_VIDEO_SIZE) {
    throw ApiError.badRequest(`Video must be ${MAX_VIDEO_SIZE / (1024 * 1024)} MB or smaller`, 'FILE_TOO_LARGE');
  }
  return mediaType;
}

/**
 * Validates the actual file signature (magic bytes) against the declared MIME
 * type. The multer file filter only trusts the client-supplied Content-Type,
 * which is trivially spoofable — this re-checks the real bytes read back from
 * disk so an executable or mislabeled file can never reach Cloudinary.
 */
export function validateImageSignature(file: Express.Multer.File): void {
  if (!file.path) return;
  let buffer: Buffer;
  try {
    buffer = readUploadedFile(file.path);
  } catch {
    throw ApiError.badRequest('Could not read the uploaded file', 'READ_FAILED');
  }
  const detected = detectImageFormat(buffer);
  if (!detected) {
    throw ApiError.badRequest(
      'The file is not a valid image. Allowed: JPG, JPEG, PNG, WEBP, GIF, BMP, AVIF',
      'INVALID_FILE_SIGNATURE',
    );
  }
  // The declared MIME and detected signature may differ (e.g. a .jpg sent with
  // image/png). Accept as long as BOTH are supported image formats, but always
  // trust the detected signature over the spoofed header.
  if (!(IMAGE_MIME as readonly string[]).includes(detected)) {
    throw ApiError.badRequest('Unsupported image format detected in file bytes', 'UNSUPPORTED_IMAGE_FORMAT');
  }
}

export async function storeUploadedMedia(
  file: Express.Multer.File,
  opts?: { createdBy?: string },
): Promise<MediaValue> {
  let mediaType: MediaType;
  try {
    mediaType = validateMediaFile(file);
    if (mediaType === 'image') validateImageSignature(file);
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
  const stored: StoredMedia = await storeMedia(file);
  return {
    mediaType,
    sourceType: 'upload',
    url: stored.url,
    publicId: stored.publicId,
    width: stored.width,
    height: stored.height,
    bytes: stored.bytes ?? file.size,
    format: stored.format,
    resourceType: stored.resourceType,
    createdBy: opts?.createdBy,
    updatedBy: opts?.createdBy,
  };
}

export function isWebUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

/** Extracts the host from an http(s) URL, or null when it is malformed. */
export function hostOfUrl(value: string): string | null {
  try {
    const u = new URL(value.trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.hostname;
  } catch {
    return null;
  }
}

export function validateWebUrl(value?: string): string {
  const v = value?.trim() ?? '';
  if (!v) throw ApiError.badRequest('Media URL is required', 'URL_REQUIRED');
  if (!isWebUrl(v) || !hostOfUrl(v)) {
    throw ApiError.badRequest('Invalid media URL. Use a full http(s) URL.', 'INVALID_URL');
  }
  // SSRF guard: never accept URLs that point at the local machine, a private
  // LAN address, link-local, loopback or otherwise internal network host.
  const host = hostOfUrl(v) as string;
  if (isUnsafeHost(host)) {
    throw ApiError.badRequest(
      'This image URL points at a local or private network and cannot be used.',
      'UNSAFE_URL',
    );
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
  /** Admin id performing the upload, stored on the media value for auditing. */
  createdBy?: string;
}

/**
 * Resolves a media value from an uploaded file, an external URL or a local
 * web-accessible path. Never trusts the raw input — every source is validated.
 */
export async function resolveMediaValue(input: MediaInput): Promise<MediaValue> {
  if (input.file) {
    return storeUploadedMedia(input.file, { createdBy: input.createdBy });
  }

  const sourceType: MediaSource = input.sourceType === 'local' ? 'local' : 'url';
  const mediaType: MediaType = input.mediaType === 'video' ? 'video' : 'image';

  if (sourceType === 'url') {
    // A previously-uploaded file whose reference is being carried in a JSON
    // update (url + publicId) is preserved as-is when sourceType is 'upload'.
    if (input.sourceType === 'upload' && input.url && input.publicId) {
      // Only ever preserve a genuine Cloudinary secure_url. Localhost, local
      // device paths and temporary Render filesystem URLs must never be
      // re-persisted — the DB may only point at durable https Cloudinary assets.
      if (!/^https:\/\/res\.cloudinary\.com\/[^\s]+$/i.test(input.url.trim())) {
        throw ApiError.badRequest(
          'Invalid stored media reference. Uploads must be a full Cloudinary https URL',
          'INVALID_URL',
        );
      }
      return { mediaType, sourceType: 'upload', url: input.url, publicId: input.publicId };
    }
    const validated = validateWebUrl(input.url);
    return { mediaType, sourceType, url: validated, publicId: '' };
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