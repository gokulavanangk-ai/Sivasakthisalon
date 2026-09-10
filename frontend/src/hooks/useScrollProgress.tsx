import { useEffect, useRef, useState } from 'react';

/**
 * Returns the scroll progress as a fraction between 0 and 1.
 * Optimized with passive scroll/resize listeners and rAF throttling.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress(current);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return progress;
}

/**
 * High-performance scroll progress indicator that updates its transform directly
 * on the DOM layer without causing parent React tree re-renders.
 */
export function ScrollProgressBar({ className = 'bg-gold' }: { className?: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const el = barRef.current;
      if (el) {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        el.style.transform = `scaleX(${pct})`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={barRef}
      className={`fixed left-0 top-0 z-40 h-0.5 w-full origin-left ${className}`}
      style={{ transform: 'scaleX(0)', willChange: 'transform' }}
      aria-hidden="true"
    />
  );
}
