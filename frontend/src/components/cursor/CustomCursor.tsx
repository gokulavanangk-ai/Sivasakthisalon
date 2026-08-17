import { useEffect, useState } from 'react';
import { useMediaQuery, useReducedMotion } from '@/hooks/useMedia';

export function CustomCursor() {
  const isDesktop = useMediaQuery('(pointer: fine)');
  const reduced = useReducedMotion();
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!isDesktop || reduced) return;

    const moveHandler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const overHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setActive(Boolean(target.closest('a, button, [role="button"], input, select, textarea')));
    };
    const leaveHandler = () => setVisible(false);

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseover', overHandler);
    document.documentElement.addEventListener('mouseleave', leaveHandler);
    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', overHandler);
      document.documentElement.removeEventListener('mouseleave', leaveHandler);
    };
  }, [isDesktop, reduced, visible]);

  if (!isDesktop || reduced) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[99]"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div
        className="absolute h-2 w-2 rounded-full bg-gold"
        style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
      />
      <div
        className="absolute h-8 w-8 rounded-full border border-gold/50 transition-transform duration-200"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) ${active ? 'scale(1.6)' : 'scale(1)'}`,
        }}
      />
    </div>
  );
}