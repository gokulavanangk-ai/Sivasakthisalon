import type { Request, Response } from 'express';
import { getOrCreateSalonSettings, updateSalonSettings } from '../services/salonService';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';
import { storeImage, deleteImage } from '../services/fileStorage';
import { ApiError } from '../utils/ApiError';
import { removeUploadedMedia, validateImageSignature, cleanPersistedUrl } from '../services/mediaService';
import type { SalonSettingsDocument } from '../models/SalonSettings';
import type { AuthRequest } from '../middleware/auth';

export const getSalonHandler = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getOrCreateSalonSettings();
  syncHeroMedia(settings);
  scrubSalonMediaReferences(settings);
  ok(res, settings, 'Salon fetched');
});

export const updateSalonHandler = asyncHandler(async (req: Request, res: Response) => {
  const current = await getOrCreateSalonSettings();
  const oldHero = current.hero?.media?.publicId
    ? { ...current.hero.media }
    : null;

  const settings = await updateSalonSettings(req.body);
  syncHeroMedia(settings);
  await settings.save();

  // Remove a replaced hero upload only after the update succeeded.
  const newHero = (req.body as { hero?: { media?: { publicId?: string } } }).hero?.media;
  if (oldHero && oldHero.publicId && oldHero.publicId !== newHero?.publicId) {
    await removeUploadedMedia(oldHero);
  }
  ok(res, settings, 'Salon updated');
});

export const uploadLogoHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw ApiError.badRequest('Logo image is required', 'FILE_REQUIRED');
  // Verify the real bytes are an image before anything reaches Cloudinary.
  validateImageSignature(req.file);
  const settings = await getOrCreateSalonSettings();
  const oldPublicId = settings.logo?.publicId;

  // Upload the NEW logo first; only after it is safely stored and saved may the
  // previous one be destroyed. This guarantees an upload failure can never leave
  // the salon without a logo (the DB keeps pointing at the old asset).
  const stored = await storeImage(req.file);
  settings.logo = {
    url: stored.url,
    publicId: stored.publicId,
    width: stored.width,
    height: stored.height,
    bytes: stored.bytes,
    format: stored.format,
  };
  await settings.save();

  if (oldPublicId && oldPublicId !== stored.publicId) {
    await deleteImage(oldPublicId);
  }
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

/**
 * Keeps the legacy hero fields (`videoUrl`, `posterUrl`, `mobileImageUrl`) in
 * sync with the new structured `hero.media` so older consumers keep working.
 *
 * When no structured media has been configured yet (media.url empty), the
 * legacy fields are backfilled into `hero.media` — otherwise the new
 * `media.mediaType` default of "image" would silently disable a hero video
 * that was set through the old `videoUrl` field.
 */
export function syncHeroMedia(settings: SalonSettingsDocument): void {
  const hero = settings.hero ?? (settings.hero = {} as SalonSettingsDocument['hero']);
  const media = hero.media ?? (hero.media = {
    mediaType: 'image',
    sourceType: 'url',
    url: '',
    posterUrl: '',
    publicId: '',
    autoplay: true,
    muted: true,
    loop: true,
    playsInline: true,
  });

  // Self-heal: never surface a stale localhost / /uploads/ / private-network
  // reference (e.g. http://localhost:5000/uploads/media-...png left by an earlier
  // dev session). Scrubbed values become '' so the browser can't request them
  // (mixed-content) and the next hero save won't fail validation.
  hero.videoUrl = cleanPersistedUrl(hero.videoUrl);
  hero.posterUrl = cleanPersistedUrl(hero.posterUrl);
  hero.mobileImageUrl = cleanPersistedUrl(hero.mobileImageUrl);
  media.url = cleanPersistedUrl(media.url);
  media.posterUrl = cleanPersistedUrl(media.posterUrl);

  if (!media.url && media.mediaType !== 'none') {
    if (hero.videoUrl) {
      media.mediaType = 'video';
      media.sourceType = 'url';
      media.url = hero.videoUrl;
      media.posterUrl = hero.posterUrl || media.posterUrl || '';
      media.publicId = '';
    } else if (hero.mobileImageUrl || hero.posterUrl) {
      media.mediaType = 'image';
      media.sourceType = 'url';
      media.url = hero.mobileImageUrl || hero.posterUrl;
      media.posterUrl = hero.posterUrl || '';
      media.publicId = '';
    }
  }

  if (!media.url) {
    // No usable hero asset after self-healing — also drop any orphaned publicId
    // so a stale Cloudinary/upload reference is never carried or treated as live.
    media.publicId = '';
    return;
  }
  if (media.mediaType === 'video') {
    hero.videoUrl = media.url;
    if (media.posterUrl) hero.posterUrl = media.posterUrl;
    hero.mobileImageUrl = media.posterUrl || hero.mobileImageUrl || '';
  } else if (media.mediaType === 'image') {
    hero.mobileImageUrl = media.url;
    hero.posterUrl = media.posterUrl || hero.posterUrl || '';
    hero.videoUrl = '';
  } else {
    hero.videoUrl = '';
  }
}

/**
 * Read-path safety net for the non-hero salon media fields. Clears any stale
 * localhost / /uploads/ / private-network / blob / data / file reference from
 * logo, about image and offer images so the browser never requests an unsafe
 * URL (mixed-content) and a subsequent save never fails validation. Safe
 * Cloudinary and external public URLs are preserved unchanged.
 */
function scrubSalonMediaReferences(settings: SalonSettingsDocument): void {
  if (settings.logo?.url) settings.logo.url = cleanPersistedUrl(settings.logo.url);
  if (settings.about?.imageUrl) settings.about.imageUrl = cleanPersistedUrl(settings.about.imageUrl);
  if (settings.offers?.items?.length) {
    settings.offers.items = settings.offers.items.map((item) =>
      item?.imageUrl ? { ...item, imageUrl: cleanPersistedUrl(item.imageUrl) } : item,
    );
  }
}