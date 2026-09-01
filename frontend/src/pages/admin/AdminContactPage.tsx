import { useCallback, useEffect, useState } from 'react';
import { useSalon, useBusinessHours } from '@/hooks/useContent';
import { useSettingsMutations } from '@/features/admin/mutations';
import { AdminCard, Toggle } from '@/features/admin/ui';
import { Save, RotateCcw, AlertTriangle } from 'lucide-react';
import LeafletMap, {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  isValidLatitude,
  isValidLongitude,
  isValidCoordinate,
} from '@/components/shared/LeafletMap';
import type { BusinessHours, DayHours, SalonSettings, WeekDay } from '@/types';

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
  const { data: hoursData } = useBusinessHours();
  const mut = useSettingsMutations();
  const [form, setForm] = useState<Partial<SalonSettings>>({});
  const [businessHours, setBusinessHours] = useState<BusinessHours>(() => ({
    workingHours: {} as Record<WeekDay, DayHours>,
    slotDurationMinutes: 30,
    blockedDates: [],
    timezone: '',
  }));

  useEffect(() => {
    if (salon) setForm(salon);
  }, [salon]);

  useEffect(() => {
    if (hoursData) {
      setBusinessHours({
        workingHours: hoursData.workingHours ?? {} as Record<WeekDay, DayHours>,
        slotDurationMinutes: hoursData.slotDurationMinutes ?? 30,
        blockedDates: hoursData.blockedDates ?? [],
        timezone: hoursData.timezone ?? '',
      });
    }
  }, [hoursData]);

  const setDay = (day: WeekDay, patch: Partial<DayHours>) => {
    setBusinessHours((h) => ({
      ...h,
      workingHours: { ...h.workingHours, [day]: { ...(h.workingHours[day] ?? defaultDay), ...patch } },
    }));
  };

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
    setForm((f) => ({
      ...f,
      maps: { ...(f.maps ?? { embedUrl: '', directionsUrl: '', latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE }), [key]: value },
    }));

  const latitude = Number(form.maps?.latitude ?? DEFAULT_LATITUDE);
  const longitude = Number(form.maps?.longitude ?? DEFAULT_LONGITUDE);
  const latValid = isValidLatitude(latitude);
  const lngValid = isValidLongitude(longitude);
  const coordinateValid = isValidCoordinate(latitude, longitude);

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setForm((f) => ({
      ...f,
      maps: {
        ...(f.maps ?? { embedUrl: '', directionsUrl: '', latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE }),
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
      },
    }));
  }, []);

  const resetMap = () => {
    setForm((f) => ({
      ...f,
      maps: {
        ...(f.maps ?? { embedUrl: '', directionsUrl: '', latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE }),
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
      },
    }));
  };

  const handleLatInput = (value: string) => {
    const v = value === '' ? '' : Number(value);
    setMaps('latitude', v === '' ? DEFAULT_LATITUDE : v);
  };

  const handleLngInput = (value: string) => {
    const v = value === '' ? '' : Number(value);
    setMaps('longitude', v === '' ? DEFAULT_LONGITUDE : v);
  };

  const save = () => {
    if (!form) return;
    if (!coordinateValid) return;
    mut.save.mutate({
      businessInfo: form.businessInfo,
      sections: form.sections,
      maps: form.maps,
      _id: undefined,
    } as Partial<SalonSettings>);
    mut.hours.mutate(businessHours);
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
          disabled={mut.save.isPending || !coordinateValid}
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

        <AdminCard title="Map & location">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Google Maps embed URL" full hint="Optional iframe URL. If set, a static map preview shows on the contact page alongside the interactive map.">
              <input className="input-dark" value={form.maps?.embedUrl ?? ''} onChange={(e) => setMaps('embedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
            </Field>
            <Field label="Directions URL" full hint="Link behind the 'Get Directions' button. Falls back to the map pin location.">
              <input className="input-dark" value={form.maps?.directionsUrl ?? ''} onChange={(e) => setMaps('directionsUrl', e.target.value)} placeholder="https://maps.google.com/?q=..." />
            </Field>
            <Field label="Latitude" hint={latValid ? undefined : 'Must be between -90 and 90'}>
              <input
                className="input-dark"
                type="number"
                step="any"
                value={Number.isFinite(latitude) ? latitude : ''}
                onChange={(e) => handleLatInput(e.target.value)}
                disabled={mut.save.isPending}
              />
            </Field>
            <Field label="Longitude" hint={lngValid ? undefined : 'Must be between -180 and 180'}>
              <input
                className="input-dark"
                type="number"
                step="any"
                value={Number.isFinite(longitude) ? longitude : ''}
                onChange={(e) => handleLngInput(e.target.value)}
                disabled={mut.save.isPending}
              />
            </Field>

            {!coordinateValid && (
              <div className="col-span-2 inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.
              </div>
            )}

            <div className="col-span-2">
              <LeafletMap
                latitude={latitude}
                longitude={longitude}
                draggable
                onLocationChange={handleLocationChange}
                className="h-[360px] w-full overflow-hidden rounded-md border border-white/10"
                popupText={form.businessInfo?.address || 'Salon location'}
              />
              <p className="mt-2 text-[11px] text-zinc-600">
                Drag the marker or click anywhere on the map to set the exact location.
              </p>
            </div>

            <div className="col-span-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={resetMap}
                disabled={mut.save.isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset to default
              </button>
            </div>
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
      </div>
    </div>
  );
}
