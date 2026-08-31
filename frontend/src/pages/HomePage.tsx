import { HeroSection } from '@/features/home/HeroSection';
import { StorySection } from '@/features/home/StorySection';
import { ServicesSection } from '@/features/home/ServicesSection';
import { SignatureSection } from '@/features/home/SignatureSection';
import { StyleFinder } from '@/features/styleFinder/StyleFinder';
import { BeforeAfterSection } from '@/features/beforeAfter/BeforeAfter';
// import { GallerySection } from '@/features/home/GallerySection';
import { ReviewsSection } from '@/features/reviews/ReviewsSection';
import { QuotesSection } from '@/features/quotes/QuotesSection';
// import { FaqSection } from '@/features/faq/FaqSection';
import { CtaSection } from '@/features/home/CtaSection';
import { OffersSection } from '@/features/offers/OffersSection';
import { TeamSection } from '@/features/team/TeamSection';
import { Marquee } from '@/components/shared/Marquee';
import { useSalon } from '@/hooks/useContent';
import { businessInfoOf } from '@/lib/utils';
import { useMemo } from 'react';

export default function HomePage() {
  const { data: salon } = useSalon();
  const bi = businessInfoOf(salon);
  const marqueeItems = useMemo(
    () => [
      'Premium Haircuts',
      'Signature Beard Styling',
      'Premium Fades',
      'Hair + Beard Combos',
      'Face Cleanup',
      'Head Massage',
      `${typeof bi.experienceYears === 'number' && bi.experienceYears > 0 ? `${bi.experienceYears}+` : ''} Years of Craft`,
    ],
    [bi.experienceYears],
  );

  return (
    <>
      <HeroSection />
      <Marquee items={marqueeItems} />
      <StorySection />
      <SignatureSection />
      <OffersSection />
      <ServicesSection />
      <StyleFinder />
      <TeamSection />
      <ReviewsSection />
      <BeforeAfterSection />
      {/* <GallerySection /> */}
      <QuotesSection />
      {/* <FaqSection /> */}
      <CtaSection />
    </>
  );
}