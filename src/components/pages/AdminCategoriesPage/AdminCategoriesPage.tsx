import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { bulkDeleteAdminProductsApi, bulkUpdateAdminCategoriesApi, bulkUpdateAdminPricesApi } from "../../../services/api/adminProductsApi";
import {
  createAdminCategoryApi,
  deleteAdminCategoryApi,
  fetchAdminCategoryListApi,
  reorderAdminCategoriesApi,
  updateAdminCategoryApi,
  type AdminCategory,
} from "../../../services/api/adminCategoriesApi";
import { useToast } from "../../../hooks/useToast";
import "./adminCategoriesPage.scss";

const PAGE_SIZE = 10;
const DEMO_CATEGORY_NAMES = [
  "Альтанки", "Гойдалки", "Будиночки", "Меблі", "Декор",
  "Ворота, паркани", "Вуличні стільці", "Вироби для садочків",
  "Вироби під замовлення", "Дитячі майданчики", "Двері", "Качелі",
  "Ліжка", "Навіси", "Перголи/поки", "Полиці для писанок",
  "Полиці для спецій", "Перегородки/решітки", "Пісочниці", "Речі декору",
  "Сувенірна продукція", "Столики та лавочки", "Скрині", "Стійки для одягу",
  "Шезлонги", "Ящики", "Садові лавки", "Стелажі", "Квітники", "Арки",
];

const DEMO_CATEGORIES: AdminCategory[] = DEMO_CATEGORY_NAMES.map((name, index) => ({
  id: index + 1,
  name,
  productCount: 15 - (index % 4),
  displayOrder: index + 1,
}));

function ChevronIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>;
}

function SearchIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="m13 13 4 4" /></svg>;
}

function EditIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 14.5-.5 3 3-.5L16 7.5 13.5 5 4 14.5Z" /><path d="m12 6.5 2.5 2.5" /></svg>;
}

function DeleteIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 3h4l1 3H7l1-3Zm-2 3 1 11h6l1-11" /></svg>;
}

function GripIcon() {
  return <span className="admin-categories__grip" aria-hidden="true">⠿</span>;
}

function EmptyCategoriesIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>;
}

type ConfirmState = { ids: number[]; title: string } | null;
type DeleteConflictState = { ids: number[]; productCount: number } | null;

export function AdminCategoriesPage() {
  const { showToast } = useToast();
  const isDemo = import.meta.env.DEV && import.meta.env.VITE_ADMIN_DEMO_MODE === "true";
  const [categories, setCategories] = useState<AdminCategory[]>(isDemo ? DEMO_CATEGORIES : []);
  const [loading, setLoading] = useState(!isDemo);
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 600px)").matches);
  const [deleteTarget, setDeleteTarget] = useState<"selected" | "all">("selected");
  const [priceAction, setPriceAction] = useState<"INCREASE_PERCENT" | "DECREASE_PERCENT" | "INCREASE_AMOUNT" | "DECREASE_AMOUNT">("INCREASE_PERCENT");
  const [priceValue, setPriceValue] = useState("");
  const [priceTarget, setPriceTarget] = useState<"selected" | "all">("selected");
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [deleteConflict, setDeleteConflict] = useState<DeleteConflictState>(null);
  const [showReplacement, setShowReplacement] = useState(false);
  const [replacementCategoryId, setReplacementCategoryId] = useState<number | "">("");
  const [replacementOpen, setReplacementOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const dragId = useRef<number | null>(null);
  const addingRef = useRef<HTMLElement>(null);
  const newNameRef = useRef<HTMLInputElement>(null);

  const loadCategories = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      setCategories(await fetchAdminCategoryListApi());
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Помилка завантаження категорій");
    } finally {
      setLoading(false);
    }
  }, [isDemo, showToast]);

  useEffect(() => { void loadCategories(); }, [loadCategories]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 600px)");
    const updateViewport = () => setIsMobile(media.matches);
    media.addEventListener("change", updateViewport);
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!editing && !confirm && !deleteConflict) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [confirm, deleteConflict, editing]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uk");
    return query ? categories.filter((item) => item.name.toLocaleLowerCase("uk").includes(query)) : categories;
  }, [categories, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = isMobile
    ? filtered.slice(0, page * PAGE_SIZE)
    : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  async function addCategory() {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      if (isDemo) {
        setCategories((items) => [...items, { id: Date.now(), name, productCount: 0, displayOrder: items.length + 1 }]);
      } else {
        await createAdminCategoryApi(name);
        await loadCategories();
      }
      setNewName("");
      showToast("Категорію додано");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Помилка додавання категорії");
    } finally { setBusy(false); }
  }

  function requestBulkDelete() {
    const ids = deleteTarget === "all" ? filtered.map((item) => item.id) : selected;
    if (!ids.length) return;
    setConfirm({ ids, title: ids.length === 1 ? "Видалити категорію?" : `Видалити ${ids.length} категорій?` });
  }

  async function confirmDelete() {
    if (!confirm) return;
    const productCount = categories
      .filter((item) => confirm.ids.includes(item.id))
      .reduce((sum, item) => sum + item.productCount, 0);
    if (productCount > 0) {
      setDeleteConflict({ ids: confirm.ids, productCount });
      setConfirm(null);
      return;
    }
    await finishCategoryDelete(confirm.ids, "category-only");
  }

  async function finishCategoryDelete(
    ids: number[],
    mode: "category-only" | "delete-products" | "move-products",
  ) {
    setBusy(true);
    try {
      if (!isDemo) {
        const filters = { categoryIds: ids };
        if (mode === "delete-products") {
          await bulkDeleteAdminProductsApi({ selectionMode: "EXCEPT_SELECTED", productIds: [], filters });
        }
        if (mode === "move-products" && replacementCategoryId !== "") {
          await bulkUpdateAdminCategoriesApi({ selectionMode: "EXCEPT_SELECTED", productIds: [], filters, categoryId: Number(replacementCategoryId) });
        }
        await Promise.all(ids.map(deleteAdminCategoryApi));
      }
      setCategories((items) => items.filter((item) => !ids.includes(item.id)));
      setSelected((items) => items.filter((id) => !ids.includes(id)));
      setConfirm(null);
      setDeleteConflict(null);
      setShowReplacement(false);
      setReplacementCategoryId("");
      setReplacementOpen(false);
      showToast(ids.length === 1 ? "Категорію видалено" : "Категорії видалено");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Не вдалося видалити категорію");
    } finally { setBusy(false); }
  }

  async function saveEdit() {
    if (!editing || !editName.trim()) return;
    setBusy(true);
    try {
      if (!isDemo) await updateAdminCategoryApi(editing.id, editName.trim());
      setCategories((items) => items.map((item) => item.id === editing.id ? { ...item, name: editName.trim() } : item));
      setEditing(null);
      showToast("Назву категорії змінено");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Не вдалося змінити категорію");
    } finally { setBusy(false); }
  }

  async function changePrices() {
    const value = Number(priceValue);
    const ids = priceTarget === "all" ? filtered.map((item) => item.id) : selected;
    if (!ids.length || !Number.isFinite(value) || value <= 0) return;
    setBusy(true);
    try {
      if (!isDemo) await bulkUpdateAdminPricesApi({
        selectionMode: "EXCEPT_SELECTED",
        productIds: [],
        filters: { categoryIds: ids },
        operation: priceAction,
        value,
      });
      setPriceValue("");
      showToast("Ціни виробів оновлено");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Не вдалося змінити ціни");
    } finally { setBusy(false); }
  }

  function toggle(id: number) {
    setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }

  async function drop(targetId: number) {
    const sourceId = dragId.current;
    if (!sourceId || sourceId === targetId || search) return;
    const next = [...categories];
    const from = next.findIndex((item) => item.id === sourceId);
    const to = next.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setCategories(next.map((item, index) => ({ ...item, displayOrder: index + 1 })));
    try { if (!isDemo) await reorderAdminCategoriesApi(next.map((item) => item.id)); }
    catch { showToast("Не вдалося зберегти порядок категорій"); await loadCategories(); }
  }

  const allVisibleSelected = visible.length > 0 && visible.every((item) => selected.includes(item.id));

  function goToAdding() {
    addingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => newNameRef.current?.focus(), 350);
  }

  return (
    <div className="admin-categories">
      <h1 className="admin-categories__title">Категорії</h1>

      <section ref={addingRef} className="admin-categories__section admin-categories__adding">
        <h2>Додати нову категорію</h2>
        <label><span>Назва категорії</span><input ref={newNameRef} value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Альтанки" onKeyDown={(event) => { if (event.key === "Enter") void addCategory(); }} /></label>
        <button className="admin-categories__primary" disabled={!newName.trim() || busy} onClick={() => void addCategory()}>Додати категорію</button>
      </section>

      <section className="admin-categories__section admin-categories__panel">
        <h2>Панель</h2>
        <div className="admin-categories__controls">
          <label className="admin-categories__control"><span>Видалити</span><div className="admin-categories__control-row"><div className="admin-categories__select"><select value={deleteTarget} onChange={(event) => setDeleteTarget(event.target.value as "selected" | "all")}><option value="selected">Обрані категорії</option><option value="all">Усі категорії</option></select><ChevronIcon /></div><button className="admin-categories__icon-btn admin-categories__icon-btn--danger" aria-label="Видалити категорії" disabled={(deleteTarget === "selected" && !selected.length) || busy} onClick={requestBulkDelete}><DeleteIcon /></button></div></label>
          <div className="admin-categories__control admin-categories__control--price"><span>Змінити ціну:</span><div className="admin-categories__price-row"><div className="admin-categories__select admin-categories__select--action"><select value={priceAction} onChange={(event) => setPriceAction(event.target.value as typeof priceAction)}><option value="INCREASE_PERCENT">+ %</option><option value="DECREASE_PERCENT">− %</option><option value="INCREASE_AMOUNT">+ ₴</option><option value="DECREASE_AMOUNT">− ₴</option></select><ChevronIcon /></div><input inputMode="decimal" value={priceValue} onChange={(event) => setPriceValue(event.target.value)} placeholder="Введіть суму" /><div className="admin-categories__select"><select value={priceTarget} onChange={(event) => setPriceTarget(event.target.value as "selected" | "all")}><option value="selected">Обраних</option><option value="all">Усіх</option></select><ChevronIcon /></div><button className="admin-categories__primary" disabled={!priceValue || (priceTarget === "selected" && !selected.length) || busy} onClick={() => void changePrices()}>Змінити</button></div></div>
          <label className="admin-categories__control admin-categories__search"><span>Пошук категорій</span><div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Введіть назву категорії" /><SearchIcon /></div></label>
        </div>
      </section>

      <section className="admin-categories__section admin-categories__list">
        <h2>Категорії</h2>
        {loading ? <div className="admin-categories__empty">Завантаження…</div> : categories.length === 0 ? <div className="admin-categories__empty-state"><span className="admin-categories__empty-icon"><EmptyCategoriesIcon /></span><p>Категорій поки немає. Додайте свою першу категорію</p><button type="button" onClick={goToAdding}>Додати категорію</button></div> : <>
          <div className="admin-categories__table-head"><span>Послідовність</span><label><input type="checkbox" checked={allVisibleSelected} onChange={() => setSelected(allVisibleSelected ? selected.filter((id) => !visible.some((item) => item.id === id)) : Array.from(new Set([...selected, ...visible.map((item) => item.id)])))} /><i /></label><span>Назва</span><span>Кількість товарів, шт</span><span>Дії</span></div>
          <div className="admin-categories__rows">
            {visible.map((category) => <article key={category.id} draggable={!search} onDragStart={() => { dragId.current = category.id; }} onDragOver={(event: DragEvent<HTMLElement>) => event.preventDefault()} onDrop={() => void drop(category.id)} className="admin-categories__row">
              <div className="admin-categories__order"><GripIcon /><span>{category.displayOrder}</span></div>
              <label className="admin-categories__checkbox"><input type="checkbox" checked={selected.includes(category.id)} onChange={() => toggle(category.id)} /><i /></label>
              <button className="admin-categories__category-name" type="button" aria-label={`Редагувати категорію ${category.name}`} onClick={() => { setEditing(category); setEditName(category.name); }}>{category.name}</button>
              <span className="admin-categories__count">{category.productCount}<small> товарів</small></span>
              <div className="admin-categories__actions"><button className="admin-categories__icon-btn" aria-label={`Редагувати ${category.name}`} onClick={() => { setEditing(category); setEditName(category.name); }}><EditIcon /></button><button className="admin-categories__icon-btn admin-categories__icon-btn--danger" aria-label={`Видалити ${category.name}`} onClick={() => setConfirm({ ids: [category.id], title: "Видалити категорію?" })}><DeleteIcon /></button></div>
            </article>)}
            {!visible.length && <div className="admin-categories__empty">Категорій не знайдено</div>}
          </div>
          {totalPages > 1 && !isMobile && <nav className="admin-categories__pagination" aria-label="Сторінки категорій"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>←</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} data-active={number === page} onClick={() => setPage(number)}>{number}</button>)}<button disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>→</button></nav>}
          {isMobile && page < totalPages && <button className="admin-categories__show-more" type="button" onClick={() => setPage((value) => value + 1)}>Показати ще <ChevronIcon /></button>}
        </>}
      </section>

      {editing && <div className="admin-categories__modal-backdrop" role="presentation" onMouseDown={() => setEditing(null)}><div className="admin-categories__modal admin-categories__modal--editing" role="dialog" aria-modal="true" aria-labelledby="edit-category-title" onMouseDown={(event) => event.stopPropagation()}><button className="admin-categories__modal-close" aria-label="Закрити" onClick={() => setEditing(null)}>×</button><h2 id="edit-category-title">Редагування</h2><label><span>Назва категорії</span><input autoFocus value={editName} onChange={(event) => setEditName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && editName.trim() !== editing.name) void saveEdit(); }} /></label><div className="admin-categories__modal-actions"><button className="admin-categories__edit-delete" onClick={() => { setConfirm({ ids: [editing.id], title: "Видалити категорію?" }); setEditing(null); }}><DeleteIcon /> Видалити категорію</button><button className="admin-categories__primary" disabled={!editName.trim() || editName.trim() === editing.name || busy} onClick={() => void saveEdit()}>Зберегти зміни</button></div></div></div>}
      {confirm && <div className="admin-categories__modal-backdrop" role="presentation" onMouseDown={() => setConfirm(null)}><div className="admin-categories__modal admin-categories__modal--deleting" role="alertdialog" aria-modal="true" aria-labelledby="delete-category-title" onMouseDown={(event) => event.stopPropagation()}><button className="admin-categories__modal-close" aria-label="Закрити" onClick={() => setConfirm(null)}>×</button><h2 id="delete-category-title">{confirm.ids.length === 1 ? "Видалення категорії" : "Видалення категорій"}</h2><div className="admin-categories__delete-message"><strong>{confirm.ids.length === 1 ? "Чи дійсно ви бажаєте видалити категорію?" : `Чи дійсно ви бажаєте видалити ${confirm.ids.length} категорій?`}</strong><p>{confirm.ids.length === 1 ? "Якщо видалити категорію, її неможливо буде повернути." : "Якщо видалити категорії, їх неможливо буде повернути."}</p></div><div className="admin-categories__modal-actions"><button className="admin-categories__delete-cancel" onClick={() => setConfirm(null)}>Ні, повернутися назад</button><button className="admin-categories__edit-delete" disabled={busy} onClick={() => void confirmDelete()}><DeleteIcon /> {confirm.ids.length === 1 ? "Так, видалити категорію" : "Так, видалити категорії"}</button></div></div></div>}
      {deleteConflict && <div className="admin-categories__modal-backdrop" data-dropdown-open={replacementOpen} role="presentation" onMouseDown={() => { setDeleteConflict(null); setShowReplacement(false); setReplacementOpen(false); }}><div className="admin-categories__modal admin-categories__modal--conflict" role="alertdialog" aria-modal="true" aria-labelledby="delete-conflict-title" onMouseDown={(event) => event.stopPropagation()}><button className="admin-categories__modal-close" aria-label="Закрити" onClick={() => { setDeleteConflict(null); setShowReplacement(false); setReplacementOpen(false); }}>×</button>{showReplacement ? <><h2 id="delete-conflict-title"><span className="admin-categories__replacement-title--desktop">Оберіть нову категорію для виробів</span><span className="admin-categories__replacement-title--mobile">Нова категорія</span></h2><div className="admin-categories__delete-message"><strong>Раніше категорія товарів називалась “{categories.find((item) => deleteConflict.ids.includes(item.id))?.name ?? "Назва"}”</strong><p>Тепер оберіть ту категорію, до якої необхідно перенести вироби.</p></div><div className="admin-categories__replacement"><span>Оберіть нову категорію</span><div className="admin-categories__replacement-dropdown"><button type="button" className="admin-categories__replacement-trigger" aria-haspopup="listbox" aria-expanded={replacementOpen} onClick={() => setReplacementOpen((value) => !value)}><span>{categories.find((item) => item.id === replacementCategoryId)?.name ?? "Категорія"}</span><ChevronIcon /></button>{replacementOpen && <div className="admin-categories__replacement-list" role="listbox">{categories.filter((item) => !deleteConflict.ids.includes(item.id)).map((item) => <label key={item.id} className="admin-categories__replacement-option"><input type="radio" name="replacementCategory" value={item.id} checked={replacementCategoryId === item.id} onChange={() => { setReplacementCategoryId(item.id); setReplacementOpen(false); }} /><i /><span>{item.name}</span></label>)}</div>}</div></div><div className="admin-categories__conflict-actions"><button className="admin-categories__replacement-confirm" disabled={!replacementCategoryId || busy} onClick={() => void finishCategoryDelete(deleteConflict.ids, "move-products")}>Підтвердити</button><button className="admin-categories__delete-cancel" disabled={busy} onClick={() => void finishCategoryDelete(deleteConflict.ids, "category-only")}>Залишити без категорії</button><button className="admin-categories__edit-delete" disabled={busy} onClick={() => void finishCategoryDelete(deleteConflict.ids, "delete-products")}><DeleteIcon /> Видалити вироби</button></div></> : <><h2 id="delete-conflict-title">Видалення категорії</h2><div className="admin-categories__delete-message"><strong>До категорії входять {deleteConflict.productCount} виробів</strong><p>Вам необхідно обрати, що зробити з виробами, які входять до цієї категорії. Ви можете обрати для них нову категорію, залишити без категорії або видалити.</p></div><div className="admin-categories__conflict-actions"><button className="admin-categories__delete-cancel" onClick={() => setShowReplacement(true)}>Обрати нову категорію</button><button className="admin-categories__delete-cancel" disabled={busy} onClick={() => void finishCategoryDelete(deleteConflict.ids, "category-only")}>Залишити без категорії</button><button className="admin-categories__edit-delete" disabled={busy} onClick={() => void finishCategoryDelete(deleteConflict.ids, "delete-products")}><DeleteIcon /> Видалити</button></div></>}</div></div>}
    </div>
  );
}
