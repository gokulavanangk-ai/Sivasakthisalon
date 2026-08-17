import { z } from 'zod';
import { WeekDay } from '../models/BusinessHours';

const dayHoursSchema = z.object({
  open: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Open time must be HH:mm'),
  close: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Close time must be HH:mm'),
  isOpen: z.boolean(),
  breakStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$|\s*$/).optional().default(''),
  breakEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$|\s*$/).optional().default(''),
});

const dayNames: WeekDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const businessHoursSchema = z.object({
  body: z.object({
    workingHours: z.object(
      Object.fromEntries(dayNames.map((d) => [d, dayHoursSchema])) as Record<WeekDay, typeof dayHoursSchema>,
    ),
    slotDurationMinutes: z.number().int().min(15).max(120).optional(),
    blockedDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().default([]),
  }),
});

const sectionHeadingSchema = z.object({
  eyebrow: z.string().max(120).optional(),
  englishTitle: z.string().max(120).optional(),
  title: z.string().max(400).optional(),
});

const offerItemSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(600).optional(),
  price: z.number().min(0).nullable().optional(),
  originalPrice: z.number().min(0).nullable().optional(),
  badge: z.string().max(60).optional(),
  imageUrl: z.string().max(800).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const salonSettingsSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(80).optional(),
    tamilName: z.string().trim().min(1).max(80).optional(),
    tagline: z.string().trim().min(1).max(120).optional(),
    taglineTamil: z.string().trim().max(120).optional(),
    businessInfo: z
      .object({
        salonName: z.string().max(120).optional(),
        tamilName: z.string().max(120).optional(),
        tagline: z.string().max(200).optional(),
        taglineTamil: z.string().max(200).optional(),
        experienceYears: z.number().int().min(0).max(100).optional(),
        happyCustomers: z.number().int().min(0).optional(),
        professionalBarbers: z.number().int().min(0).optional(),
        phone: z.string().max(30).optional(),
        whatsapp: z.string().max(30).optional(),
        email: z.string().email().max(120).optional().or(z.literal('')),
        address: z.string().max(400).optional(),
        openingHours: z.string().max(200).optional(),
        workingDays: z.string().max(200).optional(),
        instagram: z.string().max(60).optional(),
        facebook: z.string().max(200).optional(),
        youtube: z.string().max(200).optional(),
        googleMapsUrl: z.string().max(800).optional(),
      })
      .optional(),
    logo: z.object({ url: z.string().max(600), publicId: z.string().max(300) }).nullable().optional(),
    hero: z
      .object({
        title: z.string().max(200).optional(),
        subtitle: z.string().max(200).optional(),
        tagline: z.string().max(200).optional(),
        videoUrl: z.string().max(600).optional().default(''),
        posterUrl: z.string().max(600).optional().default(''),
        mobileImageUrl: z.string().max(600).optional().default(''),
      })
      .optional(),
    about: z
      .object({
        heading: z.string().max(200).optional(),
        body: z.string().max(4000).optional(),
        imageUrl: z.string().max(600).optional(),
        experienceYears: z.number().int().min(0).max(100).optional(),
      })
      .optional(),
    footerText: z.string().max(500).optional(),
    address: z.string().max(400).optional(),
    openingHours: z.string().max(120).optional(),
    notificationEmail: z.string().email().max(120).optional().or(z.literal('')),
    experienceYears: z.number().int().min(0).max(100).optional(),
    social: z
      .object({
        whatsapp: z.string().max(30).optional(),
        instagram: z.string().max(60).optional(),
        phone: z.string().max(30).optional(),
        email: z.string().email().max(120).optional().or(z.literal('')),
      })
      .optional(),
    maps: z
      .object({
        embedUrl: z.string().max(800).optional(),
        directionsUrl: z.string().max(800).optional(),
      })
      .optional(),
    toggles: z
      .object({
        pricingVisible: z.boolean().optional(),
        beforeAfterEnabled: z.boolean().optional(),
        reviewsEnabled: z.boolean().optional(),
        faqEnabled: z.boolean().optional(),
        heroVideoEnabled: z.boolean().optional(),
        bookingEnabled: z.boolean().optional(),
        barberSelection: z.boolean().optional(),
        darkModeEnabled: z.boolean().optional(),
        customerConfirmationEmail: z.boolean().optional(),
        teamEnabled: z.boolean().optional(),
        offersEnabled: z.boolean().optional(),
      })
      .optional(),
    sections: z
      .object({
        hero: z.object({ ctaPrimary: z.string().max(120).optional(), ctaSecondary: z.string().max(120).optional() }).optional(),
        about: z
          .object({
            eyebrow: z.string().max(120).optional(),
            storyNote: z.string().max(600).optional(),
            yearsLabel: z.string().max(120).optional(),
          })
          .optional(),
        services: sectionHeadingSchema.optional(),
        signature: sectionHeadingSchema.optional(),
        beforeAfter: sectionHeadingSchema.optional(),
        gallery: sectionHeadingSchema.optional(),
        team: sectionHeadingSchema.optional(),
        testimonials: sectionHeadingSchema.optional(),
        faq: sectionHeadingSchema.optional(),
        offers: sectionHeadingSchema.optional(),
        contact: z
          .object({
            eyebrow: z.string().max(120).optional(),
            englishTitle: z.string().max(120).optional(),
            title: z.string().max(400).optional(),
            callTitle: z.string().max(120).optional(),
            callTamil: z.string().max(120).optional(),
            whatsappTitle: z.string().max(120).optional(),
            whatsappTamil: z.string().max(120).optional(),
            instagramTitle: z.string().max(120).optional(),
            instagramTamil: z.string().max(120).optional(),
            addressTitle: z.string().max(120).optional(),
            addressTamil: z.string().max(120).optional(),
            openingHoursTitle: z.string().max(120).optional(),
            quote: z.string().max(600).optional(),
          })
          .optional(),
        footer: z.object({ exploreTitle: z.string().max(120).optional(), contactTitle: z.string().max(120).optional() }).optional(),
        cta: z
          .object({
            eyebrow: z.string().max(120).optional(),
            title: z.string().max(400).optional(),
            subtitle: z.string().max(200).optional(),
            primaryCta: z.string().max(120).optional(),
            secondaryCta: z.string().max(120).optional(),
          })
          .optional(),
      })
      .optional(),
    offers: z
      .object({
        enabled: z.boolean().optional(),
        eyebrow: z.string().max(120).optional(),
        englishTitle: z.string().max(120).optional(),
        title: z.string().max(400).optional(),
        items: z.array(offerItemSchema).optional(),
      })
      .optional(),
  }),
});