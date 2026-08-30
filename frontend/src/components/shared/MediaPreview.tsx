import { useState } from 'react';
import { ImageIcon, Film, AlertTriangle } from 'lucide-react';
import { cn, isVideoUrl } from '@/lib/utils';
import type { MediaType } from '@/types';

interface MediaPreviewProps {
  src?: string;
  mediaType?: MediaType;
  alt?: string;
  className?: string;
  aspect?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  poster?: string;
  rounded?: boolean;
  objectFit?: 'cover' | 'contain';
}

/**
 * Renders the correct HTML element (img vs video) for a media URL and shows
 * a friendly "Unable to load media" state instead of breaking the page.
 */
export function MediaPreview({
  src,
  mediaType,
  alt = '',
  className,
  aspect = 'aspect-video',
  controls = true,
  autoPlay = false,
  muted = true,
  loop = false,
  playsInline = true,
  poster,
  rounded = true,
  objectFit = 'cover',
}: MediaPreviewProps) {
  const [failed, setFailed] = useState(false);
  const effectiveType: MediaType = mediaType ?? (isVideoUrl(src) ? 'video' : 'image');

  const reset = () => setFailed(false);

  if (!src) {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center gap-2 bg-ink-700 text-muted',
          aspect,
          rounded && 'rounded-md',
          className,
        )}
      >
        <ImageIcon className="h-5 w-5" />
        <span className="text-xs">No media selected</span>
      </div>
    );
  }

  if (failed) {
    return (
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center gap-1.5 bg-ink-700 text-muted',
          aspect,
          rounded && 'rounded-md',
          className,
        )}
      >
        <AlertTriangle className="h-5 w-5 text-amber-400/70" />
        <span className="px-2 text-center text-xs">Unable to load media</span>
      </div>
    );
  }

  if (effectiveType === 'video') {
    return (
      <div className={cn('w-full max-w-full overflow-hidden', aspect, rounded && 'rounded-md', className)}>
        <video
          key={src}
          src={src}
          poster={poster}
          controls={controls}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline={playsInline}
          preload={autoPlay ? 'auto' : 'metadata'}
          className={`h-full w-full bg-ink-700 object-${objectFit}`}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-full overflow-hidden', aspect, rounded && 'rounded-md', className)}>
      <img
        key={src}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={reset}
        onError={() => setFailed(true)}
        className={`h-full w-full bg-ink-700 object-${objectFit}`}
      />
    </div>
  );
}

/** Small overlay used to indicate a playable video tile. */
export function VideoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-cream backdrop-blur-sm',
        className,
      )}
      aria-hidden="true"
    >
      <Film className="h-4 w-4" />
    </span>
  );
}