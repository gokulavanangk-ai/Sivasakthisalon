import { useEffect, useMemo, useRef, useState } from 'react';
import { useSalon } from '@/hooks/useContent';
import { useSettingsMutations, useMediaMutations } from '@/features/admin/mutations';
import { AdminCard, Toggle } from '@/features/admin/ui';
import { MediaField } from '@/components/shared/MediaField';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { SECTIONS, type SectionMeta, type FieldDef, getPath, setPath, buildPayload, emptyOffer } from '@/features/admin/websiteContent';
import { Pencil, X, Plus, Trash2, Check, AlertTriangle, Loader2 } from 'lucide-react';
import type { MediaValue, SalonSettings } from '@/types';

export default function AdminWebsitePage() {
  const { data: salon, isLoading } = useSalon();
  const [editing, setEditing] = useState<SectionMeta | null>(null);

  if (isLoading) return <p className="py-8 text-sm text-zinc-500">Loading website content…</p>;
  if (!salon) return <p className="py-8 text-sm text-zinc-500">Salon settings unavailable.</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Website Content</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Edit every section of the public site. Changes appear immediately.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <AdminCard key={section.key} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-sans text-sm font-semibold text-white">{section.label}</p>
              {section.tamil && <p className="font-tamil text-sm text-gold/80">{section.tamil}</p>}
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">{section.description}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(section)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-gold hover:text-black"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </AdminCard>
        ))}
      </div>

      {editing && (
        <SectionEditorModal
          section={editing}
          salon={salon}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

// ---------- Editor ----------

// Labels for the top-level data segments a field can belong to, used to group
// the flat field list into clear, spaced sub-sections inside each editor modal.
const SEGMENT_LABELS: Record<string, string> = {
  hero: 'Hero content',
  about: 'About content',
  sections: 'Section content',
  toggles: 'Toggles',
  address: 'Contact details',
  social: 'Social links',
  maps: 'Maps',
  tagline: 'Tagline',
  taglineTamil: 'Tagline',
  footerText: 'Footer text',
  offers: 'Offers',
};

interface FieldGroup {
  id: string;
  label: string;
  fields: FieldDef[];
}

function groupFields(fields: FieldDef[]): FieldGroup[] {
  const order: string[] = [];
  const bySegment = new Map<string, FieldGroup>();
  for (const field of fields) {
    const segment = field.key.split('.')[0];
    let group = bySegment.get(segment);
    if (!group) {
      group = { id: segment, label: SEGMENT_LABELS[segment] ?? 'Details', fields: [] };
      bySegment.set(segment, group);
      order.push(segment);
    }
    group.fields.push(field);
  }
  return order.map((segment) => bySegment.get(segment)!);
}

function GroupHeader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h3 className="shrink-0 font-sans text-[11px] font-semibold uppercase tracking-widest text-gold">{label}</h3>
      {hint && <span className="hidden truncate text-[11px] text-zinc-600 sm:block">{hint}</span>}
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function SectionEditorModal({
  section,
  salon,
  onClose,
}: {
  section: SectionMeta;
  salon: SalonSettings;
  onClose: () => void;
}) {
  const mut = useSettingsMutations();
  const { removeFile } = useMediaMutations();
  const [draft, setDraft] = useState<SalonSettings>(() => ({ ...salon }));
  const [saved, setSaved] = useState(false);
  const pendingUploads = useRef<Set<string>>(new Set());

  // Lock the page behind the modal so only the modal body scrolls.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const offers = useMemo(() => draft.offers, [draft.offers]);
  const groups = useMemo(() => groupFields(section.fields), [section.fields]);

  const rawHeroMedia = draft.hero?.media;
  const heroMediaValue: MediaValue | undefined =
    rawHeroMedia && rawHeroMedia.mediaType !== 'none' && rawHeroMedia.url
      ? ({ ...rawHeroMedia, mediaType: rawHeroMedia.mediaType as 'image' | 'video' } satisfies MediaValue)
      : draft.hero?.videoUrl
        ? {
            mediaType: 'video',
            sourceType: 'url',
            url: draft.hero.videoUrl,
            publicId: '',
          } satisfies MediaValue
        : undefined;

  const setValue = (key: string, value: unknown) => setDraft((d) => setPath(d, key, value));

  const setOffer = (index: number, patch: Partial<typeof offers.items[number]>) => {
    setDraft((d) => {
      const items = (d.offers?.items ?? []).map((o, i) => (i === index ? { ...o, ...patch } : o));
      return { ...d, offers: { ...d.offers, items } };
    });
  };

  const closeModal = () => {
    if (pendingUploads.current.size > 0) {
      pendingUploads.current.forEach((publicId) => removeFile.mutate({ publicId, mediaType: 'image' }));
    }
    pendingUploads.current.clear();
    onClose();
  };

  const save = () => {
    const payload = buildPayload(draft, section);
    mut.save.mutate(payload, {
      onSuccess: () => {
        pendingUploads.current.clear();
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          onClose();
        }, 800);
      },
    });
  };

  const draftRecord = draft as unknown as Record<string, unknown>;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70" onClick={closeModal}>
      <div className="flex h-full w-full items-start justify-center sm:items-center sm:p-5">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Edit ${section.label}`}
          onClick={(e) => e.stopPropagation()}
          className="flex h-full w-full max-w-3xl flex-col bg-[#141414] sm:h-[calc(100vh-2.5rem)] sm:rounded-md sm:border sm:border-white/10"
        >
          {/* Fixed header */}
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2.5">
                <h2 className="truncate font-sans text-base font-semibold text-white sm:text-lg">{section.label}</h2>
                {section.tamil && <p className="shrink-0 font-tamil text-sm text-gold/80">{section.tamil}</p>}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{section.description}</p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="shrink-0 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            {groups.map((group) => (
              <section key={group.id} className="mb-7 last:mb-2">
                <GroupHeader label={group.label} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group.fields.map((field) =>
                    field.type === 'boolean' ? (
                      <div key={field.key} className="rounded-md border border-white/10 p-3 sm:col-span-2">
                        <Toggle
                          label={field.label}
                          checked={Boolean(getPath(draftRecord, field.key))}
                          onChange={(v) => setValue(field.key, v)}
                        />
                      </div>
                    ) : (
                      <ContentField key={field.key} field={field} value={getPath(draftRecord, field.key)} onChange={(v) => setValue(field.key, v)} onRegisterPendingUpload={(publicId) => pendingUploads.current.add(publicId)} />
                    ),
                  )}
                </div>
              </section>
            ))}

            {section.key === 'hero' && (
              <section className="mb-7">
                <GroupHeader label="Hero media" hint="Background image or video for the hero" />
                <MediaField
                  label="Hero media (background)"
                  mediaType="both"
                  value={heroMediaValue}
                  onChange={(media) => {
                    if (media) {
                      setDraft((d) => ({
                        ...d,
                        hero: {
                          ...d.hero,
                          media: {
                            mediaType: media.mediaType as 'image' | 'video',
                            sourceType: media.sourceType,
                            url: media.url,
                            posterUrl: d.hero?.media?.posterUrl ?? '',
                            publicId: media.publicId ?? '',
                            autoplay: true,
                            muted: true,
                            loop: true,
                            playsInline: true,
                          },
                        },
                      }));
                    }
                  }}
                  onRegisterPendingUpload={(publicId) => pendingUploads.current.add(publicId)}
                />
                <div className="mt-4 rounded-md border border-white/10 p-3">
                  <ImageUpload
                    label="Mobile hero image (shown on phones instead of the video)"
                    value={getPath(draftRecord, 'hero.mobileImageUrl') as string | undefined}
                    onChange={(url) => setValue('hero.mobileImageUrl', url)}
                    onRegisterPendingUpload={(publicId) => pendingUploads.current.add(publicId)}
                    aspect="aspect-[4/5]"
                  />
                </div>
              </section>
            )}

            {section.key === 'offers' && (
              <section className="mb-7">
                <GroupHeader label="Offer items" hint="Add, edit or remove promotions shown on the site" />
                <OffersEditor
                  offers={offers}
                  onChange={setOffer}
                  onAdd={() => setDraft((d) => ({ ...d, offers: { ...d.offers, items: [...(d.offers?.items ?? []), { ...emptyOffer(), sortOrder: (d.offers?.items?.length ?? 0) }] } }))}
                  onRemove={(i) => setDraft((d) => ({ ...d, offers: { ...d.offers, items: (d.offers?.items ?? []).filter((_, idx) => idx !== i) } }))}
                  onRegisterPendingUpload={(publicId) => pendingUploads.current.add(publicId)}
                />
              </section>
            )}
          </div>

          {/* Fixed footer */}
          <div className="flex shrink-0 items-center gap-2 border-t border-white/10 px-5 py-4 sm:px-6">
            <div className="mr-auto min-w-0">
              {mut.save.isError ? (
                <p className="inline-flex max-w-[220px] items-start gap-1.5 leading-snug text-xs text-red-400 sm:max-w-none">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{mut.save.error instanceof Error ? mut.save.error.message : 'Save failed'}</span>
                </p>
              ) : saved ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-400">
                  <Check className="h-4 w-4" /> Saved
                </span>
              ) : (
                <span className="hidden text-[11px] text-zinc-600 sm:block">Changes apply when you save.</span>
              )}
            </div>
            <button type="button" onClick={closeModal} className="shrink-0 rounded-md px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/10 hover:text-white">
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={mut.save.isPending}
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mut.save.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentField({
  field,
  value,
  onChange,
  onRegisterPendingUpload,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  onRegisterPendingUpload?: (publicId: string) => void;
}) {
  const textValue = typeof value === 'string' ? value : '';
  const numValue = typeof value === 'number' ? value : '';

  return (
    <label className={field.full ? 'sm:col-span-2 block' : 'block'}>
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{field.label}</span>
      {field.isImage ? (
        <ImageUpload
          value={textValue}
          onChange={onChange}
          onRegisterPendingUpload={onRegisterPendingUpload}
          aspect="aspect-[4/5]"
        />
      ) : field.type === 'textarea' ? (
        <textarea
          className="input-dark min-h-[80px]"
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      ) : field.type === 'number' ? (
        <input
          type="number"
          className="input-dark"
          value={numValue}
          min={field.min}
          onChange={(e) => onChange(e.target.value === '' ? (field.min ?? 0) : Number(e.target.value))}
        />
      ) : (
        <input
          type="text"
          className="input-dark"
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )}
      {field.note && <span className="mt-1 block text-[11px] text-zinc-600">{field.note}</span>}
    </label>
  );
}

function OffersEditor({
  offers,
  onChange,
  onAdd,
  onRemove,
  onRegisterPendingUpload,
}: {
  offers: SalonSettings['offers'];
  onChange: (index: number, patch: Partial<SalonSettings['offers']['items'][number]>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onRegisterPendingUpload?: (publicId: string) => void;
}) {
  return (
    <div className="col-span-2 rounded-md border border-white/10 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Offer items</p>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
        >
          <Plus className="h-3.5 w-3.5" /> Add offer
        </button>
      </div>

      {(offers?.items ?? []).length === 0 ? (
        <p className="text-xs text-zinc-500">No offers yet. Add one to show promotions on the site.</p>
      ) : (
        <div className="space-y-3">
          {(offers?.items ?? []).map((item, i) => (
            <div key={i} className="rounded-md border border-white/10 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Offer {i + 1}</p>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(e) => onChange(i, { isActive: e.target.checked })}
                      className="accent-[#c8a96b]"
                    />
                    Active
                  </label>
                  <button type="button" onClick={() => onRemove(i)} className="rounded p-1 text-zinc-500 hover:text-red-400" aria-label={`Remove offer ${i + 1}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="input-dark" placeholder="Title (e.g. Student combo)" value={item.title} onChange={(e) => onChange(i, { title: e.target.value })} />
                <input className="input-dark" placeholder="Badge (e.g. 20% OFF)" value={item.badge} onChange={(e) => onChange(i, { badge: e.target.value })} />
                <input className="input-dark col-span-2" placeholder="Description" value={item.description} onChange={(e) => onChange(i, { description: e.target.value })} />
                <input type="number" className="input-dark" placeholder="Price (₹)" value={item.price ?? ''} onChange={(e) => onChange(i, { price: e.target.value === '' ? null : Number(e.target.value) })} />
                <input type="number" className="input-dark" placeholder="Original price (₹)" value={item.originalPrice ?? ''} onChange={(e) => onChange(i, { originalPrice: e.target.value === '' ? null : Number(e.target.value) })} />
              </div>
              <div className="mt-2 col-span-2">
                <ImageUpload
                  label="Image (optional)"
                  value={item.imageUrl}
                  onChange={(url) => onChange(i, { imageUrl: url })}
                  onRegisterPendingUpload={onRegisterPendingUpload}
                  aspect="aspect-[4/3]"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
