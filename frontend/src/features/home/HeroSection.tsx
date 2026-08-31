import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useSalon } from '@/hooks/useContent';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { Magnetic } from '@/components/shared/Magnetic';
import { SmartImage } from '@/components/shared/SmartImage';
import { businessInfoOf, resolveHeroMedia } from '@/lib/utils';

const ASCENT_GREY =
  'linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.35) 40%, rgba(8,8,8,0.9) 100%)';

export function HeroSection() {
  const { data: salon } = useSalon();
  const progress = useScrollProgress();
  const reduced = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);

  const hero = salon?.hero;
  const bi = businessInfoOf(salon);
  const taglineTamil = bi.taglineTamil;
  const title = hero?.title ?? 'உன் தோற்றம்…\nஉன் அடையாளம்.';
  const hasYears = typeof bi.experienceYears === 'number' && bi.experienceYears > 0;
  const subtitle =
    hero?.subtitle || (hasYears ? `${bi.experienceYears}+ YEARS OF EXPERIENCE` : 'YEARS OF EXPERIENCE');
  const ctaPrimary = salon?.sections?.hero?.ctaPrimary ?? 'Book Your Style';
  const ctaSecondary = salon?.sections?.hero?.ctaSecondary ?? 'Explore Our Style';

  const { videoUrl, imageUrl, poster, mobileImageUrl } = resolveHeroMedia(hero);

  const showVideo =
    salon?.toggles?.heroVideoEnabled !== false &&
    Boolean(videoUrl) &&
    !videoFailed;

  const backgroundImage = imageUrl;
  // Mobile always shows a static image (never the <video>). Fall back to the
  // desktop image/poster when no dedicated mobile image is configured.
  const mobileImage = mobileImageUrl || imageUrl || poster;

  const gradientBackground = (
    <div
      className="h-full w-full animate-slow-zoom"
      style={{
        background:
          'radial-gradient(120% 90% at 70% 10%, #1c1a14 0%, #0d0d0d 45%, #080808 100%)',
      }}
    />
  );

  return (
    <section
      className="grain relative flex min-h-[100svh] items-center overflow-hidden"
      id="hero"
      aria-label="Introduction"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden bg-ink">
        {/* Mobile (< md): static image only — the <video> is never mounted here,
            so it is never requested over the network on small screens. */}
        <div className="h-full w-full md:hidden">
          {mobileImage ? (
            <div className="h-full w-full animate-slow-zoom">
              <SmartImage src={mobileImage} alt="Sivasakthi premium men's grooming" aspect="aspect-auto" className="absolute inset-0 h-full w-full" eager />
            </div>
          ) : (
            gradientBackground
          )}
        </div>

        {/* Desktop (>= md): video when enabled, else image/gradient. */}
        <div className="hidden h-full w-full md:block">
          {showVideo ? (
            <video
              key={videoUrl}
              className="h-full w-full object-cover"
              src={videoUrl}
              poster={poster || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              onError={() => setVideoFailed(true)}
            />
          ) : backgroundImage ? (
            <div className="h-full w-full animate-slow-zoom">
              <SmartImage src={backgroundImage} alt="Sivasakthi premium men's grooming" aspect="aspect-auto" className="absolute inset-0 h-full w-full" eager />
            </div>
          ) : (
            gradientBackground
          )}
        </div>
        <div className="absolute inset-0" style={{ background: ASCENT_GREY }} />
      </div>

      {/* Content */}
      <div className="container-x relative z-10 pt-28 pb-20 sm:pt-32">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="eyebrow flex items-center gap-3"
        >
          <span className="inline-block h-px w-10 bg-gold" />
          {subtitle}
        </motion.p>

        <h1
          className="h-display mt-6 max-w-4xl text-5xl sm:text-7xl lg:text-8xl"
          style={{ whiteSpace: 'pre-line' }}
        >
          {title.split('\n').map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={reduced ? false : { y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 + i * 0.14, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 1 }}
          className="mt-8 font-tamil text-lg text-gold sm:text-xl"
        >
          {taglineTamil}
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.9 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Magnetic>
            <a
              href="/booking"
              className="btn-primary group"
              aria-label="Book your style appointment"
            >
              <span className="mr-1">{ctaPrimary}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Magnetic>
          <a href="/styles" className="btn-ghost" aria-label="Explore our styles">
            {ctaSecondary}
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        animate={reduced ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        aria-hidden="true"
      >
        <ArrowDown className="h-5 w-5 text-muted" />
      </motion.div>

      {/* Scroll progress indicator */}
      <div
        className="fixed left-0 top-0 z-40 h-0.5 bg-gold"
        style={{ width: `${progress * 100}%` }}
        aria-hidden="true"
      />
    </section>
  );
}