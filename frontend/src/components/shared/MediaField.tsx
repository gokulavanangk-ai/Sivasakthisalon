import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, Link2, FolderOpen, X, Loader2, FileVideo, FileImage, AlertTriangle } from 'lucide-react';
import { cn, formatBytes, isVideoUrl } from '@/lib/utils';
import { useMediaMutations } from '@/features/admin/mutations';
import { MediaPreview } from '@/components/shared/MediaPreview';
import type { LocalMediaFile, MediaSource, MediaType, MediaValue, UploadedMedia } from '@/types';

export const MEDIA_IMAGE_LIMIT = 5 * 1024 * 1024;
export const MEDIA_VIDEO_LIMIT = 50 * 1024 * 1024;

export const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif';
export const VIDEO_ACCEPT = '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime';

const SOURCE_LABELS: Record<MediaSource, string> = {
  upload: 'Uploaded file',
  url: 'External URL',
  local: 'Project media',
};

interface MediaFieldProps {
  label?: string;
  /** Restricts what kind of media this field accepts. */
  mediaType: MediaType | 'both';
  value?: MediaValue | null;
  onChange: (value: MediaValue | null) => void;
  /** Allowed sources. Defaults to all three. */
  sources?: MediaSource[];
  /** Show a remove/clear button. */
  allowRemove?: boolean;
  aspect?: string;
  /** Register an upload so the page can clean it up if the edit is cancelled. */
  onRegisterPendingUpload?: (publicId: string) => void;
}

type SourceTab = MediaSource;

/**
 * Reusable media input: Upload File / Use URL / Existing Local with preview,
 * validation and correct img/video rendering. Used across gallery, hero,
 * styles and services so upload logic is never duplicated per page.
 */
export function MediaField({
  label,
  mediaType,
  value,
  onChange,
  sources = ['upload', 'url', 'local'],
  allowRemove = true,
  aspect,
  onRegisterPendingUpload,
}: MediaFieldProps) {
  const { upload, local } = useMediaMutations();
  const [activeSource, setActiveSource] = useState<SourceTab>(() => {
    if (value?.sourceType) return value.sourceType;
    return sources.includes('upload') ? 'upload' : sources[0];
  });
  const [urlDraft, setUrlDraft] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localOptions, setLocalOptions] = useState<LocalMediaFile[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localLoaded, setLocalLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sourceTabs: SourceTab[] = sources;

  useEffect(() => {
    if (value?.sourceType && sources.includes(value.sourceType)) {
      setActiveSource(value.sourceType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.sourceType]);

  const previewUrl = value?.url ?? (file ? URL.createObjectURL(file) : urlDraft || undefined);

  const effectiveType: MediaType | 'both' =
    file ? (file.type.startsWith('video/') ? 'video' : 'image')
    : value?.mediaType
      ? value.mediaType
      : urlDraft
        ? isVideoUrl(urlDraft)
          ? 'video'
          : 'image'
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

  const handleUrl = (raw: string) => {
    setUrlDraft(raw);
    setError(null);
    const v = raw.trim();
    if (!v) {
      onChange(null);
      return;
    }
    if (!/^https?:\/\/\S+$/i.test(v) && !v.startsWith('/')) {
      setError('Enter a full http(s) URL or a project path like /images/…');
      return;
    }
    const type: MediaType = mediaType === 'both' ? (isVideoUrl(v) ? 'video' : 'image') : mediaType;
    onChange({ mediaType: type, sourceType: 'url', url: v });
  };

  const loadLocal = async () => {
    if (localLoaded) return;
    setLocalLoading(true);
    try {
      const options = await local.mutateAsync();
      setLocalOptions(options);
      setLocalLoaded(true);
    } catch {
      setLocalOptions([]);
    } finally {
      setLocalLoading(false);
    }
  };

  const filteredLocal = localOptions.filter(
    (o) => mediaType === 'both' || o.mediaType === mediaType,
  );

  const onTabClick = (tab: SourceTab) => {
    setActiveSource(tab);
    setError(null);
    if (tab === 'local') void loadLocal();
  };

  return (
    <div className="space-y-2 rounded-md border border-white/10 p-3">
      {label && (
        <p className="text-xs font-medium text-zinc-400">
          {label}
          <span className="ml-2 text-[10px] uppercase tracking-wider text-zinc-600">{mediaType === 'both' ? 'image / video' : mediaType}</span>
        </p>
      )}

      {/* Source selector */}
      <div className="flex flex-wrap gap-1.5">
        {sourceTabs.includes('upload') && (
          <TabButton active={activeSource === 'upload'} onClick={() => onTabClick('upload')} icon={<Upload className="h-3.5 w-3.5" />}>
            Upload File
          </TabButton>
        )}
        {sourceTabs.includes('url') && (
          <TabButton active={activeSource === 'url'} onClick={() => onTabClick('url')} icon={<Link2 className="h-3.5 w-3.5" />}>
            Use URL
          </TabButton>
        )}
        {sourceTabs.includes('local') && (
          <TabButton active={activeSource === 'local'} onClick={() => onTabClick('local')} icon={<FolderOpen className="h-3.5 w-3.5" />}>
            Existing Local
          </TabButton>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertTriangle className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      {/* Upload */}
      {activeSource === 'upload' && (
        <div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-white/20 py-6 text-zinc-400 transition-colors hover:border-gold/50">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span className="text-sm">
              {uploading ? 'Uploading…' : 'Choose file'}
            </span>
            <span className="text-xs text-zinc-600">
              {mediaType === 'image' ? 'JPG · PNG · WEBP · max 5 MB' : mediaType === 'video' ? 'MP4 · WEBM · MOV · max 50 MB' : 'Image max 5 MB · Video max 50 MB'}
            </span>
            <input ref={fileRef} type="file" accept={accept} hidden onChange={(e) => void handleFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
      )}

      {/* URL */}
      {activeSource === 'url' && (
        <div>
          <input
            className="input-dark"
            placeholder={mediaType === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/image.webp'}
            value={urlDraft}
            onChange={(e) => handleUrl(e.target.value)}
          />
        </div>
      )}

      {/* Local */}
      {activeSource === 'local' && (
        <div>
          {localLoading ? (
            <p className="text-xs text-zinc-500">Loading project media…</p>
          ) : filteredLocal.length === 0 ? (
            <p className="text-xs text-zinc-500">
              No local {mediaType === 'video' ? 'videos' : mediaType === 'image' ? 'images' : 'media'} found in public/images or public/videos.
            </p>
          ) : (
            <select
              className="input-dark"
              value={value?.sourceType === 'local' ? value.url : ''}
              onChange={(e) => {
                const option = filteredLocal.find((o) => o.path === e.target.value);
                if (!option) return;
                onChange({ mediaType: option.mediaType, sourceType: 'local', url: option.path });
              }}
            >
              <option value="">Select a file…</option>
              {filteredLocal.map((o) => (
                <option key={o.path} value={o.path}>
                  {o.path} ({formatBytes(o.size)})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Preview */}
      {previewUrl ? (
        <MediaPreview
          src={previewUrl}
          mediaType={effectiveType === 'both' ? undefined : effectiveType}
          alt="Media preview"
          aspect={aspect ?? 'aspect-video'}
        />
      ) : (
        <div className="rounded-md bg-ink-700/60 px-3 py-3 text-xs text-zinc-600">
          No media selected. Pick a file, paste a URL or choose project media.
        </div>
      )}

      {/* Media info */}
      {value && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1 capitalize">
            {effectiveType === 'video' ? <FileVideo className="h-3.5 w-3.5" /> : <FileImage className="h-3.5 w-3.5" />}
            {value.mediaType ?? effectiveType}
          </span>
          <span>Source: {SOURCE_LABELS[value.sourceType]}</span>
          {value.url && (
            <span className="max-w-[260px] truncate" title={value.url}>{value.url}</span>
          )}
        </div>
      )}

      {value && allowRemove && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-400"
        >
          <X className="h-3.5 w-3.5" /> Remove media
        </button>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-gold/60 bg-gold/10 text-gold'
          : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white',
      )}
    >
      {icon}
      {children}
    </button>
  );
}