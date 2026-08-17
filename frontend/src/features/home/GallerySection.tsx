import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useGallery, useSalon } from '@/hooks/useContent';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SmartImage } from '@/components/shared/SmartImage';
import { ErrorMessage, LoadingSpinner } from '@/components/ui/Feedback';

export function GallerySection() {
  const { data: gallery = [], isLoading, error } = useGallery();
  const { data: salon } = useSalon();

  if (isLoading) return <LoadingSpinner label="Loading gallery" />;
  if (error) {
    return (
      <div className="container-x py-16">
        <ErrorMessage message="Could not load the gallery." />
      </div>
    );
  }
  if (gallery.length === 0) return null;

  const heading = salon?.sections?.gallery ?? {
    eyebrow: 'Gallery',
    englishTitle: 'Inside the studio',
    title: 'கண்ணாடிக்கு அப்பால்...',
  };

  return (
    <section className="container-x py-24 lg:py-32" id="gallery">
      <SectionHeading
        eyebrow={heading.eyebrow}
        englishTitle={heading.englishTitle}
        title={heading.title}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {gallery.slice(0, 8).map((item, i) => (
          <Link
            key={item._id}
            to="/gallery"
            className={`group relative block overflow-hidden rounded-md ${
              i === 0 || i === 4 ? 'aspect-[3/4]' : 'aspect-[4/5]'
            }`}
            aria-label="Open full gallery"
          >
            <SmartImage
              src={item.imageUrl}
              alt={item.title || 'Gallery photo from Sivasakthi men\'s salon'}
              aspect="aspect-auto"
              className="h-full"
              imgClassName="transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/30" />
            <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      {gallery.length > 8 && (
        <div className="mt-10 text-center">
          <Link to="/gallery" className="btn-ghost" aria-label="View full gallery">
            View Full Gallery
          </Link>
        </div>
      )}
    </section>
  );
}