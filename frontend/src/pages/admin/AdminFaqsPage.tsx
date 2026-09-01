import { useEffect, useState } from 'react';
import { useFaqs, useSalon } from '@/hooks/useContent';
import { useFaqMutations, useSettingsMutations } from '@/features/admin/mutations';
import { AdminCard, Toggle } from '@/features/admin/ui';
import { Pencil, Trash2, Plus, X, Save } from 'lucide-react';
import type { Faq, SalonSettings } from '@/types';

const emptyForm: Partial<Faq> = {
  question: '',
  answer: '',
  sortOrder: 0,
  isActive: true,
};

export default function AdminFaqsPage() {
  const { data, isLoading } = useFaqs();
  const { data: salon } = useSalon();
  const mut = useFaqMutations();
  const settingsMut = useSettingsMutations();
  const [form, setForm] = useState<Partial<Faq> | null>(null);
  const [sections, setSections] = useState<Partial<SalonSettings['sections']>>({});
  const [faqEnabled, setFaqEnabled] = useState(false);

  useEffect(() => {
    if (salon) {
      setSections({ faq: salon.sections?.faq });
      setFaqEnabled(Boolean(salon.toggles?.faqEnabled));
    }
  }, [salon]);

  const setFaqSection = (key: string, value: unknown) =>
    setSections((s) => ({ ...s, faq: { ...(s.faq ?? {} as SalonSettings['sections']['faq']), [key]: value } }));

  const saveFaqSection = () => {
    if (!salon?._id) return;
    settingsMut.save.mutate({
      sections: { ...salon.sections, faq: sections.faq },
      toggles: { ...salon.toggles, faqEnabled },
      _id: undefined,
    } as Partial<SalonSettings>);
  };

  const save = () => {
    if (!form) return;
    const payload = { ...form };
    if (form._id) {
      mut.update.mutate({ id: form._id, data: payload }, { onSuccess: () => setForm(null) });
    } else {
      mut.create.mutate(payload, { onSuccess: () => setForm(null) });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">FAQ</h1>
          <p className="mt-1 text-sm text-zinc-500">FAQ section heading and the questions shown on the website.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveFaqSection}
            disabled={settingsMut.save.isPending}
            className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {settingsMut.save.isPending ? 'Saving…' : 'Save section settings'}
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...emptyForm })}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:bg-gold-300"
          >
            <Plus className="h-4 w-4" /> Add question
          </button>
        </div>
      </div>

      <AdminCard title="FAQ section">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Eyebrow label">
            <input className="input-dark" value={sections.faq?.eyebrow ?? ''} onChange={(e) => setFaqSection('eyebrow', e.target.value)} />
          </Field>
          <Field label="English title">
            <input className="input-dark" value={sections.faq?.englishTitle ?? ''} onChange={(e) => setFaqSection('englishTitle', e.target.value)} />
          </Field>
          <Field label="Tamil title">
            <input className="input-dark" value={sections.faq?.title ?? ''} onChange={(e) => setFaqSection('title', e.target.value)} />
          </Field>
          <div className="rounded-md border border-white/10 p-3">
            <Toggle label="Show FAQ section" checked={faqEnabled} onChange={setFaqEnabled} />
          </div>
        </div>
      </AdminCard>

      {isLoading ? (
        <p className="py-8 text-sm text-zinc-500">Loading…</p>
      ) : (
        <AdminCard className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.map((f) => (
                  <tr key={f._id}>
                    <td className="px-4 py-3">
                      <p className="text-white">{f.question}</p>
                      <p className="mt-1 max-w-xl truncate text-xs text-zinc-500">{f.answer}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{f.sortOrder}</td>
                    <td className="px-4 py-3">
                      {f.isActive ? <span className="text-green-400">●</span> : <span className="text-zinc-600">●</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setForm({ ...f })} className="rounded-md p-2 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label={`Edit ${f.question}`}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete "${f.question}"?`)) mut.remove.mutate(f._id);
                          }}
                          className="rounded-md p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                          aria-label={`Delete ${f.question}`}
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
          <div className="w-full max-w-lg rounded-md border border-white/10 bg-[#141414] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{form._id ? 'Edit question' : 'New question'}</h2>
              <button type="button" onClick={() => setForm(null)} className="rounded-md p-1 text-zinc-400 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4">
              <Field label="Question (required)">
                <input className="input-dark" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
              </Field>
              <Field label="Answer (required)">
                <textarea className="input-dark min-h-[120px]" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
              </Field>
              <Field label="Sort order">
                <input type="number" className="input-dark" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </Field>
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
                disabled={!form.question || !form.answer || mut.create.isPending || mut.update.isPending}
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