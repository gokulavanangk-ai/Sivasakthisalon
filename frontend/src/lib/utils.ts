import { clsx, type ClassValue } from 'clsx';
import type { BusinessInfo, MediaType, SalonSettings } from '@/types';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Returns the salon's shared business information straight from MongoDB (the
 * single source of truth). No hardcoded fallbacks — but fields that MongoDB
 * leaves out (or stores as null) are coerced to their declared type so no
 * consumer ever receives `undefined`. Numeric fields keep their number when
 * present; string fields become '' when absent.
 */
export function businessInfoOf(salon?: SalonSettings): BusinessInfo {
  const src = (salon?.businessInfo ?? {}) as Partial<Record<keyof BusinessInfo, unknown>>;
  const out: Record<string, unknown> = {};
  for (const key of BUSINESS_INFO_KEYS) {
    const value = src[key];
    out[key] = typeof value === 'string' ? value : value ?? '';
  }
  return out as unknown as BusinessInfo;
}

const BUSINESS_INFO_KEYS: (keyof BusinessInfo)[] = [
  'salonName',
  'tamilName',
  'tagline',
  'taglineTamil',
  'experienceYears',
  'happyCustomers',
  'professionalBarbers',
  'phone',
  'whatsapp',
  'email',
  'address',
  'openingHours',
  'workingDays',
  'instagram',
  'facebook',
  'youtube',
  'googleMapsUrl',
];

// ---------- Media helpers ----------

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'];

/**
 * Recognizes external video URLs by file extension, streaming formats, and known
 * public video providers (Pexels, YouTube, Vimeo, Dailymotion, Wistia, Google
 * Drive, Cloudinary video paths). Media-type detection is provider-aware so a
 * public video URL is never misclassified as an image. Returns false for empty,
 * undefined or null-ish inputs so callers never pass a bad value downstream.
 */
export function isVideoUrl(value?: string | null): boolean {
  const raw = value?.trim();
  if (!raw) return false;
  if (/^data:video\//.test(raw)) return true;

  const clean = raw.split('?')[0].split('#')[0].toLowerCase();
  if (VIDEO_EXTENSIONS.some((ext) => clean.endsWith(`.${ext}`))) return true;
  if (/\.(m3u8|mpd)(\/|$)/.test(clean)) return true;
  // Some CDNs keep the file extension on a path segment (not the end).
  if (VIDEO_EXTENSIONS.some((ext) => clean.split('/').some((seg) => seg.endsWith(`.${ext}`)))) {
    return true;
  }

  if (!/^https?:\/\//i.test(clean)) return false;
  // Keep the query string so provider matchers that use `?v=` etc. still work.
  const withoutScheme = raw.trim().replace(/^https?:\/\//i, '');

  // Pexels: file server host and its video landing/download page URLs.
  if (/videos\.pexels\.com\//i.test(withoutScheme)) return true;
  if (/^(www\.)?pexels\.com\/(download\/)?video\//i.test(withoutScheme)) return true;

  // YouTube (watch / short / embed) and host-short URL (youtu.be).
  if (/youtube\.com\/(watch\?.*v=|shorts\/|embed\/|live\/)/i.test(withoutScheme)) return true;
  if (/youtu\.be\/[\w-]+/i.test(withoutScheme)) return true;

  // Vimeo (page or embed player).
  if (/^(player\.)?vimeo\.com\/(video\/)?\d+/i.test(withoutScheme)) return true;

  // Dailymotion, Wistia and Google Drive file viewers.
  if (/dailymotion\.com\/video\//i.test(withoutScheme)) return true;
  if (/[\w-]+\.wistia\.com\/medias\//i.test(withoutScheme)) return true;
  if (/drive\.google\.com\/file\/d\//i.test(withoutScheme)) return true;

  // Cloudinary video assets (explicit /video/upload/ path).
  if (/res\.cloudinary\.com\/[^/]+\/video\/upload\//i.test(withoutScheme)) return true;

  return false;
}

export function isImageUrl(value?: string | null): boolean {
  if (!value) return false;
  const clean = value.split('?')[0].split('#')[0].toLowerCase();
  if (IMAGE_EXTENSIONS.some((ext) => clean.endsWith(`.${ext}`))) return true;
  return /^data:image\//.test(value);
}

export function mediaUrlOf(
  item: { media?: { url?: string }; videoUrl?: string; imageUrl?: string } | null | undefined,
): string {
  if (!item) return '';
  return item.media?.url || item.videoUrl || item.imageUrl || '';
}

export function mediaTypeOf(
  item: { media?: { mediaType?: string; url?: string }; videoUrl?: string; imageUrl?: string } | null | undefined,
): MediaType {
  if (item?.media?.mediaType === 'video') return 'video';
  if (item?.media?.mediaType === 'image') return 'image';
  // Provider-aware detection on the effective URL so a public video link
  // (e.g. a Pexels /download/video/... page) is never treated as an image.
  const effective = item?.media?.url || item?.videoUrl || item?.imageUrl || '';
  if (isVideoUrl(effective)) return 'video';
  if (isImageUrl(effective)) return 'image';
  return 'image';
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function isValidMediaUrl(value?: string): boolean {
  if (!value) return false;
  const v = value.trim();
  return /^https?:\/\/\S+$/i.test(v) || v.startsWith('/');
}

/**
 * Extracts a usable URL from a value that may be a plain URL or a full embed
 * snippet (e.g. '<iframe src="https://..."></iframe>'). Returns '' if no valid
 * http(s) URL can be found. Used to harden legacy Google Maps embed fields that
 * were accidentally saved with the surrounding iframe markup.
 */
export function extractEmbedUrl(value?: string | null): string {
  if (!value) return '';
  const raw = value.trim();
  if (!raw) return '';

  const srcMatch = raw.match(/src\s*=\s*["']([^"']+)["']/i);
  const candidate = srcMatch ? srcMatch[1] : raw;
  if (/^https?:\/\/\S+$/i.test(candidate)) return candidate;

  // Allow maps.google.com / google.com/maps embed URLs specifically, even if
  // the generic http(s) test already caught them; reject everything else.
  return '';
}

export function isValidDirectionsUrl(value?: string | null): boolean {
  const url = extractEmbedUrl(value);
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return /^https?:$/.test(parsed.protocol);
  } catch {
    return false;
  }
}

export interface HeroMediaResolved {
  videoUrl: string;
  imageUrl: string;
  poster: string;
  /** Static image shown on small screens (below md) instead of the video. */
  mobileImageUrl: string;
}

/**
 * Resolves which hero background to show. Prefers the structured `hero.media`
 * but falls back to the legacy `videoUrl`/`posterUrl`/`mobileImageUrl` fields
 * whenever no structured media URL is configured — this keeps old hero videos
 * working even after a default `media.mediaType: "image"` subdoc exists.
 *
 * `mobileImageUrl` is always sourced from `hero.mobileImageUrl` (the dedicated
 * phone fallback). When it is empty, callers fall back to imageUrl/poster.
 */
export function resolveHeroMedia(hero?: SalonSettings['hero']): HeroMediaResolved {
  const m = hero?.media;
  const hasStructured = Boolean(m?.url);
  let videoUrl = '';
  let imageUrl = '';
  let poster = '';
  let mobileImageUrl = hero?.mobileImageUrl ?? '';

  if (m?.mediaType === 'video') {
    videoUrl = m.url;
    imageUrl = m.posterUrl || hero?.posterUrl || mobileImageUrl || '';
    poster = m.posterUrl || hero?.posterUrl || '';
  } else if (m?.mediaType === 'image' && hasStructured) {
    imageUrl = m.url;
    poster = m.posterUrl || hero?.posterUrl || '';
  } else if (!hasStructured) {
    videoUrl = hero?.videoUrl ?? '';
    imageUrl = hero?.posterUrl || mobileImageUrl || '';
    poster = hero?.posterUrl || '';
  }

  return { videoUrl, imageUrl, poster, mobileImageUrl };
}

export function formatPhone(phone?: string | null): string {
  if (!phone) return '';
  const phoneStr = String(phone);
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone;
}

export function displayDate(date: string, time?: string): string {
  const d = new Date(`${date}T00:00:00`);
  const formatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
  return time ? `${formatted} \u00b7 ${time}` : formatted;
}

export function to12Hour(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export function todayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

export function addDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

export function nextNDays(count: number): string[] {
  const today = todayDateKey();
  return Array.from({ length: count }, (_, i) => addDays(today, i));
}

export function escapeHtml(text?: string | null): string {
  if (!text) return '';
  return String(text).replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[c];
  });
}