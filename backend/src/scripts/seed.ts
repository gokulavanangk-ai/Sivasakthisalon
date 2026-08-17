import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { Admin } from '../models/Admin';
import { SalonSettings } from '../models/SalonSettings';
import { Service } from '../models/Service';
import { Hairstyle } from '../models/Hairstyle';
import { Review } from '../models/Review';
import { BusinessHours } from '../models/BusinessHours';
import { Faq } from '../models/Faq';
import { hashPassword } from '../services/authService';
import { DEFAULT_SALON } from '../services/salonService';
import { servicesSeed, hairstylesSeed, reviewsSeed, faqsSeed } from './seedData';

async function seed(): Promise<void> {
  if (env.nodeEnv === 'production') {
    logger.warn('Seeding in production is intentionally disabled.');
    return;
  }

  await mongoose.connect(env.mongodbUri);
  logger.info('Connected — starting seed');

  // Salon settings
  const existingSettings = await SalonSettings.findOne().exec();
  if (!existingSettings) {
    await SalonSettings.create(DEFAULT_SALON);
    logger.info('Salon settings seeded');
  } else {
    logger.info('Salon settings already exist — skipped');
  }

  // Business hours
  const existingHours = await BusinessHours.findOne().exec();
  if (!existingHours) {
    await BusinessHours.create({});
    logger.info('Business hours seeded');
  }

  // Services
  if ((await Service.countDocuments()) === 0) {
    await Service.insertMany(servicesSeed);
    logger.info('Services seeded');
  } else {
    logger.info('Services already exist — skipped');
  }

  // Hairstyles
  if ((await Hairstyle.countDocuments()) === 0) {
    await Hairstyle.insertMany(hairstylesSeed);
    logger.info('Hairstyles seeded');
  }

  // Reviews
  if ((await Review.countDocuments()) === 0) {
    await Review.insertMany(reviewsSeed);
    logger.info('Reviews seeded');
  }

  // FAQs
  if ((await Faq.countDocuments()) === 0) {
    await Faq.insertMany(faqsSeed);
    logger.info('FAQs seeded');
  }

  // Admin from environment only
  if (!env.adminEmail || !env.adminPassword) {
    logger.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin creation. Always change the password after first login.');
  } else if ((await Admin.countDocuments()) === 0) {
    const username = env.adminEmail.split('@')[0];
    await Admin.create({
      name: 'Salon Admin',
      email: env.adminEmail,
      username,
      passwordHash: await hashPassword(env.adminPassword),
      role: 'admin',
    });
    logger.info(`Admin created with email ${env.adminEmail}. CHANGE THE PASSWORD after first login.`);
  } else {
    logger.info('Admin already exists — skipped');
  }

  await mongoose.disconnect();
  logger.info('Seed complete');
}

seed().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});