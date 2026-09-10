import { useEffect, useRef } from 'react';
import { useMediaQuery, useReducedMotion } from '@/hooks/useMedia';

export function CustomCursor() {
  const isDesktop = useMediaQuery('(pointer: fine)');
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDesktop || reduced) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let isActive = false;
    let rafId = 0;

    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!root || !dot || !ring) return;

    const render = () => {
      // Smoothly interpolate ring position towards mouse
      ringX += (mouseX - ringX) * 0.25;
      ringY += (mouseY - ringY) * 0.25;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) ${
        isActive ? 'scale(1.6)' : 'scale(1)'
      }`;

      if (isVisible) {
        root.style.opacity = '1';
      } else {
        root.style.opacity = '0';
      }

      rafId = requestAnimationFrame(render);
    };

    const moveHandler = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) isVisible = true;
    };

    const overHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      isActive = Boolean(target?.closest?.('a, button, [role="button"], input, select, textarea'));
    };

    const leaveHandler = () => {
      isVisible = false;
    };

    window.addEventListener('mousemove', moveHandler, { passive: true });
    window.addEventListener('mouseover', overHandler, { passive: true });
    document.documentElement.addEventListener('mouseleave', leaveHandler, { passive: true });

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', overHandler);
      document.documentElement.removeEventListener('mouseleave', leaveHandler);
    };
  }, [isDesktop, reduced]);

  if (!isDesktop || reduced) return null;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[99] transition-opacity duration-300"
      style={{ opacity: 0 }}
      aria-hidden="true"
    >
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-2 w-2 rounded-full bg-gold will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)' }}
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-8 w-8 rounded-full border border-gold/50 transition-transform duration-150 ease-out will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)' }}
      />
    </div>
  );
}