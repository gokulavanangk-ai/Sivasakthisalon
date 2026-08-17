import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useHairstyles, useSalon } from '@/hooks/useContent';
import { HorizontalScroll } from '@/components/shared/HorizontalScroll';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SmartImage } from '@/components/shared/SmartImage';
import { ErrorMessage, LoadingSpinner } from '@/components/ui/Feedback';
import { HAIRSTYLE_CATEGORY_LABELS } from '@/constants';

export function StylesShowcase() {
  const { data: hairstyles = [], isLoading, error } = useHairstyles();
  const { data: salon } = useSalon();

  if (isLoading) return <LoadingSpinner label="Loading styles" />;
  if (error) {
    return (
      <div className="container-x py-16">
        <ErrorMessage message="Could not load hairstyle showcase." />
      </div>
    );
  }
  if (hairstyles.length === 0) return null;

  const heading = {
    eyebrow: 'Hairstyles',
    englishTitle: 'The lookbook',
    title: salon?.sections?.services?.title ?? 'ஒவ்வொரு முகத்திற்கும் ஒரு Style',
  };

  return (
    <section className="py-24 lg:py-32" id="styles-showcase">
      <div className="container-x mb-10 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow={heading.eyebrow}
          englishTitle={heading.englishTitle}
          title={heading.title}
          className="mb-0"
        />
        <Link
          to="/styles"
          className="group inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-widest text-gold"
          aria-label="View all hairstyles"
        >
          View all styles
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <HorizontalScroll
        items={hairstyles}
        className="w-[78vw] max-w-[340px] shrink-0 sm:w-[52vw] sm:max-w-[390px] lg:w-[380px]"
        renderItem={(style) => (
          <Link
            to={`/styles#${style.englishName.toLowerCase().replace(/\s+/g, '-')}`}
            className="group block"
            aria-label={`View ${style.englishName} hairstyle`}
          >
            <div className="relative overflow-hidden rounded-md">
              <SmartImage
                src={style.imageUrl}
                alt={`${style.tamilName} (${style.englishName}) at Sivasakthi men's salon`}
                aspect="aspect-[4/5]"
                imgClassName="transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-gold">
                  {HAIRSTYLE_CATEGORY_LABELS[style.category]?.label ?? style.category}
                </p>
                <h3 className="mt-1 font-tamil text-2xl text-cream">{style.tamilName}</h3>
                <p className="font-sans text-xs uppercase tracking-widest text-cream/70">{style.englishName}</p>
              </div>
            </div>
          </Link>
        )}
      />
    </section>
  );
}