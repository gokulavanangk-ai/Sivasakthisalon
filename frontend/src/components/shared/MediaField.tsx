import { useMemo, useRef, useState } from 'react';
import { Upload, X, Loader2, FileVideo, FileImage, AlertTriangle, Link2 } from 'lucide-react';
import { cn, isVideoUrl } from '@/lib/utils';
import { useMediaMutations } from '@/features/admin/mutations';
import { MediaPreview } from '@/components/shared/MediaPreview';
import type { MediaType, MediaValue, UploadedMedia } from '@/types';

export const MEDIA_IMAGE_LIMIT = 5 * 1024 * 1024;
export const MEDIA_VIDEO_LIMIT = 50 * 1024 * 1024;

export const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif';
export const VIDEO_ACCEPT = '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime';

interface MediaFieldProps {
  label?: string;
  /** Restricts what kind of media this field accepts. */
  mediaType: MediaType | 'both';
  value?: MediaValue | null;
  onChange: (value: MediaValue | null) => void;
  /** Allowed sources. Ignored now, kept for backward compatibility in props. */
  sources?: any[];
  /** Show a remove/clear button. */
  allowRemove?: boolean;
  aspect?: string;
  /** Register an upload so the page can clean it up if the edit is cancelled. */
  onRegisterPendingUpload?: (publicId: string) => void;
}

/**
 * Reusable media input that acts as a simple direct file upload field.
 */
export function MediaField({
  label,
  mediaType,
  value,
  onChange,
  allowRemove = true,
  aspect,
  onRegisterPendingUpload,
}: MediaFieldProps) {
  const { upload } = useMediaMutations();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const previewUrl = value?.url ?? (file ? URL.createObjectURL(file) : undefined);

  const effectiveType: MediaType | 'both' =
    file ? (file.type.startsWith('video/') ? 'video' : 'image')
    : value?.mediaType
      ? value.mediaType
      : mediaType;

  const accept = useMemo(() => {
    if (mediaType === 'image') return IMAGE_ACCEPT;
    if (mediaType === 'video') return VIDEO_ACCEPT;
    return `${IMAGE_ACCEPT},${VIDEO_ACCEPT}`;
  }, [mediaType]);

  const validateFile = (f: File): string | null => {
    const isVideo = f.type.startsWith('video/');
    const isImage = f.type.startsWith('image/');
    if (mediaType === 'image' && !isImage) return 'Only image files are allowed here (JPG, PNG, WEBP).';
    if (mediaType === 'video' && !isVideo) return 'Only video files are allowed here (MP4, WEBM, MOV).';
    if (!isImage && !isVideo) return 'Unsupported file type. Use JPG, PNG, WEBP, MP4, WEBM or MOV.';
    if (isImage && f.size > MEDIA_IMAGE_LIMIT) return 'Image must be 5 MB or smaller.';
    if (isVideo && f.size > MEDIA_VIDEO_LIMIT) return 'Video must be 50 MB or smaller.';
    return null;
  };

  const handleFile = async (f: File | null) => {
    if (!f) return;
    setError(null);
    const problem = validateFile(f);
    if (problem) {
      setError(problem);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setFile(f);
    setUploading(true);
    try {
      const result: UploadedMedia = await upload.mutateAsync(f);
      onRegisterPendingUpload?.(result.publicId);
      onChange({
        mediaType: result.mediaType,
        sourceType: 'upload',
        url: result.url,
        publicId: result.publicId,
      });
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
      setFile(null);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3 rounded-md border border-white/10 p-4 bg-white/5">
      {label && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-300">
            {label}
            <span className="ml-2 rounded bg-black/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
              {mediaType === 'both' ? 'image / video' : mediaType}
            </span>
          </p>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertTriangle className="h-4 w-4" /> {error}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Preview Area */}
        <div className="w-full sm:w-1/2 md:w-2/5 shrink-0">
          {previewUrl ? (
            <MediaPreview
              src={previewUrl}
              mediaType={effectiveType === 'both' ? undefined : effectiveType}
              alt="Media preview"
              aspect={aspect ?? 'aspect-video'}
            />
          ) : (
            <div className={cn('flex w-full items-center justify-center rounded-md border border-dashed border-white/20 bg-black/40', aspect ?? 'aspect-video')}>
              <div className="text-center text-zinc-600">
                <FileImage className="mx-auto h-6 w-6 mb-1 opacity-50" />
                <span className="text-xs">No media</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Area */}
        <div className="flex w-full flex-col justify-center gap-3">
          <label className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed py-6 px-4 text-center transition-colors",
            uploading ? "border-gold/30 text-gold/80" : "border-white/20 text-zinc-400 hover:border-gold/50 hover:bg-white/5"
          )}>
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            <div>
              <p className="text-sm font-medium">{uploading ? 'Uploading…' : (value?.url ? 'Replace file' : 'Upload new file')}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {mediaType === 'image' ? 'JPG, PNG, WEBP (max 5 MB)' : mediaType === 'video' ? 'MP4, WEBM, MOV (max 50 MB)' : 'Image <5 MB or Video <50 MB'}
              </p>
            </div>
            <input ref={fileRef} type="file" accept={accept} hidden onChange={(e) => void handleFile(e.target.files?.[0] ?? null)} disabled={uploading} />
          </label>

          {value && allowRemove && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            >
              <X className="h-4 w-4" /> Remove current media
            </button>
          )}

          {value?.url && (
            <div className="flex items-center gap-2 overflow-hidden rounded bg-black/40 px-2 py-1.5 text-[10px] text-zinc-500">
              <Link2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{value.url}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}