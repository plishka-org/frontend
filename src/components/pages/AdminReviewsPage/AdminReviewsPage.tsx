import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  createAdminReview,
  deleteAdminReview,
  deleteReviewMedia,
  getAdminReview,
  getAdminReviews,
  setReviewPrimaryMedia,
  setReviewFeatured,
  uploadAdminReviewMedia,
  updateAdminReview,
  type AdminReview,
  type AdminReviewSummary,
} from "../../../services/api/adminContentApi";
import { resolveMediaUrl } from "../../../services/api/mediaApi";
import { useToast } from "../../../hooks/useToast";
import demoReview1 from "../../../assets/block-reviews/reviews.webp";
import demoReview2 from "../../../assets/block-reviews/reviews-2.webp";
import demoReview3 from "../../../assets/block-reviews/reviews-3.webp";
import demoReview4 from "../../../assets/block-reviews/reviews-4.webp";
import "./adminReviewsPage.scss";

const PAGE_SIZE = 10;
const EMPTY_FORM = { authorName: "", content: "" };
const AUTHORS = [
  "Олексій Приймак", "Марія Сидоренко", "Марія Петрівна", "Тетяна Левченко",
  "Олег Шевченко", "Марія Коваль", "Олексій Сидоров", "Анна Григорівна",
  "Сергій Олександрович", "Ірина Бондар", "Андрій Мельник", "Катерина Савчук",
];
const CONTENT = [
  "Чудова якість і гарна ціна!", "Досить задоволена покупкою, все підійшло!",
  "Чудово виконано!", "Відмінна якість, рекомендую всім друзям!",
  "Швидка доставка, але товар потребує поліпшення", "Продукт відповідає опису, рекомендую!",
  "Дуже сподобалося!", "Вражаюче!", "Неймовірний досвід!", "Все супер, дякую майстрам!",
];
const DEMO_MEDIA = [demoReview1, demoReview2, demoReview3, demoReview4, demoReview2, demoReview3];

const DEMO_REVIEWS: AdminReviewSummary[] = Array.from({ length: 30 }, (_, index) => ({
  reviewId: index + 1,
  authorName: AUTHORS[index % AUTHORS.length],
  content: CONTENT[index % CONTENT.length],
  createdAt: new Date(2026, 5, 30 - index).toISOString(),
  isFeatured: index < 4,
  primaryMedia: index % 3 === 2 ? null : {
    reviewMediaId: index + 1,
    s3Key: `demo/review-${index + 1}.jpg`,
    mediaType: index % 4 === 0 ? "VIDEO" : "IMAGE",
  },
}));

function SearchIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="m13 13 4 4" /></svg>;
}
function EditIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 14.5-.5 3 3-.5L16 7.5 13.5 5 4 14.5Z" /><path d="m12 6.5 2.5 2.5" /></svg>;
}
function DeleteIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 3h4l1 3H7l1-3Zm-2 3 1 11h6l1-11" /></svg>;
}
function ChevronIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>;
}
function CloseIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>; }
function ReplaceIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.5 7A6 6 0 1 0 16 12" /><path d="M15.5 3v4h-4" /></svg>; }
function PlusIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>; }
function StarIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 16.52 6.7 19.31l1.01-5.9-4.29-4.18 5.93-.86L12 3Z" /></svg>; }
function GripIcon() { return <span className="admin-reviews__grip" aria-hidden="true">⠿</span>; }

function CheckBox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return <label className="admin-reviews__checkbox"><input type="checkbox" checked={checked} onChange={onChange} /><i />{label && <span>{label}</span>}</label>;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return <button type="button" className="admin-reviews__toggle" data-active={checked} aria-label="Показувати на головній" aria-pressed={checked} onClick={onChange}><i /></button>;
}

type ModalMedia = AdminReview["media"][number] & { url: string };

function ReviewEditModal({
  review,
  isDemo,
  onClose,
  onSaved,
  onRequestDelete,
}: {
  review: AdminReviewSummary;
  isDemo: boolean;
  onClose: () => void;
  onSaved: (review: AdminReviewSummary) => void;
  onRequestDelete: (id: number) => void;
}) {
  const { showToast } = useToast();
  const [authorName, setAuthorName] = useState(review.authorName);
  const [content, setContent] = useState(review.content);
  const [media, setMedia] = useState<ModalMedia[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);
  const [primary, setPrimary] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isDemo);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<number | null>(null);
  const previewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    async function loadDetail() {
      if (isDemo) {
        const demoMedia = DEMO_MEDIA.map((url, index) => ({
          reviewMediaId: review.reviewId * 10 + index + 1,
          s3Key: `demo/review-${review.reviewId}-${index + 1}.jpg`,
          mediaType: "IMAGE" as const,
          isPrimary: index === 0,
          displayOrder: index + 1,
          url,
        }));
        setMedia(demoMedia);
        setPrimary(`existing:${demoMedia[0].reviewMediaId}`);
        return;
      }
      try {
        const detail = await getAdminReview(review.reviewId);
        const resolved = await Promise.all(detail.media.map(async (item) => ({ ...item, url: await resolveMediaUrl(item.s3Key, "") })));
        if (!cancelled) {
          setAuthorName(detail.authorName);
          setContent(detail.content);
          setMedia(resolved);
          setPrimary(detail.media.find((item) => item.isPrimary) ? `existing:${detail.media.find((item) => item.isPrimary)!.reviewMediaId}` : null);
        }
      } catch { if (!cancelled) showToast("Не вдалося завантажити відгук"); }
      finally { if (!cancelled) setLoading(false); }
    }
    void loadDetail();
    return () => { cancelled = true; };
  }, [isDemo, review.reviewId, showToast]);

  useEffect(() => { previewUrlsRef.current = newPreviews; }, [newPreviews]);
  useEffect(() => () => { previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)); }, []);

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setNewFiles((items) => [...items, ...files]);
    setNewPreviews((items) => [...items, ...files.map((file) => URL.createObjectURL(file))]);
    event.target.value = "";
  }

  function removeExisting(id: number) {
    setDeletedMediaIds((items) => [...items, id]);
    setMedia((items) => items.filter((item) => item.reviewMediaId !== id));
    if (primary === `existing:${id}`) setPrimary(null);
  }

  function removeNew(index: number) {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((items) => items.filter((_, itemIndex) => itemIndex !== index));
    setNewPreviews((items) => items.filter((_, itemIndex) => itemIndex !== index));
    if (primary === `new:${index}`) setPrimary(null);
    else if (primary?.startsWith("new:") && Number(primary.slice(4)) > index) setPrimary(`new:${Number(primary.slice(4)) - 1}`);
  }

  function replaceExisting(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const targetId = replaceTargetRef.current;
    event.target.value = "";
    if (!file || targetId === null) return;
    removeExisting(targetId);
    setNewFiles((items) => [...items, file]);
    setNewPreviews((items) => [...items, URL.createObjectURL(file)]);
    replaceTargetRef.current = null;
  }

  async function save() {
    if (!authorName.trim() || !content.trim()) return;
    setSaving(true);
    try {
      if (!isDemo) {
        await updateAdminReview(review.reviewId, { authorName: authorName.trim(), content: content.trim() });
        await Promise.all(deletedMediaIds.map((id) => deleteReviewMedia(review.reviewId, id)));
        const uploadedKeys = await uploadAdminReviewMedia(review.reviewId, newFiles);
        if (primary?.startsWith("existing:")) {
          await setReviewPrimaryMedia(review.reviewId, Number(primary.slice(9)));
        } else if (primary?.startsWith("new:")) {
          const key = uploadedKeys[Number(primary.slice(4))];
          if (key) {
            const detail = await getAdminReview(review.reviewId);
            const uploaded = detail.media.find((item) => item.s3Key === key);
            if (uploaded) await setReviewPrimaryMedia(review.reviewId, uploaded.reviewMediaId);
          }
        }
      }
      const firstMedia = primary?.startsWith("existing:")
        ? media.find((item) => item.reviewMediaId === Number(primary.slice(9)))
        : null;
      onSaved({ ...review, authorName: authorName.trim(), content: content.trim(), primaryMedia: firstMedia ? { reviewMediaId: firstMedia.reviewMediaId, s3Key: firstMedia.s3Key, mediaType: firstMedia.mediaType } : review.primaryMedia });
      showToast("Відгук оновлено");
      onClose();
    } catch (error) { showToast(error instanceof Error ? error.message : "Не вдалося зберегти відгук"); }
    finally { setSaving(false); }
  }

  return <div className="review-edit" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="review-edit__dialog" role="dialog" aria-modal="true" aria-labelledby="review-edit-title">
      <button type="button" className="review-edit__close" aria-label="Закрити" onClick={onClose}><CloseIcon /></button>
      <h2 id="review-edit-title">Редагування</h2>
      {loading ? <p className="review-edit__loading">Завантаження…</p> : <>
        <label className="review-edit__field"><span>Ім’я клієнта</span><input autoFocus maxLength={100} value={authorName} onChange={(event) => setAuthorName(event.target.value)} /></label>
        <label className="review-edit__field review-edit__field--textarea"><span>Опис відгуку</span><textarea maxLength={300} value={content} placeholder="Введіть опис" onChange={(event) => setContent(event.target.value)} /><small>{content.length}/300</small></label>
        <div className="review-edit__media-grid">
          {media.map((item) => <div className="review-edit__media-item" key={item.reviewMediaId}>
            <div className="review-edit__preview">{item.mediaType === "VIDEO" ? <video src={item.url} muted /> : <img src={item.url} alt="" />}</div>
            <label className="review-edit__radio"><input type="radio" name="review-primary" checked={primary === `existing:${item.reviewMediaId}`} disabled={item.mediaType !== "IMAGE"} onChange={() => item.mediaType === "IMAGE" && setPrimary(`existing:${item.reviewMediaId}`)} /><i /><span>Встановити головним</span></label>
            <div className="review-edit__media-actions"><button type="button" aria-label="Замінити медіа" onClick={() => { replaceTargetRef.current = item.reviewMediaId; replaceInputRef.current?.click(); }}><ReplaceIcon /></button><button type="button" className="review-edit__media-delete" aria-label="Видалити медіа" onClick={() => removeExisting(item.reviewMediaId)}><DeleteIcon /></button></div>
          </div>)}
          {newPreviews.map((url, index) => <div className="review-edit__media-item" key={url}>
            <div className="review-edit__preview">{newFiles[index]?.type.startsWith("video/") ? <video src={url} muted /> : <img src={url} alt="" />}</div>
            <label className="review-edit__radio"><input type="radio" name="review-primary" checked={primary === `new:${index}`} disabled={!newFiles[index] || !newFiles[index].type.startsWith("image/")} onChange={() => newFiles[index]?.type.startsWith("image/") && setPrimary(`new:${index}`)} /><i /><span>Встановити головним</span></label>
            <div className="review-edit__media-actions"><button type="button" className="review-edit__media-delete" aria-label="Видалити медіа" onClick={() => removeNew(index)}><DeleteIcon /></button></div>
          </div>)}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={addFiles} />
        <input ref={replaceInputRef} type="file" accept="image/*,video/*" hidden onChange={replaceExisting} />
        <button type="button" className="review-edit__add" onClick={() => fileInputRef.current?.click()}><PlusIcon /> Додати фото/відео</button>
        <div className="review-edit__footer"><button type="button" className="review-edit__delete" disabled={saving} onClick={() => onRequestDelete(review.reviewId)}><DeleteIcon /> Видалити відгук</button><button type="button" className="review-edit__save" disabled={saving || !authorName.trim() || !content.trim()} onClick={() => void save()}>{saving ? "Збереження…" : "Зберегти зміни"}</button></div>
      </>}
    </section>
  </div>;
}

function DeleteReviewConfirm({ count, busy, onCancel, onConfirm }: { count: number; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  const multiple = count > 1;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onCancel(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [onCancel]);

  return <div className="review-delete-confirm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <section className="review-delete-confirm__dialog" role="alertdialog" aria-modal="true" aria-labelledby="review-delete-title" aria-describedby="review-delete-description">
      <button type="button" className="review-delete-confirm__close" aria-label="Закрити" onClick={onCancel}><CloseIcon /></button>
      <h2 id="review-delete-title">{multiple ? "Видалення відгуків" : "Видалення відгуку"}</h2>
      <div className="review-delete-confirm__message">
        <strong>{multiple ? `Чи дійсно ви бажаєте видалити ${count} відгуків?` : "Чи дійсно ви бажаєте видалити відгук?"}</strong>
        <p id="review-delete-description">{multiple ? "Якщо видалити відгуки, їх неможливо буде повернути." : "Якщо видалити відгук, його неможливо буде повернути."}</p>
      </div>
      <div className="review-delete-confirm__actions"><button type="button" className="review-delete-confirm__cancel" onClick={onCancel}>Ні, повернутися назад</button><button type="button" className="review-delete-confirm__delete" disabled={busy} onClick={onConfirm}><DeleteIcon /> {multiple ? "Так, видалити відгуки" : "Так, видалити відгук"}</button></div>
    </section>
  </div>;
}

export function AdminReviewsPage() {
  const { showToast } = useToast();
  const isDemo = import.meta.env.DEV && import.meta.env.VITE_ADMIN_DEMO_MODE === "true";
  const [reviews, setReviews] = useState<AdminReviewSummary[]>(isDemo ? DEMO_REVIEWS : []);
  const [loading, setLoading] = useState(!isDemo);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [mobilePages, setMobilePages] = useState(1);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 600px)").matches);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingReview, setEditingReview] = useState<AdminReviewSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<number[]>([]);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const addFormRef = useRef<HTMLElement>(null);

  const load = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      const first = await getAdminReviews("", 0);
      const pages = await Promise.all(Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, i) => getAdminReviews("", i + 1)));
      setReviews([first, ...pages].flatMap((result) => result.content));
    } catch { showToast("Не вдалося завантажити відгуки"); }
    finally { setLoading(false); }
  }, [isDemo, showToast]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 600px)");
    const update = () => setIsMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uk");
    return query ? reviews.filter((review) => `${review.authorName} ${review.content}`.toLocaleLowerCase("uk").includes(query)) : reviews;
  }, [reviews, search]);
  const featured = filtered.filter((review) => review.isFeatured).slice(0, 5);
  const regular = filtered.filter((review) => !review.isFeatured);
  const totalPages = Math.max(1, Math.ceil(regular.length / PAGE_SIZE));
  const visibleRegular = isMobile ? regular.slice(0, mobilePages * PAGE_SIZE) : regular.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const noReviews = !loading && reviews.length === 0;

  useEffect(() => { setPage(1); setMobilePages(1); }, [search]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  async function saveReview() {
    const authorName = form.authorName.trim();
    const content = form.content.trim();
    if (!authorName || !content) return;
    setBusy(true);
    try {
      if (isDemo) setReviews((items) => [{ reviewId: Date.now(), authorName, content, createdAt: new Date().toISOString(), isFeatured: false, primaryMedia: null }, ...items]);
      else { await createAdminReview({ authorName, content }); await load(); }
      setForm(EMPTY_FORM);
      showToast("Відгук додано");
    } catch { showToast("Не вдалося зберегти відгук"); }
    finally { setBusy(false); }
  }

  async function toggleFeatured(review: AdminReviewSummary) {
    if (!review.isFeatured && reviews.filter((item) => item.isFeatured).length >= 5) { showToast("На головній може бути не більше 5 відгуків"); return; }
    const next = !review.isFeatured;
    setReviews((items) => items.map((item) => item.reviewId === review.reviewId ? { ...item, isFeatured: next } : item));
    try { if (!isDemo) await setReviewFeatured(review.reviewId, next); }
    catch { await load(); showToast("Не вдалося змінити статус відгуку"); }
  }

  function remove(ids: number[]) {
    if (ids.length) setPendingDelete(ids);
  }

  async function confirmRemove() {
    const ids = pendingDelete;
    if (!ids.length) return;
    setDeleteBusy(true);
    try {
      if (!isDemo) await Promise.all(ids.map(deleteAdminReview));
      setReviews((items) => items.filter((item) => !ids.includes(item.reviewId)));
      setSelected((items) => items.filter((id) => !ids.includes(id)));
      setPendingDelete([]);
      showToast(ids.length === 1 ? "Відгук видалено" : "Відгуки видалено");
    } catch { showToast("Не вдалося видалити відгук"); }
    finally { setDeleteBusy(false); }
  }

  function edit(review: AdminReviewSummary) {
    setEditingReview(review);
  }
  function toggleSelected(id: number) { setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]); }
  const allFeaturedSelected = featured.length > 0 && featured.every((item) => selected.includes(item.reviewId));
  const allRegularSelected = visibleRegular.length > 0 && visibleRegular.every((item) => selected.includes(item.reviewId));

  function ReviewRow({ review, order, featuredRow = false }: { review: AdminReviewSummary; order?: number; featuredRow?: boolean }) {
    const mediaCount = review.primaryMedia ? (review.primaryMedia.mediaType === "VIDEO" ? "4 фото, 1 відео" : "3 фото, 0 відео") : "0 фото, 0 відео";
    return <article className="admin-reviews__row" data-featured={featuredRow}>
      <div className="admin-reviews__order">{featuredRow && <><GripIcon /><span>{order}</span></>}</div>
      <CheckBox checked={selected.includes(review.reviewId)} onChange={() => toggleSelected(review.reviewId)} />
      <strong>{review.authorName}</strong>
      <p>{review.content}</p>
      <span className="admin-reviews__media-count">{mediaCount}</span>
      <div className="admin-reviews__featured-control"><small>На головній</small><Toggle checked={review.isFeatured} onChange={() => void toggleFeatured(review)} /></div>
      <div className="admin-reviews__actions"><button type="button" onClick={() => edit(review)} aria-label="Редагувати"><EditIcon /></button><button type="button" className="admin-reviews__delete" onClick={() => remove([review.reviewId])} aria-label="Видалити"><DeleteIcon /></button></div>
    </article>;
  }

  return <div className="admin-reviews">
    <h1>Відгуки</h1>
    <section ref={addFormRef} className="admin-reviews__card admin-reviews__adding">
      <h2>Додати новий відгук</h2>
      <label><span>Ім’я клієнта</span><input maxLength={100} value={form.authorName} placeholder="Сергій" onChange={(event) => setForm({ ...form, authorName: event.target.value })} /></label>
      <label><span>Опис відгуку</span><div className="admin-reviews__textarea"><textarea maxLength={300} value={form.content} placeholder="Опис" onChange={(event) => setForm({ ...form, content: event.target.value })} /><small>{form.content.length}/300</small></div></label>
      <div className="admin-reviews__media"><span>Медіа</span><button type="button">＋&nbsp; ДОДАТИ ФОТО/ВІДЕО</button></div>
      <div className="admin-reviews__form-actions"><button className="admin-reviews__primary" type="button" disabled={busy || !form.authorName.trim() || !form.content.trim()} onClick={() => void saveReview()}>ДОДАТИ ВІДГУК</button></div>
    </section>

    <section className="admin-reviews__card admin-reviews__panel" data-empty={noReviews}><h2>Панель</h2><div className="admin-reviews__bulk"><label><span>Видалити</span><select defaultValue="selected"><option value="selected">Обрані відгуки</option></select><ChevronIcon /></label><button type="button" disabled={!selected.length} onClick={() => remove(selected)}><DeleteIcon /></button></div><label className="admin-reviews__search"><span>Пошук відгуків</span><div><input value={search} placeholder="Введіть ім’я клієнта, слова з опису" onChange={(event) => setSearch(event.target.value)} /><SearchIcon /></div></label></section>

    {noReviews ? <section className="admin-reviews__card admin-reviews__empty-state"><h2>Відгуки</h2><div><span className="admin-reviews__empty-star"><StarIcon /></span><p>Відгуків поки немає. Додайте перший відгук</p><button type="button" onClick={() => addFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>Додати відгук</button></div></section> : <>
      <section className="admin-reviews__card admin-reviews__table"><h2>Відгуки на головній сторінці</h2><div className="admin-reviews__select-all"><CheckBox checked={allFeaturedSelected} onChange={() => setSelected(allFeaturedSelected ? selected.filter((id) => !featured.some((item) => item.reviewId === id)) : [...new Set([...selected, ...featured.map((item) => item.reviewId)])])} label="Вибрати всі" /></div><div className="admin-reviews__head"><span>Послідовність</span><CheckBox checked={allFeaturedSelected} onChange={() => setSelected(allFeaturedSelected ? selected.filter((id) => !featured.some((item) => item.reviewId === id)) : [...new Set([...selected, ...featured.map((item) => item.reviewId)])])} /><span>Ім’я клієнта</span><span>Опис</span><span>Медіа</span><span>На головній</span><span>Дії</span></div>{featured.map((review, index) => <ReviewRow key={review.reviewId} review={review} order={index + 1} featuredRow />)}{!featured.length && <p className="admin-reviews__empty">Немає відгуків на головній сторінці</p>}</section>

      <section className="admin-reviews__card admin-reviews__table"><h2>Усі відгуки</h2><div className="admin-reviews__select-all"><CheckBox checked={allRegularSelected} onChange={() => setSelected(allRegularSelected ? selected.filter((id) => !visibleRegular.some((item) => item.reviewId === id)) : [...new Set([...selected, ...visibleRegular.map((item) => item.reviewId)])])} label="Вибрати всі" /></div><div className="admin-reviews__head admin-reviews__head--regular"><CheckBox checked={allRegularSelected} onChange={() => setSelected(allRegularSelected ? selected.filter((id) => !visibleRegular.some((item) => item.reviewId === id)) : [...new Set([...selected, ...visibleRegular.map((item) => item.reviewId)])])} /><span>Ім’я клієнта</span><span>Опис</span><span>Медіа</span><span>На головній</span><span>Дії</span></div>{loading ? <p className="admin-reviews__empty">Завантаження…</p> : visibleRegular.map((review) => <ReviewRow key={review.reviewId} review={review} />)}
        {!isMobile && totalPages > 1 && <nav className="admin-reviews__pagination" aria-label="Пагінація"><button disabled={page === 1} onClick={() => setPage(page - 1)}>←</button>{Array.from({ length: totalPages }, (_, index) => <button key={index + 1} data-active={page === index + 1} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</button></nav>}
        {isMobile && visibleRegular.length < regular.length && <button className="admin-reviews__show-more" type="button" onClick={() => setMobilePages((value) => value + 1)}>ПОКАЗАТИ ЩЕ <ChevronIcon /></button>}
      </section>
    </>}
    {editingReview && <ReviewEditModal review={editingReview} isDemo={isDemo} onClose={() => setEditingReview(null)} onSaved={(updated) => { setReviews((items) => items.map((item) => item.reviewId === updated.reviewId ? updated : item)); if (!isDemo) void load(); }} onRequestDelete={(id) => { setEditingReview(null); setPendingDelete([id]); }} />}
    {pendingDelete.length > 0 && <DeleteReviewConfirm count={pendingDelete.length} busy={deleteBusy} onCancel={() => setPendingDelete([])} onConfirm={() => void confirmRemove()} />}
  </div>;
}
