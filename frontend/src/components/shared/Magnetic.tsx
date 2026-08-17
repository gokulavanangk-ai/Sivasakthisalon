import { type ReactNode, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { useMagnetic } from '@/hooks/useMagnetic';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className, strength }: MagneticProps) {
  const ref = useMagnetic<HTMLDivElement>({ strength });

  return (
    <div ref={ref} className={cn('inline-block will-change-transform', className)}>
      {children}
    </div>
  );
}

export function MagneticLink({
  href,
  children,
  className,
  variant = 'primary',
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'ghost';
}) {
  const ref = useMagnetic<HTMLAnchorElement>({});

  const scrollToBooking = (e: MouseEvent<HTMLAnchorElement>) => {
    if (href === '#book' && typeof window !== 'undefined') {
      e.preventDefault();
      window.location.hash = '#book';
    }
  };

  return (
    <a
      ref={ref}
      href={href}
      onClick={scrollToBooking}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-sans text-[13px] font-semibold uppercase tracking-widest transition-colors duration-300 will-change-transform',
        variant === 'primary'
          ? 'bg-gold text-ink hover:bg-gold-300'
          : 'border border-line text-cream hover:border-gold hover:text-gold',
        className,
      )}
    >
      {children}
    </a>
  );
}