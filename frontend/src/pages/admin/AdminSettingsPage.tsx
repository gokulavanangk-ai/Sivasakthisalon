import { useEffect, useRef, useState } from 'react';
import { useSalon } from '@/hooks/useContent';
import { useSettingsMutations } from '@/features/admin/mutations';
import { AdminCard, Toggle } from '@/features/admin/ui';
import { Upload } from 'lucide-react';
import type { SalonSettings } from '@/types';

export default function AdminSettingsPage() {
  const { data: salon } = useSalon();
  const mut = useSettingsMutations();
  const pendingUploads = useRef<Set<string>>(new Set());

  const [settings, setSettings] = useState<Partial<SalonSettings>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (salon) setSettings(salon);
  }, [salon]);

  const setBI = (key: keyof SalonSettings['businessInfo'], value: unknown) =>
    setSettings((s) => ({ ...s, businessInfo: { ...(s.businessInfo ?? {} as SalonSettings['businessInfo']), [key]: value } }));
  const setField = (key: keyof SalonSettings, value: unknown) => setSettings((s) => ({ ...s, [key]: value }));
  const setToggle = (key: keyof SalonSettings['toggles'], value: boolean) =>
    setSettings((s) => ({ ...s, toggles: { ...(s.toggles ?? ({} as SalonSettings['toggles'])), [key]: value } }));
  const setFooterSection = (key: string, value: unknown) =>
    setSettings((s) => ({
      ...s,
      sections: {
        ...(s.sections ?? ({} as SalonSettings['sections'])),
        footer: { ...(s.sections?.footer ?? ({} as SalonSettings['sections']['footer'])), [key]: value },
      } as SalonSettings['sections'],
    }));

  const saveSettings = () => {
    if (salon?._id && settings) mut.save.mutate({ ...settings, _id: undefined } as Partial<SalonSettings>);
    pendingUploads.current.clear();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
          <p className="mt-1 text-sm text-zinc-500">Site-wide brand, logo, footer and global toggles.</p>
        </div>
        <button
          type="button"
          onClick={saveSettings}
          disabled={mut.save.isPending}
          className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black hover:bg-gold-300 disabled:opacity-50"
        >
          {mut.save.isPending ? 'Saving…' : 'Save all changes'}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Brand */}
        <AdminCard title="Brand identity">
          <div className="grid grid-cols-2 gap-3">
            <Field label="English name">
              <input className="input-dark" value={settings.businessInfo?.salonName ?? ''} onChange={(e) => setBI('salonName', e.target.value)} />
            </Field>
            <Field label="Tamil name">
              <input className="input-dark" value={settings.businessInfo?.tamilName ?? ''} onChange={(e) => setBI('tamilName', e.target.value)} />
            </Field>
            <Field label="Tagline (English)">
              <input className="input-dark" value={settings.businessInfo?.tagline ?? ''} onChange={(e) => setBI('tagline', e.target.value)} />
            </Field>
            <Field label="Tagline (Tamil)">
              <input className="input-dark" value={settings.businessInfo?.taglineTamil ?? ''} onChange={(e) => setBI('taglineTamil', e.target.value)} />
            </Field>
            <Field label="Experience years" hint="Shown site-wide as 'N+ years'.">
              <input type="number" className="input-dark" value={settings.businessInfo?.experienceYears ?? 0} onChange={(e) => setBI('experienceYears', Number(e.target.value))} />
            </Field>
          </div>
        </AdminCard>

        {/* Logo */}
        <AdminCard title="Logo">
          <div className="flex items-start gap-4">
            {settings.logo?.url ? (
              <img src={settings.logo.url} alt="Current logo" className="h-20 w-20 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 text-3xl text-gold">சி</div>
            )}
            <div className="flex-1 space-y-2">
              <label className="block cursor-pointer rounded-md border border-dashed border-white/20 px-4 py-3 text-center text-sm text-zinc-400 hover:border-gold/50">
                <span className="inline-flex items-center gap-2"><Upload className="h-4 w-4" /> {settings.logo?.url ? 'Replace logo' : 'Upload logo'}</span>
                <input type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setLogoFile(f);
                }} />
              </label>
              {logoFile && (
                <button type="button" onClick={() => {
                  const form = new FormData();
                  form.append('logo', logoFile);
                  mut.logo.mutate(form, { onSuccess: () => setLogoFile(null) });
                }} className="w-full rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:bg-gold-300">
                  Upload logo
                </button>
              )}
              {settings.logo?.url && (
                <button type="button" onClick={() => mut.removeLogo.mutate()} className="w-full rounded-md border border-white/15 px-4 py-2 text-sm text-zinc-400 hover:text-white">
                  Remove logo (fallback text logo used)
                </button>
              )}
            </div>
          </div>
        </AdminCard>

        {/* Footer */}
        <AdminCard title="Footer">
          <p className="mb-4 text-xs leading-relaxed text-zinc-600">
            Column headings for the site footer. Footer contact details come from the Contact tab; the footer blurb comes
            from the About page story.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Explore column heading">
              <input className="input-dark" value={settings.sections?.footer?.exploreTitle ?? ''} onChange={(e) => setFooterSection('exploreTitle', e.target.value)} />
            </Field>
            <Field label="Contact column heading">
              <input className="input-dark" value={settings.sections?.footer?.contactTitle ?? ''} onChange={(e) => setFooterSection('contactTitle', e.target.value)} />
            </Field>
          </div>
        </AdminCard>

        {/* Notifications */}
        <AdminCard title="Notifications">
          <Field label="Booking alert email" hint="Receives an email for every new booking.">
            <input className="input-dark" type="email" value={settings.notificationEmail ?? ''} onChange={(e) => setField('notificationEmail', e.target.value)} placeholder="owner@example.com" />
          </Field>
        </AdminCard>
      </div>

      {/* Global toggles */}
      <AdminCard title="Global toggles">
        <p className="mb-2 text-xs text-zinc-600">
          Site-wide switches. Page/section toggles (e.g. hero video, offers, team, reviews, pricing) live in their own
          tabs.
        </p>
        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <Toggle label="Online booking" checked={Boolean(settings.toggles?.bookingEnabled)} onChange={(v) => setToggle('bookingEnabled', v)} />
          <Toggle label="Barber selection" checked={Boolean(settings.toggles?.barberSelection)} onChange={(v) => setToggle('barberSelection', v)} />
          <Toggle label="Customer confirmation email (default OFF)" checked={Boolean(settings.toggles?.customerConfirmationEmail)} onChange={(v) => setToggle('customerConfirmationEmail', v)} />
          <Toggle label="Dark mode" checked={Boolean(settings.toggles?.darkModeEnabled)} onChange={(v) => setToggle('darkModeEnabled', v)} />
        </div>
      </AdminCard>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-zinc-600">{hint}</span>}
    </label>
  );
}