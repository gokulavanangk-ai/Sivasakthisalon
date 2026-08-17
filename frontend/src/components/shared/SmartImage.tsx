import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspect?: string;
  eager?: boolean;
}

const FALLBACK_IMAGE =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#171717"/><g fill="#3a342a"><circle cx="400" cy="230" r="70"/><rect x="310" y="330" width="180" height="230" rx="24"/></g><text x="400" y="540" font-family="serif" font-size="20" fill="#5a5245" text-anchor="middle">SIVASAKTHI MEN'S SALON</text></svg>`,
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
    <div className={cn('relative w-full overflow-hidden', aspect, className)}>
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-ink-700" aria-hidden="true" />
      )}
      {src && (
        <img
          src={status === 'error' ? FALLBACK_IMAGE : src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus((s) => (s === 'loading' ? 'error' : s))}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      )}
    </div>
  );
}