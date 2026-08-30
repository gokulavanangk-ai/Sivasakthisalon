import { useMemo, useRef, useState } from 'react';
import { useSalon } from '@/hooks/useContent';
import { useSettingsMutations, useMediaMutations } from '@/features/admin/mutations';
import { AdminCard, Toggle } from '@/features/admin/ui';
import { MediaField } from '@/components/shared/MediaField';
import { SECTIONS, type SectionMeta, type FieldDef, getPath, setPath, buildPayload, emptyOffer } from '@/features/admin/websiteContent';
import { Pencil, X, Plus, Trash2, Check } from 'lucide-react';
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

  const offers = useMemo(() => draft.offers, [draft.offers]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-10 lg:pt-16" onClick={closeModal}>
      <div
        className="w-full max-w-2xl rounded-md border border-white/10 bg-[#141414] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{section.label}</h2>
            {section.tamil && <p className="font-tamil text-sm text-gold/80">{section.tamil}</p>}
            <p className="mt-1 text-xs text-zinc-500">{section.description}</p>
          </div>
          <button type="button" onClick={closeModal} className="rounded-md p-1 text-zinc-400 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            {section.fields.map((field) =>
              field.type === 'boolean' ? (
                <div key={field.key} className="col-span-2 rounded-md border border-white/10 p-3">
                  <Toggle
                    label={field.label}
                    checked={Boolean(getPath(draft as unknown as Record<string, unknown>, field.key))}
                    onChange={(v) => setValue(field.key, v)}
                  />
                </div>
              ) : (
                <ContentField key={field.key} field={field} value={getPath(draft as unknown as Record<string, unknown>, field.key)} onChange={(v) => setValue(field.key, v)} />
              ),
            )}
          </div>

          {section.key === 'hero' && (
            <div className="col-span-2">
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
            </div>
          )}

          {section.key === 'offers' && (
            <OffersEditor
              offers={offers}
              onChange={setOffer}
              onAdd={() => setDraft((d) => ({ ...d, offers: { ...d.offers, items: [...(d.offers?.items ?? []), { ...emptyOffer(), sortOrder: (d.offers?.items?.length ?? 0) }] } }))}
              onRemove={(i) => setDraft((d) => ({ ...d, offers: { ...d.offers, items: (d.offers?.items ?? []).filter((_, idx) => idx !== i) } }))}
            />
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          {mut.save.isError && <p className="mr-auto text-sm text-red-400">{mut.save.error instanceof Error ? mut.save.error.message : 'Save failed'}</p>}
          {saved && (
            <span className="mr-auto inline-flex items-center gap-1.5 text-sm text-green-400">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
          <button type="button" onClick={closeModal} className="rounded-md px-4 py-2 text-sm text-zinc-400 hover:text-white">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={mut.save.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black hover:bg-gold-300 disabled:opacity-50"
          >
            {mut.save.isPending ? 'Saving…' : 'Save / Update'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContentField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const textValue = typeof value === 'string' ? value : '';
  const numValue = typeof value === 'number' ? value : '';
  const isUrl = field.type === 'url';

  return (
    <label className={field.full ? 'col-span-2 block' : 'block'}>
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{field.label}</span>
      {field.type === 'textarea' ? (
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
          type={isUrl ? 'url' : 'text'}
          className="input-dark"
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )}
      {field.isImage && textValue && (
        <div className="mt-2">
          <img
            src={textValue}
            alt="Preview"
            className="h-20 w-20 rounded-md border border-white/10 object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
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
}: {
  offers: SalonSettings['offers'];
  onChange: (index: number, patch: Partial<SalonSettings['offers']['items'][number]>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
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
                <input className="input-dark col-span-2" placeholder="Image URL (optional)" value={item.imageUrl} onChange={(e) => onChange(i, { imageUrl: e.target.value })} />
              </div>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt="Offer preview"
                  className="mt-2 h-16 w-16 rounded-md border border-white/10 object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
