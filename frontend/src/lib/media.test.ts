import { describe, expect, it } from 'vitest';
import {
  isVideoUrl,
  isImageUrl,
  mediaUrlOf,
  mediaTypeOf,
  formatBytes,
  isValidMediaUrl,
  resolveHeroMedia,
} from '@/lib/utils';

describe('media URL detection', () => {
  it('detects video URLs by extension and data URI', () => {
    expect(isVideoUrl('https://example.com/video.mp4')).toBe(true);
    expect(isVideoUrl('https://example.com/clip.webm?token=1')).toBe(true);
    expect(isVideoUrl('https://example.com/clip.mov')).toBe(true);
    expect(isVideoUrl('data:video/mp4;base64,AAAA')).toBe(true);
    expect(isVideoUrl('https://example.com/photo.jpg')).toBe(false);
    expect(isVideoUrl('')).toBe(false);
  });

  it('detects HLS and mid-path video extensions', () => {
    expect(isVideoUrl('https://cdn.example.com/live/index.m3u8')).toBe(true);
    expect(isVideoUrl('https://cdn.example.com/videos/hero.mp4/playlist.mpd')).toBe(true);
    expect(isVideoUrl('https://cdn.example.com/photo.webp')).toBe(false);
  });

  it('detects image URLs by extension', () => {
    expect(isImageUrl('https://example.com/photo.webp')).toBe(true);
    expect(isImageUrl('/images/gallery/barber-01.jpg')).toBe(true);
    expect(isImageUrl('https://example.com/video.mp4')).toBe(false);
  });
});

describe('resolveHeroMedia', () => {
  it('prefers the structured video media', () => {
    const r = resolveHeroMedia({
      videoUrl: 'https://example.com/old.mp4',
      media: { mediaType: 'video', sourceType: 'url', url: 'https://example.com/new.mp4', posterUrl: 'https://example.com/poster.webp' },
    } as never);
    expect(r.videoUrl).toBe('https://example.com/new.mp4');
    expect(r.poster).toBe('https://example.com/poster.webp');
  });

  it('falls back to legacy videoUrl when the media subdoc has no url', () => {
    const r = resolveHeroMedia({
      videoUrl: 'https://example.com/legacy.mp4',
      posterUrl: 'https://example.com/poster.webp',
      media: { mediaType: 'image', sourceType: 'url', url: '' },
    } as never);
    expect(r.videoUrl).toBe('https://example.com/legacy.mp4');
    expect(r.imageUrl).toBe('https://example.com/poster.webp');
  });

  it('uses legacy fields when there is no media subdoc at all', () => {
    const r = resolveHeroMedia({
      videoUrl: 'https://example.com/legacy.mp4',
      mobileImageUrl: 'https://example.com/mobile.webp',
    } as never);
    expect(r.videoUrl).toBe('https://example.com/legacy.mp4');
    expect(r.imageUrl).toBe('https://example.com/mobile.webp');
  });

  it('uses the structured image when it is set', () => {
    const r = resolveHeroMedia({
      videoUrl: 'https://example.com/old.mp4',
      media: { mediaType: 'image', sourceType: 'url', url: 'https://example.com/image.webp' },
    } as never);
    expect(r.videoUrl).toBe('');
    expect(r.imageUrl).toBe('https://example.com/image.webp');
  });

  it('returns empty strings when nothing is configured', () => {
    expect(resolveHeroMedia(undefined)).toEqual({ videoUrl: '', imageUrl: '', poster: '' });
  });
});

describe('mediaUrlOf / mediaTypeOf', () => {
  it('prefers the structured media object', () => {
    expect(
      mediaUrlOf({ media: { url: '/media/a.mp4' }, imageUrl: '/legacy/a.jpg' }),
    ).toBe('/media/a.mp4');
  });

  it('falls back to legacy fields', () => {
    expect(mediaUrlOf({ imageUrl: '/legacy/a.jpg' })).toBe('/legacy/a.jpg');
    expect(mediaUrlOf(null)).toBe('');
  });

  it('returns the media type from the structured field', () => {
    expect(mediaTypeOf({ media: { mediaType: 'video' }, imageUrl: '/a.jpg' })).toBe('video');
    expect(mediaTypeOf({ media: { mediaType: 'image' } })).toBe('image');
    expect(mediaTypeOf({ imageUrl: '/a.jpg' })).toBe('image');
  });
});

describe('formatBytes and URL validation', () => {
  it('formats byte sizes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('accepts http(s) and project-relative paths', () => {
    expect(isValidMediaUrl('https://example.com/a.jpg')).toBe(true);
    expect(isValidMediaUrl('/videos/hero.mp4')).toBe(true);
    expect(isValidMediaUrl('javascript:alert(1)')).toBe(false);
    expect(isValidMediaUrl('C:\\x.png')).toBe(false);
  });
});