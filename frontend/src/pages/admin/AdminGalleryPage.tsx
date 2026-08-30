import { useMemo, useRef, useState } from 'react';
import { useGallery } from '@/hooks/useContent';
import { useGalleryMutations, useMediaMutations } from '@/features/admin/mutations';
import { AdminCard, Toggle } from '@/features/admin/ui';
import { MediaField } from '@/components/shared/MediaField';
import { MediaPreview, VideoBadge } from '@/components/shared/MediaPreview';
import { Trash2, Plus, X, Loader2 } from 'lucide-react';
import { GALLERY_CATEGORIES } from '@/constants';
import { mediaTypeOf, mediaUrlOf } from '@/lib/utils';
import type { GalleryItem, MediaValue } from '@/types';

interface GalleryForm {
  title: string;
  description: string;
  alt: string;
  category: GalleryItem['category'];
  sortOrder: number;
  isActive: boolean;
  media: MediaValue | null;
}

const emptyForm = (): GalleryForm => ({
  title: '',
  description: '',
  alt: '',
  category: 'salon-interior',
  sortOrder: 0,
  isActive: true,
  media: null,
});

export default function AdminGalleryPage() {
  const { data, isLoading } = useGallery({ includeInactive: true });
  const mut = useGalleryMutations();
  const { removeFile } = useMediaMutations();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GalleryForm | null>(null);
  const [saving, setSaving] = useState(false);
  const pendingUploads = useRef<Set<string>>(new Set());

  const editingItem = useMemo(
    () => (editingId ? data?.find((i) => i._id === editingId) ?? null : null),
    [data, editingId],
  );

  const openCreate = () => {
    pendingUploads.current.clear();
    setEditingId(null);
    setForm(emptyForm());
  };

  const openEdit = (item: GalleryItem) => {
    pendingUploads.current.clear();
    setEditingId(item._id);
    setForm({
      title: item.title ?? '',
      description: item.description ?? '',
      alt: item.media?.alt ?? item.title ?? '',
      category: item.category,
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive,
      media: item.media ? { ...item.media } : item.imageUrl ? { mediaType: 'image', sourceType: 'url', url: item.imageUrl, publicId: item.publicId } : null,
    });
  };

  const close = () => {
    if (pendingUploads.current.size > 0) {
      pendingUploads.current.forEach((publicId) => {
        removeFile.mutate({ publicId, mediaType: 'image' });
      });
    }
    pendingUploads.current.clear();
    setEditingId(null);
    setForm(null);
  };

  const save = () => {
    if (!form) return;
    if (!form.media?.url) return;
    setSaving(true);
    const payload: Partial<GalleryItem> = {
      title: form.title,
      description: form.description,
      category: form.category,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      media: { ...form.media, alt: form.alt || form.title },
    };
    const onDone = () => {
      pendingUploads.current.clear();
      setSaving(false);
      setEditingId(null);
      setForm(null);
    };
    if (editingItem) {
      mut.update.mutate({ id: editingItem._id, data: payload }, { onSuccess: onDone, onError: () => setSaving(false) });
    } else {
      mut.create.mutate(payload, { onSuccess: onDone, onError: () => setSaving(false) });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Gallery</h1>
          <p className="mt-1 text-sm text-zinc-500">Photos and videos from the salon — upload, link or reuse project media.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:bg-gold-300"
        >
          <Plus className="h-4 w-4" /> Add media
        </button>
      </div>

      {isLoading ? (
        <p className="py-8 text-sm text-zinc-500">Loading…</p>
      ) : (data?.length ?? 0) === 0 ? (
        <AdminCard>
          <p className="py-8 text-center text-sm text-zinc-500">No media yet. Add some!</p>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data?.map((item) => (
            <GalleryCard key={item._id} item={item} onEdit={() => openEdit(item)} onDelete={() => {
              if (window.confirm(`Delete "${item.title || 'this media'}"? This cannot be undone.`)) {
                mut.remove.mutate(item._id);
              }
            }} />
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-8 sm:pt-16" onClick={close}>
          <div className="my-4 w-full max-w-lg rounded-md border border-white/10 bg-[#141414] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editingItem ? 'Edit media' : 'Add media'}</h2>
              <button type="button" onClick={close} className="rounded-md p-1 text-zinc-400 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4">
              <MediaField
                label="Media"
                mediaType="both"
                value={form.media}
                onChange={(media) => setForm((f) => (f ? { ...f, media } : f))}
                onRegisterPendingUpload={(publicId) => pendingUploads.current.add(publicId)}
              />

              {editingItem && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-zinc-400">Current media</p>
                  <MediaPreview src={mediaUrlOf(editingItem)} mediaType={mediaTypeOf(editingItem)} alt={editingItem.title} aspect="aspect-video" controls={false} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-zinc-400">Title</span>
                  <input className="input-dark" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Premium fade" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-zinc-400">Alt text</span>
                  <input className="input-dark" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} placeholder="Accessibility description" />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-400">Description</span>
                <input className="input-dark" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional note" />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-zinc-400">Category</span>
                  <select className="input-dark" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as GalleryItem['category'] })}>
                    {GALLERY_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-zinc-400">Sort order</span>
                  <input type="number" className="input-dark" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
                </label>
              </div>

              <div className="rounded-md border border-white/10 p-3">
                <Toggle label="Visible on site" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              {mut.create.isError && <p className="mr-auto text-xs text-red-400">{(mut.create.error as Error)?.message}</p>}
              {mut.update.isError && <p className="mr-auto text-xs text-red-400">{(mut.update.error as Error)?.message}</p>}
              <button type="button" onClick={close} className="rounded-md px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button
                type="button"
                onClick={save}
                disabled={!form.media?.url || saving}
                className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black hover:bg-gold-300 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingItem ? 'Save changes' : 'Add media'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryCard({
  item,
  onEdit,
  onDelete,
}: {
  item: GalleryItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isVideo = mediaTypeOf(item) === 'video';
  return (
    <div className="group relative overflow-hidden rounded-md border border-white/10">
      <MediaPreview
        src={mediaUrlOf(item)}
        mediaType={mediaTypeOf(item)}
        alt={item.title || item.media?.alt || item.category}
        aspect="aspect-[4/3]"
        controls={false}
        rounded={false}
      />
      {isVideo && <VideoBadge />}
      <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md bg-white/20 px-2 py-1 text-xs font-medium text-white hover:bg-white/30"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md bg-red-500/60 p-1.5 text-white hover:bg-red-500"
            aria-label={`Delete ${item.title || 'media'}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div>
          <p className="truncate text-sm font-medium text-white">{item.title || item.category}</p>
          <p className="text-xs text-zinc-400">{item.category} · {item.media?.mediaType ?? 'image'}</p>
        </div>
      </div>
      {!item.isActive && (
        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
          Hidden
        </span>
      )}
    </div>
  );
}