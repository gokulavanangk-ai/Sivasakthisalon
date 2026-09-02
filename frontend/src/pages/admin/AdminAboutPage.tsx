import { useEffect, useState } from 'react';
import { useSalon } from '@/hooks/useContent';
import { useSettingsMutations } from '@/features/admin/mutations';
import { AdminCard } from '@/features/admin/ui';
import { ImageUpload } from '@/components/shared/ImageUpload';
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

  const save = () => {
    if (!form) return;
    mut.save.mutate({
      about: form.about,
      businessInfo: form.businessInfo,
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
            Content for the dedicated About page (/about). Home page story section is edited in the Home tab.
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
        <AdminCard title="About page content">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Heading (Tamil)" full>
              <textarea className="input-dark min-h-[70px]" value={form.about?.heading ?? ''} onChange={(e) => setAbout('heading', e.target.value)} />
            </Field>
            <Field label="Body text (Tamil)" full>
              <textarea className="input-dark min-h-[90px]" value={form.about?.body ?? ''} onChange={(e) => setAbout('body', e.target.value)} />
            </Field>
            <div className="col-span-2">
              <ImageUpload
                label="Image (upload from device)"
                value={form.about?.imageUrl ?? ''}
                onChange={(url) => setAbout('imageUrl', url)}
                aspect="aspect-[4/5]"
              />
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-600">
            This content appears on the dedicated About page (/about). Home page story section copy
            (eyebrow, story note, years label) is managed from the Home tab.
          </p>
        </AdminCard>

        <AdminCard title="About statistics" className="h-fit">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Happy customers" hint="Optional stat card on the About page.">
              <input type="number" className="input-dark" value={form.businessInfo?.happyCustomers ?? 0} onChange={(e) => setBI('happyCustomers', Number(e.target.value))} />
            </Field>
            <Field label="Professional barbers" hint="Optional stat card on the About page.">
              <input type="number" className="input-dark" value={form.businessInfo?.professionalBarbers ?? 0} onChange={(e) => setBI('professionalBarbers', Number(e.target.value))} />
            </Field>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-600">
            These appear as 'N+ Happy customers' and 'N+ Professional barbers' on the About page. Services, signature
            styles and gallery counts are calculated automatically.
          </p>
        </AdminCard>
      </div>
    </div>
  );
}