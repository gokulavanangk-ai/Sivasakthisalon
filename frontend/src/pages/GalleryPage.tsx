import { useGallery } from '@/hooks/useContent';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { GalleryGrid } from '@/features/gallery/GalleryGrid';
import { ErrorMessage, LoadingSpinner, EmptyState } from '@/components/ui/Feedback';
import { CtaSection } from '@/features/home/CtaSection';

export default function GalleryPage() {
  const { data: gallery = [], isLoading, error } = useGallery();

  return (
    <div className="pt-28 pb-24 sm:pt-36">
      <div className="container-x">
        <SectionHeading
          eyebrow="Gallery"
          englishTitle="Inside the studio"
          title="கண்ணாடிக்கு அப்பால்..."
        />
      </div>

      <div className="container-x">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message="Gallery-ஐ load செய்ய முடியவில்லை." />
        ) : gallery.length === 0 ? (
          <EmptyState title="Photos விரைவில் வரும்." body="வரும் காட்சிகள் ஒவ்வொன்றும் ஒரு கதை." />
        ) : (
          <GalleryGrid items={gallery} />
        )}
      </div>

      <CtaSection />
    </div>
  );
}