import { useEffect, useState } from 'react';
import { useSalon } from '@/hooks/useContent';
import { useSettingsMutations } from '@/features/admin/mutations';
import { AdminCard } from '@/features/admin/ui';
import { Save } from 'lucide-react';
import type { SalonSettings } from '@/types';

function Field({ label, full, hint, children }: { label: string; full?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? 'col-span-2' : ''}`}>
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-zinc-600">{hint}</span>}
    </label>
  );
}

export default function AdminAboutPage() {
  const { data: salon, isLoading } = useSalon();
  const mut = useSettingsMutations();
  const [form, setForm] = useState<Partial<SalonSettings>>({});

  useEffect(() => {
    if (salon) setForm(salon);
  }, [salon]);

  const setBI = (key: keyof SalonSettings['businessInfo'], value: unknown) =>
    setForm((f) => ({ ...f, businessInfo: { ...(f.businessInfo ?? {} as SalonSettings['businessInfo']), [key]: value } }));
  const setAbout = (key: keyof SalonSettings['about'], value: unknown) =>
    setForm((f) => ({ ...f, about: { ...(f.about ?? {} as SalonSettings['about']), [key]: value } }));
  const setSection = (key: string, value: unknown) =>
    setForm((f) => ({
      ...f,
      sections: {
        ...(f.sections ?? ({} as SalonSettings['sections'])),
        about: { ...(f.sections?.about ?? ({} as SalonSettings['sections']['about'])), [key]: value },
      } as SalonSettings['sections'],
    }));
  const setCta = (key: string, value: unknown) =>
    setForm((f) => ({
      ...f,
      sections: {
        ...(f.sections ?? ({} as SalonSettings['sections'])),
        cta: { ...(f.sections?.cta ?? ({} as SalonSettings['sections']['cta'])), [key]: value },
      } as SalonSettings['sections'],
    }));

  const save = () => {
    if (!form) return;
    mut.save.mutate({
      businessInfo: form.businessInfo,
      about: form.about,
      sections: form.sections,
      _id: undefined,
    } as Partial<SalonSettings>);
  };

  if (isLoading) return <p className="py-8 text-sm text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">About</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Business info shown across the whole site, plus the About page story, image and call-to-action.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={mut.save.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black hover:bg-gold-300 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {mut.save.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminCard title="Business information">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Salon name">
              <input className="input-dark" value={form.businessInfo?.salonName ?? ''} onChange={(e) => setBI('salonName', e.target.value)} />
            </Field>
            <Field label="Tamil name">
              <input className="input-dark" value={form.businessInfo?.tamilName ?? ''} onChange={(e) => setBI('tamilName', e.target.value)} />
            </Field>
            <Field label="Tagline (English)">
              <input className="input-dark" value={form.businessInfo?.tagline ?? ''} onChange={(e) => setBI('tagline', e.target.value)} />
            </Field>
            <Field label="Tagline (Tamil)">
              <input className="input-dark" value={form.businessInfo?.taglineTamil ?? ''} onChange={(e) => setBI('taglineTamil', e.target.value)} />
            </Field>
            <Field label="Experience (years)" hint="Shown on Home, About, Footer and CTA as 'N+ years'.">
              <input type="number" className="input-dark" value={form.businessInfo?.experienceYears ?? 0} onChange={(e) => setBI('experienceYears', Number(e.target.value))} />
            </Field>
            <Field label="Happy customers" hint="Optional stat shown on the About page.">
              <input type="number" className="input-dark" value={form.businessInfo?.happyCustomers ?? 0} onChange={(e) => setBI('happyCustomers', Number(e.target.value))} />
            </Field>
            <Field label="Professional barbers" hint="Optional stat shown on the About page.">
              <input type="number" className="input-dark" value={form.businessInfo?.professionalBarbers ?? 0} onChange={(e) => setBI('professionalBarbers', Number(e.target.value))} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="About story">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Eyebrow label" full>
              <input className="input-dark" value={form.sections?.about?.eyebrow ?? ''} onChange={(e) => setSection('eyebrow', e.target.value)} />
            </Field>
            <Field label="Heading (Tamil)" full>
              <textarea className="input-dark min-h-[70px]" value={form.about?.heading ?? ''} onChange={(e) => setAbout('heading', e.target.value)} />
            </Field>
            <Field label="Body text (Tamil)" full>
              <textarea className="input-dark min-h-[90px]" value={form.about?.body ?? ''} onChange={(e) => setAbout('body', e.target.value)} />
            </Field>
            <Field label="Story note (Tamil)" full>
              <textarea className="input-dark min-h-[70px]" value={form.sections?.about?.storyNote ?? ''} onChange={(e) => setSection('storyNote', e.target.value)} />
            </Field>
            <Field label="Image URL" full>
              <input className="input-dark" value={form.about?.imageUrl ?? ''} onChange={(e) => setAbout('imageUrl', e.target.value)} placeholder="https://…" />
            </Field>
            {form.about?.imageUrl && (
              <div className="col-span-2">
                <img src={form.about.imageUrl} alt="About preview" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} className="aspect-[4/5] w-full max-w-[220px] rounded-md object-cover" />
              </div>
            )}
            <Field label="Years badge label">
              <input className="input-dark" value={form.sections?.about?.yearsLabel ?? ''} onChange={(e) => setSection('yearsLabel', e.target.value)} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Call to action (bottom band)">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Eyebrow" full>
              <input className="input-dark" value={form.sections?.cta?.eyebrow ?? ''} onChange={(e) => setCta('eyebrow', e.target.value)} />
            </Field>
            <Field label="Title (Tamil)" full>
              <textarea className="input-dark min-h-[70px]" value={form.sections?.cta?.title ?? ''} onChange={(e) => setCta('title', e.target.value)} />
            </Field>
            <Field label="Subtitle" full>
              <input className="input-dark" value={form.sections?.cta?.subtitle ?? ''} onChange={(e) => setCta('subtitle', e.target.value)} />
            </Field>
            <Field label="Primary button label">
              <input className="input-dark" value={form.sections?.cta?.primaryCta ?? ''} onChange={(e) => setCta('primaryCta', e.target.value)} />
            </Field>
            <Field label="Secondary button label">
              <input className="input-dark" value={form.sections?.cta?.secondaryCta ?? ''} onChange={(e) => setCta('secondaryCta', e.target.value)} />
            </Field>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}