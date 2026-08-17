import { useState } from 'react';
import { useReviews } from '@/hooks/useContent';
import { useReviewMutations } from '@/features/admin/mutations';
import { AdminCard, Toggle } from '@/features/admin/ui';
import { Pencil, Trash2, Plus, X, Star } from 'lucide-react';
import type { Review } from '@/types';

const emptyForm: Partial<Review> = { name: '', initial: '', rating: 5, text: '', service: '', isActive: true, sortOrder: 0 };

export default function AdminReviewsPage() {
  const { data, isLoading } = useReviews({ includeInactive: true });
  const mut = useReviewMutations();
  const [form, setForm] = useState<Partial<Review> | null>(null);

  const save = () => {
    if (!form) return;
    if (form._id) mut.update.mutate({ id: form._id, data: form }, { onSuccess: () => setForm(null) });
    else mut.create.mutate(form, { onSuccess: () => setForm(null) });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Reviews</h1>
          <p className="mt-1 text-sm text-zinc-500">Customer testimonials shown on the site.</p>
        </div>
        <button type="button" onClick={() => setForm({ ...emptyForm })} className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:bg-gold-300">
          <Plus className="h-4 w-4" /> Add review
        </button>
      </div>

      {isLoading ? (
        <p className="py-8 text-sm text-zinc-500">Loading…</p>
      ) : (data?.length ?? 0) === 0 ? (
        <AdminCard><p className="py-8 text-center text-sm text-zinc-500">No reviews yet.</p></AdminCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map((review) => (
            <AdminCard key={review._id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold">{review.initial || review.name.charAt(0)}</span>
                  <div>
                    <p className="font-medium text-white">{review.name}</p>
                    {review.service && <p className="text-xs text-zinc-500">{review.service}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-gold text-gold' : 'text-zinc-700'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-zinc-300">{review.text}</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <span className={review.isActive ? 'text-xs text-green-400' : 'text-xs text-zinc-600'}>{review.isActive ? 'Active on site' : 'Hidden'}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setForm({ ...review })} className="rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label={`Edit review by ${review.name}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete review by ${review.name}?`)) mut.remove.mutate(review._id);
                    }}
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`Delete review by ${review.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16" onClick={() => setForm(null)}>
          <div className="w-full max-w-md rounded-md border border-white/10 bg-[#141414] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{form._id ? 'Edit review' : 'New review'}</h2>
              <button type="button" onClick={() => setForm(null)} className="rounded-md p-1 text-zinc-400 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name (required)">
                  <input className="input-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Field>
                <Field label="Initial (M)">
                  <input className="input-dark" value={form.initial ?? ''} maxLength={2} onChange={(e) => setForm({ ...form, initial: e.target.value })} />
                </Field>
              </div>
              <Field label="Rating">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, rating: n })}
                      className={n <= (form.rating ?? 0) ? 'text-gold' : 'text-zinc-700'}
                      aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Review (Tamil ok)">
                <textarea className="input-dark min-h-[90px]" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              </Field>
              <Field label="Service (e.g. Premium Fade)">
                <input className="input-dark" value={form.service ?? ''} onChange={(e) => setForm({ ...form, service: e.target.value })} />
              </Field>
              <div className="rounded-md border border-white/10 p-3">
                <Toggle label="Show on site" checked={Boolean(form.isActive)} onChange={(v) => setForm({ ...form, isActive: v })} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="rounded-md px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button
                type="button"
                onClick={save}
                disabled={!form.name || !form.text || form.text.length < 5}
                className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black hover:bg-gold-300 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
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