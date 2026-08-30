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

const IMAGE_EXT_REGEX = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i;
const VIDEO_EXT_REGEX = /\.(mp4|webm|mov|m4v|ogv)(\/|$)/i;

/**
 * Classifies a public http(s) external URL as an 'image' or 'video' based on
 * file extension and known public video providers (Pexels, YouTube, Vimeo,
 * Dailymotion, Wistia, Google Drive, Cloudinary video paths). This lets a
 * caller distinguish an external image URL from an external video URL without
 * ever routing a video through image-only (or Cloudinary upload) logic.
 *
 * Returns null for empty, scheme-less or explicitly ambiguous inputs so a
 * caller can decide the default instead of guessing.
 */
export function externalUrlMediaType(url?: string): MediaType | null {
  const raw = url?.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) return null;

  // Provider-aware host/path checks (scheme + query already stripped below).
  const withoutScheme = raw.replace(/^https?:\/\//i, '');
  if (/^(www\.)?pexels\.com\/(download\/)?video\//i.test(withoutScheme)) return 'video';
  if (/videos\.pexels\.com\//i.test(withoutScheme)) return 'video';
  if (/youtube\.com\/(watch\?.*v=|shorts\/|embed\/|live\/)/i.test(withoutScheme)) return 'video';
  if (/youtu\.be\/[\w-]+/i.test(withoutScheme)) return 'video';
  if (/^(player\.)?vimeo\.com\/(video\/)?\d+/i.test(withoutScheme)) return 'video';
  if (/dailymotion\.com\/video\//i.test(withoutScheme)) return 'video';
  if (/[\w-]+\.wistia\.com\/medias\//i.test(withoutScheme)) return 'video';
  if (/drive\.google\.com\/file\/d\//i.test(withoutScheme)) return 'video';
  if (/res\.cloudinary\.com\/[^/]+\/video\/upload\//i.test(withoutScheme)) return 'video';

  const clean = raw.split('?')[0].split('#')[0].replace(/^https?:\/\//i, '');
  if (VIDEO_EXT_REGEX.test(clean)) return 'video';
  if (/\.(m3u8|mpd)(\/|$)/i.test(clean)) return 'video';
  if (IMAGE_EXT_REGEX.test(clean)) return 'image';
  if (/^[^/]+\.[^/]+$/.test(clean)) return 'image';
  if (/images?\.pexels\.com\//i.test(clean)) return 'image';

  return null;
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
  const mediaType: MediaType =
    input.mediaType === 'video'
      ? 'video'
      : input.mediaType === 'image'
        ? 'image'
        : (externalUrlMediaType(input.url) ?? 'image');

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

/**
 * Sanitizes a persisted media/URL field bound for MongoDB so that only durable,
 * publicly reachable assets are ever stored. Accepts:
 *  - '' / undefined (cleared field),
 *  - any full https (or http) URL that passes the SSRF host check (this includes
 *    Cloudinary secure URLs whose host is res.cloudinary.com),
 * and rejects everything else:
 *  - localhost / 127.0.0.1 / private & internal network hosts (SSRF),
 *  - backend upload references: http://localhost:PORT/uploads/... and /uploads/...,
 *  - blob:, data:, file:, javascript://, relative paths and absolute local paths.
 * Throws ApiError on a disallowed value; returns the trimmed safe URL otherwise.
 */
export function sanitizePersistedUrl(
  value?: string,
  label = 'Media URL',
  opts?: { allowEmpty?: boolean },
): string {
  const v = value?.trim() ?? '';
  if (!v) {
    if (opts?.allowEmpty === false) {
      throw ApiError.badRequest(`${label} is required`, 'URL_REQUIRED');
    }
    return '';
  }
  if (!/^https?:\/\/\S+$/i.test(v)) {
    throw ApiError.badRequest(
      `${label} must be a full https URL (or a Cloudinary upload URL). Localhost, /uploads/, blob:, file:, data: and local paths are not allowed.`,
      'INVALID_URL',
    );
  }
  // Rejects localhost, private/LAN/link-local/internal hosts, and anything that
  // is not an http(s) URL.
  return validateWebUrl(v);
}

/**
 * Non-throwing read-path variant of `sanitizePersistedUrl`. Returns the trimmed
 * safe public URL when the value is a durable http(s) asset (Cloudinary or an
 * external image/video URL), or `''` for anything unsafe or empty —
 * localhost, 127.0.0.1, private/IP ranges, `/uploads/...` backend references,
 * `blob:`/`data:`/`file:`/`javascript:`, relative and absolute local paths.
 *
 * Used when materializing a document to send to the browser (or to re-save) so
 * a stale localhost `/uploads/...` value left in the DB can never be requested
 * by the client (mixed-content) or fail a subsequent save — it is simply cleared
 * instead of surfaced.
 */
export function cleanPersistedUrl(value?: string | null): string {
  const v = value?.trim() ?? '';
  if (!v) return '';
  try {
    return sanitizePersistedUrl(v);
  } catch {
    return '';
  }
}

/**
 * Removes a file only when it is an application-owned upload; external URLs are never touched. */
export async function removeUploadedMedia(
  media: { sourceType?: string; publicId?: string; mediaType?: string } | null | undefined,
): Promise<void> {
  if (!media || media.sourceType !== 'upload' || !media.publicId) return;
  await deleteMedia(media.publicId, media.mediaType === 'video' ? 'video' : 'image');
}

export type { StoredMediaType };