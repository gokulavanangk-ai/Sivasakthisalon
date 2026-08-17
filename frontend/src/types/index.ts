export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pages: number;
  total: number;
  limit: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

export interface SectionHeadingCopy {
  eyebrow: string;
  englishTitle: string;
  title: string;
}

export interface OfferItem {
  title: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  badge: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export interface WebsiteSections {
  hero: { ctaPrimary: string; ctaSecondary: string };
  about: { eyebrow: string; storyNote: string; yearsLabel: string };
  services: SectionHeadingCopy;
  signature: SectionHeadingCopy;
  beforeAfter: SectionHeadingCopy;
  gallery: SectionHeadingCopy;
  team: SectionHeadingCopy;
  testimonials: SectionHeadingCopy;
  faq: SectionHeadingCopy;
  offers: SectionHeadingCopy;
  contact: {
    eyebrow: string;
    englishTitle: string;
    title: string;
    callTitle: string;
    callTamil: string;
    whatsappTitle: string;
    whatsappTamil: string;
    instagramTitle: string;
    instagramTamil: string;
    addressTitle: string;
    addressTamil: string;
    openingHoursTitle: string;
    quote: string;
  };
  footer: { exploreTitle: string; contactTitle: string };
  cta: { eyebrow: string; title: string; subtitle: string; primaryCta: string; secondaryCta: string };
}

export interface OffersConfig {
  enabled: boolean;
  eyebrow: string;
  englishTitle: string;
  title: string;
  items: OfferItem[];
}

export interface BusinessInfo {
  salonName: string;
  tamilName: string;
  tagline: string;
  taglineTamil: string;
  experienceYears: number;
  happyCustomers: number;
  professionalBarbers: number;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  openingHours: string;
  workingDays: string;
  instagram: string;
  facebook: string;
  youtube: string;
  googleMapsUrl: string;
}

export interface SalonSettings {
  _id: string;
  name: string;
  tamilName: string;
  tagline: string;
  taglineTamil: string;
  businessInfo: BusinessInfo;
  logo: { url: string; publicId: string } | null;
  hero: {
    title: string;
    subtitle: string;
    tagline: string;
    videoUrl: string;
    posterUrl: string;
    mobileImageUrl: string;
  };
  about: {
    heading: string;
    body: string;
    imageUrl: string;
    experienceYears: number;
  };
  footerText: string;
  address: string;
  openingHours: string;
  notificationEmail: string;
  experienceYears: number;
  social: {
    whatsapp: string;
    instagram: string;
    phone: string;
    email: string;
  };
  maps: { embedUrl: string; directionsUrl: string };
  toggles: {
    pricingVisible: boolean;
    beforeAfterEnabled: boolean;
    reviewsEnabled: boolean;
    faqEnabled: boolean;
    heroVideoEnabled: boolean;
    bookingEnabled: boolean;
    barberSelection: boolean;
    darkModeEnabled: boolean;
    customerConfirmationEmail: boolean;
    teamEnabled: boolean;
    offersEnabled: boolean;
  };
  sections: WebsiteSections;
  offers: OffersConfig;
}

export interface Service {
  _id: string;
  tamilName: string;
  englishName: string;
  subtitle: string;
  description: string;
  durationMinutes: number;
  price: number | null;
  priceVisible: boolean;
  imageUrl: string;
  category: string;
  isActive: boolean;
  isSignature: boolean;
  sortOrder: number;
}

export type HairstyleCategory =
  | 'classic'
  | 'fade'
  | 'modern'
  | 'textured'
  | 'formal'
  | 'beard'
  | 'hair-beard';

export type FaceShape = 'oval' | 'round' | 'square' | 'rectangle' | 'diamond' | 'heart';
export type StyleType = 'classic' | 'modern' | 'bold' | 'professional' | 'low-maintenance';
export type HairType = 'straight' | 'wavy' | 'curly';

export interface Hairstyle {
  _id: string;
  tamilName: string;
  englishName: string;
  category: HairstyleCategory;
  description: string;
  faceShapes: FaceShape[];
  styleTypes: StyleType[];
  hairTypes: HairType[];
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export type GalleryCategory =
  | 'salon-interior'
  | 'haircuts'
  | 'beard-styles'
  | 'customers'
  | 'atmosphere';

export interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  category: GalleryCategory;
  imageUrl: string;
  publicId: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Review {
  _id: string;
  name: string;
  initial: string;
  rating: number;
  text: string;
  service: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Booking {
  _id: string;
  bookingId: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  serviceId?: string | null;
  barber?: string;
  date: string;
  time: string;
  message?: string;
  status: BookingStatus;
  emailStatus: 'pending' | 'sent' | 'failed';
  emailStatusNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
  breakStart: string;
  breakEnd: string;
}

export interface BusinessHours {
  _id?: string;
  workingHours: Record<WeekDay, DayHours>;
  slotDurationMinutes: number;
  blockedDates: string[];
  timezone: string;
}

export interface Barber {
  _id: string;
  name: string;
  tamilName: string;
  specialty: string;
  isActive: boolean;
  sortOrder: number;
}

export interface SlotInfo {
  time: string;
  available: boolean;
}

export interface AdminUser {
  id: string;
  role: string;
  name: string;
  username: string;
  email: string;
}

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}