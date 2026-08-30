import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, ArrowUpRight } from 'lucide-react';
import { useSalon } from '@/hooks/useContent';
import { whatsappLink, instagramLink } from '@/constants';
import { formatPhone, businessInfoOf } from '@/lib/utils';

export function Footer() {
  const { data: salon } = useSalon();
  if (!salon) return null;

  const bi = businessInfoOf(salon);
  const years = typeof bi.experienceYears === 'number' && bi.experienceYears > 0 ? bi.experienceYears : null;
  const igLink = instagramLink(bi.instagram);
  const waLink = whatsappLink(bi.whatsapp);
  const exploreTitle = salon.sections?.footer?.exploreTitle ?? 'Explore';
  const contactTitle = salon.sections?.footer?.contactTitle ?? 'Contact';
  const aboutBody = salon.about?.body || (bi.tamilName ? `${bi.tamilName}${years ? ` — ${years}+ years of premium men's grooming` : ''}.` : '');
  const yearsSuffix = years ? `${years}+ years of trusted grooming` : 'Trusted grooming';
  const area = bi.address ? bi.address.split(',')[0] : '';

  return (
    <footer className="border-t border-line bg-ink-900" id="footer">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          {salon.logo?.url ? (
            <img src={salon.logo.url} alt="Sivasakthi Men's Salon logo" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 font-tamil text-2xl text-gold">
              சி
            </span>
          )}
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
            {aboutBody}
          </p>
          <p className="mt-6 font-tamil text-xl text-gold">{bi.taglineTamil}</p>
        </div>

        <div>
          <p className="eyebrow mb-5">{exploreTitle}</p>
          <ul className="space-y-3 font-sans text-sm">
            {[
              { to: '/about', label: 'About' },
              { to: '/services', label: 'Services' },
              { to: '/styles', label: 'Styles' },
              { to: '/gallery', label: 'Gallery' },
              { to: '/booking', label: 'Book Appointment' },
              { to: '/contact', label: 'Contact' },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="inline-flex items-center gap-2 text-cream/80 transition-colors hover:text-gold">
                  {l.label}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-5">{contactTitle}</p>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3 text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{bi.address}</span>
            </li>
            {bi.phone && (
              <li className="flex gap-3 text-muted">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={`tel:+91${bi.phone}`} className="hover:text-cream">
                  {formatPhone(bi.phone)}
                </a>
              </li>
            )}
            {bi.email && (
              <li className="flex gap-3 text-muted">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={`mailto:${bi.email}`} className="hover:text-cream">
                  {bi.email}
                </a>
              </li>
            )}
            {bi.instagram && (
              <li className="flex gap-3 text-muted">
                <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={igLink} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                  @{bi.instagram}
                </a>
              </li>
            )}
            {bi.facebook && (
              <li className="flex gap-3 text-muted">
                <Facebook className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={bi.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                  Facebook
                </a>
              </li>
            )}
            {bi.youtube && (
              <li className="flex gap-3 text-muted">
                <Youtube className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={bi.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                  YouTube
                </a>
              </li>
            )}
            {waLink && bi.whatsapp && (
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold hover:text-gold-300"
                >
                  WhatsApp: {formatPhone(bi.whatsapp)}
                </a>
              </li>
            )}
          </ul>
          <p className="mt-5 text-xs text-muted/70">
            {yearsSuffix}
            {area ? ` · ${area}` : ''}
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {bi.salonName}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}