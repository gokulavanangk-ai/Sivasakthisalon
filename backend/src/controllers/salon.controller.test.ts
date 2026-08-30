import { describe, expect, it } from 'vitest';
import { syncHeroMedia } from '../controllers/salon.controller';

function makeSettings(hero: Record<string, any>): Record<string, any> {
  return { hero };
}

describe('syncHeroMedia', () => {
  it('backfills a legacy videoUrl into the structured media subdoc', () => {
    const s = makeSettings({
      videoUrl: 'https://example.com/hero.mp4',
      posterUrl: 'https://example.com/poster.webp',
      mobileImageUrl: '',
      media: { mediaType: 'image', sourceType: 'url', url: '', posterUrl: '', publicId: '' },
    });
    syncHeroMedia(s as never);
    expect(s.hero.media.mediaType).toBe('video');
    expect(s.hero.media.url).toBe('https://example.com/hero.mp4');
    expect(s.hero.media.posterUrl).toBe('https://example.com/poster.webp');
  });

  it('backfills legacy image fields when there is no video', () => {
    const s = makeSettings({
      videoUrl: '',
      posterUrl: 'https://example.com/poster.webp',
      mobileImageUrl: 'https://example.com/mobile.webp',
      media: { mediaType: 'image', sourceType: 'url', url: '', posterUrl: '', publicId: '' },
    });
    syncHeroMedia(s as never);
    expect(s.hero.media.mediaType).toBe('image');
    expect(s.hero.media.url).toBe('https://example.com/mobile.webp');
  });

  it('keeps a configured structured video untouched', () => {
    const s = makeSettings({
      videoUrl: 'https://example.com/old.mp4',
      posterUrl: '',
      mobileImageUrl: '',
      media: { mediaType: 'video', sourceType: 'url', url: 'https://example.com/new.mp4', posterUrl: '', publicId: '' },
    });
    syncHeroMedia(s as never);
    expect(s.hero.media.url).toBe('https://example.com/new.mp4');
    expect(s.hero.videoUrl).toBe('https://example.com/new.mp4');
  });

  it('syncs legacy videoUrl when a structured video is set', () => {
    const s = makeSettings({
      videoUrl: '',
      posterUrl: '',
      mobileImageUrl: '',
      media: { mediaType: 'video', sourceType: 'upload', url: 'http://localhost:5000/uploads/media-1.mp4', posterUrl: '', publicId: 'media-1.mp4' },
    });
    syncHeroMedia(s as never);
    expect(s.hero.videoUrl).toBe('http://localhost:5000/uploads/media-1.mp4');
  });
});