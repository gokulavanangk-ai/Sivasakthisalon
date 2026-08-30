import { useState } from 'react';
import { useQuotes } from '@/hooks/useContent';
import { useQuoteMutations } from '@/features/admin/mutations';
import { AdminCard, Toggle } from '@/features/admin/ui';
import { MediaLibraryPicker, type PickedImage } from '@/features/admin/MediaLibraryPicker';
import { Pencil, Trash2, Plus, X, ImageIcon } from 'lucide-react';
import type { Quote, QuoteSource } from '@/types';

const SOURCE_OPTIONS: { value: QuoteSource; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'contact', label: 'Contact' },
];

const emptyForm = (): Partial<Quote> => ({
  text: '',
  author: null,
  role: '',
  source: 'general',
  image: null,
  sortOrder: 0,
  isActive: true,
});

export default function AdminQuotesPage() {
  const { data, isLoading } = useQuotes({ includeInactive: true });
  const mut = useQuoteMutations();
  const [form, setForm] = useState<Partial<Quote> | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const save = () => {
    if (!form) return;
    const payload = { ...form };
    if (form._id) {
      mut.update.mutate({ id: form._id, data: payload }, { onSuccess: () => setForm(null) });
    } else {
      mut.create.mutate(payload, { onSuccess: () => setForm(null) });
    }
  };

  const pickImage = (image: PickedImage) => {
    setForm((f) => (f ? { ...f, image: { url: image.url, publicId: image.publicId } } : f));
    setPickerOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Quotes</h1>
          <p className="mt-1 text-sm text-zinc-500">Reusable quotes shown across the site. One record, reused everywhere.</p>
        </div>
        <button
          type="button"
          onClick={() => setForm(emptyForm())}
          className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:bg-gold-300"
        >
          <Plus className="h-4 w-4" /> Add quote
        </button>
      </div>

      {isLoading ? (
        <p className="py-8 text-sm text-zinc-500">Loading…</p>
      ) : (
        <AdminCard className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">Quote</th>
                  <th className="px-4 py-3">Placement</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">
                      No quotes yet. Add one to get started.
                    </td>
                  </tr>
                )}
                {data?.map((q) => (
                  <tr key={q._id}>
                    <td className="px-4 py-3">
                      <p className="max-w-xl truncate text-white">{q.text}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {q.author ? `— ${q.author}` : 'No author'}
                        {q.role ? ` · ${q.role}` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 capitalize">{q.source}</td>
                    <td className="px-4 py-3 text-zinc-300">{q.sortOrder}</td>
                    <td className="px-4 py-3">
                      {q.isActive ? <span className="text-green-400">●</span> : <span className="text-zinc-600">●</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setForm({ ...q })} className="rounded-md p-2 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Edit quote">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this quote?')) mut.remove.mutate(q._id);
                          }}
                          className="rounded-md p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                          aria-label="Delete quote"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16" onClick={() => setForm(null)}>
          <div className="w-full max-w-xl rounded-md border border-white/10 bg-[#141414] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{form._id ? 'Edit quote' : 'New quote'}</h2>
              <button type="button" onClick={() => setForm(null)} className="rounded-md p-1 text-zinc-400 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4">
              <Field label="Quote text (required)">
                <textarea className="input-dark min-h-[90px]" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Author">
                  <input className="input-dark" value={form.author ?? ''} onChange={(e) => setForm({ ...form, author: e.target.value || null })} />
                </Field>
                <Field label="Role / title">
                  <input className="input-dark" value={form.role ?? ''} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Placement">
                  <select
                    className="input-dark"
                    value={form.source ?? 'general'}
                    onChange={(e) => setForm({ ...form, source: e.target.value as QuoteSource })}
                  >
                    {SOURCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value} className="bg-[#141414]">
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Sort order">
                  <input type="number" className="input-dark" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
                </Field>
              </div>
              <div className="rounded-md border border-white/10 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-cream/85">Image (optional)</span>
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> Choose / upload
                  </button>
                </div>
                {form.image?.url ? (
                  <div className="flex items-center gap-3">
                    <img src={form.image.url} alt="Quote" className="h-16 w-16 rounded-md object-cover" />
                    <button type="button" onClick={() => setForm({ ...form, image: null })} className="text-xs text-red-400 hover:text-red-300">
                      Remove image
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">No image set.</p>
                )}
              </div>
              <div className="rounded-md border border-white/10 p-3">
                <Toggle label="Active" checked={Boolean(form.isActive)} onChange={(v) => setForm({ ...form, isActive: v })} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="rounded-md px-4 py-2 text-sm text-zinc-400 hover:text-white">
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!form.text || mut.create.isPending || mut.update.isPending}
                className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black hover:bg-gold-300 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {pickerOpen && <MediaLibraryPicker onSelect={pickImage} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
