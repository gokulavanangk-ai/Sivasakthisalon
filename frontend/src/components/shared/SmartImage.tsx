import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspect?: string;
  eager?: boolean;
}

const FALLBACK_SVG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#141414"/><g fill="#2e2920"><circle cx="400" cy="230" r="64"/><path d="M290 490c0-60.7 49.3-110 110-110s110 49.3 110 110z"/></g><text x="400" y="540" font-family="sans-serif" font-size="16" letter-spacing="4" fill="#c8a96b" text-anchor="middle">SIVASAKTHI MEN'S SALON</text></svg>`,
  );

export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  aspect = 'aspect-[4/5]',
  eager = false,
}: SmartImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(() => (src ? 'loading' : 'error'));

  useEffect(() => {
    setStatus(src ? 'loading' : 'error');
  }, [src]);

  return (
    <div className={cn('relative w-full overflow-hidden bg-ink-800', aspect, className)}>
      {/* Shimmer skeleton while image is loading */}
      {status === 'loading' && (
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden bg-ink-700/80 after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/[0.04] after:to-transparent"
        />
      )}

      {/* Actual image with smooth fade-in */}
      {src ? (
        <img
          src={status === 'error' ? FALLBACK_SVG : src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus((s) => (s === 'loading' ? 'error' : s))}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500 ease-out',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-800/80 p-4 text-center">
          <ImageIcon className="h-6 w-6 text-muted/40" />
          <span className="font-tamil text-xs text-muted/60">சிவசக்தி</span>
        </div>
      )}
    </div>
  );
}