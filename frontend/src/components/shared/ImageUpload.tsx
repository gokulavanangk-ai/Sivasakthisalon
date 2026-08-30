import { useRef, useState } from 'react';
import { Upload, X, Loader2, AlertTriangle } from 'lucide-react';
import { useMediaMutations } from '@/features/admin/mutations';
import { IMAGE_ACCEPT } from '@/components/shared/MediaField';

/**
 * Direct file-upload control for string image fields (e.g. about.imageUrl,
 * offers[].imageUrl, hero.posterUrl/mobileImageUrl). A local file is uploaded
 * straight to Cloudinary and the returned secure_url is written to the field as
 * a plain https string — exactly like the Logo upload.
 *
 * There is no URL text box: a local file is never treated as a URL string, so
 * it can never reach backend URL validation.
 */
export function ImageUpload({
  label,
  value,
  onChange,
  onRegisterPendingUpload,
  aspect = 'aspect-[4/5]',
}: {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  onRegisterPendingUpload?: (publicId: string) => void;
  aspect?: string;
}) {
  const { upload } = useMediaMutations();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File | null) => {
    if (!f) return;
    setError(null);
    if (!f.type.startsWith('image/')) {
      setError('Only image files are allowed here (JPG, PNG, WEBP, HEIC).');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setUploading(true);
    try {
      const result = await upload.mutateAsync(f);
      onRegisterPendingUpload?.(result.publicId);
      onChange(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertTriangle className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-white/20 py-5 text-zinc-400 transition-colors hover:border-gold/50">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        <span className="text-sm">{uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}</span>
        <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} hidden onChange={(e) => void handleFile(e.target.files?.[0] ?? null)} />
      </label>

      {value ? (
        <div className="flex items-start gap-3">
          <img src={value} alt="Preview" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} className={`${aspect} w-full max-w-[180px] rounded-md object-cover border border-white/10`} />
          <button
            type="button"
            onClick={() => onChange('')}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      ) : (
        <p className="text-xs text-zinc-600">No image uploaded.</p>
      )}
    </div>
  );
}
