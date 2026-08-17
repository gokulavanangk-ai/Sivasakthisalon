import { useRef, useState } from 'react';
import { useGallery } from '@/hooks/useContent';
import { useGalleryMutations } from '@/features/admin/mutations';
import { AdminCard, Toggle } from '@/features/admin/ui';
import { Trash2, Upload, X } from 'lucide-react';
import { GALLERY_CATEGORIES } from '@/constants';
import type { GalleryItem } from '@/types';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export default function AdminGalleryPage() {
  const { data, isLoading } = useGallery({ includeInactive: true });
  const mut = useGalleryMutations();
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('haircuts');
  const fileRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditing(null);
    setFile(null);
    setTitle('');
    setDescription('');
    setCategory('haircuts');
  };

  const submitUpload = () => {
    if (!file) return;
    const form = new FormData();
    form.append('image', file);
    form.append('title', title);
    form.append('description', description);
    form.append('category', category);
    if (editing) {
      form.append('isActive', String(editing.isActive));
      form.append('sortOrder', String(editing.sortOrder ?? 0));
      mut.update.mutate(
        { id: editing._id, form },
        {
          onSuccess: () => {
            setEditing(null);
            setFile(null);
          },
        },
      );
    } else {
      mut.create.mutate(form, { onSuccess: openCreate });
    }
  };

  const onFileChange = (f: File | null) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      alert('Only JPEG, PNG or WEBP images are allowed.');
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      alert('Image must be under 8 MB.');
      return;
    }
    setFile(f);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Gallery</h1>
          <p className="mt-1 text-sm text-zinc-500">Upload and organize salon photos.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            openCreate();
            if (fileRef.current) fileRef.current.click();
          }}
          className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:bg-gold-300"
        >
          <Upload className="h-4 w-4" /> Add photos
        </button>
        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
      </div>

      {mut.create.isPending && <p className="text-sm text-zinc-400">Uploading…</p>}

      {isLoading ? (
        <p className="py-8 text-sm text-zinc-500">Loading…</p>
      ) : (data?.length ?? 0) === 0 ? (
        <AdminCard>
          <p className="py-8 text-center text-sm text-zinc-500">No photos yet. Add some!</p>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data?.map((item) => (
            <div key={item._id} className="group relative overflow-hidden rounded-md border border-white/10">
              <img
                src={item.imageUrl}
                alt={item.title || item.category}
                loading="lazy"
                className={`aspect-[4/3] w-full object-cover ${item.isActive ? '' : 'opacity-40 grayscale'}`}
              />
              <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(item);
                      setFile(null);
                      setTitle(item.title ?? '');
                      setDescription(item.description ?? '');
                      setCategory(item.category);
                    }}
                    className="rounded-md bg-white/20 px-2 py-1 text-xs font-medium text-white hover:bg-white/30"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this image?')) mut.remove.mutate(item._id);
                    }}
                    className="rounded-md bg-red-500/60 p-1.5 text-white hover:bg-red-500"
                    aria-label={`Delete ${item.title || 'image'}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="truncate text-sm font-medium text-white">{item.title || item.category}</p>
                  <p className="text-xs text-zinc-400">{item.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || file) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16" onClick={() => { setEditing(null); setFile(null); }}>
          <div className="w-full max-w-lg rounded-md border border-white/10 bg-[#141414] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editing ? 'Edit image' : 'Upload photo'}</h2>
              <button type="button" onClick={() => { setEditing(null); setFile(null); }} className="rounded-md p-1 text-zinc-400 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!file && !editing && (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-white/20 py-12 text-zinc-400 hover:border-gold/50">
                <Upload className="h-6 w-6" />
                <span className="text-sm">Click to choose an image</span>
                <span className="text-xs text-zinc-600">JPEG, PNG or WEBP · max 8 MB</span>
                <input type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
              </label>
            )}

            {(file || editing) && (
              <div className="space-y-4">
                {editing ? (
                  <img src={editing.imageUrl} alt="Current" className="aspect-video w-full rounded-md object-cover" />
                ) : file ? (
                  <img src={URL.createObjectURL(file)} alt="Preview" className="aspect-video w-full rounded-md object-cover" />
                ) : null}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Replace image (optional)</label>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} className="input-dark" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Title</label>
                  <input className="input-dark" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Premium fade" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Description</label>
                  <input className="input-dark" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional note" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Category</label>
                  <select className="input-dark" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {GALLERY_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                {editing && <Toggle label="Active on site" checked={editing.isActive} onChange={(v) => setEditing({ ...editing, isActive: v })} />}
                {editing && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Sort order</label>
                    <input type="number" className="input-dark" value={editing.sortOrder ?? 0} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} />
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => { setEditing(null); setFile(null); }} className="rounded-md px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button
                type="button"
                onClick={submitUpload}
                disabled={!editing && !file}
                className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black hover:bg-gold-300 disabled:opacity-50"
              >
                {editing ? 'Save changes' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}