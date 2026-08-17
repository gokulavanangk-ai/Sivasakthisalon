import { useState } from 'react';
import { useHairstyles } from '@/hooks/useContent';
import { useHairstyleMutations } from '@/features/admin/mutations';
import { AdminCard, Toggle } from '@/features/admin/ui';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { HAIRSTYLE_CATEGORY_LABELS, FACE_SHAPES, STYLE_TYPES, HAIR_TYPES } from '@/constants';
import type { Hairstyle } from '@/types';

const emptyForm: Partial<Hairstyle> = {
  tamilName: '',
  englishName: '',
  category: 'classic',
  description: '',
  faceShapes: [],
  styleTypes: [],
  hairTypes: [],
  imageUrl: '',
  isActive: true,
  sortOrder: 0,
};

function MultiCheck<const T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T[];
  onChange: (next: T[]) => void;
}) {
  const toggle = (v: T) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => toggle(o.value)}
          className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
            value.includes(o.value)
              ? 'border-gold/60 bg-gold/10 text-gold'
              : 'border-white/10 text-zinc-400 hover:border-white/30'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminStylesPage() {
  const { data, isLoading } = useHairstyles({ includeInactive: true });
  const mut = useHairstyleMutations();
  const [form, setForm] = useState<Partial<Hairstyle> | null>(null);

  const save = () => {
    if (!form) return;
    if (form._id) mut.update.mutate({ id: form._id, data: form }, { onSuccess: () => setForm(null) });
    else mut.create.mutate(form, { onSuccess: () => setForm(null) });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Styles</h1>
          <p className="mt-1 text-sm text-zinc-500">The style lookbook shown to customers.</p>
        </div>
        <button type="button" onClick={() => setForm({ ...emptyForm })} className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:bg-gold-300">
          <Plus className="h-4 w-4" /> Add style
        </button>
      </div>

      {isLoading ? (
        <p className="py-8 text-sm text-zinc-500">Loading…</p>
      ) : (
        <AdminCard className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">Style</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Face shapes</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.map((h) => (
                  <tr key={h._id}>
                    <td className="px-4 py-3">
                      <p className="font-tamil text-base text-white">{h.tamilName}</p>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">{h.englishName}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{HAIRSTYLE_CATEGORY_LABELS[h.category]?.label ?? h.category}</td>
                    <td className="px-4 py-3 text-zinc-400">{h.faceShapes.map((f) => f).join(', ') || '—'}</td>
                    <td className="px-4 py-3">{h.isActive ? <span className="text-green-400">●</span> : <span className="text-zinc-600">●</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setForm({ ...h })} className="rounded-md p-2 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label={`Edit ${h.englishName}`}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete "${h.englishName}"?`)) mut.remove.mutate(h._id);
                          }}
                          className="rounded-md p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                          aria-label={`Delete ${h.englishName}`}
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
              <h2 className="text-lg font-semibold text-white">{form._id ? 'Edit style' : 'New style'}</h2>
              <button type="button" onClick={() => setForm(null)} className="rounded-md p-1 text-zinc-400 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tamil name">
                  <input className="input-dark" value={form.tamilName} onChange={(e) => setForm({ ...form, tamilName: e.target.value })} />
                </Field>
                <Field label="English name">
                  <input className="input-dark" value={form.englishName} onChange={(e) => setForm({ ...form, englishName: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select
                    className="input-dark"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Hairstyle['category'] })}
                  >
                    {Object.entries(HAIRSTYLE_CATEGORY_LABELS).map(([key, v]) => (
                      <option key={key} value={key}>{v.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Sort order">
                  <input
                    type="number"
                    className="input-dark"
                    value={form.sortOrder ?? 0}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea className="input-dark min-h-[70px]" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
              <Field label="Image URL">
                <input className="input-dark" value={form.imageUrl ?? ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" />
              </Field>
              <div className="space-y-3 rounded-md border border-white/10 p-3">
                <p className="text-xs font-medium text-zinc-400">Face shapes</p>
                <MultiCheck options={FACE_SHAPES} value={form.faceShapes ?? []} onChange={(faceShapes) => setForm({ ...form, faceShapes })} />
                <p className="text-xs font-medium text-zinc-400">Style types</p>
                <MultiCheck options={STYLE_TYPES} value={form.styleTypes ?? []} onChange={(styleTypes) => setForm({ ...form, styleTypes })} />
                <p className="text-xs font-medium text-zinc-400">Hair types</p>
                <MultiCheck options={HAIR_TYPES} value={form.hairTypes ?? []} onChange={(hairTypes) => setForm({ ...form, hairTypes })} />
              </div>
              <div className="rounded-md border border-white/10 p-3">
                <Toggle label="Active" checked={Boolean(form.isActive)} onChange={(v) => setForm({ ...form, isActive: v })} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="rounded-md px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button
                type="button"
                onClick={save}
                disabled={!form.tamilName || !form.englishName || !form.category}
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