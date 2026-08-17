import { ArrowUpRight } from 'lucide-react';
import { useSalon } from '@/hooks/useContent';
import { Magnetic } from '@/components/shared/Magnetic';
import { Reveal } from '@/components/shared/Reveal';
import { SmartImage } from '@/components/shared/SmartImage';
import { businessInfoOf } from '@/lib/utils';

export function CtaSection() {
  const { data: salon } = useSalon();
  const bi = businessInfoOf(salon);
  const bookEnabled = salon?.toggles?.bookingEnabled !== false;
  const cta = salon?.sections?.cta ?? {
    eyebrow: 'Your Style. Your Story.',
    title: 'கண்ணாடியில் ஒரு புதிய உன்னைப்\nபார்க்க தயாரா?',
    subtitle: 'Book in 60 seconds. No advance payment.',
    primaryCta: 'Book Your Style',
    secondaryCta: 'Explore Styles',
  };

  return (
    <section className="relative overflow-hidden py-32 lg:py-40">
      {salon?.about?.imageUrl && (
        <div className="absolute inset-0 opacity-25">
          <SmartImage src={salon.about.imageUrl} alt="" aspect="aspect-auto" className="h-full w-full" eager />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/70 to-ink" />

      <div className="container-x relative text-center">
        <Reveal>
          <p className="eyebrow mb-6">{cta.eyebrow}</p>
          <h2
            className="h-display mx-auto max-w-3xl text-4xl sm:text-6xl"
            style={{ whiteSpace: 'pre-line' }}
          >
            {cta.title}
          </h2>
          <p className="mt-6 font-sans text-[11px] font-semibold uppercase tracking-widest2 text-muted">
            {cta.subtitle}
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            {bookEnabled ? (
              <Magnetic>
                <a href="/booking" className="btn-primary" aria-label="Book your style now">
                  {cta.primaryCta}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Magnetic>
            ) : (
              <a
                href={`tel:+91${bi.phone}`}
                className="btn-primary"
                aria-label="Call the salon"
              >
                Call Now
              </a>
            )}
            <a href="/styles" className="btn-ghost" aria-label="Explore our hairstyles">
              {cta.secondaryCta}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}