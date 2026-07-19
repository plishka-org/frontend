import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, FormEvent, InputHTMLAttributes, ReactNode } from "react";
import fallback1 from "../../../assets/galery-block/galery-1.webp";
import fallback2 from "../../../assets/galery-block/galery-2.webp";
import fallback3 from "../../../assets/galery-block/galery-3.webp";
import fallback4 from "../../../assets/galery-block/galery-4.webp";
import fallback5 from "../../../assets/galery-block/galery-5.webp";
import fallback6 from "../../../assets/galery-block/galery-6.webp";
import {
  createSocialLink,
  deleteAboutMedia,
  deleteSocialLink,
  getAdminAbout,
  getAdminContacts,
  getAdminSettings,
  reorderAboutMedia,
  updateAdminAbout,
  updateAdminContacts,
  updateAdminSettings,
  updateSocialLink,
  uploadAdminAboutMedia,
  type AdminAboutMedia,
  type ContactContent,
  type SocialLink,
} from "../../../services/api/adminContentApi";
import { resolveMediaUrl } from "../../../services/api/mediaApi";
import type { AboutContent } from "../../../services/api/contentApi";
import "./adminContentPage.scss";

type AboutMediaView = AdminAboutMedia & { url: string };
type ContactForm = { facebook: string; instagram: string; telegram: string; viber: string; email: string; phone: string; address: string; googleMapsUrl: string };
type PlatformKey = "facebook" | "instagram" | "telegram" | "viber";

const FALLBACK_MEDIA = [fallback1, fallback2, fallback3, fallback4, fallback5, fallback6];
const EMPTY_ABOUT: AboutContent = { mainTitle: "", mainSubtitle: "", secondaryTitle: "", secondarySubtitle: "" };
const EMPTY_CONTACTS: ContactForm = { facebook: "", instagram: "", telegram: "", viber: "", email: "", phone: "", address: "", googleMapsUrl: "" };
const PLATFORM_NAMES: Record<PlatformKey, string> = { facebook: "Facebook", instagram: "Instagram", telegram: "Telegram", viber: "Viber" };
const PLATFORM_KEYS = Object.keys(PLATFORM_NAMES) as PlatformKey[];
const DEMO_ABOUT: AboutContent = {
  mainTitle: "Plishka — це історія, що почалася з дерева",
  mainSubtitle: "Назва бренду народилася у 2022 році — прямо під час роботи над терасою. Стоячи на даху разом із командою, ми шукали слово, яке б передавало суть нашої справи: любов до дерева, майстерність і увагу до деталей.\n\nМи хотіли, щоб назва звучала легко, запам’ятовувалась і однаково гарно сприймалась українською та англійською.",
  secondaryTitle: "Plishka – Сьогодні",
  secondarySubtitle: "Сьогодні Plishka — це не просто майстерня. Це про створення виробів із характером: натуральних, довговічних і продуманих до дрібниць. Кожен наш проєкт — це баланс естетики, функціональності та ручної роботи.",
};
const DEMO_CONTACTS: ContactForm = {
  facebook: "https://www.facebook.com/profile.php?id=61554255062034",
  instagram: "",
  telegram: "",
  viber: "",
  email: "maksim1904@ukr.net",
  phone: "0673446109",
  address: "Село Город, Косівський район, Івано-Франківська обл., вул. Незалежності, 55",
  googleMapsUrl: "https://maps.app.goo.gl/dTA1WhUeKpHjWcn59",
};

function RefreshIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7" /></svg>; }
function TrashIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6" /></svg>; }
function PlusIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>; }

function localPhone(phone: string | null | undefined) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  return digits.startsWith("38") ? digits.slice(2, 12) : digits.slice(0, 10);
}

function formattedPhone(phone: string) {
  return [phone.slice(0, 3), phone.slice(3, 6), phone.slice(6, 8), phone.slice(8, 10)].filter(Boolean).join(" ");
}

function contactsFromApi(content: ContactContent, links: SocialLink[]): ContactForm {
  const getLink = (name: string) => links.find((link) => link.name.toLowerCase() === name.toLowerCase())?.url ?? "";
  return {
    facebook: getLink("Facebook"), instagram: getLink("Instagram"), telegram: getLink("Telegram"), viber: getLink("Viber"),
    email: content.email ?? "", phone: localPhone(content.phoneNumber), address: content.address ?? "", googleMapsUrl: content.googleMapsUrl ?? "",
  };
}

async function resolveAboutMedia(items: AdminAboutMedia[]) {
  return Promise.all(items.sort((a, b) => a.displayOrder - b.displayOrder).map(async (item, index) => ({
    ...item,
    url: await resolveMediaUrl(item.s3Key, FALLBACK_MEDIA[index % FALLBACK_MEDIA.length]),
  })));
}

export function AdminContentPage() {
  const demoMode = import.meta.env.DEV && import.meta.env.VITE_ADMIN_DEMO_MODE === "true";
  const [about, setAbout] = useState<AboutContent>(EMPTY_ABOUT);
  const [savedAbout, setSavedAbout] = useState<AboutContent>(EMPTY_ABOUT);
  const [media, setMedia] = useState<AboutMediaView[]>([]);
  const [contacts, setContacts] = useState<ContactForm>(EMPTY_CONTACTS);
  const [savedContacts, setSavedContacts] = useState<ContactForm>(EMPTY_CONTACTS);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [shopMode, setShopMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const dragIndex = useRef<number | null>(null);

  const aboutDirty = useMemo(() => JSON.stringify(about) !== JSON.stringify(savedAbout), [about, savedAbout]);
  const contactsDirty = useMemo(() => JSON.stringify(contacts) !== JSON.stringify(savedContacts), [contacts, savedContacts]);

  useEffect(() => {
    if (demoMode) {
      const demoMedia = FALLBACK_MEDIA.map((url, index) => ({ mediaId: index + 1, s3Key: `demo/about-${index + 1}.webp`, mediaType: "IMAGE" as const, displayOrder: index + 1, url }));
      setAbout(DEMO_ABOUT); setSavedAbout(DEMO_ABOUT); setContacts(DEMO_CONTACTS); setSavedContacts(DEMO_CONTACTS); setMedia(demoMedia); setShopMode(true); setLoading(false);
      return;
    }
    Promise.all([getAdminAbout(), getAdminContacts(), getAdminSettings()])
      .then(async ([aboutDto, contactsDto, settings]) => {
        setAbout(aboutDto.content); setSavedAbout(aboutDto.content);
        setMedia(await resolveAboutMedia(aboutDto.media));
        const nextContacts = contactsFromApi(contactsDto.content, contactsDto.socialLinks);
        setContacts(nextContacts); setSavedContacts(nextContacts); setLinks(contactsDto.socialLinks); setShopMode(settings.isShopModeEnabled);
      })
      .catch(() => setNotice({ type: "error", text: "Не вдалося завантажити налаштування контенту." }))
      .finally(() => setLoading(false));
  }, [demoMode]);

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true); setNotice(null);
    try { await action(); setNotice({ type: "success", text: success }); }
    catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "Не вдалося зберегти зміни." }); }
    finally { setBusy(false); }
  }

  async function reloadMedia() {
    if (demoMode) return;
    const response = await getAdminAbout();
    setMedia(await resolveAboutMedia(response.media));
  }

  function updateAbout(key: keyof AboutContent, value: string) { setAbout((state) => ({ ...state, [key]: value })); setNotice(null); }
  function updateContact(key: keyof ContactForm, value: string) {
    setContacts((state) => ({ ...state, [key]: key === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value }));
    setNotice(null);
  }

  async function saveAbout(event: FormEvent) {
    event.preventDefault();
    if (!aboutDirty || busy) return;
    await run(async () => {
      if (!demoMode) await updateAdminAbout(about);
      setSavedAbout(about);
    }, "Сторінку «Про нас» оновлено.");
  }

  async function syncSocialLinks() {
    const nextLinks = [...links];
    for (const key of PLATFORM_KEYS) {
      const name = PLATFORM_NAMES[key];
      const url = contacts[key].trim();
      const existing = nextLinks.find((link) => link.name.toLowerCase() === name.toLowerCase());
      if (url && existing) {
        const saved = await updateSocialLink(existing.socialLinkId, { name, url });
        nextLinks.splice(nextLinks.indexOf(existing), 1, saved);
      } else if (url) {
        nextLinks.push(await createSocialLink({ name, url }));
      } else if (existing) {
        await deleteSocialLink(existing.socialLinkId);
        nextLinks.splice(nextLinks.indexOf(existing), 1);
      }
    }
    setLinks(nextLinks);
  }

  async function saveContacts(event: FormEvent) {
    event.preventDefault();
    if (!contactsDirty || busy) return;
    await run(async () => {
      if (!demoMode) {
        await updateAdminContacts({
          phoneNumber: contacts.phone ? `+38${contacts.phone}` : null,
          email: contacts.email.trim() || null,
          address: contacts.address.trim() || null,
          googleMapsUrl: contacts.googleMapsUrl.trim() || null,
        });
        await syncSocialLinks();
      }
      setSavedContacts(contacts);
    }, "Контакти оновлено.");
  }

  async function toggleShopMode(next: boolean) {
    const previous = shopMode; setShopMode(next); setNotice(null);
    if (demoMode) return;
    try { const saved = await updateAdminSettings(next); setShopMode(saved.isShopModeEnabled); }
    catch { setShopMode(previous); setNotice({ type: "error", text: "Не вдалося змінити режим прийому замовлень." }); }
  }

  async function addMedia(files: File[]) {
    if (!files.length) return;
    await run(async () => {
      if (demoMode) {
        const added = files.map((file, index) => ({ mediaId: Date.now() + index, s3Key: file.name, mediaType: file.type.startsWith("video/") ? "VIDEO" as const : "IMAGE" as const, displayOrder: media.length + index + 1, url: URL.createObjectURL(file) }));
        setMedia((state) => [...state, ...added]);
      } else { await uploadAdminAboutMedia(files); await reloadMedia(); }
    }, "Фото додано.");
  }

  async function replaceMedia(item: AboutMediaView, file: File) {
    await run(async () => {
      if (demoMode) setMedia((state) => state.map((current) => current.mediaId === item.mediaId ? { ...current, s3Key: file.name, url: URL.createObjectURL(file) } : current));
      else { await uploadAdminAboutMedia([file]); await deleteAboutMedia(item.mediaId); await reloadMedia(); }
    }, "Фото замінено.");
  }

  async function removeMedia(item: AboutMediaView) {
    await run(async () => {
      if (!demoMode) await deleteAboutMedia(item.mediaId);
      setMedia((state) => state.filter((current) => current.mediaId !== item.mediaId));
    }, "Фото видалено.");
  }

  async function dropMedia(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    const sourceIndex = dragIndex.current; dragIndex.current = null;
    if (sourceIndex === null || sourceIndex === targetIndex) return;
    const next = [...media]; const [moved] = next.splice(sourceIndex, 1); next.splice(targetIndex, 0, moved); setMedia(next);
    if (!demoMode) {
      try { await reorderAboutMedia(next.map((item) => item.mediaId)); }
      catch { setMedia(media); setNotice({ type: "error", text: "Не вдалося змінити порядок фото." }); }
    }
  }

  if (loading) return <p className="admin-additional__loading">Завантаження…</p>;

  return (
    <section className="admin-additional">
      <h1>Додатково</h1>
      {notice && <div className={`admin-additional__notice admin-additional__notice--${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>{notice.text}</div>}

      <article className="admin-additional__card admin-additional__mode-card">
        <div className="admin-additional__mode-row">
          <label className="admin-additional__mode-label" htmlFor="shop-mode">Режим прийому замовлень</label>
          <label className="admin-additional__switch"><input id="shop-mode" type="checkbox" checked={shopMode} onChange={(event) => void toggleShopMode(event.target.checked)} /><span /></label>
        </div>
        <p>{shopMode ? "Замовлення із сайту приймаються." : "Замовлення із сайту не приймаються."}</p>
      </article>

      <form className="admin-additional__card admin-additional__about" onSubmit={(event) => void saveAbout(event)}>
        <h2>Сторінка про нас</h2>
        <ContentField label="Головний заголовок"><input value={about.mainTitle} maxLength={255} onChange={(event) => updateAbout("mainTitle", event.target.value)} /></ContentField>
        <ContentField label="Головний підзаголовок" count={`${about.mainSubtitle.length}/500`}><textarea value={about.mainSubtitle} maxLength={500} onChange={(event) => updateAbout("mainSubtitle", event.target.value)} /></ContentField>
        <ContentField label="Другорядний заголовок"><input value={about.secondaryTitle} maxLength={255} onChange={(event) => updateAbout("secondaryTitle", event.target.value)} /></ContentField>
        <ContentField label="Другорядний підзаголовок" count={`${about.secondarySubtitle.length}/500`}><textarea value={about.secondarySubtitle} maxLength={500} onChange={(event) => updateAbout("secondarySubtitle", event.target.value)} /></ContentField>

        <div className="admin-additional__media" aria-label="Фотографії сторінки про нас">
          <div className="admin-additional__media-row admin-additional__media-row--featured">
            {media.slice(0, 2).map((item, index) => <MediaCard key={item.mediaId} item={item} index={index} onDragStart={() => { dragIndex.current = index; }} onDrop={(event) => void dropMedia(event, index)} onReplace={(file) => void replaceMedia(item, file)} />)}
          </div>
          <div className="admin-additional__media-row admin-additional__media-row--secondary">
            {media.slice(2).map((item, offset) => { const index = offset + 2; return <MediaCard key={item.mediaId} item={item} index={index} onDragStart={() => { dragIndex.current = index; }} onDrop={(event) => void dropMedia(event, index)} onReplace={(file) => void replaceMedia(item, file)} onDelete={() => void removeMedia(item)} />; })}
          </div>
        </div>
        <label className="admin-additional__add-media"><input type="file" accept="image/*,video/*" multiple onChange={(event) => { void addMedia(Array.from(event.target.files ?? [])); event.target.value = ""; }} /><PlusIcon />Додати фото</label>
        <SaveButton disabled={!aboutDirty || busy} />
      </form>

      <form className="admin-additional__card admin-additional__contacts" onSubmit={(event) => void saveContacts(event)}>
        <h2>Контакти на сайті</h2>
        <p>Посилання на соцмережі</p>
        <ContactUrl label="Facebook" value={contacts.facebook} placeholder="Вставте посилання" onChange={(value) => updateContact("facebook", value)} />
        <ContactUrl label="Instagram" value={contacts.instagram} placeholder="Вставте посилання" onChange={(value) => updateContact("instagram", value)} />
        <ContactUrl label="Telegram" value={contacts.telegram} placeholder="Вставте посилання" onChange={(value) => updateContact("telegram", value)} />
        <ContactUrl label="Viber" value={contacts.viber} placeholder="Вставте посилання" onChange={(value) => updateContact("viber", value)} />
        <ContactInput label="Електронна пошта" type="email" value={contacts.email} onChange={(value) => updateContact("email", value)} />
        <ContentField label="Номер телефону"><div className="admin-additional__phone"><span>+38</span><input type="tel" inputMode="numeric" value={formattedPhone(contacts.phone)} onChange={(event) => updateContact("phone", event.target.value)} /></div></ContentField>
        <ContentField label="Адреса майстерні"><textarea className="admin-additional__short-textarea" value={contacts.address} maxLength={255} onChange={(event) => updateContact("address", event.target.value)} /></ContentField>
        <ContactUrl label="Посилання на Google мапу" value={contacts.googleMapsUrl} onChange={(value) => updateContact("googleMapsUrl", value)} />
        <SaveButton disabled={!contactsDirty || busy} />
      </form>
    </section>
  );
}

function ContentField({ label, count, children }: { label: string; count?: string; children: ReactNode }) {
  return <label className="admin-additional__field"><span>{label}</span><div className="admin-additional__control">{children}{count && <small>{count}</small>}</div></label>;
}

function ContactInput({ label, onChange, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & { label: string; onChange: (value: string) => void }) {
  return <ContentField label={label}><input {...props} onChange={(event) => onChange(event.target.value)} /></ContentField>;
}

function ContactUrl({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (value: string) => void }) {
  return <ContentField label={label}><textarea className="admin-additional__url-field" rows={value.length > 36 ? 2 : 1} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></ContentField>;
}

function SaveButton({ disabled }: { disabled: boolean }) {
  return <button className="admin-additional__save" type="submit" disabled={disabled}>Підтвердити зміни</button>;
}

function MediaCard({ item, index, onDragStart, onDrop, onReplace, onDelete }: { item: AboutMediaView; index: number; onDragStart: () => void; onDrop: (event: DragEvent) => void; onReplace: (file: File) => void; onDelete?: () => void }) {
  return (
    <div className="admin-additional__media-item" draggable onDragStart={onDragStart} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
      <div className="admin-additional__media-index"><span aria-hidden="true">⠿</span>{index + 1}</div>
      {item.mediaType === "VIDEO" ? <video src={item.url} /> : <img src={item.url} alt={`Фото ${index + 1}`} />}
      <div className="admin-additional__media-actions">
        <label className="admin-additional__icon-button" aria-label={`Замінити фото ${index + 1}`}><input type="file" accept="image/*,video/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) onReplace(file); event.target.value = ""; }} /><RefreshIcon /></label>
        {onDelete && <button className="admin-additional__icon-button admin-additional__icon-button--danger" type="button" aria-label={`Видалити фото ${index + 1}`} onClick={onDelete}><TrashIcon /></button>}
      </div>
    </div>
  );
}
