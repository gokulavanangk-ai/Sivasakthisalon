import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/avif',
] as const;
export const VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime'] as const;
export const ALL_MEDIA_MIME = new Set<string>([...IMAGE_MIME, ...VIDEO_MIME]);

/** Maximum size of a single uploaded image, driven by MAX_IMAGE_UPLOAD_MB env. */
export const MAX_IMAGE_SIZE = env.maxImageUploadMb * 1024 * 1024;
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

/** Guard against decompression bombs: reject decoded images over ~25 megapixels. */
export const MAX_IMAGE_PIXELS = 25_000_000;

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/avif': '.avif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

/**
 * Detects the real image format from the file's magic bytes, independent of the
 * (spoofable) HTTP Content-Type and filename. Returns the canonical MIME type,
 * or null when the bytes don't match a supported image signature.
 */
export function detectImageFormat(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 16) return null;

  const b = buffer;
  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WEBP: "RIFF" .... "WEBP"
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';

  // GIF: "GIF87a" / "GIF89a"
  if (b.toString('ascii', 0, 3) === 'GIF' && (b.toString('ascii', 3, 6) === '87a' || b.toString('ascii', 3, 6) === '89a')) {
    return 'image/gif';
  }

  // BMP: "BM"
  if (b.toString('ascii', 0, 2) === 'BM') return 'image/bmp';

  // AVIF / HEIF: ISO BMFF — "ftyp" box with an image brand (avif/avis/heic/heix/mif1)
  const brand = readFtypBrand(b);
  if (brand) {
    const avif = ['avif', 'avis'];
    const heif = ['heic', 'heix', 'mif1', 'msf1'];
    if (avif.includes(brand)) return 'image/avif';
    if (heif.includes(brand)) return 'image/heic';
  }

  return null;
}

/** Reads the brand from the first "ftyp" box of an ISO BMFF file (avif/heic). */
function readFtypBrand(buffer: Buffer): string | null {
  if (buffer.length < 16) return null;
  if (buffer.toString('ascii', 4, 8) !== 'ftyp') return null;
  return buffer.toString('ascii', 8, 12).trim();
}

/** Whether a previously persisted URL is a durable Cloudinary (secure https) URL. */
export function isCloudinarySecureUrl(url: string): boolean {
  return /^https:\/\/res\.cloudinary\.com\//i.test(url.trim());
}

/** Pure host classifier rejecting SSRF targets (localhost, private/internal nets). */
export function isUnsafeHost(host: string): boolean {
  const h = host.toLowerCase().replace(/[[\]]/g, '').trim();
  if (!h) return true;

  // Hostnames that resolve to the local machine or the local network.
  if (h === 'localhost' || h === 'localhost.localdomain') return true;
  if (h.endsWith('.localhost') || h.endsWith('.local')) return true;

  // Bare IPv4 literals classified by range, and IPv6 loopback/link-local.
  if (isPrivateIpLiteral(host)) return true;
  if (/^[0-9a-f:]+$/.test(h)) {
    if (h === '::1' || h.startsWith('0:0:0:0:0:0:0:1') || h === '0:0:0:0:0:0:0:1') return true;
    if (h.startsWith('fe80:') || h.startsWith('fc') || h.startsWith('fd')) return true;
  }

  return false;
}

function ipv4ToNumber(octets: number[]): number {
  return ((octets[0] << 24) >>> 0) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
}

function isIpLiteral(host: string): number[] | null {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const octets = [m[1], m[2], m[3], m[4]].map((n) => parseInt(n, 10));
  if (octets.some((o) => o > 255)) return null;
  return octets;
}

function isPrivateIpLiteral(host: string): boolean {
  const octets = isIpLiteral(host);
  if (!octets) return false;
  const [a, b] = octets;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 127) return true; // 127.0.0.0/8 loopback
  const n = ipv4ToNumber(octets);
  // Each range is [network, mask] with the correct mask width per CIDR block.
  const ranges: Array<[number, number]> = [
    [0, 4278190080], // 0.0.0.0/8
    [1681915904, 4290772992], // 100.64.0.0/10 (CGNAT)
    [2851995648, 4294901760], // 169.254.0.0/16 link-local
    [3221225984, 4294967040], // 192.0.2.0/24 (TEST-NET-1)
    [3321888768, 4294836224], // 198.18.0.0/15 (network benchmark)
    [3758096384, 4026531840], // 224.0.0.0/4 multicast
    [4026531840, 4026531840], // 240.0.0.0/4 reserved
  ];
  return ranges.some(([net, mask]) => ((n & mask) >>> 0) === net);
}

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
      ApiError.badRequest('Only image files are allowed (JPG, PNG, WEBP, GIF, BMP, AVIF)', 'INVALID_FILE_TYPE'),
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
        'Unsupported file type. Allowed: JPG, JPEG, PNG, WEBP, GIF, BMP, AVIF, MP4, WEBM, MOV',
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

/** Reads a freshly-written upload back from disk so its real signature can be verified. */
export function readUploadedFile(filePath: string): Buffer {
  return fs.readFileSync(filePath);
}
