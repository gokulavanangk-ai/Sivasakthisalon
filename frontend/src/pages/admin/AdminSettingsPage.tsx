import { useEffect, useRef, useState } from 'react';
import { useSalon, useBusinessHours, useBarbers } from '@/hooks/useContent';
import { useSettingsMutations, useBarberMutations } from '@/features/admin/mutations';
import { AdminCard, Toggle } from '@/features/admin/ui';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Trash2, Plus, Upload, X } from 'lucide-react';
import type { SalonSettings, BusinessHours, WeekDay, DayHours, Barber } from '@/types';

const WEEK_DAYS: { key: WeekDay; label: string; tamil: string }[] = [
  { key: 'monday', label: 'Monday', tamil: 'திங்கள்' },
  { key: 'tuesday', label: 'Tuesday', tamil: 'செவ்வாய்' },
  { key: 'wednesday', label: 'Wednesday', tamil: 'புதன்' },
  { key: 'thursday', label: 'Thursday', tamil: 'வியாழன்' },
  { key: 'friday', label: 'Friday', tamil: 'வெள்ளி' },
  { key: 'saturday', label: 'Saturday', tamil: 'சனி' },
  { key: 'sunday', label: 'Sunday', tamil: 'ஞாயிறு' },
];

const defaultDay: DayHours = { open: '09:00', close: '21:00', isOpen: true, breakStart: '', breakEnd: '' };

export default function AdminSettingsPage() {
  const { data: salon } = useSalon();
  const { data: hours } = useBusinessHours();
  const { data: barbersData } = useBarbers();
  const mut = useSettingsMutations();
  const barberMut = useBarberMutations();
  const pendingUploads = useRef<Set<string>>(new Set());

  const [settings, setSettings] = useState<Partial<SalonSettings>>({});
  const [businessHours, setBusinessHours] = useState<Partial<BusinessHours>>({});
  const [barberForm, setBarberForm] = useState<Partial<Barber> | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (salon) setSettings(salon);
  }, [salon]);

  useEffect(() => {
    if (hours) setBusinessHours(hours);
  }, [hours]);

  const setField = (key: keyof SalonSettings, value: unknown) => setSettings((s) => ({ ...s, [key]: value }));
  const setToggle = (key: keyof SalonSettings['toggles'], value: boolean) =>
    setSettings((s) => ({ ...s, toggles: { ...(s.toggles ?? ({} as SalonSettings['toggles'])), [key]: value } }));

  const setDay = (key: WeekDay, patch: Partial<DayHours>) =>
    setBusinessHours((h) => {
      const workingHours: Record<WeekDay, DayHours> = {
        monday: defaultDay,
        tuesday: defaultDay,
        wednesday: defaultDay,
        thursday: defaultDay,
        friday: defaultDay,
        saturday: defaultDay,
        sunday: defaultDay,
        ...(h.workingHours ?? {}),
      };
      workingHours[key] = { ...workingHours[key], ...patch };
      return { ...h, workingHours };
    });

  const saveSettings = () => {
    if (salon?._id && settings) mut.save.mutate({ ...settings, _id: undefined } as Partial<SalonSettings>);
    if (businessHours.slotDurationMinutes) mut.hours.mutate(businessHours as Partial<BusinessHours>);
    pendingUploads.current.clear();
  };

  const saveBarber = () => {
    if (!barberForm?.name) return;
    if (barberForm._id) {
      barberMut.update.mutate({ id: barberForm._id, data: barberForm }, { onSuccess: () => setBarberForm(null) });
    } else barberMut.create.mutate(barberForm, { onSuccess: () => setBarberForm(null) });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
          <p className="mt-1 text-sm text-zinc-500">Brand, content, hours and appearance.</p>
        </div>
        <button
          type="button"
          onClick={saveSettings}
          disabled={mut.save.isPending || mut.hours.isPending}
          className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black hover:bg-gold-300 disabled:opacity-50"
        >
          {mut.save.isPending || mut.hours.isPending ? 'Saving…' : 'Save all changes'}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Brand */}
        <AdminCard title="Brand identity">
          <div className="grid grid-cols-2 gap-3">
            <Field label="English name">
              <input className="input-dark" value={settings.name ?? ''} onChange={(e) => setField('name', e.target.value)} />
            </Field>
            <Field label="Tamil name">
              <input className="input-dark" value={settings.tamilName ?? ''} onChange={(e) => setField('tamilName', e.target.value)} />
            </Field>
            <Field label="Tagline (English)">
              <input className="input-dark" value={settings.tagline ?? ''} onChange={(e) => setField('tagline', e.target.value)} />
            </Field>
            <Field label="Tagline (Tamil)">
              <input className="input-dark" value={settings.taglineTamil ?? ''} onChange={(e) => setField('taglineTamil', e.target.value)} />
            </Field>
            <Field label="Experience years">
              <input type="number" className="input-dark" value={settings.experienceYears ?? 23} onChange={(e) => setField('experienceYears', Number(e.target.value))} />
            </Field>
            <Field label="Address">
              <input className="input-dark" value={settings.address ?? ''} onChange={(e) => setField('address', e.target.value)} />
            </Field>
            <Field label="Opening hours (display text)">
              <input className="input-dark" value={settings.openingHours ?? ''} onChange={(e) => setField('openingHours', e.target.value)} placeholder="Mon – Sat: 9:00 AM – 9:00 PM" />
            </Field>
            <Field label="Footer text">
              <input className="input-dark col-span-2" value={settings.footerText ?? ''} onChange={(e) => setField('footerText', e.target.value)} />
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

        {/* Contact */}
        <AdminCard title="Contact & social">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><input className="input-dark" value={settings.social?.phone ?? ''} onChange={(e) => setSettings((s) => ({ ...s, social: { ...s.social!, phone: e.target.value } }))} /></Field>
            <Field label="WhatsApp"><input className="input-dark" value={settings.social?.whatsapp ?? ''} onChange={(e) => setSettings((s) => ({ ...s, social: { ...s.social!, whatsapp: e.target.value } }))} /></Field>
            <Field label="Instagram handle"><input className="input-dark" value={settings.social?.instagram ?? ''} onChange={(e) => setSettings((s) => ({ ...s, social: { ...s.social!, instagram: e.target.value } }))} /></Field>
            <Field label="Email"><input className="input-dark" value={settings.social?.email ?? ''} onChange={(e) => setSettings((s) => ({ ...s, social: { ...s.social!, email: e.target.value } }))} /></Field>
            <Field label="Google Maps embed URL"><input className="input-dark col-span-2" value={settings.maps?.embedUrl ?? ''} onChange={(e) => setSettings((s) => ({ ...s, maps: { ...s.maps!, embedUrl: e.target.value } }))} /></Field>
            <Field label="Directions URL"><input className="input-dark col-span-2" value={settings.maps?.directionsUrl ?? ''} onChange={(e) => setSettings((s) => ({ ...s, maps: { ...s.maps!, directionsUrl: e.target.value } }))} /></Field>
            <Field label="Notification email (booking alerts)">
              <input className="input-dark col-span-2" type="email" value={settings.notificationEmail ?? ''} onChange={(e) => setField('notificationEmail', e.target.value)} placeholder="owner@example.com" />
            </Field>
          </div>
        </AdminCard>

        {/* Hero + About */}
        <AdminCard title="Hero & about">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hero title (Tamil)">
              <textarea className="input-dark col-span-2 min-h-[60px]" value={settings.hero?.title ?? ''} onChange={(e) => setSettings((s) => ({ ...s, hero: { ...s.hero!, title: e.target.value } }))} />
            </Field>
            <Field label="Hero subtitle (eyebrow)">
              <input className="input-dark col-span-2" value={settings.hero?.subtitle ?? ''} onChange={(e) => setSettings((s) => ({ ...s, hero: { ...s.hero!, subtitle: e.target.value } }))} />
            </Field>
            <Field label="Hero tagline (Tamil)"><input className="input-dark col-span-2" value={settings.hero?.tagline ?? ''} onChange={(e) => setSettings((s) => ({ ...s, hero: { ...s.hero!, tagline: e.target.value } }))} /></Field>
            <Field label="Hero video URL"><input className="input-dark" value={settings.hero?.videoUrl ?? ''} onChange={(e) => setSettings((s) => ({ ...s, hero: { ...s.hero!, videoUrl: e.target.value } }))} /></Field>
            <div className="col-span-2">
              <ImageUpload
                label="Hero poster image"
                value={settings.hero?.posterUrl ?? ''}
                onChange={(url) => setSettings((s) => ({ ...s, hero: { ...s.hero!, posterUrl: url } }))}
                onRegisterPendingUpload={(publicId) => pendingUploads.current.add(publicId)}
                aspect="aspect-[16/9]"
              />
            </div>
            <div className="col-span-2">
              <ImageUpload
                label="Mobile fallback image"
                value={settings.hero?.mobileImageUrl ?? ''}
                onChange={(url) => setSettings((s) => ({ ...s, hero: { ...s.hero!, mobileImageUrl: url } }))}
                onRegisterPendingUpload={(publicId) => pendingUploads.current.add(publicId)}
                aspect="aspect-[4/5]"
              />
            </div>
            <Field label="About heading (Tamil)"><input className="input-dark col-span-2" value={settings.about?.heading ?? ''} onChange={(e) => setSettings((s) => ({ ...s, about: { ...s.about!, heading: e.target.value } }))} /></Field>
            <Field label="About body (Tamil)"><textarea className="input-dark col-span-2 min-h-[80px]" value={settings.about?.body ?? ''} onChange={(e) => setSettings((s) => ({ ...s, about: { ...s.about!, body: e.target.value } }))} /></Field>
            <div className="col-span-2">
              <ImageUpload
                label="About image"
                value={settings.about?.imageUrl ?? ''}
                onChange={(url) => setSettings((s) => ({ ...s, about: { ...s.about!, imageUrl: url } }))}
                onRegisterPendingUpload={(publicId) => pendingUploads.current.add(publicId)}
                aspect="aspect-[4/5]"
              />
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Toggles */}
      <AdminCard title="Feature toggles">
        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <Toggle label="Show pricing on site" checked={Boolean(settings.toggles?.pricingVisible)} onChange={(v) => setToggle('pricingVisible', v)} />
          <Toggle label="Before / After section" checked={Boolean(settings.toggles?.beforeAfterEnabled)} onChange={(v) => setToggle('beforeAfterEnabled', v)} />
          <Toggle label="Customer reviews" checked={Boolean(settings.toggles?.reviewsEnabled)} onChange={(v) => setToggle('reviewsEnabled', v)} />
          <Toggle label="FAQ section" checked={Boolean(settings.toggles?.faqEnabled)} onChange={(v) => setToggle('faqEnabled', v)} />
          <Toggle label="Hero video" checked={Boolean(settings.toggles?.heroVideoEnabled)} onChange={(v) => setToggle('heroVideoEnabled', v)} />
          <Toggle label="Online booking" checked={Boolean(settings.toggles?.bookingEnabled)} onChange={(v) => setToggle('bookingEnabled', v)} />
          <Toggle label="Barber selection" checked={Boolean(settings.toggles?.barberSelection)} onChange={(v) => setToggle('barberSelection', v)} />
          <Toggle label="Team / Barbers section" checked={Boolean(settings.toggles?.teamEnabled)} onChange={(v) => setToggle('teamEnabled', v)} />
          <Toggle label="Offers section" checked={Boolean(settings.toggles?.offersEnabled)} onChange={(v) => setToggle('offersEnabled', v)} />
          <Toggle label="Customer confirmation email (default OFF)" checked={Boolean(settings.toggles?.customerConfirmationEmail)} onChange={(v) => setToggle('customerConfirmationEmail', v)} />
        </div>
      </AdminCard>

      {/* Business hours */}
      <AdminCard title="Business hours & slots">
        <div className="mb-4 flex items-center gap-3">
          <Field label="Slot duration (minutes)">
            <input type="number" className="input-dark w-28" value={businessHours.slotDurationMinutes ?? 30} onChange={(e) => setBusinessHours((h) => ({ ...h, slotDurationMinutes: Number(e.target.value) }))} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {WEEK_DAYS.map((day) => {
            const dh = (businessHours.workingHours ?? {})[day.key] ?? defaultDay;
            return (
              <div key={day.key} className="rounded-md border border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{day.label} <span className="ml-1 text-xs text-zinc-500">{day.tamil}</span></p>
                  <Toggle label="" checked={Boolean(dh.isOpen)} onChange={(v) => setDay(day.key, { isOpen: v })} />
                </div>
                {dh.isOpen && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input type="time" className="input-dark" value={dh.open} onChange={(e) => setDay(day.key, { open: e.target.value })} />
                    <input type="time" className="input-dark" value={dh.close} onChange={(e) => setDay(day.key, { close: e.target.value })} />
                    <input type="time" className="input-dark" value={dh.breakStart || ''} onChange={(e) => setDay(day.key, { breakStart: e.target.value })} placeholder="Break start" />
                    <input type="time" className="input-dark" value={dh.breakEnd || ''} onChange={(e) => setDay(day.key, { breakEnd: e.target.value })} placeholder="Break end" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AdminCard>

      {/* Barbers */}
      <AdminCard title="Barbers (optional)">
        <div className="mb-4">
          <button type="button" onClick={() => setBarberForm({ name: '', tamilName: '', specialty: '', isActive: true, sortOrder: 0 })} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">
            <Plus className="h-4 w-4" /> Add barber
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {(barbersData?.items ?? []).map((b) => (
            <div key={b._id} className="flex items-center justify-between rounded-md border border-white/10 p-3">
              <div>
                <p className="text-sm font-medium text-white">{b.name}</p>
                <p className="text-xs text-zinc-500">{b.specialty || b.tamilName || 'General barber'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={b.isActive ? 'text-xs text-green-400' : 'text-xs text-zinc-600'}>{b.isActive ? 'Active' : 'Hidden'}</span>
                <button type="button" onClick={() => setBarberForm({ ...b })} className="rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label={`Edit ${b.name}`}>✎</button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Remove ${b.name}?`)) barberMut.remove.mutate(b._id);
                  }}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                  aria-label={`Remove ${b.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      {barberForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-16" onClick={() => setBarberForm(null)}>
          <div className="w-full max-w-sm rounded-md border border-white/10 bg-[#141414] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{barberForm._id ? 'Edit barber' : 'New barber'}</h2>
              <button type="button" onClick={() => setBarberForm(null)} className="text-zinc-400 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-3">
              <Field label="Name (required)"><input className="input-dark" value={barberForm.name} onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })} /></Field>
              <Field label="Tamil name"><input className="input-dark" value={barberForm.tamilName ?? ''} onChange={(e) => setBarberForm({ ...barberForm, tamilName: e.target.value })} /></Field>
              <Field label="Specialty"><input className="input-dark" value={barberForm.specialty ?? ''} onChange={(e) => setBarberForm({ ...barberForm, specialty: e.target.value })} placeholder="Fades, beards…" /></Field>
              <Toggle label="Active" checked={Boolean(barberForm.isActive)} onChange={(v) => setBarberForm({ ...barberForm, isActive: v })} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setBarberForm(null)} className="rounded-md px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button type="button" onClick={saveBarber} disabled={!barberForm.name} className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black hover:bg-gold-300 disabled:opacity-50">Save</button>
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