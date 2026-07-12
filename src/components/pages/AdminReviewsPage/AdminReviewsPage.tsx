import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminReview,
  deleteAdminReview,
  getAdminReviews,
  setReviewFeatured,
  updateAdminReview,
  type AdminReviewSummary,
} from "../../../services/api/adminContentApi";
import { useToast } from "../../../hooks/useToast";
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
function GripIcon() { return <span className="admin-reviews__grip" aria-hidden="true">⠿</span>; }

function CheckBox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return <label className="admin-reviews__checkbox"><input type="checkbox" checked={checked} onChange={onChange} /><i />{label && <span>{label}</span>}</label>;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return <button type="button" className="admin-reviews__toggle" data-active={checked} aria-label="Показувати на головній" aria-pressed={checked} onClick={onChange}><i /></button>;
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

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
  const featured = filtered.filter((review) => review.isFeatured).slice(0, 4);
  const regular = filtered.filter((review) => !review.isFeatured);
  const totalPages = Math.max(1, Math.ceil(regular.length / PAGE_SIZE));
  const visibleRegular = isMobile ? regular.slice(0, mobilePages * PAGE_SIZE) : regular.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); setMobilePages(1); }, [search]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  async function saveReview() {
    const authorName = form.authorName.trim();
    const content = form.content.trim();
    if (!authorName || !content) return;
    setBusy(true);
    try {
      if (isDemo) {
        if (editingId === null) setReviews((items) => [{ reviewId: Date.now(), authorName, content, createdAt: new Date().toISOString(), isFeatured: false, primaryMedia: null }, ...items]);
        else setReviews((items) => items.map((item) => item.reviewId === editingId ? { ...item, authorName, content } : item));
      } else {
        if (editingId === null) await createAdminReview({ authorName, content });
        else await updateAdminReview(editingId, { authorName, content });
        await load();
      }
      setForm(EMPTY_FORM); setEditingId(null);
      showToast(editingId === null ? "Відгук додано" : "Відгук оновлено");
    } catch { showToast("Не вдалося зберегти відгук"); }
    finally { setBusy(false); }
  }

  async function toggleFeatured(review: AdminReviewSummary) {
    if (!review.isFeatured && reviews.filter((item) => item.isFeatured).length >= 4) { showToast("На головній може бути не більше 4 відгуків"); return; }
    const next = !review.isFeatured;
    setReviews((items) => items.map((item) => item.reviewId === review.reviewId ? { ...item, isFeatured: next } : item));
    try { if (!isDemo) await setReviewFeatured(review.reviewId, next); }
    catch { await load(); showToast("Не вдалося змінити статус відгуку"); }
  }

  async function remove(ids: number[]) {
    if (!ids.length || !window.confirm(ids.length === 1 ? "Видалити цей відгук?" : `Видалити ${ids.length} відгуків?`)) return;
    try {
      if (!isDemo) await Promise.all(ids.map(deleteAdminReview));
      setReviews((items) => items.filter((item) => !ids.includes(item.reviewId)));
      setSelected((items) => items.filter((id) => !ids.includes(id)));
      showToast("Відгук видалено");
    } catch { showToast("Не вдалося видалити відгук"); }
  }

  function edit(review: AdminReviewSummary) {
    setEditingId(review.reviewId);
    setForm({ authorName: review.authorName, content: review.content });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <div className="admin-reviews__actions"><button type="button" onClick={() => edit(review)} aria-label="Редагувати"><EditIcon /></button><button type="button" className="admin-reviews__delete" onClick={() => void remove([review.reviewId])} aria-label="Видалити"><DeleteIcon /></button></div>
    </article>;
  }

  return <div className="admin-reviews">
    <h1>Відгуки</h1>
    <section className="admin-reviews__card admin-reviews__adding">
      <h2>{editingId === null ? "Додати новий відгук" : "Редагування відгуку"}</h2>
      <label><span>Ім’я клієнта</span><input maxLength={100} value={form.authorName} placeholder="Сергій" onChange={(event) => setForm({ ...form, authorName: event.target.value })} /></label>
      <label><span>Опис відгуку</span><div className="admin-reviews__textarea"><textarea maxLength={300} value={form.content} placeholder="Опис" onChange={(event) => setForm({ ...form, content: event.target.value })} /><small>{form.content.length}/300</small></div></label>
      <div className="admin-reviews__media"><span>Медіа</span><button type="button">＋&nbsp; ДОДАТИ ФОТО/ВІДЕО</button></div>
      <div className="admin-reviews__form-actions"><button className="admin-reviews__primary" type="button" disabled={busy || !form.authorName.trim() || !form.content.trim()} onClick={() => void saveReview()}>{editingId === null ? "ДОДАТИ ВІДГУК" : "ЗБЕРЕГТИ ЗМІНИ"}</button>{editingId !== null && <button type="button" className="admin-reviews__cancel" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}>СКАСУВАТИ</button>}</div>
    </section>

    <section className="admin-reviews__card admin-reviews__panel"><h2>Панель</h2><div className="admin-reviews__bulk"><label><span>Видалити</span><select defaultValue="selected"><option value="selected">Обрані відгуки</option></select><ChevronIcon /></label><button type="button" disabled={!selected.length} onClick={() => void remove(selected)}><DeleteIcon /></button></div><label className="admin-reviews__search"><span>Пошук відгуків</span><div><input value={search} placeholder="Введіть ім’я клієнта, слова з опису" onChange={(event) => setSearch(event.target.value)} /><SearchIcon /></div></label></section>

    <section className="admin-reviews__card admin-reviews__table"><h2>Відгуки на головній сторінці</h2><div className="admin-reviews__select-all"><CheckBox checked={allFeaturedSelected} onChange={() => setSelected(allFeaturedSelected ? selected.filter((id) => !featured.some((item) => item.reviewId === id)) : [...new Set([...selected, ...featured.map((item) => item.reviewId)])])} label="Вибрати всі" /></div><div className="admin-reviews__head"><span>Послідовність</span><CheckBox checked={allFeaturedSelected} onChange={() => setSelected(allFeaturedSelected ? selected.filter((id) => !featured.some((item) => item.reviewId === id)) : [...new Set([...selected, ...featured.map((item) => item.reviewId)])])} /><span>Ім’я клієнта</span><span>Опис</span><span>Медіа</span><span>На головній</span><span>Дії</span></div>{featured.map((review, index) => <ReviewRow key={review.reviewId} review={review} order={index + 1} featuredRow />)}{!featured.length && <p className="admin-reviews__empty">Немає відгуків на головній сторінці</p>}</section>

    <section className="admin-reviews__card admin-reviews__table"><h2>Усі відгуки</h2><div className="admin-reviews__select-all"><CheckBox checked={allRegularSelected} onChange={() => setSelected(allRegularSelected ? selected.filter((id) => !visibleRegular.some((item) => item.reviewId === id)) : [...new Set([...selected, ...visibleRegular.map((item) => item.reviewId)])])} label="Вибрати всі" /></div><div className="admin-reviews__head admin-reviews__head--regular"><CheckBox checked={allRegularSelected} onChange={() => setSelected(allRegularSelected ? selected.filter((id) => !visibleRegular.some((item) => item.reviewId === id)) : [...new Set([...selected, ...visibleRegular.map((item) => item.reviewId)])])} /><span>Ім’я клієнта</span><span>Опис</span><span>Медіа</span><span>На головній</span><span>Дії</span></div>{loading ? <p className="admin-reviews__empty">Завантаження…</p> : visibleRegular.map((review) => <ReviewRow key={review.reviewId} review={review} />)}
      {!isMobile && totalPages > 1 && <nav className="admin-reviews__pagination" aria-label="Пагінація"><button disabled={page === 1} onClick={() => setPage(page - 1)}>←</button>{Array.from({ length: totalPages }, (_, index) => <button key={index + 1} data-active={page === index + 1} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<button disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</button></nav>}
      {isMobile && visibleRegular.length < regular.length && <button className="admin-reviews__show-more" type="button" onClick={() => setMobilePages((value) => value + 1)}>ПОКАЗАТИ ЩЕ <ChevronIcon /></button>}
    </section>
  </div>;
}
