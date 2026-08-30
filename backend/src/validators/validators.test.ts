import { describe, expect, it } from 'vitest';
import { bookingSchema } from '../validators/booking.validator';
import { loginSchema } from '../validators/auth.validator';
import { gallerySchema } from '../validators/gallery.validator';
import { mediaSchema } from '../validators/media.validator';
import { quoteSchema } from '../validators/quote.validator';

function parseBooking(body: unknown) {
  return bookingSchema.safeParse({ body });
}

describe('bookingSchema validation', () => {
  const valid = {
    name: 'Murugan',
    phone: '9790446470',
    email: 'murugan@example.com',
    service: 'Premium Fade',
    date: '2026-09-01',
    time: '10:30',
  };

  it('accepts a valid booking payload', () => {
    expect(parseBooking(valid).success).toBe(true);
  });

  it('rejects a missing name', () => {
    const r = parseBooking({ ...valid, name: '' });
    expect(r.success).toBe(false);
  });

  it('rejects an invalid phone', () => {
    const r = parseBooking({ ...valid, phone: 'abc' });
    expect(r.success).toBe(false);
  });

  it('rejects a bad date format', () => {
    const r = parseBooking({ ...valid, date: '01/09/2026' });
    expect(r.success).toBe(false);
  });

  it('rejects a bad time format', () => {
    const r = parseBooking({ ...valid, time: '10:30 PM' });
    expect(r.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const r = parseBooking({ ...valid, email: 'not-an-email' });
    expect(r.success).toBe(false);
  });
});

describe('loginSchema validation', () => {
  it('accepts identifier and password', () => {
    expect(loginSchema.safeParse({ body: { identifier: 'admin', password: 'secret123' } }).success).toBe(true);
  });

  it('rejects short passwords', () => {
    expect(loginSchema.safeParse({ body: { identifier: 'admin', password: '123' } }).success).toBe(false);
  });
});

describe('gallery media schema validation', () => {
  it('accepts a URL-based video gallery item', () => {
    const r = gallerySchema.safeParse({
      body: {
        title: 'Barber at work',
        category: 'staff',
        media: { mediaType: 'video', sourceType: 'url', url: 'https://example.com/clip.mp4' },
      },
    });
    expect(r.success).toBe(true);
  });

  it('rejects a bad media type', () => {
    const r = gallerySchema.safeParse({
      body: {
        category: 'other',
        media: { mediaType: 'audio', sourceType: 'url', url: 'https://example.com/a.mp3' },
      },
    });
    expect(r.success).toBe(false);
  });

  it('accepts string multipart numbers via coercion', () => {
    const r = gallerySchema.safeParse({
      body: { category: 'haircuts', sortOrder: '4', isActive: 'true' },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.body.sortOrder).toBe(4);
      expect(r.data.body.isActive).toBe(true);
    }
  });

  it('rejects an invalid category', () => {
    const r = gallerySchema.safeParse({ body: { category: 'not-a-category' } });
    expect(r.success).toBe(false);
  });
});

describe('mediaSchema validation', () => {
  it('coerces boolean strings', () => {
    const r = mediaSchema.safeParse({ isActive: 'false' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.isActive).toBe(false);
  });

  it('accepts image and video types', () => {
    expect(mediaSchema.safeParse({ mediaType: 'image', sourceType: 'local' }).success).toBe(true);
    expect(mediaSchema.safeParse({ mediaType: 'video', sourceType: 'upload' }).success).toBe(true);
  });
});

describe('quoteSchema validation', () => {
  const valid = {
    text: 'ஒவ்வொரு வெட்டிலும் ஒரு கதை. வந்து உன் கதையை சொல்.',
    author: 'Sivasakthi',
    role: 'Founder',
    source: 'contact',
    image: { url: 'https://res.cloudinary.com/uen3jw7c/image/upload/v1/sivasakthi-salon/a.jpg', publicId: 'sivasakthi-salon/a.jpg' },
    isActive: true,
    sortOrder: 1,
  };

  it('accepts a valid quote payload', () => {
    const r = quoteSchema.safeParse({ body: valid });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.body.author).toBe('Sivasakthi');
      expect(r.data.body.source).toBe('contact');
    }
  });

  it('coerces string sortOrder to a number', () => {
    const r = quoteSchema.safeParse({ body: { text: 'hello world', sortOrder: '3' } });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.body.sortOrder).toBe(3);
  });

  it('rejects empty text', () => {
    const r = quoteSchema.safeParse({ body: { ...valid, text: '' } });
    expect(r.success).toBe(false);
  });

  it('rejects text over 600 chars', () => {
    const r = quoteSchema.safeParse({ body: { ...valid, text: 'x'.repeat(601) } });
    expect(r.success).toBe(false);
  });

  it('rejects an invalid source', () => {
    const r = quoteSchema.safeParse({ body: { ...valid, source: 'not-a-source' } });
    expect(r.success).toBe(false);
  });

  it('rejects a malformed image URL', () => {
    const r = quoteSchema.safeParse({ body: { ...valid, image: { url: 'not-a-url' } } });
    expect(r.success).toBe(false);
  });

  it('defaults author and source when omitted', () => {
    const r = quoteSchema.safeParse({ body: { text: 'just a quote' } });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.body.source).toBe('general');
      expect(r.data.body.author).toBeUndefined();
    }
  });
});