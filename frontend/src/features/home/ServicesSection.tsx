import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useServices, useSalon } from '@/hooks/useContent';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { ErrorMessage, EmptyState, ServicesSkeleton } from '@/components/ui/Feedback';

export function ServicesSection() {
  const { data, isLoading, error, refetch } = useServices();
  const { data: salon } = useSalon();
  const pricingVisible = salon?.toggles?.pricingVisible === true;

  const services = data?.items ?? [];
  const heading = salon?.sections?.services ?? {
    eyebrow: 'SERVICES',
    englishTitle: 'What we do',
    title: 'உனக்கான Style. உனக்கான கதை.',
  };

  return (
    <section className="container-x py-24 lg:py-28" id="services">
      <SectionHeading
        eyebrow={heading.eyebrow}
        englishTitle={heading.englishTitle}
        title={heading.title}
      />

      {isLoading ? (
        <ServicesSkeleton count={4} />
      ) : error ? (
        <ErrorMessage
          message="Could not load our services."
          onRetry={() => refetch()}
        />
      ) : services.length === 0 ? (
        <EmptyState title="Services will be listed here soon." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <Reveal key={service._id} delay={(i % 4) * 0.08}>
              <Link
                to="/booking"
                className="group flex h-full flex-col justify-between rounded-md border border-line bg-ink-700 p-6 transition-colors duration-300 hover:border-gold/40"
                aria-label={`Book ${service.englishName} (${service.tamilName})`}
              >
                <div>
                  <h3 className="font-sans text-xl font-semibold text-cream transition-colors group-hover:text-gold">
                    {service.englishName}
                  </h3>
                  <p className="mt-1 font-tamil text-lg text-gold/80">{service.tamilName}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted">{service.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <Clock className="h-3.5 w-3.5 text-gold" />
                    {service.durationMinutes} min
                  </span>
                  {pricingVisible && service.price != null && (
                    <span className="font-sans text-sm font-semibold text-gold">₹{service.price}</span>
                  )}
                  <span className="rounded-full border border-gold/40 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-widest text-gold">
                    Book now
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}