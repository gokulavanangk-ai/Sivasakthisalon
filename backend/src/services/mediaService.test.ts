import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  detectMediaType,
  validateWebUrl,
  isWebUrl,
  isLocalMediaPath,
  validateLocalPath,
  resolveMediaValue,
  storeUploadedMedia,
  validateImageSignature,
  removeUploadedMedia,
  sanitizePersistedUrl,
} from '../services/mediaService';
import { detectImageFormat, isUnsafeHost } from '../middleware/upload';
import { ApiError } from '../utils/ApiError';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sivasakthi-media-test-'));
const tempPaths: string[] = [];

function writeFile(name: string, bytes: Buffer): string {
  const p = path.join(dir, name);
  fs.writeFileSync(p, bytes);
  tempPaths.push(p);
  return p;
}

function jpegBytes(): Buffer {
  const b = Buffer.alloc(32);
  b[0] = 0xff; b[1] = 0xd8; b[2] = 0xff; b[3] = 0xe0;
  b.write('JFIF', 6, 'ascii');
  return b;
}
function pngBytes(): Buffer {
  const b = Buffer.alloc(24);
  [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].forEach((v, i) => { b[i] = v; });
  b.writeUInt32BE(1, 16);
  b.writeUInt32BE(1, 20);
  return b;
}
function webpBytes(): Buffer {
  const b = Buffer.alloc(16);
  b.write('RIFF', 0, 'ascii');
  b.write('WEBP', 8, 'ascii');
  return b;
}
function textBytes(): Buffer {
  return Buffer.from('this is definitely not an image\n', 'ascii');
}

function fakeFile(
  filePath: string,
  mimetype: string,
  size: number,
  originalname = 'fake.png',
): Express.Multer.File {
  return {
    mimetype,
    size,
    fieldname: 'file',
    originalname,
    encoding: '7bit',
    destination: dir,
    filename: path.basename(filePath),
    path: filePath,
    stream: undefined as never,
    buffer: Buffer.alloc(0),
  };
}

beforeAll(() => {
  const jpg = writeFile('sample.jpg', jpegBytes());
  const png = writeFile('sample.png', pngBytes());
  const webp = writeFile('sample.webp', webpBytes());
  const txt = writeFile('sample.txt', textBytes());
  (globalThis as Record<string, string>).__t_jpg = jpg;
  (globalThis as Record<string, string>).__t_png = png;
  (globalThis as Record<string, string>).__t_webp = webp;
  (globalThis as Record<string, string>).__t_txt = txt;
});

afterAll(() => {
  for (const p of tempPaths) {
    try { fs.unlinkSync(p); } catch { /* ignore */ }
  }
  try { fs.rmdirSync(dir, { recursive: true }); } catch { /* ignore */ }
});

const g = globalThis as Record<string, string>;

describe('detectMediaType', () => {
  it('detects images and videos by MIME', () => {
    expect(detectMediaType('image/jpeg')).toBe('image');
    expect(detectMediaType('image/png')).toBe('image');
    expect(detectMediaType('image/webp')).toBe('image');
    expect(detectMediaType('video/mp4')).toBe('video');
    expect(detectMediaType('video/webm')).toBe('video');
  });

  it('rejects executables and unknown types', () => {
    expect(() => detectMediaType('application/x-msdownload')).toThrow(ApiError);
    expect(() => detectMediaType('application/octet-stream')).toThrow(ApiError);
  });
});

describe('detectImageFormat (magic bytes, not filename/MIME)', () => {
  it('identifies real JPEG/PNG/WEBP bytes', () => {
    expect(detectImageFormat(jpegBytes())).toBe('image/jpeg');
    expect(detectImageFormat(pngBytes())).toBe('image/png');
    expect(detectImageFormat(webpBytes())).toBe('image/webp');
  });

  it('identifies GIF, BMP, AVIF and HEIC bytes', () => {
    const gif = Buffer.alloc(16); gif.write('GIF89a', 0, 'ascii');
    const bmp = Buffer.alloc(16); bmp.write('BM', 0, 'ascii');
    const avif = Buffer.alloc(16); avif.writeUInt32BE(16, 0); avif.write('ftyp', 4, 'ascii'); avif.write('avif', 8, 'ascii');
    const heic = Buffer.alloc(16); heic.writeUInt32BE(16, 0); heic.write('ftyp', 4, 'ascii'); heic.write('heic', 8, 'ascii');
    expect(detectImageFormat(gif)).toBe('image/gif');
    expect(detectImageFormat(bmp)).toBe('image/bmp');
    expect(detectImageFormat(avif)).toBe('image/avif');
    expect(detectImageFormat(heic)).toBe('image/heic');
  });

  it('returns null for non-image bytes', () => {
    expect(detectImageFormat(textBytes())).toBeNull();
  });
});

describe('validateImageSignature', () => {
  it('accepts a real on-disk JPEG/PNG/WEBP', () => {
    expect(() => validateImageSignature(fakeFile(g.__t_jpg, 'image/jpeg', fs.statSync(g.__t_jpg).size))).not.toThrow();
    expect(() => validateImageSignature(fakeFile(g.__t_png, 'image/png', fs.statSync(g.__t_png).size))).not.toThrow();
    expect(() => validateImageSignature(fakeFile(g.__t_webp, 'image/webp', fs.statSync(g.__t_webp).size))).not.toThrow();
  });

  it('rejects a mislabeled/non-image file even when MIME claims image', () => {
    const f = fakeFile(g.__t_txt, 'image/jpeg', fs.statSync(g.__t_txt).size, 'evil.jpg');
    expect(() => validateImageSignature(f)).toThrow(ApiError);
  });
});

describe('file size validation', () => {
  it('rejects an oversized image', async () => {
    // Real bytes but a size way over any configured limit.
    const f = fakeFile(g.__t_jpg, 'image/jpeg', 20 * 1024 * 1024);
    await expect(resolveMediaValue({ file: f })).rejects.toThrow(ApiError);
  });

  it('accepts a real uploaded image (dev provider returns a local URL)', async () => {
    const f = fakeFile(g.__t_png, 'image/png', fs.statSync(g.__t_png).size);
    const value = await storeUploadedMedia(f);
    expect(value.mediaType).toBe('image');
    expect(value.sourceType).toBe('upload');
    expect(value.url).toBeTruthy();
    expect(value.publicId).toBeTruthy();
  });

  it('rejects a real but oversized video', async () => {
    const f = fakeFile(g.__t_jpg, 'video/mp4', 51 * 1024 * 1024);
    await expect(resolveMediaValue({ file: f })).rejects.toThrow(ApiError);
  });
});

describe('SSRF-safe URL validation', () => {
  it('rejects localhost / private / internal network hosts', () => {
    expect(isUnsafeHost('localhost')).toBe(true);
    expect(isUnsafeHost('127.0.0.1')).toBe(true);
    expect(isUnsafeHost('10.0.0.5')).toBe(true);
    expect(isUnsafeHost('192.168.1.1')).toBe(true);
    expect(isUnsafeHost('169.254.169.254')).toBe(true);
    expect(isUnsafeHost('myhost.local')).toBe(true);
    expect(isUnsafeHost('cdn.example.com')).toBe(false);
  });

  it('rejects http(s) URLs that point at private/internal networks', () => {
    expect(() => validateWebUrl('http://localhost:5000/uploads/x.jpg')).toThrow(ApiError);
    expect(() => validateWebUrl('http://127.0.0.1/x.jpg')).toThrow(ApiError);
    expect(() => validateWebUrl('https://10.0.0.2/x.jpg')).toThrow(ApiError);
    expect(() => validateWebUrl('https://192.168.0.10/x.jpg')).toThrow(ApiError);
    expect(() => validateWebUrl('https://[::1]/x.jpg')).toThrow(ApiError);
  });

  it('accepts public https image URLs', () => {
    expect(validateWebUrl('https://cdn.example.com/image.webp')).toBe('https://cdn.example.com/image.webp');
    expect(validateWebUrl('https://images.unsplash.com/photo.jpg?v=1')).toBeTruthy();
  });

  it('rejects malformed, javascript and file URLs', () => {
    expect(() => validateWebUrl('javascript:alert(1)')).toThrow(ApiError);
    expect(() => validateWebUrl('file:///etc/passwd')).toThrow(ApiError);
    expect(() => validateWebUrl('not a url')).toThrow(ApiError);
  });
});

describe('local media path validation', () => {
  it('accepts web-accessible project paths', () => {
    expect(isLocalMediaPath('/images/gallery/barber-01.webp')).toBe(true);
    expect(validateLocalPath('/images/logo.png')).toBe('/images/logo.png');
  });

  it('rejects absolute Windows paths and traversal', () => {
    expect(isLocalMediaPath('C:\\Users\\me\\image.png')).toBe(false);
    expect(isLocalMediaPath('/images/../../etc/passwd')).toBe(false);
    expect(() => validateLocalPath('/images/..\\secret')).toThrow(ApiError);
  });
});

describe('single source of truth: only Cloudinary secure URLs are re-persisted', () => {
  it('preserves an existing Cloudinary upload reference', async () => {
    const value = await resolveMediaValue({
      sourceType: 'upload',
      mediaType: 'image',
      url: 'https://res.cloudinary.com/uen3jw7c/image/upload/v1/sivasakthi-salon/media-1.jpg',
      publicId: 'sivasakthi-salon/media-1.jpg',
    });
    expect(value.sourceType).toBe('upload');
    expect(value.url).toContain('res.cloudinary.com');
  });

  it('rejects re-persisting a non-Cloudinary https URL', async () => {
    await expect(
      resolveMediaValue({
        sourceType: 'upload',
        mediaType: 'image',
        url: 'https://cdn.example.org/photo.jpg',
        publicId: 'photo.jpg',
      }),
    ).rejects.toThrow(ApiError);
  });

  it('rejects re-persisting a localhost /uploads URL (production never falls back)', async () => {
    await expect(
      resolveMediaValue({
        sourceType: 'upload',
        mediaType: 'image',
        url: 'http://localhost:5000/uploads/media-123-1.jpg',
        publicId: 'media-123-1.jpg',
      }),
    ).rejects.toThrow(ApiError);
  });

  it('removing an uploaded media reference does not throw for dev/local provider', async () => {
    await expect(
      removeUploadedMedia({ sourceType: 'upload', publicId: 'sivasakthi-salon/media-1.jpg', mediaType: 'image' }),
    ).resolves.toBeUndefined();
  });
});

describe('sanitizePersistedUrl (salon hero/about/offers/logo + quote image fields)', () => {
  it('keeps an empty string or undefined (cleared media)', () => {
    expect(sanitizePersistedUrl('')).toBe('');
    expect(sanitizePersistedUrl(undefined)).toBe('');
    expect(sanitizePersistedUrl('   ')).toBe('');
  });

  it('accepts a Cloudinary secure URL', () => {
    expect(sanitizePersistedUrl('https://res.cloudinary.com/uen3jw7c/image/upload/v1/sivasakthi-salon/media-1.jpg')).toContain('res.cloudinary.com');
  });

  it('accepts a safe public https image/video URL', () => {
    expect(sanitizePersistedUrl('https://images.pexels.com/photos/1/hero.jpg')).toBe('https://images.pexels.com/photos/1/hero.jpg');
  });

  it('rejects a localhost /uploads backend reference', () => {
    expect(() => sanitizePersistedUrl('http://localhost:5000/uploads/media-1.jpg')).toThrow(ApiError);
    expect(() => sanitizePersistedUrl('127.0.0.1/uploads/media-1.jpg')).toThrow(ApiError);
  });

  it('rejects blob:, data:, file: and absolute local paths', () => {
    expect(() => sanitizePersistedUrl('blob:http://localhost:5173/uuid')).toThrow(ApiError);
    expect(() => sanitizePersistedUrl('data:image/png;base64,abc')).toThrow(ApiError);
    expect(() => sanitizePersistedUrl('file:///C:/x/y.jpg')).toThrow(ApiError);
    expect(() => sanitizePersistedUrl('C:\\Users\\x\\pic.jpg')).toThrow(ApiError);
  });

  it('rejects private/internal network hosts (SSRF) and relative paths', () => {
    expect(() => sanitizePersistedUrl('http://10.0.0.5/pic.jpg')).toThrow(ApiError);
    expect(() => sanitizePersistedUrl('/images/pic.jpg')).toThrow(ApiError);
    expect(() => sanitizePersistedUrl('https://192.168.1.10/pic.jpg')).toThrow(ApiError);
  });
});
