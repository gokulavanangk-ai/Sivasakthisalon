import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaLibrary } from '@/services/api';
import { useMediaMutations } from '@/features/admin/mutations';
import { X, Upload, Loader2 } from 'lucide-react';

export interface PickedImage {
  url: string;
  publicId: string;
}

/**
 * Cloudinary-backed media library picker. Lets an admin reuse a previously
 * uploaded image (the single source of truth) or upload a brand new one.
 * Calls `onSelect` with `{ url, publicId }`.
 */
export function MediaLibraryPicker({
  onSelect,
  onClose,
}: {
  onSelect: (image: PickedImage) => void;
  onClose: () => void;
}) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['media-library'],
    queryFn: fetchMediaLibrary,
    staleTime: 30 * 1000,
  });
  const { upload } = useMediaMutations();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (file: File) => {
    upload.mutate(file, {
      onSuccess: (asset) => {
        onSelect({ url: asset.url, publicId: asset.publicId });
        refetch();
      },
    });
  };

  const assets = data ?? [];

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-md border border-white/10 bg-[#141414] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Media library</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-zinc-400 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={upload.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-3 py-1.5 text-sm font-semibold text-black hover:bg-gold-300 disabled:opacity-50"
          >
            {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload new image
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = '';
            }}
          />
          <p className="text-xs text-zinc-500">Reuse an existing Cloudinary image or upload a new one.</p>
        </div>

        {isLoading ? (
          <p className="py-8 text-sm text-zinc-500">Loading library…</p>
        ) : assets.length === 0 ? (
          <div className="rounded-md border border-dashed border-white/10 py-10 text-center text-sm text-zinc-500">
            No images in the library yet. Upload one above.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {assets.map((a) => (
              <button
                key={a.publicId}
                type="button"
                onClick={() => onSelect({ url: a.url, publicId: a.publicId })}
                className="group relative aspect-square overflow-hidden rounded-md border border-white/10 bg-black"
              >
                <img src={a.url} alt="Media library asset" className="h-full w-full object-cover" loading="lazy" />
                <span className="pointer-events-none absolute inset-0 flex items-end justify-center bg-black/0 pb-2 text-xs text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                  Use image
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
