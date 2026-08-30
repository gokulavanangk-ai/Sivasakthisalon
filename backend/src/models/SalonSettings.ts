import mongoose, { type Document, type Schema } from 'mongoose';

export interface SocialLinks {
  whatsapp: string;
  instagram: string;
  phone: string;
  email: string;
}

export interface GalleryConfig {
  categories: string[];
}

export interface HeroMedia {
  mediaType: 'image' | 'video' | 'none';
  sourceType: 'upload' | 'url' | 'local';
  url: string;
  posterUrl: string;
  publicId: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  playsInline: boolean;
}

export interface FeatureToggles {
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

export interface SectionHeadingCopy {
  eyebrow: string;
  englishTitle: string;
  title: string;
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

export interface SalonSettingsDocument extends Document {
  name: string;
  tamilName: string;
  tagline: string;
  taglineTamil: string;
  businessInfo: BusinessInfo;
  logo: {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
  } | null;
  hero: {
    title: string;
    subtitle: string;
    tagline: string;
    videoUrl: string;
    posterUrl: string;
    mobileImageUrl: string;
    media: HeroMedia;
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
  social: SocialLinks;
  maps: { embedUrl: string; directionsUrl: string };
  toggles: FeatureToggles;
  sections: WebsiteSections;
  offers: OffersConfig;
}

const salonSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tamilName: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    taglineTamil: { type: String, default: '', trim: true },
    businessInfo: {
      salonName: { type: String, default: '', trim: true },
      tamilName: { type: String, default: '', trim: true },
      tagline: { type: String, default: '', trim: true },
      taglineTamil: { type: String, default: '', trim: true },
      experienceYears: { type: Number, default: 23 },
      happyCustomers: { type: Number, default: 0 },
      professionalBarbers: { type: Number, default: 0 },
      phone: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      openingHours: { type: String, default: '' },
      workingDays: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' },
      googleMapsUrl: { type: String, default: '' },
    },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      bytes: { type: Number, default: 0 },
      format: { type: String, default: '' },
    },
    hero: {
      title: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      tagline: { type: String, default: '' },
      videoUrl: { type: String, default: '' },
      posterUrl: { type: String, default: '' },
      mobileImageUrl: { type: String, default: '' },
      media: {
        mediaType: { type: String, enum: ['image', 'video', 'none'], default: 'image' },
        sourceType: { type: String, enum: ['upload', 'url', 'local'], default: 'url' },
        url: { type: String, default: '' },
        posterUrl: { type: String, default: '' },
        publicId: { type: String, default: '' },
        autoplay: { type: Boolean, default: true },
        muted: { type: Boolean, default: true },
        loop: { type: Boolean, default: true },
        playsInline: { type: Boolean, default: true },
      },
    },
    about: {
      heading: { type: String, default: '' },
      body: { type: String, default: '' },
      imageUrl: { type: String, default: '' },
      experienceYears: { type: Number, default: 23 },
    },
    footerText: { type: String, default: '' },
    address: { type: String, default: '' },
    openingHours: {
      type: String,
      default: 'Mon – Sat: 9:00 AM – 9:00 PM',
      trim: true,
    },
    notificationEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    experienceYears: { type: Number, default: 23 },
    social: {
      whatsapp: { type: String, default: '9790446470' },
      instagram: { type: String, default: 'sivasakthisalon' },
      phone: { type: String, default: '9790446470' },
      email: { type: String, default: '' },
    },
    maps: {
      embedUrl: { type: String, default: '' },
      directionsUrl: { type: String, default: '' },
    },
    toggles: {
      pricingVisible: { type: Boolean, default: false },
      beforeAfterEnabled: { type: Boolean, default: false },
      reviewsEnabled: { type: Boolean, default: true },
      faqEnabled: { type: Boolean, default: true },
      heroVideoEnabled: { type: Boolean, default: true },
      bookingEnabled: { type: Boolean, default: true },
      barberSelection: { type: Boolean, default: false },
      darkModeEnabled: { type: Boolean, default: true },
      customerConfirmationEmail: { type: Boolean, default: false },
      teamEnabled: { type: Boolean, default: false },
      offersEnabled: { type: Boolean, default: false },
    },
    sections: {
      hero: {
        ctaPrimary: { type: String, default: 'Book Your Style' },
        ctaSecondary: { type: String, default: 'Explore Our Style' },
      },
      about: {
        eyebrow: { type: String, default: 'Our Story' },
        storyNote: { type: String, default: 'இங்கு ஒவ்வொரு நாற்காலியும் ஒரு கதைசொல்லி. உன் வருகை அதன் அடுத்த அத்தியாயம்.' },
        yearsLabel: { type: String, default: 'Years of Craft' },
      },
      services: {
        eyebrow: { type: String, default: 'SERVICES' },
        englishTitle: { type: String, default: 'What we do' },
        title: { type: String, default: 'உனக்கான Style. உனக்கான கதை.' },
      },
      signature: {
        eyebrow: { type: String, default: 'SIGNATURE' },
        englishTitle: { type: String, default: 'The signature experience' },
        title: { type: String, default: 'மூன்று அடையாள அழகுகள்' },
      },
      beforeAfter: {
        eyebrow: { type: String, default: 'Before / After' },
        englishTitle: { type: String, default: 'The transformation' },
        title: { type: String, default: 'மாற்றத்தின் கதை' },
      },
      gallery: {
        eyebrow: { type: String, default: 'Gallery' },
        englishTitle: { type: String, default: 'Inside the studio' },
        title: { type: String, default: 'கண்ணாடிக்கு அப்பால்...' },
      },
      team: {
        eyebrow: { type: String, default: 'TEAM' },
        englishTitle: { type: String, default: 'The barbers' },
        title: { type: String, default: 'கைவண்ணம் காட்டுபவர்கள்' },
      },
      testimonials: {
        eyebrow: { type: String, default: 'Testimonials' },
        englishTitle: { type: String, default: 'What our customers think' },
        title: { type: String, default: 'எங்களை நம்பியவர்கள்' },
      },
      faq: {
        eyebrow: { type: String, default: 'FAQ' },
        englishTitle: { type: String, default: 'Answers' },
        title: { type: String, default: 'அடிக்கடி கேட்கப்படும் கேள்விகள்' },
      },
      offers: {
        eyebrow: { type: String, default: 'Offers' },
        englishTitle: { type: String, default: 'Current offers' },
        title: { type: String, default: 'சலுகைகள்' },
      },
      contact: {
        eyebrow: { type: String, default: 'Contact' },
        englishTitle: { type: String, default: 'Get in touch' },
        title: { type: String, default: 'எங்களை அடையுங்கள்' },
        callTitle: { type: String, default: 'Call Now' },
        callTamil: { type: String, default: 'அழை' },
        whatsappTitle: { type: String, default: 'WhatsApp' },
        whatsappTamil: { type: String, default: 'செய்தி' },
        instagramTitle: { type: String, default: 'Instagram' },
        instagramTamil: { type: String, default: 'பின்தொடர' },
        addressTitle: { type: String, default: 'Address' },
        addressTamil: { type: String, default: 'முகவரி' },
        openingHoursTitle: { type: String, default: 'Opening Hours' },
        quote: { type: String, default: 'ஒவ்வொரு வெட்டிலும் ஒரு கதை. வந்து உன் கதையை சொல்.' },
      },
      footer: {
        exploreTitle: { type: String, default: 'Explore' },
        contactTitle: { type: String, default: 'Contact' },
      },
      cta: {
        eyebrow: { type: String, default: 'Your Style. Your Story.' },
        title: { type: String, default: 'கண்ணாடியில் ஒரு புதிய உன்னைப்\nபார்க்க தயாரா?' },
        subtitle: { type: String, default: 'Book in 60 seconds. No advance payment.' },
        primaryCta: { type: String, default: 'Book Your Style' },
        secondaryCta: { type: String, default: 'Explore Styles' },
      },
    },
    offers: {
      enabled: { type: Boolean, default: false },
      eyebrow: { type: String, default: 'Offers' },
      englishTitle: { type: String, default: 'Current offers' },
      title: { type: String, default: 'சலுகைகள்' },
      items: {
        type: [
          {
            title: { type: String, default: '' },
            description: { type: String, default: '' },
            price: { type: Number, default: null, min: 0 },
            originalPrice: { type: Number, default: null, min: 0 },
            badge: { type: String, default: '' },
            imageUrl: { type: String, default: '' },
            isActive: { type: Boolean, default: true },
            sortOrder: { type: Number, default: 0 },
          },
        ],
        default: [],
      },
    },
  },
  { timestamps: true },
);

export const SalonSettings = mongoose.model<SalonSettingsDocument>('SalonSettings', salonSchema);