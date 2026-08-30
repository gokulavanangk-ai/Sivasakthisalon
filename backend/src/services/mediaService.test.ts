import { describe, expect, it } from 'vitest';
import {
  detectMediaType,
  validateWebUrl,
  isWebUrl,
  isLocalMediaPath,
  validateLocalPath,
  resolveMediaValue,
} from '../services/mediaService';
import { ApiError } from '../utils/ApiError';

function fakeFile(mimetype: string, size: number): Express.Multer.File {
  return {
    mimetype,
    size,
    fieldname: 'file',
    originalname: 'fake.bin',
    encoding: '7bit',
    destination: '',
    filename: 'media-123-1.jpg',
    path: '/tmp/media-123-1.jpg',
    stream: undefined as never,
    buffer: Buffer.alloc(0),
  };
}

describe('detectMediaType', () => {
  it('detects images', () => {
    expect(detectMediaType('image/jpeg')).toBe('image');
    expect(detectMediaType('image/png')).toBe('image');
    expect(detectMediaType('image/webp')).toBe('image');
  });

  it('detects videos', () => {
    expect(detectMediaType('video/mp4')).toBe('video');
    expect(detectMediaType('video/webm')).toBe('video');
    expect(detectMediaType('video/quicktime')).toBe('video');
  });

  it('rejects executables and unknown types', () => {
    expect(() => detectMediaType('application/x-msdownload')).toThrow(ApiError);
    expect(() => detectMediaType('application/octet-stream')).toThrow(ApiError);
  });
});

describe('file size validation', () => {
  it('rejects an oversized image (over 5 MB)', async () => {
    await expect(resolveMediaValue({ file: fakeFile('image/jpeg', 6 * 1024 * 1024) })).rejects.toThrow(
      ApiError,
    );
  });

  it('accepts an image at the limit', async () => {
    const value = await resolveMediaValue({ file: fakeFile('image/jpeg', 5 * 1024 * 1024) });
    expect(value.mediaType).toBe('image');
    expect(value.sourceType).toBe('upload');
    expect(value.url).toBeTruthy();
  });

  it('rejects an oversized video (over 50 MB)', async () => {
    await expect(resolveMediaValue({ file: fakeFile('video/mp4', 51 * 1024 * 1024) })).rejects.toThrow(
      ApiError,
    );
  });
});

describe('URL validation', () => {
  it('accepts https URLs', () => {
    expect(isWebUrl('https://example.com/image.webp')).toBe(true);
    expect(validateWebUrl('https://example.com/video.mp4')).toBe('https://example.com/video.mp4');
  });

  it('rejects javascript, file and malformed URLs', () => {
    expect(() => validateWebUrl('javascript:alert(1)')).toThrow(ApiError);
    expect(() => validateWebUrl('file:///etc/passwd')).toThrow(ApiError);
    expect(() => validateWebUrl('not a url')).toThrow(ApiError);
  });

  it('resolves a URL source without uploading', async () => {
    const value = await resolveMediaValue({
      sourceType: 'url',
      mediaType: 'video',
      url: 'https://cdn.example.com/hero.mp4',
    });
    expect(value).toEqual({
      mediaType: 'video',
      sourceType: 'url',
      url: 'https://cdn.example.com/hero.mp4',
      publicId: '',
    });
  });

  it('preserves an already-uploaded file reference when a valid https url + publicId are provided', async () => {
    const value = await resolveMediaValue({
      sourceType: 'upload',
      mediaType: 'image',
      url: 'https://res.cloudinary.com/uen3jw7c/image/upload/v1/sivasakthi-salon/media-1.jpg',
      publicId: 'sivasakthi-salon/media-1.jpg',
    });
    expect(value.sourceType).toBe('upload');
    expect(value.publicId).toBe('sivasakthi-salon/media-1.jpg');
  });

  it('rejects a previously-stored localhost/local upload URL so it is never re-persisted', async () => {
    await expect(
      resolveMediaValue({
        sourceType: 'upload',
        mediaType: 'image',
        url: 'http://localhost:5000/uploads/media-123-1.jpg',
        publicId: 'media-123-1.jpg',
      }),
    ).rejects.toThrow(ApiError);
  });
});

describe('local media path validation', () => {
  it('accepts web-accessible project paths', () => {
    expect(isLocalMediaPath('/images/gallery/barber-01.webp')).toBe(true);
    expect(isLocalMediaPath('/videos/hero-salon.mp4')).toBe(true);
    expect(validateLocalPath('/images/logo.png')).toBe('/images/logo.png');
  });

  it('rejects absolute Windows paths and traversal', () => {
    expect(isLocalMediaPath('C:\\Users\\me\\image.png')).toBe(false);
    expect(isLocalMediaPath('/images/../../etc/passwd')).toBe(false);
    expect(isLocalMediaPath('//server/share/x.png')).toBe(false);
    expect(() => validateLocalPath('/images/..\\secret')).toThrow(ApiError);
    expect(() => validateLocalPath('/foo/bar.png')).toThrow(ApiError);
  });

  it('resolves a local source', async () => {
    const value = await resolveMediaValue({
      sourceType: 'local',
      mediaType: 'image',
      url: '/images/gallery/barber-01.webp',
    });
    expect(value).toEqual({
      mediaType: 'image',
      sourceType: 'local',
      url: '/images/gallery/barber-01.webp',
      publicId: '',
    });
  });
});