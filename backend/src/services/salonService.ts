import { SalonSettings, type SalonSettingsDocument, type WebsiteSections, type OffersConfig, type BusinessInfo } from '../models/SalonSettings';
import { sanitizePersistedUrl, cleanPersistedUrl } from './mediaService';
import { BusinessHours, type BusinessHoursDocument } from '../models/BusinessHours';
import { ApiError } from '../utils/ApiError';

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  salonName: 'Sivasakthi Men\u2019s Salon',
  tamilName: '\u0B9A\u0BBF\u0BB5\u0B9A\u0B95\u0BCD\u0BA4\u0BBF \u0B9A\u0BBF\u0B95\u0BC8 \u0B85\u0BB2\u0B99\u0BCD\u0B95\u0BBE\u0BB0\u0BAE\u0BCD',
  tagline: 'Every haircut tells a story.',
  taglineTamil: '\u0B92\u0BB5\u0BCD\u0BB5\u0BCA\u0BB0\u0BC1 \u0BB5\u0BC6\u0B9F\u0BCD\u0B9F\u0BBF\u0BB2\u0BC1\u0BAE\u0BCD \u0B92\u0BB0\u0BC1 \u0B95\u0BA4\u0BC8.',
  experienceYears: 23,
  happyCustomers: 0,
  professionalBarbers: 0,
  phone: '9790446470',
  whatsapp: '9790446470',
  email: '',
  address: 'Pandian Nagar, Rosalpatti, Tamil Nadu 626001',
  openingHours: 'Mon \u2013 Sat: 9:00 AM \u2013 9:00 PM',
  workingDays: '',
  instagram: 'sivasakthisalon',
  facebook: '',
  youtube: '',
  googleMapsUrl: 'https://www.google.com/maps?q=Rosalpatti,+Tamil+Nadu+626001',
};

export const DEFAULT_SECTIONS: WebsiteSections = {
  hero: {
    ctaPrimary: 'Book Your Style',
    ctaSecondary: 'Explore Our Style',
  },
  about: {
    eyebrow: 'Our Story',
    storyNote: 'இங்கு ஒவ்வொரு நாற்காலியும் ஒரு கதைசொல்லி. உன் வருகை அதன் அடுத்த அத்தியாயம்.',
    yearsLabel: 'Years of Craft',
    heading: '',
    body: '',
    imageUrl: '',
  },
  services: {
    eyebrow: 'SERVICES',
    englishTitle: 'What we do',
    title: 'உனக்கான Style. உனக்கான கதை.',
  },
  signature: {
    eyebrow: 'SIGNATURE',
    englishTitle: 'The signature experience',
    title: 'மூன்று அடையாள அழகுகள்',
  },
  beforeAfter: {
    eyebrow: 'Before / After',
    englishTitle: 'The transformation',
    title: 'மாற்றத்தின் கதை',
  },
  gallery: {
    eyebrow: 'Gallery',
    englishTitle: 'Inside the studio',
    title: 'கண்ணாடிக்கு அப்பால்...',
  },
  team: {
    eyebrow: 'TEAM',
    englishTitle: 'The barbers',
    title: 'கைவண்ணம் காட்டுபவர்கள்',
  },
  testimonials: {
    eyebrow: 'Testimonials',
    englishTitle: 'What our customers think',
    title: 'எங்களை நம்பியவர்கள்',
  },
  faq: {
    eyebrow: 'FAQ',
    englishTitle: 'Answers',
    title: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
  },
  offers: {
    eyebrow: 'Offers',
    englishTitle: 'Current offers',
    title: 'சலுகைகள்',
  },
  contact: {
    eyebrow: 'Contact',
    englishTitle: 'Get in touch',
    title: 'எங்களை அடையுங்கள்',
    callTitle: 'Call Now',
    callTamil: 'அழை',
    whatsappTitle: 'WhatsApp',
    whatsappTamil: 'செய்தி',
    instagramTitle: 'Instagram',
    instagramTamil: 'பின்தொடர',
    addressTitle: 'Address',
    addressTamil: 'முகவரி',
    openingHoursTitle: 'Opening Hours',
    quote: 'ஒவ்வொரு வெட்டிலும் ஒரு கதை. வந்து உன் கதையை சொல்.',
  },
  footer: {
    exploreTitle: 'Explore',
    contactTitle: 'Contact',
  },
  cta: {
    eyebrow: 'Your Style. Your Story.',
    title: 'கண்ணாடியில் ஒரு புதிய உன்னைப்\nபார்க்க தயாரா?',
    subtitle: 'Book in 60 seconds. No advance payment.',
    primaryCta: 'Book Your Style',
    secondaryCta: 'Explore Styles',
  },
};

export const DEFAULT_OFFERS: OffersConfig = {
  enabled: false,
  eyebrow: 'Offers',
  englishTitle: 'Current offers',
  title: 'சலுகைகள்',
  items: [],
};

export const DEFAULT_SALON = {
  name: 'Sivasakthi Men\u2019s Salon',
  tamilName: '\u0B9A\u0BBF\u0BB5\u0B9A\u0B95\u0BCD\u0BA4\u0BBF \u0B9A\u0BBF\u0B95\u0BC8 \u0B85\u0BB2\u0B99\u0BCD\u0B95\u0BBE\u0BB0\u0BAE\u0BCD',
  tagline: 'Every haircut tells a story.',
  taglineTamil: '\u0B92\u0BB5\u0BCD\u0BB5\u0BCA\u0BB0\u0BC1 \u0BB5\u0BC6\u0B9F\u0BCD\u0B9F\u0BBF\u0BB2\u0BC1\u0BAE\u0BCD \u0B92\u0BB0\u0BC1 \u0B95\u0BA4\u0BC8.',
  hero: {
    title: '\u0B89\u0BA9\u0BCD \u0BA4\u0BCB\u0BB1\u0BCD\u0BB1\u0BAE\u0BCD\u2026\n\u0B89\u0BA9\u0BCD \u0B85\u0B9F\u0BC8\u0BAF\u0BBE\u0BB3\u0BAE\u0BCD.',
    subtitle: '23+ YEARS OF EXPERIENCE',
    tagline: '\u0B92\u0BB5\u0BCD\u0BB5\u0BCA\u0BB0\u0BC1 \u0BB5\u0BC6\u0B9F\u0BCD\u0B9F\u0BBF\u0BB2\u0BC1\u0BAE\u0BCD \u0B92\u0BB0\u0BC1 \u0B95\u0BA4\u0BC8.',
  },
  about: {
    heading: '23 \u0B86\u0BA3\u0BCD\u0B9F\u0BC1\u0B95\u0BB3\u0BBF\u0BA9\u0BCD \u0B85\u0BA9\u0BC1\u0BAA\u0BB5\u0BAE\u0BCD. \u0B92\u0BB0\u0BC7 \u0BA8\u0BCB\u0B95\u0BCD\u0B95\u0BAE\u0BCD.',
    body: '23 \u0B86\u0BA3\u0BCD\u0B9F\u0BC1\u0B95\u0BB3\u0BBE\u0B95, \u0BA4\u0BCB\u0BB1\u0BCD\u0BB1\u0BA4\u0BCD\u0BA4\u0BC8 \u0BAE\u0B9F\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD \u0BAE\u0BBE\u0BB1\u0BCD\u0BB1\u0BBE\u0BAE\u0BB2\u0BCD, \u0B92\u0BB5\u0BCD\u0BB5\u0BCA\u0BB0\u0BC1 \u0BB5\u0BBE\u0B9F\u0BBF\u0B95\u0BCD\u0B95\u0BC8\u0BAF\u0BBE\u0BB3\u0BB0\u0BBF\u0BA9\u0BCD \u0BA4\u0BA9\u0BBF\u0BA4\u0BCD\u0BA4\u0BC1\u0BB5\u0BA4\u0BCD\u0BA4\u0BC8\u0BAF\u0BC1\u0BAE\u0BCD \u0B85\u0BB5\u0BB0\u0BCD\u0B95\u0BB3\u0BBF\u0BA9\u0BCD \u0B9F\u0BBF\u0BB8\u0BCD\u0B9F\u0BC8\u0BAF\u0BB2\u0BCD \u0B86\u0B95 \u0BAE\u0BBE\u0BB1\u0BCD\u0BB1\u0BBF \u0BB5\u0BB0\u0BC1\u0B95\u0BBF\u0BB1\u0BCB\u0BAE\u0BCD.',
    experienceYears: 23,
  },
  footerText: '\u0B92\u0BB5\u0BCD\u0BB5\u0BCA\u0BB0\u0BC1 \u0BB5\u0BC6\u0B9F\u0BCD\u0B9F\u0BBF\u0BB2\u0BC1\u0BAE\u0BCD \u0B92\u0BB0\u0BC1 \u0B95\u0BA4\u0BC8.',
  address: 'Pandian Nagar, Rosalpatti, Tamil Nadu 626001',
  openingHours: 'Mon \u2013 Sat: 9:00 AM \u2013 9:00 PM',
  notificationEmail: '',
  experienceYears: 23,
  toggles: {
    pricingVisible: false,
    beforeAfterEnabled: false,
    reviewsEnabled: true,
    faqEnabled: true,
    heroVideoEnabled: true,
    bookingEnabled: true,
    barberSelection: false,
    darkModeEnabled: true,
    customerConfirmationEmail: false,
    teamEnabled: false,
    offersEnabled: false,
  },
  sections: DEFAULT_SECTIONS,
  offers: DEFAULT_OFFERS,
};

const mergeSectionDefaults = (settings: SalonSettingsDocument): void => {
  const s = settings.sections ?? (settings.sections = {} as SalonSettingsDocument['sections']);
  const o = settings.offers ?? (settings.offers = {} as SalonSettingsDocument['offers']);
  settings.sections = deepMerge(DEFAULT_SECTIONS, s) as SalonSettingsDocument['sections'];
  settings.offers = deepMerge(DEFAULT_OFFERS, o) as SalonSettingsDocument['offers'];
};

function syncBusinessInfo(settings: SalonSettingsDocument, data?: Partial<SalonSettingsDocument>): void {
  const bi = settings.businessInfo ?? (settings.businessInfo = {} as BusinessInfo);
  const social = settings.social ?? (settings.social = { whatsapp: '', instagram: '', phone: '', email: '' });
  const maps = settings.maps ?? (settings.maps = { embedUrl: '', directionsUrl: '', latitude: 9.5919, longitude: 77.9732 });
  const about = settings.about ?? (settings.about = { heading: '', body: '', imageUrl: '', experienceYears: 23 });

  if (data?.businessInfo) {
    settings.name = bi.salonName ?? settings.name;
    settings.tamilName = bi.tamilName ?? settings.tamilName;
    settings.tagline = bi.tagline ?? settings.tagline;
    settings.taglineTamil = bi.taglineTamil ?? settings.taglineTamil;
    settings.experienceYears = bi.experienceYears ?? settings.experienceYears;
    about.experienceYears = bi.experienceYears ?? about.experienceYears;
    settings.address = bi.address ?? settings.address;
    settings.openingHours = bi.openingHours ?? settings.openingHours;
    social.phone = bi.phone ?? social.phone;
    social.whatsapp = bi.whatsapp ?? social.whatsapp;
    social.email = bi.email ?? social.email;
    social.instagram = bi.instagram ?? social.instagram;
    maps.directionsUrl = data?.maps?.directionsUrl ?? bi.googleMapsUrl ?? maps.directionsUrl;
  }

  settings.businessInfo = {
    ...DEFAULT_BUSINESS_INFO,
    ...bi,
    salonName: settings.name,
    tamilName: settings.tamilName,
    tagline: settings.tagline,
    taglineTamil: settings.taglineTamil,
    experienceYears: settings.experienceYears,
    phone: social.phone ?? '',
    whatsapp: social.whatsapp ?? '',
    email: social.email ?? '',
    address: settings.address,
    openingHours: settings.openingHours,
    instagram: social.instagram ?? '',
    googleMapsUrl: maps.directionsUrl ?? '',
  };
}

export async function getOrCreateSalonSettings(): Promise<SalonSettingsDocument> {
  let settings = await SalonSettings.findOne().exec();
  if (!settings) {
    settings = await SalonSettings.create({ ...DEFAULT_SALON, businessInfo: DEFAULT_BUSINESS_INFO });
  } else {
    mergeSectionDefaults(settings);
    if (!settings.toggles?.teamEnabled && settings.toggles?.teamEnabled !== false) {
      settings.toggles = { ...DEFAULT_SALON.toggles, ...settings.toggles };
    }
    syncBusinessInfo(settings);
    await settings.save();
  }
  return settings;
}

export async function updateSalonSettings(
  data: Partial<SalonSettingsDocument>,
): Promise<SalonSettingsDocument> {
  const settings = await getOrCreateSalonSettings();

  // Self-heal stale DB baseline before merge: a localhost / /uploads/ reference
  // left in the DB by an earlier session must not fail a save that only touches
  // one field. We clear it from the loaded baseline (it is replaced by the
  // client's clean value on merge, or cleared entirely). The strict
  // `sanitizePersistedUrl` guard below still rejects any genuinely-unsafe NEW
  // value the client sends.
  cleanSalonBaselineMedia(settings);

  const merged = deepMerge(settings.toObject(), data) as Partial<SalonSettingsDocument>;
  Object.assign(settings, merged);
  syncBusinessInfo(settings, data);

  // Data-flow guard: never persist localhost, /uploads/, blob:/file:/data: or
  // private-network URLs into any salon media/URL field. Uploaded hero media is
  // a Cloudinary https URL and passes; external video/poster/about/offer URLs
  // must be safe public web URLs (SSRF-checked).
  if (settings.logo?.url) settings.logo.url = sanitizePersistedUrl(settings.logo.url, 'Logo URL');
  if (settings.about?.imageUrl) settings.about.imageUrl = sanitizePersistedUrl(settings.about.imageUrl, 'About image URL');
  if (settings.hero?.media?.url) settings.hero.media.url = sanitizePersistedUrl(settings.hero.media.url, 'Hero media URL');
  settings.hero && (settings.hero.videoUrl = sanitizePersistedUrl(settings.hero.videoUrl, 'Hero video URL'));
  settings.hero && (settings.hero.posterUrl = sanitizePersistedUrl(settings.hero.posterUrl, 'Hero poster URL'));
  settings.hero && (settings.hero.mobileImageUrl = sanitizePersistedUrl(settings.hero.mobileImageUrl, 'Hero mobile image URL'));
  if (settings.offers?.items?.length) {
    settings.offers.items = settings.offers.items.map((item) =>
      item?.imageUrl ? { ...item, imageUrl: sanitizePersistedUrl(item.imageUrl, 'Offer image URL') } : item,
    );
  }

  await settings.save();
  return settings;
}

/**
 * Clears stale unsafe media references (localhost, /uploads/, private-network,
 * blob:/data:/file:, absolute paths) from a salon document's media fields so a
 * pre-existing broken value can never fail a save or be served to clients.
 * Safe Cloudinary and external public URLs are preserved. Non-throwing.
 */
function cleanSalonBaselineMedia(settings: Partial<SalonSettingsDocument>): void {
  if (settings.logo?.url) settings.logo.url = cleanPersistedUrl(settings.logo.url);
  if (settings.about?.imageUrl) settings.about.imageUrl = cleanPersistedUrl(settings.about.imageUrl);
  if (settings.hero) {
    if (settings.hero.media) settings.hero.media.url = cleanPersistedUrl(settings.hero.media.url);
    settings.hero.videoUrl = cleanPersistedUrl(settings.hero.videoUrl);
    settings.hero.posterUrl = cleanPersistedUrl(settings.hero.posterUrl);
    settings.hero.mobileImageUrl = cleanPersistedUrl(settings.hero.mobileImageUrl);
  }
  if (settings.offers?.items?.length) {
    settings.offers.items = settings.offers.items.map((item) =>
      item?.imageUrl ? { ...item, imageUrl: cleanPersistedUrl(item.imageUrl) } : item,
    );
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlainObject(patch)) return patch as T;
  const out: Record<string, unknown> = isPlainObject(base) ? { ...base } : {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    out[key] = isPlainObject(value) ? deepMerge(out[key], value) : value;
  }
  return out as T;
}

export async function updateBusinessHours(
  data: Partial<Record<string, unknown>>,
): Promise<BusinessHoursDocument> {
  let hours = await BusinessHours.findOne().exec();
  if (!hours) {
    hours = await BusinessHours.create(data);
    return hours;
  }
  Object.assign(hours, data);
  await hours.save();
  return hours;
}

export async function getOrCreateBusinessHours(): Promise<BusinessHoursDocument> {
  let hours = await BusinessHours.findOne().exec();
  if (!hours) {
    hours = await BusinessHours.create({});
  }
  return hours;
}

export async function uploadSalonLogo(file: Express.Multer.File): Promise<SalonSettingsDocument> {
  void file;
  throw ApiError.badRequest('Logo upload must be handled by the route', 'IMPL_MISSING');
}