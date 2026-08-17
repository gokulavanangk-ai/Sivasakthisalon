import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useServices, useSalon } from '@/hooks/useContent';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SmartImage } from '@/components/shared/SmartImage';

export function SignatureSection() {
  const { data } = useServices();
  const { data: salon } = useSalon();
  const signatures = (data?.items ?? []).filter((s) => s.isSignature).slice(0, 3);

  if (signatures.length === 0) return null;

  const heading = salon?.sections?.signature ?? {
    eyebrow: 'SIGNATURE',
    englishTitle: 'The signature experience',
    title: 'மூன்று அடையாள அழகுகள்',
  };

  return (
    <section className="py-24 lg:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow={heading.eyebrow}
          englishTitle={heading.englishTitle}
          title={heading.title}
        />
      </div>

      <div className="container grid gap-8 lg:grid-cols-3">
        {signatures.map((service, i) => (
          <Reveal key={service._id} delay={i * 0.1}>
            <Link
              to="/booking"
              className="group relative block overflow-hidden rounded-md"
              aria-label={`Book ${service.englishName}`}
            >
              <SmartImage
                src={service.imageUrl}
                alt={`${service.englishName} at Sivasakthi`}
                aspect="aspect-[3/4]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-sans text-2xl font-semibold text-cream">{service.englishName}</h3>
                <p className="mt-1 font-tamil text-xl text-gold/80">{service.tamilName}</p>
                <p className="mt-2 text-sm text-cream/80">{service.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-widest text-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Book now <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}