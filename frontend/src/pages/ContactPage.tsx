import { Phone, MessageCircle, Instagram, Facebook, Youtube, MapPin, Navigation } from 'lucide-react';
import { useSalon, useBusinessHours } from '@/hooks/useContent';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/shared/Reveal';
import { whatsappLink, instagramLink } from '@/constants';
import { formatPhone, businessInfoOf, isValidDirectionsUrl } from '@/lib/utils';
import LeafletMap, { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '@/components/shared/LeafletMap';
import { FaqSection } from '@/features/faq/FaqSection';

const WEEK_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

function ContactCard({ title, tamil, children }: { title: string; tamil: string; children: React.ReactNode }) {
  return (
    <div className="card h-full p-6">
      <p className="font-tamil text-xl text-gold">{tamil}</p>
      <p className="mt-1 font-sans text-[11px] font-semibold uppercase tracking-widest text-muted">{title}</p>
      <div className="mt-4 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

export default function ContactPage() {
  const { data: salon } = useSalon();
  const { data: hours } = useBusinessHours();
  const bi = businessInfoOf(salon);

  const phone = bi.phone;
  const directionsUrl = bi.googleMapsUrl;
  const directionsValid = isValidDirectionsUrl(directionsUrl);

  const latitude = salon?.maps?.latitude ?? DEFAULT_LATITUDE;
  const longitude = salon?.maps?.longitude ?? DEFAULT_LONGITUDE;

  const sec = salon?.sections?.contact;
  const contact = {
    eyebrow: sec?.eyebrow ?? 'Contact',
    englishTitle: sec?.englishTitle ?? 'Get in touch',
    title: sec?.title ?? 'எங்களை அடையுங்கள்',
    quote: sec?.quote ?? 'ஒவ்வொரு வெட்டிலும் ஒரு கதை. வந்து உன் கதையை சொல்.',
    callTitle: sec?.callTitle ?? 'Call Now',
    callTamil: sec?.callTamil ?? 'அழை',
    whatsappTitle: sec?.whatsappTitle ?? 'WhatsApp',
    whatsappTamil: sec?.whatsappTamil ?? 'செய்தி',
    instagramTitle: sec?.instagramTitle ?? 'Instagram',
    instagramTamil: sec?.instagramTamil ?? 'பின்தொடர',
    addressTitle: sec?.addressTitle ?? 'Address',
    addressTamil: sec?.addressTamil ?? 'முகவரி',
    openingHoursTitle: sec?.openingHoursTitle ?? 'Opening Hours',
  };

  return (
    <div className="pt-28 pb-24 sm:pt-36">
      <div className="container-x">
        <SectionHeading eyebrow={contact.eyebrow} englishTitle={contact.englishTitle} title={contact.title} />
      </div>

      <div className="container-x grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Reveal>
          <ContactCard title={contact.callTitle} tamil={contact.callTamil}>
            {phone ? (
              <a href={`tel:+91${phone}`} className="text-xl text-cream hover:text-gold">
                {formatPhone(phone)}
              </a>
            ) : (
              <span className="text-muted/50">—</span>
            )}
          </ContactCard>
        </Reveal>
        <Reveal delay={0.05}>
          <ContactCard title={contact.whatsappTitle} tamil={contact.whatsappTamil}>
            {whatsappLink(bi.whatsapp) ? (
              <a href={whatsappLink(bi.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-cream">
                <MessageCircle className="h-4 w-4 text-gold" /> Chat with us
              </a>
            ) : (
              <span className="text-muted/50">—</span>
            )}
          </ContactCard>
        </Reveal>
        <Reveal delay={0.1}>
          <ContactCard title={contact.instagramTitle} tamil={contact.instagramTamil}>
            {bi.instagram ? (
              <a href={instagramLink(bi.instagram)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-cream">
                <Instagram className="h-4 w-4 text-gold" /> @{bi.instagram}
              </a>
            ) : (
              <span className="text-muted/50">—</span>
            )}
          </ContactCard>
        </Reveal>
        <Reveal delay={0.15}>
          <ContactCard title={contact.addressTitle} tamil={contact.addressTamil}>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {bi.address}
            </p>
          </ContactCard>
        </Reveal>
      </div>

      {(bi.facebook || bi.youtube) && (
        <div className="container-x mt-6">
          <div className="flex flex-wrap gap-3">
            {bi.facebook && (
              <a href={bi.facebook} target="_blank" rel="noopener noreferrer" className="card inline-flex items-center gap-2 px-5 py-3 text-sm text-cream/80 hover:text-cream">
                <Facebook className="h-4 w-4 text-gold" /> Facebook
              </a>
            )}
            {bi.youtube && (
              <a href={bi.youtube} target="_blank" rel="noopener noreferrer" className="card inline-flex items-center gap-2 px-5 py-3 text-sm text-cream/80 hover:text-cream">
                <Youtube className="h-4 w-4 text-gold" /> YouTube
              </a>
            )}
          </div>
        </div>
      )}

      <div className="container-x mt-14">
        <Reveal>
          <div className="relative overflow-hidden rounded-md border border-line">
            <LeafletMap
              latitude={latitude}
              longitude={longitude}
              scrollWheelZoom
              popupText={`${bi.salonName || 'Salon'} — ${bi.address || ''}`}
            />
            <div className="pointer-events-none absolute inset-0 border border-line/40" />
          </div>
        </Reveal>
      </div>
      <FaqSection />
      
      <div className="container-x mt-14 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="card h-full p-7">
            <p className="eyebrow mb-5">{contact.openingHoursTitle}</p>
            {hours ? (
              <ul className="space-y-2.5 text-sm">
                {Object.entries(hours.workingHours).map(([day, h]) => (
                  <li key={day} className="flex items-center justify-between border-b border-line/50 pb-2 last:border-0">
                    <span className={h.isOpen ? 'text-cream/85' : 'text-muted/50'}>{WEEK_LABELS[day]}</span>
                    {h.isOpen ? (
                      <span className="text-muted">{h.open.slice(0, 5)} – {h.close.slice(0, 5)}</span>
                    ) : (
                      <span className="text-muted/50">Closed</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Loading…</p>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="card flex h-full flex-col justify-center gap-4 p-7">
            <p className="font-tamil text-2xl leading-snug text-cream">
              {contact.quote}
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={`tel:+91${phone}`} className="btn-primary">
                <Phone className="h-4 w-4" /> Call Now
              </a>
              {directionsValid ? (
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <Navigation className="h-4 w-4" /> Get Directions
                </a>
              ) : (
                <a
                  href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  <Navigation className="h-4 w-4" /> Get Directions
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}