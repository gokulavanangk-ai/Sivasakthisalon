import fs from 'fs';
import path from 'path';
import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { storeUploadedMedia } from '../services/mediaService';
import {
  deleteMedia,
  listMediaLibrary,
  getMediaAsset,
} from '../services/fileStorage';
import { GalleryItem } from '../models/GalleryItem';
import { Service } from '../models/Service';
import { Hairstyle } from '../models/Hairstyle';
import { Quote } from '../models/Quote';
import { SalonSettings } from '../models/SalonSettings';
import type { AuthRequest } from '../middleware/auth';

/**
 * POST /api/admin/media/upload
 * Uploads an image or video file and returns the Cloudinary secure_url +
 * publicId plus asset metadata. The record that references it is saved
 * separately (upload-then-attach), which keeps storage concerns out of the
 * per-resource controllers. The multer filter + signature check guarantee only
 * real image files are accepted before any bytes reach Cloudinary.
 */
export const uploadMediaHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw ApiError.badRequest('A media file is required', 'FILE_REQUIRED');
  const media = await storeUploadedMedia(req.file, { createdBy: req.user?.id });
  ok(
    res,
    {
      url: media.url,
      publicId: media.publicId,
      mediaType: media.mediaType,
      sourceType: media.sourceType,
      size: req.file.size,
      originalName: req.file.originalname,
      width: media.width,
      height: media.height,
      bytes: media.bytes,
      format: media.format,
      resourceType: media.resourceType,
    },
    'Media uploaded',
    201,
  );
});

/**
 * GET /api/admin/media/local
 * Lists images/videos stored inside the frontend public directory so the
 * admin can reuse existing local media without typing paths manually (dev only).
 */
export const listLocalMediaHandler = asyncHandler(async (_req: Request, res: Response) => {
  const base = path.resolve(process.cwd(), '../frontend/public');
  const roots: { dir: string; urlPrefix: string; mediaType: 'image' | 'video' }[] = [
    { dir: path.join(base, 'images'), urlPrefix: '/images', mediaType: 'image' },
    { dir: path.join(base, 'videos'), urlPrefix: '/videos', mediaType: 'video' },
  ];

  const files: { path: string; name: string; mediaType: 'image' | 'video'; size: number }[] = [];
  for (const root of roots) {
    if (!fs.existsSync(root.dir)) continue;
    const walk = (current: string): void => {
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        if (entry.name.startsWith('.')) continue;
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.isFile()) {
          const rel = path.relative(root.dir, full).split(path.sep).join('/');
          const stat = fs.statSync(full);
          files.push({
            path: `${root.urlPrefix}/${rel}`,
            name: entry.name,
            mediaType: root.mediaType,
            size: stat.size,
          });
        }
      }
    };
    walk(root.dir);
  }

  files.sort((a, b) => a.path.localeCompare(b.path));
  ok(res, files);
});

/**
 * GET /api/admin/media/library
 * Lists Cloudinary assets already uploaded to the salon folder so the admin can
 * reuse a previously-uploaded image as the single source for multiple fields.
 */
export const listMediaLibraryHandler = asyncHandler(async (_req: Request, res: Response) => {
  const assets = await listMediaLibrary();
  ok(res, assets);
});

/**
 * GET /api/admin/media/:publicId
 * Fetches a single Cloudinary asset's metadata so the admin can inspect or
 * confirm an existing asset before reusing/replacing it.
 */
export const getMediaFileHandler = asyncHandler(async (req: Request, res: Response) => {
  const publicId = req.params.publicId ? decodeURIComponent(req.params.publicId) : '';
  if (!publicId) throw ApiError.badRequest('publicId is required', 'BAD_REQUEST');
  const asset = await getMediaAsset(publicId);
  ok(res, asset);
});

const SAFE_UPLOAD_NAME =
  /^(media|upload)-\d+-\d+\.(jpg|jpeg|png|webp|gif|bmp|avif|heic|mp4|webm|mov)$/i;

/**
 * Determines whether a Cloudinary publicId is still referenced by any record in
 * the CMS. Used to avoid destroying a shared asset that pages are still using.
 */
async function isMediaReferenced(publicId: string): Promise<boolean> {
  const checks = await Promise.allSettled([
    GalleryItem.exists({ publicId }),
    GalleryItem.exists({ 'media.publicId': publicId }),
    Service.exists({ 'media.publicId': publicId }),
    Hairstyle.exists({ 'image.publicId': publicId }),
    Hairstyle.exists({ 'thumbnail.publicId': publicId }),
    Hairstyle.exists({ 'video.publicId': publicId }),
    Quote.exists({ 'image.publicId': publicId }),
    SalonSettings.exists({ 'logo.publicId': publicId }),
    SalonSettings.exists({ 'hero.media.publicId': publicId }),
  ]);
  return checks.some((r) => r.status === 'fulfilled' && r.value);
}

/**
 * DELETE /api/admin/media/:publicId
 * Removes an uploaded media file from Cloudinary. Only filenames generated by
 * this application are eligible — external URLs are never touched. The asset is
 * only destroyed when no CMS record still references it; otherwise the delete is
 * refused so an in-use image is never orphaned.
 */
export const deleteMediaFileHandler = asyncHandler(async (req: Request, res: Response) => {
  const raw = req.params.publicId;
  if (!raw) throw ApiError.badRequest('publicId is required', 'BAD_REQUEST');

  const mediaType = req.query.mediaType === 'video' ? 'video' : 'image';
  const basename = path.basename(raw);
  if (!SAFE_UPLOAD_NAME.test(basename)) {
    throw ApiError.badRequest('Not an application-owned media file', 'INVALID_MEDIA_ID');
  }

  // Cloudinary publicId kept the sivasakthi-salon/ folder prefix on upload.
  const safePublicId = raw.startsWith('sivasakthi-salon/') ? raw : `sivasakthi-salon/${raw}`;

  if (await isMediaReferenced(safePublicId)) {
    throw ApiError.conflict(
      'This image is still used by the CMS and cannot be deleted from the library.',
      'MEDIA_IN_USE',
    );
  }

  await deleteMedia(safePublicId, mediaType);
  ok(res, null, 'Media file removed');
});
