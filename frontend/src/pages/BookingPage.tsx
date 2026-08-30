import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import { BookingForm } from '@/features/booking/BookingForm';
import { useSalon, useBusinessHours } from '@/hooks/useContent';
import { whatsappLink } from '@/constants';
import { formatPhone, businessInfoOf } from '@/lib/utils';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Suspense } from 'react';

const WEEK_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export default function BookingPage() {
  const { data: salon } = useSalon();
  const { data: hours } = useBusinessHours();
  const bi = businessInfoOf(salon);

  return (
    <div className="pt-28 pb-24 sm:pt-36">
      <div className="container-x">
        <SectionHeading
          eyebrow="Appointment"
          englishTitle="Book your slot"
          title="உன் Slot-ஐ முன்பதிவு செய்"
        />
      </div>

      <div className="container-x grid gap-12 lg:grid-cols-[1fr_360px]">
        <Reveal>
          <Suspense>
            <BookingForm />
          </Suspense>
        </Reveal>

        <aside className="space-y-5 lg:pt-4">
          <div className="card p-6">
            <p className="eyebrow mb-4">Contact</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-muted">
                <Phone className="h-4 w-4 text-gold" />
                {bi.phone ? (
                  <a href={`tel:+91${bi.phone}`} className="hover:text-cream">
                    {formatPhone(bi.phone)}
                  </a>
                ) : (
                  <span className="text-muted/50">—</span>
                )}
              </li>
              <li className="flex items-center gap-3 text-muted">
                <MessageCircle className="h-4 w-4 text-gold" />
                {whatsappLink(bi.whatsapp) ? (
                  <a href={whatsappLink(bi.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                    WhatsApp
                  </a>
                ) : (
                  <span className="text-muted/50">—</span>
                )}
              </li>
              <li className="flex items-start gap-3 text-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{bi.address}</span>
              </li>
            </ul>
          </div>

          <div className="card p-6">
            <p className="eyebrow mb-4">Opening Hours</p>
            {hours ? (
              <ul className="space-y-2 text-sm">
                {Object.entries(hours.workingHours).map(([day, h]) => (
                  <li key={day} className="flex items-center justify-between gap-3">
                    <span className={h.isOpen ? 'text-cream/80' : 'text-muted/50'}>{WEEK_LABELS[day]}</span>
                    <span className="flex items-center gap-1.5 text-muted">
                      {h.isOpen ? (
                        <>
                          <Clock className="h-3.5 w-3.5 text-gold" />
                          {h.open.slice(0, 5)} – {h.close.slice(0, 5)}
                        </>
                      ) : (
                        <span className="text-muted/50">Closed</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Loading…</p>
            )}
          </div>

          <div className="card border-gold/25 bg-gold/[0.04] p-6">
            <p className="font-tamil text-lg text-cream">{bi.taglineTamil}</p>
            <p className="mt-2 text-sm text-muted">
              Arriving at your confirmed time means minimal waiting and your favourite barber ready for you.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}