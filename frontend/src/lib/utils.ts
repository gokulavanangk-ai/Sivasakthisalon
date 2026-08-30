import { clsx, type ClassValue } from 'clsx';
import { BUSINESS_FALLBACK } from '@/constants';
import type { BusinessInfo, MediaType, SalonSettings } from '@/types';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function businessInfoOf(salon?: SalonSettings): BusinessInfo {
  return { ...BUSINESS_FALLBACK, ...(salon?.businessInfo ?? {}) } as BusinessInfo;
}

// ---------- Media helpers ----------

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'];

export function isVideoUrl(value?: string): boolean {
  if (!value) return false;
  if (/^data:video\//.test(value)) return true;
  const clean = value.split('?')[0].split('#')[0].toLowerCase();
  if (VIDEO_EXTENSIONS.some((ext) => clean.endsWith(`.${ext}`))) return true;
  if (/\.(m3u8|mpd)(\/|$)/.test(clean)) return true;
  // Some CDNs keep the file extension on a path segment (not the end).
  return VIDEO_EXTENSIONS.some((ext) =>
    clean.split('/').some((seg) => seg.endsWith(`.${ext}`)),
  );
}

export function isImageUrl(value?: string): boolean {
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
  item: { media?: { mediaType?: string }; videoUrl?: string; imageUrl?: string } | null | undefined,
): MediaType {
  if (item?.media?.mediaType === 'video') return 'video';
  if (item?.media?.mediaType === 'image') return 'image';
  if (isVideoUrl(item?.videoUrl) && !item?.imageUrl) return 'video';
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

export interface HeroMediaResolved {
  videoUrl: string;
  imageUrl: string;
  poster: string;
}

/**
 * Resolves which hero background to show. Prefers the structured `hero.media`
 * but falls back to the legacy `videoUrl`/`posterUrl`/`mobileImageUrl` fields
 * whenever no structured media URL is configured — this keeps old hero videos
 * working even after a default `media.mediaType: "image"` subdoc exists.
 */
export function resolveHeroMedia(hero?: SalonSettings['hero']): HeroMediaResolved {
  const m = hero?.media;
  const hasStructured = Boolean(m?.url);
  let videoUrl = '';
  let imageUrl = '';
  let poster = '';

  if (m?.mediaType === 'video') {
    videoUrl = m.url;
    imageUrl = m.posterUrl || hero?.posterUrl || hero?.mobileImageUrl || '';
    poster = m.posterUrl || hero?.posterUrl || '';
  } else if (m?.mediaType === 'image' && hasStructured) {
    imageUrl = m.url;
    poster = m.posterUrl || hero?.posterUrl || '';
  } else if (!hasStructured) {
    videoUrl = hero?.videoUrl ?? '';
    imageUrl = hero?.posterUrl || hero?.mobileImageUrl || '';
    poster = hero?.posterUrl || '';
  }

  return { videoUrl, imageUrl, poster };
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
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

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => {
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