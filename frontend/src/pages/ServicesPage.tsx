import { Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useServices, useSalon } from '@/hooks/useContent';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/shared/Reveal';
import { ErrorMessage, LoadingSpinner, EmptyState } from '@/components/ui/Feedback';
import { CtaSection } from '@/features/home/CtaSection';

export default function ServicesPage() {
  const { data, isLoading, error } = useServices();
  const { data: salon } = useSalon();
  const pricingVisible = salon?.toggles?.pricingVisible === true;

  return (
    <div className="pt-28 pb-24 sm:pt-36">
      <div className="container-x">
        <SectionHeading
          eyebrow="SERVICES"
          englishTitle="The full menu"
          title="எங்கள் அனைத்து சேவைகளும்"
        />
      </div>

      <div className="container-x">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message="Could not load our services." />
        ) : (data?.items ?? []).length === 0 ? (
          <EmptyState title="Services will be listed here soon." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.items ?? []).map((service, i) => (
              <Reveal key={service._id} delay={(i % 3) * 0.08}>
                <div className="group flex h-full flex-col rounded-md border border-line bg-ink-700 p-7 transition-colors duration-300 hover:border-gold/40">
                  <h3 className="font-sans text-2xl font-semibold text-cream">{service.englishName}</h3>
                  <p className="mt-1 font-tamil text-xl text-gold/80">{service.tamilName}</p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{service.description}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <Clock className="h-3.5 w-3.5 text-gold" />
                      {service.durationMinutes} min
                    </span>
                    {pricingVisible && service.price != null && (
                      <span className="font-sans text-lg font-semibold text-gold">₹{service.price}</span>
                    )}
                    <Link
                      to="/booking"
                      className="inline-flex items-center gap-1 rounded-full border border-gold/40 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-widest text-gold"
                      aria-label={`Book ${service.englishName}`}
                    >
                      Book now <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <CtaSection />
    </div>
  );
}