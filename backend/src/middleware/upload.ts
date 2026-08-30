import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime'] as const;
export const ALL_MEDIA_MIME = new Set<string>([...IMAGE_MIME, ...VIDEO_MIME]);

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

// Serverless runtimes (e.g. Vercel Lambda) mount the deployment directory
// read-only and give no persistent disk. Local uploads therefore MUST live in
// the OS temp directory there; the directory is created lazily on the first
// upload rather than at module import, so a filesystem problem can never take
// the whole function down on startup.
function baseUploadDir(): string {
  return env.isProduction
    ? path.join(os.tmpdir(), 'sivasakthi-salon', 'uploads')
    : path.resolve(process.cwd(), 'uploads');
}

let uploadDir: string | null = null;

export function getUploadDir(): string {
  if (uploadDir) return uploadDir;
  uploadDir = baseUploadDir();
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sivasakthi-salon-'));
  }
  return uploadDir;
}

/**
 * Safe disk storage: the stored filename is generated from the validated
 * MIME type (never from the client-supplied filename), which prevents
 * executable uploads and path-traversal filenames.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getUploadDir()),
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] ?? '.bin';
    const name = `media-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!(IMAGE_MIME as readonly string[]).includes(file.mimetype)) {
    return cb(
      ApiError.badRequest('Only JPEG, PNG or WEBP images are allowed', 'INVALID_FILE_TYPE'),
    );
  }
  cb(null, true);
};

const videoFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!(VIDEO_MIME as readonly string[]).includes(file.mimetype)) {
    return cb(
      ApiError.badRequest('Only MP4, WEBM or MOV videos are allowed', 'INVALID_FILE_TYPE'),
    );
  }
  cb(null, true);
};

const mediaFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!ALL_MEDIA_MIME.has(file.mimetype)) {
    return cb(
      ApiError.badRequest(
        'Unsupported file type. Allowed: JPG, JPEG, PNG, WEBP, MP4, WEBM, MOV',
        'INVALID_FILE_TYPE',
      ),
    );
  }
  cb(null, true);
};

export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
});

export const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: MAX_VIDEO_SIZE, files: 1 },
});

/** Accepts both images and videos; per-type size limits are enforced by the media service. */
export const uploadMedia = multer({
  storage,
  fileFilter: mediaFilter,
  limits: { fileSize: MAX_VIDEO_SIZE, files: 1 },
});

export function publicUrl(filename: string): string {
  if (env.isProduction) {
    return `/uploads/${filename}`;
  }
  return `http://localhost:${env.port}/uploads/${filename}`;
}