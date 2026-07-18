import { useCallback, useEffect, useMemo, useState } from "react";
import {
  banAdminUser,
  bulkBanAdminUsers,
  bulkUnbanAdminUsers,
  getAdminUsers,
  getBannedAdminUsers,
  unbanAdminUser,
  type AdminUser,
} from "../../../services/api/adminUsersApi";
import { useToast } from "../../../hooks/useToast";
import "./adminClientsPage.scss";

const PAGE_SIZE = 10;

const DEMO_CLIENTS: AdminUser[] = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: index % 3 === 0 ? "Ольга Іванченко" : index % 3 === 1 ? "Марія Бондар" : "Олексій Коваль",
  email: index % 3 === 0 ? `olga${12345567 + index}@email.com` : index % 3 === 1 ? `maria${index + 1}@email.com` : `oleksii${index + 1}@email.com`,
  phone: index % 3 === 1 ? null : "+380505050500",
  isBanned: false,
  numberOfOrders: 15,
}));

const DEMO_BANNED: AdminUser[] = Array.from({ length: 3 }, (_, index) => ({
  id: 1001 + index,
  name: "Ольга Іванченко",
  email: `blocked${index + 1}@email.com`,
  phone: index === 0 ? "+380505050500" : null,
  isBanned: true,
  numberOfOrders: 15,
}));

function SearchIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="m13 13 4 4" /></svg>;
}

function ChevronIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>;
}

function CloseIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>;
}

function TrashIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 3h4l1 3H7l1-3Zm-2 3 1 11h6l1-11" /></svg>;
}

function ClientsEmptyIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3.5 18c.4-3.2 2.2-5 5.5-5s5.1 1.8 5.5 5M16 7.5a2.5 2.5 0 0 1 0 5M16.5 14c2.3.4 3.6 1.8 4 4" /></svg>;
}

function BannedEmptyIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></svg>;
}

function EmptyClientsState({ bannedList = false }: { bannedList?: boolean }) {
  return <div className="admin-clients__empty-state" role="status">
    <span className="admin-clients__empty-icon">{bannedList ? <BannedEmptyIcon /> : <ClientsEmptyIcon />}</span>
    <p>{bannedList ? "Заблокованих клієнтів поки що немає" : "Клієнтів поки що немає"}</p>
  </div>;
}

function CheckBox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return <label className="admin-clients__checkbox"><input type="checkbox" checked={checked} onChange={onChange} /><i />{label && <span>{label}</span>}</label>;
}

function pageNumbers(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages: Array<number | "ellipsis"> = [1];
  if (current > 4) pages.push("ellipsis");
  const start = Math.max(2, Math.min(current - 1, total - 4));
  const end = Math.min(total - 1, Math.max(current + 1, 5));
  for (let number = start; number <= end; number += 1) pages.push(number);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

function BlockClientConfirm({ count, busy, onCancel, onConfirm }: { count: number; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  const multiple = count > 1;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onCancel(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [onCancel]);

  return <div className="client-block-confirm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <section className="client-block-confirm__dialog" role="alertdialog" aria-modal="true" aria-labelledby="client-block-title" aria-describedby="client-block-description">
      <button type="button" className="client-block-confirm__close" aria-label="Закрити" onClick={onCancel}><CloseIcon /></button>
      <h2 id="client-block-title">{multiple ? "Блокування клієнтів" : "Блокування клієнта"}</h2>
      <div className="client-block-confirm__message"><strong>{multiple ? `Чи дійсно ви бажаєте заблокувати ${count} клієнтів?` : "Чи дійсно ви бажаєте заблокувати клієнта?"}</strong><p id="client-block-description">{multiple ? "Якщо заблокувати клієнтів, вони не зможуть оформлювати заявки на сайті." : "Якщо заблокувати клієнта, він не зможе оформлювати заявки на сайті."}</p></div>
      <div className="client-block-confirm__actions"><button type="button" className="client-block-confirm__cancel" onClick={onCancel}>Ні, повернутися назад</button><button type="button" className="client-block-confirm__approve" disabled={busy} onClick={onConfirm}><TrashIcon /> {multiple ? "Так, заблокувати" : "Так, заблокувати"}</button></div>
    </section>
  </div>;
}

export function AdminClientsPage() {
  const { showToast } = useToast();
  const isDemo = import.meta.env.DEV && import.meta.env.VITE_ADMIN_DEMO_MODE === "true";
  const [clients, setClients] = useState<AdminUser[]>(isDemo ? DEMO_CLIENTS : []);
  const [banned, setBanned] = useState<AdminUser[]>(isDemo ? DEMO_BANNED : []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [mobilePages, setMobilePages] = useState(1);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectedBanned, setSelectedBanned] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(isDemo ? 10 : 1);
  const [loading, setLoading] = useState(!isDemo);
  const [busy, setBusy] = useState(false);
  const [pendingBan, setPendingBan] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 600px)").matches);

  const load = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      const [usersPage, bannedPage] = await Promise.all([
        getAdminUsers(search, page - 1, PAGE_SIZE),
        getBannedAdminUsers(search, 0, 100),
      ]);
      setClients(usersPage.content);
      setBanned(bannedPage.content);
      setTotalPages(Math.max(1, usersPage.totalPages));
    } catch { showToast("Не вдалося завантажити клієнтів"); }
    finally { setLoading(false); }
  }, [isDemo, page, search, showToast]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 600px)");
    const update = () => setIsMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => { setPage(1); setMobilePages(1); setSelectedClients([]); setSelectedBanned([]); }, [search]);

  const filteredClients = useMemo(() => {
    if (!isDemo) return clients;
    const query = search.trim().toLocaleLowerCase("uk");
    return query ? clients.filter((user) => `${user.name} ${user.email} ${user.phone ?? ""}`.toLocaleLowerCase("uk").includes(query)) : clients;
  }, [clients, isDemo, search]);
  const filteredBanned = useMemo(() => {
    if (!isDemo) return banned;
    const query = search.trim().toLocaleLowerCase("uk");
    return query ? banned.filter((user) => `${user.name} ${user.email} ${user.phone ?? ""}`.toLocaleLowerCase("uk").includes(query)) : banned;
  }, [banned, isDemo, search]);

  const demoTotalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const effectiveTotalPages = isDemo ? demoTotalPages : totalPages;
  const visibleClients = isDemo
    ? isMobile ? filteredClients.slice(0, mobilePages * PAGE_SIZE) : filteredClients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : clients;
  const allClientsSelected = visibleClients.length > 0 && visibleClients.every((user) => selectedClients.includes(user.id));
  const allBannedSelected = filteredBanned.length > 0 && filteredBanned.every((user) => selectedBanned.includes(user.id));

  function toggleSelection(id: number, bannedList: boolean) {
    const setter = bannedList ? setSelectedBanned : setSelectedClients;
    setter((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }

  async function changeBan(ids: number[], shouldBan: boolean) {
    if (!ids.length || busy) return;
    setBusy(true);
    try {
      if (!isDemo) {
        if (ids.length === 1) await (shouldBan ? banAdminUser(ids[0]) : unbanAdminUser(ids[0]));
        else await (shouldBan ? bulkBanAdminUsers(ids) : bulkUnbanAdminUsers(ids));
        await load();
      } else if (shouldBan) {
        const moved = clients.filter((user) => ids.includes(user.id)).map((user) => ({ ...user, isBanned: true }));
        setClients((items) => items.filter((user) => !ids.includes(user.id)));
        setBanned((items) => [...moved, ...items]);
      } else {
        const moved = banned.filter((user) => ids.includes(user.id)).map((user) => ({ ...user, isBanned: false }));
        setBanned((items) => items.filter((user) => !ids.includes(user.id)));
        setClients((items) => [...moved, ...items]);
      }
      setSelectedClients((items) => items.filter((id) => !ids.includes(id)));
      setSelectedBanned((items) => items.filter((id) => !ids.includes(id)));
      showToast(shouldBan ? "Клієнтів заблоковано" : "Клієнтів розблоковано");
    } catch (error) { showToast(error instanceof Error ? error.message : "Не вдалося змінити статус клієнта"); }
    finally { setBusy(false); }
  }

  function requestBan(ids: number[]) {
    if (ids.length && !busy) setPendingBan(ids);
  }

  async function confirmBan() {
    const ids = pendingBan;
    if (!ids.length) return;
    await changeBan(ids, true);
    setPendingBan([]);
  }

  function UserRow({ user, bannedList = false }: { user: AdminUser; bannedList?: boolean }) {
    const selected = bannedList ? selectedBanned : selectedClients;
    return <article className="admin-clients__row" data-banned={bannedList}>
      <CheckBox checked={selected.includes(user.id)} onChange={() => toggleSelection(user.id, bannedList)} />
      <strong>{user.name}</strong>
      <b>{user.email}</b>
      <span className="admin-clients__phone">{user.phone ?? "-"}</span>
      <span className="admin-clients__orders">{user.numberOfOrders}<small> замовлень</small></span>
      <button type="button" className={bannedList ? "admin-clients__unban" : "admin-clients__ban"} disabled={busy} onClick={() => bannedList ? void changeBan([user.id], false) : requestBan([user.id])}>{bannedList ? "Розблокувати" : "Заблокувати"}</button>
    </article>;
  }

  return <div className="admin-clients">
    <h1>Клієнти</h1>
    <section className="admin-clients__card admin-clients__selected"><h2>Обрані</h2><div><button type="button" className="admin-clients__ban" aria-disabled={!selectedClients.length} onClick={() => requestBan(selectedClients)}>Заблокувати</button><button type="button" className="admin-clients__unban" aria-disabled={!selectedBanned.length} onClick={() => void changeBan(selectedBanned, false)}>Розблокувати</button></div></section>
    <section className="admin-clients__card admin-clients__panel"><h2>Панель</h2><label><span>Пошук клієнтів</span><div><input value={search} placeholder="Введіть ім’я клієнта, номер телефону чи пошту" onChange={(event) => setSearch(event.target.value)} /><SearchIcon /></div></label></section>
    <section className={`admin-clients__card admin-clients__list${!loading && visibleClients.length === 0 ? " admin-clients__list--empty" : ""}`}><h2>Клієнти</h2>{visibleClients.length > 0 && <><div className="admin-clients__select-all"><CheckBox label="Вибрати всі" checked={allClientsSelected} onChange={() => setSelectedClients(allClientsSelected ? selectedClients.filter((id) => !visibleClients.some((user) => user.id === id)) : [...new Set([...selectedClients, ...visibleClients.map((user) => user.id)])])} /></div><div className="admin-clients__head"><CheckBox checked={allClientsSelected} onChange={() => setSelectedClients(allClientsSelected ? selectedClients.filter((id) => !visibleClients.some((user) => user.id === id)) : [...new Set([...selectedClients, ...visibleClients.map((user) => user.id)])])} /><span>Ім’я клієнта</span><span>Email</span><span>Номер телефону</span><span>Кількість<br />замовлень</span><span>Дії</span></div></>}{loading ? <p className="admin-clients__empty">Завантаження…</p> : visibleClients.length > 0 ? visibleClients.map((user) => <UserRow key={user.id} user={user} />) : <EmptyClientsState />}
      {!loading && visibleClients.length > 0 && !isMobile && effectiveTotalPages > 1 && <nav className="admin-clients__pagination" aria-label="Сторінки клієнтів"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>←</button>{pageNumbers(page, effectiveTotalPages).map((item, index) => item === "ellipsis" ? <span key={`ellipsis-${index}`}>…</span> : <button key={item} data-active={page === item} onClick={() => setPage(item)}>{item}</button>)}<button disabled={page === effectiveTotalPages} onClick={() => setPage((value) => value + 1)}>→</button></nav>}
      {isMobile && visibleClients.length < filteredClients.length && <button type="button" className="admin-clients__show-more" onClick={() => setMobilePages((value) => value + 1)}>Показати ще <ChevronIcon /></button>}
    </section>
    <section className={`admin-clients__card admin-clients__list admin-clients__banned${filteredBanned.length === 0 ? " admin-clients__list--empty" : ""}`}><h2>Бан-лист</h2>{filteredBanned.length > 0 && <><div className="admin-clients__select-all"><CheckBox label="Вибрати всі" checked={allBannedSelected} onChange={() => setSelectedBanned(allBannedSelected ? [] : filteredBanned.map((user) => user.id))} /></div><div className="admin-clients__head"><CheckBox checked={allBannedSelected} onChange={() => setSelectedBanned(allBannedSelected ? [] : filteredBanned.map((user) => user.id))} /><span>Ім’я клієнта</span><span>Email</span><span>Номер телефону</span><span>Кількість<br />замовлень</span><span>Дії</span></div>{filteredBanned.map((user) => <UserRow key={user.id} user={user} bannedList />)}</>}{!filteredBanned.length && <EmptyClientsState bannedList />}</section>
    {pendingBan.length > 0 && <BlockClientConfirm count={pendingBan.length} busy={busy} onCancel={() => setPendingBan([])} onConfirm={() => void confirmBan()} />}
  </div>;
}
