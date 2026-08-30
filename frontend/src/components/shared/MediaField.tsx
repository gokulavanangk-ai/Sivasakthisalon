import { useMemo, useRef, useState } from 'react';
import { Upload, X, Loader2, FileVideo, FileImage, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  /** Show a remove/clear button. */
  allowRemove?: boolean;
  aspect?: string;
  /** Register an upload so the page can clean it up if the edit is cancelled. */
  onRegisterPendingUpload?: (publicId: string) => void;
}

/**
 * Direct file-upload media input (Logo-style). A local file is uploaded
 * straight to the backend upload endpoint and stored in Cloudinary; the
 * returned secure_url + publicId become the media value.
 *
 * Deliberately NO URL import and NO project-media tabs: every admin image field
 * must come from a real local file so a URL string can never reach backend URL
 * validation. The File object is sent as multipart/form-data — it is never
 * converted to a file://, blob:, localhost or filesystem path.
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

  const previewUrl = file ? URL.createObjectURL(file) : value?.url;

  const effectiveType: MediaType =
    file
      ? (file.type.startsWith('video/') ? 'video' : 'image')
      : (value?.mediaType ?? (mediaType === 'both' ? 'image' : mediaType));

  const accept = useMemo(() => {
    if (mediaType === 'image') return IMAGE_ACCEPT;
    if (mediaType === 'video') return VIDEO_ACCEPT;
    return `${IMAGE_ACCEPT},${VIDEO_ACCEPT}`;
  }, [mediaType]);

  const validateFile = (f: File): string | null => {
    const isVideo = f.type.startsWith('video/');
    const isImage = f.type.startsWith('image/');
    if (mediaType === 'image' && !isImage) return 'Only image files are allowed here (JPG, PNG, WEBP, HEIC).';
    if (mediaType === 'video' && !isVideo) return 'Only video files are allowed here (MP4, WEBM, MOV).';
    if (!isImage && !isVideo) return 'Unsupported file type. Use JPG, PNG, WEBP, HEIC, MP4, WEBM or MOV.';
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
      // The actual File object goes into FormData as multipart/form-data.
      const result: UploadedMedia = await upload.mutateAsync(f);
      onRegisterPendingUpload?.(result.publicId);
      onChange({
        mediaType: result.mediaType,
        sourceType: 'upload',
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
        resourceType: result.resourceType,
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
    <div className="space-y-2 rounded-md border border-white/10 p-3">
      {label && (
        <p className="text-xs font-medium text-zinc-400">
          {label}
          <span className="ml-2 text-[10px] uppercase tracking-wider text-zinc-600">{mediaType === 'both' ? 'image / video' : mediaType}</span>
        </p>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertTriangle className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      <div>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-white/20 py-6 text-zinc-400 transition-colors hover:border-gold/50">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-sm">
            {uploading ? 'Uploading…' : 'Choose file'}
          </span>
          <span className="text-xs text-zinc-600">
            {mediaType === 'image' ? 'JPG · PNG · WEBP · HEIC · max 5 MB' : mediaType === 'video' ? 'MP4 · WEBM · MOV · max 50 MB' : 'Image max 5 MB · Video max 50 MB'}
          </span>
          <input ref={fileRef} type="file" accept={accept} hidden onChange={(e) => void handleFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>

      {previewUrl ? (
        <MediaPreview
          src={previewUrl}
          mediaType={effectiveType}
          alt="Media preview"
          aspect={aspect ?? 'aspect-video'}
          controls={false}
        />
      ) : (
        <div className="rounded-md bg-ink-700/60 px-3 py-3 text-xs text-zinc-600">
          No media selected. Choose a file from your device.
        </div>
      )}

      {value && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1 capitalize">
            {effectiveType === 'video' ? <FileVideo className="h-3.5 w-3.5" /> : <FileImage className="h-3.5 w-3.5" />}
            {value.mediaType ?? effectiveType}
          </span>
          <span>Uploaded to Cloudinary</span>
          {value.url && (
            <span className="max-w-[260px] truncate" title={value.url}>{value.url}</span>
          )}
        </div>
      )}

      {value && allowRemove && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-400',
          )}
        >
          <X className="h-3.5 w-3.5" /> Remove media
        </button>
      )}
    </div>
  );
}
