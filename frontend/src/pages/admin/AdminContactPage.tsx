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

export default function AdminContactPage() {
  const { data: salon, isLoading } = useSalon();
  const mut = useSettingsMutations();
  const [form, setForm] = useState<Partial<SalonSettings>>({});

  useEffect(() => {
    if (salon) setForm(salon);
  }, [salon]);

  const setBI = (key: keyof SalonSettings['businessInfo'], value: unknown) =>
    setForm((f) => ({ ...f, businessInfo: { ...(f.businessInfo ?? {} as SalonSettings['businessInfo']), [key]: value } }));
  const setSection = (key: string, value: unknown) =>
    setForm((f) => ({
      ...f,
      sections: {
        ...(f.sections ?? ({} as SalonSettings['sections'])),
        contact: { ...(f.sections?.contact ?? ({} as SalonSettings['sections']['contact'])), [key]: value },
      } as SalonSettings['sections'],
    }));
  const setMaps = (key: keyof SalonSettings['maps'], value: unknown) =>
    setForm((f) => ({ ...f, maps: { ...(f.maps ?? { embedUrl: '', directionsUrl: '' }), [key]: value } }));

  const save = () => {
    if (!form) return;
    mut.save.mutate({
      businessInfo: form.businessInfo,
      sections: form.sections,
      maps: form.maps,
      _id: undefined,
    } as Partial<SalonSettings>);
  };

  if (isLoading) return <p className="py-8 text-sm text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Contact</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Salon contact details shown on the Contact page, footer, booking page and floating buttons.
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
        <AdminCard title="Contact details">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" hint="Used for call buttons, footer and booking.">
              <input className="input-dark" value={form.businessInfo?.phone ?? ''} onChange={(e) => setBI('phone', e.target.value)} />
            </Field>
            <Field label="WhatsApp number" hint="Used for the WhatsApp chat buttons.">
              <input className="input-dark" value={form.businessInfo?.whatsapp ?? ''} onChange={(e) => setBI('whatsapp', e.target.value)} />
            </Field>
            <Field label="Email" full>
              <input className="input-dark" type="email" value={form.businessInfo?.email ?? ''} onChange={(e) => setBI('email', e.target.value)} placeholder="salon@example.com" />
            </Field>
            <Field label="Address" full>
              <input className="input-dark" value={form.businessInfo?.address ?? ''} onChange={(e) => setBI('address', e.target.value)} />
            </Field>
            <Field label="Opening hours (display text)" full hint="Short summary, e.g. Mon – Sat: 9 AM – 9 PM. Detailed per-day hours are in Settings → Business hours.">
              <input className="input-dark" value={form.businessInfo?.openingHours ?? ''} onChange={(e) => setBI('openingHours', e.target.value)} />
            </Field>
            <Field label="Working days" full>
              <input className="input-dark" value={form.businessInfo?.workingDays ?? ''} onChange={(e) => setBI('workingDays', e.target.value)} placeholder="All days" />
            </Field>
            <Field label="Instagram handle" hint="e.g. sivasakthisalon">
              <input className="input-dark" value={form.businessInfo?.instagram ?? ''} onChange={(e) => setBI('instagram', e.target.value)} />
            </Field>
            <Field label="Facebook URL">
              <input className="input-dark" value={form.businessInfo?.facebook ?? ''} onChange={(e) => setBI('facebook', e.target.value)} placeholder="https://facebook.com/…" />
            </Field>
            <Field label="YouTube URL" full>
              <input className="input-dark" value={form.businessInfo?.youtube ?? ''} onChange={(e) => setBI('youtube', e.target.value)} placeholder="https://youtube.com/@…" />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Maps & directions">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Google Maps embed URL" full hint="Shown as the map iframe on the Contact page.">
              <input className="input-dark" value={form.maps?.embedUrl ?? ''} onChange={(e) => setMaps('embedUrl', e.target.value)} placeholder="https://www.google.com/maps?q=…" />
            </Field>
            <Field label="Google Maps location URL" full hint="Used for the 'Get Directions' button and map fallback.">
              <input className="input-dark" value={form.businessInfo?.googleMapsUrl ?? ''} onChange={(e) => setBI('googleMapsUrl', e.target.value)} placeholder="https://www.google.com/maps?q=…" />
            </Field>
            {form.maps?.embedUrl && (
              <div className="col-span-2">
                <iframe title="Map preview" src={form.maps.embedUrl} className="h-52 w-full rounded-md border border-white/10 grayscale-[0.4] invert-[0.92] hue-rotate-180 contrast-[0.9]" loading="lazy" />
              </div>
            )}
          </div>
        </AdminCard>

        <AdminCard title="Contact page labels" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Eyebrow"><input className="input-dark" value={form.sections?.contact?.eyebrow ?? ''} onChange={(e) => setSection('eyebrow', e.target.value)} /></Field>
            <Field label="English title"><input className="input-dark" value={form.sections?.contact?.englishTitle ?? ''} onChange={(e) => setSection('englishTitle', e.target.value)} /></Field>
            <Field label="Tamil title"><input className="input-dark" value={form.sections?.contact?.title ?? ''} onChange={(e) => setSection('title', e.target.value)} /></Field>
            <Field label="Quote (Tamil)" full><textarea className="input-dark min-h-[60px]" value={form.sections?.contact?.quote ?? ''} onChange={(e) => setSection('quote', e.target.value)} /></Field>
            <Field label="Call card title"><input className="input-dark" value={form.sections?.contact?.callTitle ?? ''} onChange={(e) => setSection('callTitle', e.target.value)} /></Field>
            <Field label="Call card Tamil"><input className="input-dark" value={form.sections?.contact?.callTamil ?? ''} onChange={(e) => setSection('callTamil', e.target.value)} /></Field>
            <Field label="WhatsApp card title"><input className="input-dark" value={form.sections?.contact?.whatsappTitle ?? ''} onChange={(e) => setSection('whatsappTitle', e.target.value)} /></Field>
            <Field label="WhatsApp card Tamil"><input className="input-dark" value={form.sections?.contact?.whatsappTamil ?? ''} onChange={(e) => setSection('whatsappTamil', e.target.value)} /></Field>
            <Field label="Instagram card title"><input className="input-dark" value={form.sections?.contact?.instagramTitle ?? ''} onChange={(e) => setSection('instagramTitle', e.target.value)} /></Field>
            <Field label="Instagram card Tamil"><input className="input-dark" value={form.sections?.contact?.instagramTamil ?? ''} onChange={(e) => setSection('instagramTamil', e.target.value)} /></Field>
            <Field label="Address card title"><input className="input-dark" value={form.sections?.contact?.addressTitle ?? ''} onChange={(e) => setSection('addressTitle', e.target.value)} /></Field>
            <Field label="Address card Tamil"><input className="input-dark" value={form.sections?.contact?.addressTamil ?? ''} onChange={(e) => setSection('addressTamil', e.target.value)} /></Field>
            <Field label="Opening hours label"><input className="input-dark" value={form.sections?.contact?.openingHoursTitle ?? ''} onChange={(e) => setSection('openingHoursTitle', e.target.value)} /></Field>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}