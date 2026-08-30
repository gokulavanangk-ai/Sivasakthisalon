import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

/**
 * One-time data repair for media records still pointing at a localhost/Render
 * temp "uploads" path (http://localhost:5000/uploads/...).
 *
 * - If the source file still exists locally (backend/uploads/<filename>) it is
 *   re-uploaded to Cloudinary and the record is updated to the secure_url.
 * - If the source file is gone, the broken reference is removed so no production
 *   API response returns a localhost/uploads path. Those records are reported so
 *   they can be re-uploaded from the Admin UI.
 *
 * Idempotent. Reads credentials from backend/.env (gitignored, not committed).
 * Requires a Cloudinary API key with upload ("create") permission.
 *
 * Run from backend/:  npx tsx src/scripts/fixMediaRecords.ts
 */

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI =
  process.env.MONGO_URI ?? 'mongodb://localhost:27017/sivasakthisalon';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isBadUrl(value: unknown): boolean {
  if (typeof value !== 'string' || !value) return false;
  const v = value.trim();
  return (
    v.includes('localhost') ||
    v.includes('127.0.0.1') ||
    v.startsWith('/uploads/') ||
    /^\/[A-Za-z]:[\\/]/.test(v) ||
    /^https?:\/\/\d{1,3}(\.\d{1,3}){3}/.test(v)
  );
}

function fileFromUrl(url: string): string {
  const clean = url.split('?')[0].split('#')[0].replace(/\\/g, '/');
  return decodeURIComponent(clean.split('/').pop() ?? '');
}

function localFileFor(filename: string): string | null {
  const candidate = path.join(UPLOAD_DIR, filename);
  return fs.existsSync(candidate) ? candidate : null;
}

async function uploadToCloudinary(filePath: string): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'sivasakthi-salon',
    resource_type: 'image',
    transformation: [{ width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

interface Change {
  action: 'MIGRATED' | 'REMOVED' | 'NEEDS_REUPLOAD';
  target: string;
  detail: string;
}

async function main(): Promise<void> {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('Connected to', mongoose.connection.host);
  const db = mongoose.connection.db;
  if (!db) throw new Error('No db');

  const changes: Change[] = [];

  // ---- GALLERY ----
  if ((await db.listCollections({ name: 'galleryitems' }).toArray()).length) {
    const col = db.collection('galleryitems');
    for (const doc of await col.find({}).toArray()) {
      const label = `galleryitems/${doc._id}`;
      const urls: Array<{ display: string; value: string }> = [];
      if (isBadUrl(doc.imageUrl)) urls.push({ display: 'imageUrl', value: doc.imageUrl });
      if (doc.media && isBadUrl(doc.media.url)) urls.push({ display: 'media.url', value: doc.media.url });

      for (const u of urls) {
        const filename = fileFromUrl(u.value);
        const localPath = localFileFor(filename);
        if (localPath) {
          const { url, publicId } = await uploadToCloudinary(localPath);
          await col.updateOne(
            { _id: doc._id },
            {
              $set: {
                imageUrl: url,
                publicId,
                media: {
                  mediaType: 'image',
                  sourceType: 'upload',
                  url,
                  publicId,
                  alt: doc.title ?? '',
                  title: doc.title ?? '',
                  isActive: doc.isActive ?? true,
                  order: doc.sortOrder ?? 0,
                },
              },
            },
          );
          changes.push({ action: 'MIGRATED', target: `${label} ${u.display}`, detail: `${u.value} -> ${url}` });
          console.log(`MIGRATED ${label} ${u.display}: ${u.value} -> ${url}`);
        } else {
          changes.push({ action: 'NEEDS_REUPLOAD', target: `${label} ${u.display}`, detail: `file "${filename}" not found locally` });
          console.log(`NEEDS RE-UPLOAD ${label} ${u.display}: ${u.value} (file "${filename}" not found)`);
        }
      }
    }
  }

  // ---- SERVICES ----
  if ((await db.listCollections({ name: 'services' }).toArray()).length) {
    const col = db.collection('services');
    for (const doc of await col.find({}).toArray()) {
      const label = `services/${doc._id}`;
      const urls: Array<{ display: string; value: string }> = [];
      if (isBadUrl(doc.imageUrl)) urls.push({ display: 'imageUrl', value: doc.imageUrl });
      if (doc.media && isBadUrl(doc.media.url)) urls.push({ display: 'media.url', value: doc.media.url });

      for (const u of urls) {
        const filename = fileFromUrl(u.value);
        const localPath = localFileFor(filename);
        if (localPath) {
          const { url, publicId } = await uploadToCloudinary(localPath);
          await col.updateOne(
            { _id: doc._id },
            {
              $set: {
                imageUrl: url,
                media: {
                  mediaType: 'image',
                  sourceType: 'upload',
                  url,
                  publicId,
                  alt: doc.englishName ?? doc.tamilName ?? '',
                  isActive: doc.isActive ?? true,
                  order: doc.sortOrder ?? 0,
                },
              },
            },
          );
          changes.push({ action: 'MIGRATED', target: `${label} ${u.display}`, detail: `${u.value} -> ${url}` });
          console.log(`MIGRATED ${label} ${u.display}: ${u.value} -> ${url}`);
        } else {
          changes.push({ action: 'NEEDS_REUPLOAD', target: `${label} ${u.display}`, detail: `file "${filename}" not found locally` });
          console.log(`NEEDS RE-UPLOAD ${label} ${u.display}: ${u.value} (file "${filename}" not found)`);
        }
      }
    }
  }

  // ---- HAIRSTYLES ----
  if ((await db.listCollections({ name: 'hairstyles' }).toArray()).length) {
    const col = db.collection('hairstyles');
    for (const doc of await col.find({}).toArray()) {
      const label = `hairstyles/${doc._id}`;
      const urls: Array<{ display: string; value: string }> = [];
      if (isBadUrl(doc.imageUrl)) urls.push({ display: 'imageUrl', value: doc.imageUrl });
      for (const f of ['image', 'thumbnail', 'video']) {
        if (doc[f] && isBadUrl(doc[f].url)) urls.push({ display: `${f}.url`, value: doc[f].url });
      }

      for (const u of urls) {
        const filename = fileFromUrl(u.value);
        const localPath = localFileFor(filename);
        if (localPath) {
          const { url, publicId } = await uploadToCloudinary(localPath);
          const match = u.display.match(/^(.+)\.url$/);
          if (match) {
            const sub = match[1];
            await col.updateOne({ _id: doc._id }, { $set: { [`${sub}.url`]: url, [`${sub}.publicId`]: publicId } });
          } else {
            await col.updateOne(
              { _id: doc._id },
              {
                $set: {
                  imageUrl: url,
                  image: { mediaType: 'image', sourceType: 'upload', url, publicId, alt: doc.englishName ?? '', isActive: true, order: 0 },
                },
              },
            );
          }
          changes.push({ action: 'MIGRATED', target: `${label} ${u.display}`, detail: `${u.value} -> ${url}` });
          console.log(`MIGRATED ${label} ${u.display}: ${u.value} -> ${url}`);
        } else {
          changes.push({ action: 'NEEDS_REUPLOAD', target: `${label} ${u.display}`, detail: `file "${filename}" not found locally` });
          console.log(`NEEDS RE-UPLOAD ${label} ${u.display}: ${u.value} (file "${filename}" not found)`);
        }
      }
    }
  }

  // ---- QUOTES ----
  if ((await db.listCollections({ name: 'quotes' }).toArray()).length) {
    const col = db.collection('quotes');
    for (const doc of await col.find({}).toArray()) {
      const label = `quotes/${doc._id}`;
      if (doc.image && isBadUrl(doc.image.url)) {
        const filename = fileFromUrl(doc.image.url);
        const localPath = localFileFor(filename);
        if (localPath) {
          const { url, publicId } = await uploadToCloudinary(localPath);
          await col.updateOne({ _id: doc._id }, { $set: { 'image.url': url, 'image.publicId': publicId } });
          changes.push({ action: 'MIGRATED', target: `${label} image.url`, detail: `${doc.image.url} -> ${url}` });
          console.log(`MIGRATED ${label} image.url: ${doc.image.url} -> ${url}`);
        } else {
          await col.updateOne({ _id: doc._id }, { $set: { image: null } });
          changes.push({ action: 'REMOVED', target: `${label} image`, detail: `file "${filename}" not found locally; image set to null` });
          console.log(`REMOVED ${label} image: ${doc.image.url} (file "${filename}" not found; image set to null)`);
        }
      }
    }
  }

  // ---- SALON SETTINGS ----
  if ((await db.listCollections({ name: 'salonsettings' }).toArray()).length) {
    const col = db.collection('salonsettings');
    for (const doc of await col.find({}).toArray()) {
      const label = `salonsettings/${doc._id}`;

      // LOGO
      if (doc.logo && isBadUrl(doc.logo.url)) {
        const filename = fileFromUrl(doc.logo.url);
        const localPath = localFileFor(filename);
        if (localPath) {
          const { url, publicId } = await uploadToCloudinary(localPath);
          await col.updateOne({ _id: doc._id }, { $set: { 'logo.url': url, 'logo.publicId': publicId } });
          changes.push({ action: 'MIGRATED', target: `${label} logo`, detail: `${doc.logo.url} -> ${url}` });
          console.log(`MIGRATED ${label} logo: ${doc.logo.url} -> ${url}`);
        } else {
          // No local file -> remove the broken logo reference.
          await col.updateOne({ _id: doc._id }, { $set: { logo: null } });
          changes.push({ action: 'REMOVED', target: `${label} logo`, detail: `file "${filename}" not found locally; logo set to null (re-upload from Admin)` });
          console.log(`REMOVED ${label} logo: ${doc.logo.url} (file "${filename}" not found; logo set to null)`);
        }
      }

      // HERO
      const heroUrls: Array<{ display: string; value: string }> = [];
      if (doc.hero?.media && isBadUrl(doc.hero.media.url)) heroUrls.push({ display: 'hero.media.url', value: doc.hero.media.url });
      if (doc.hero && isBadUrl(doc.hero.mobileImageUrl)) heroUrls.push({ display: 'hero.mobileImageUrl', value: doc.hero.mobileImageUrl });

      for (const u of heroUrls) {
        const filename = fileFromUrl(u.value);
        const localPath = localFileFor(filename);
        if (localPath) {
          const { url, publicId } = await uploadToCloudinary(localPath);
          await col.updateOne({ _id: doc._id }, { $set: { 'hero.media.url': url, 'hero.media.publicId': publicId, 'hero.mobileImageUrl': url } });
          changes.push({ action: 'MIGRATED', target: `${label} ${u.display}`, detail: `${u.value} -> ${url}` });
          console.log(`MIGRATED ${label} ${u.display}: ${u.value} -> ${url}`);
        } else {
          // No local file -> clear the broken hero upload reference and rely on the
          // existing hero.posterUrl (pexels) fallback. syncHeroMedia on GET will
          // backfill media.url from posterUrl.
          await col.updateOne({ _id: doc._id }, { $set: { 'hero.media.url': '', 'hero.media.publicId': '', 'hero.mobileImageUrl': '' } });
          changes.push({ action: 'REMOVED', target: `${label} ${u.display}`, detail: `file "${filename}" not found locally; cleared broken hero ref (re-upload from Admin)` });
          console.log(`REMOVED ${label} ${u.display}: ${u.value} (file "${filename}" not found; cleared)`);
        }
      }
    }
  }

  console.log('\n===== SUMMARY =====');
  for (const c of changes) {
    console.log(`[${c.action}] ${c.target}: ${c.detail}`);
  }
  console.log(`\nTotal changes: ${changes.length}`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
