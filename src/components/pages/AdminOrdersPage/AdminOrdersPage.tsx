import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getAdminOrders,
  type AdminOrder,
  type AdminOrdersSort,
} from '../../../services/api/adminOrdersApi'
import { useToast } from '../../../hooks/useToast'
import gazeboImage from '../../../assets/best-products-block/product-1.webp'
import swingImage from '../../../assets/best-products-block/product-2.webp'
import './adminOrdersPage.scss'

const PAGE_SIZE = 10

const DEMO_ORDERS: AdminOrder[] = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  orderNumber: String(23456 + index),
  createdAt: new Date(2026, 4, 22 - index, 12, 0).toISOString(),
  customerName: index % 4 === 0 ? 'Ольга' : index % 4 === 1 ? 'Марія' : index % 4 === 2 ? 'Олексій' : 'Ірина',
  phone: '+380505050500',
  items: Array.from({ length: index === 0 ? 2 : index % 5 === 1 ? 3 : 1 }, (_, itemIndex) => ({
    id: index * 10 + itemIndex + 1,
    productId: itemIndex + 1,
    name: itemIndex === 0 ? 'Альтанка' : 'Гойдалка',
    categoryName: itemIndex === 0 ? 'Альтанки' : 'Гойдалки',
    imageUrl: itemIndex === 0 ? gazeboImage : swingImage,
    quantity: 1,
    unitPrice: itemIndex === 0 ? 1500 : 2500,
  })),
  totalPrice: index === 0 ? 4000 : 5000 + (index % 5) * 1000,
  deliveryCity: index % 3 === 0 ? 'Київ' : index % 3 === 1 ? 'Львів' : 'Одеса',
  comment: index === 0 ? 'Пошвидше телефонуйте' : undefined,
}))

function SearchIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="m13 13 4 4" /></svg>
}

function ChevronIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
}

function OrdersEmptyIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1.5 10h-13L4 9Z" /><path d="m8 9 4-5 4 5M9 12v4M12 12v4M15 12v4" /></svg>
}

function CloseIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>
}

function EmptyOrdersState() {
  return <div className="admin-orders__empty-state" role="status">
    <span className="admin-orders__empty-icon"><OrdersEmptyIcon /></span>
    <p>Замовлень поки що немає</p>
  </div>
}

const SORT_OPTIONS: Array<{ value: AdminOrdersSort; label: string }> = [
  { value: 'amount-asc', label: 'За сумою: від меншої' },
  { value: 'amount-desc', label: 'За сумою: від більшої' },
  { value: 'newest', label: 'За датою: від новішої' },
  { value: 'oldest', label: 'За датою: від старішої' },
]

function OrderSortPicker({ value, onChange }: { value: AdminOrdersSort; onChange: (value: AdminOrdersSort) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedLabel = SORT_OPTIONS.find((option) => option.value === value)?.label ?? SORT_OPTIONS[2].label

  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false) }
    const isMobileViewport = window.matchMedia('(max-width: 600px)').matches
    const previousOverflow = document.body.style.overflow
    if (isMobileViewport) document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      if (isMobileViewport) document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  return <div className="admin-orders__sort">
    <span>Сортувати:</span>
    <button type="button" className="admin-orders__sort-trigger" aria-expanded={isOpen} aria-haspopup="dialog" onClick={() => setIsOpen((open) => !open)}>{selectedLabel}<ChevronIcon /></button>
    {isOpen && <div className="admin-orders__sort-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false) }}>
      <section className="admin-orders__sort-options" role="dialog" aria-modal="false" aria-label="Сортування замовлень">
        <div className="admin-orders__sort-title"><strong>Сортувати:</strong><button type="button" aria-label="Закрити сортування" onClick={() => setIsOpen(false)}><CloseIcon /></button></div>
        <div role="radiogroup" aria-label="Варіант сортування">{SORT_OPTIONS.map((option) => <label key={option.value}><input type="radio" name="admin-orders-sort" value={option.value} checked={value === option.value} onChange={() => { onChange(option.value); setIsOpen(false) }} /><i /><span>{option.label}</span></label>)}</div>
      </section>
    </div>}
  </div>
}

function pageNumbers(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const pages: Array<number | 'ellipsis'> = [1]
  if (current > 4) pages.push('ellipsis')
  const start = Math.max(2, Math.min(current - 1, total - 4))
  const end = Math.min(total - 1, Math.max(current + 1, 5))
  for (let number = start; number <= end; number += 1) pages.push(number)
  if (end < total - 1) pages.push('ellipsis')
  pages.push(total)
  return pages
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(value)
}

function ProductList({ order }: { order: AdminOrder }) {
  return <div className="admin-orders__products">{order.items.map((item) => <div key={item.id} className="admin-orders__product">
    <span className="admin-orders__thumb">{item.imageUrl && <img src={item.imageUrl} alt="" />}</span>
    <span>{item.name}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</span>
  </div>)}</div>
}

function OrderRow({ order, onOpen }: { order: AdminOrder; onOpen: (order: AdminOrder) => void }) {
  return <article className="admin-orders__row">
    <a href={`#/admin/orders/${order.id}`} onClick={(event) => { event.preventDefault(); onOpen(order) }}>{order.orderNumber}</a>
    <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
    <strong>{order.customerName}</strong>
    <b>{order.phone}</b>
    <ProductList order={order} />
    <span className="admin-orders__price">{formatPrice(order.totalPrice)} <small>грн</small></span>
    <span className="admin-orders__city">{order.deliveryCity}</span>
  </article>
}

function OrderDetailsModal({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const total = order.items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.quantity, 0) || order.totalPrice

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', closeOnEscape) }
  }, [onClose])

  return <div className="order-details" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="order-details__dialog" role="dialog" aria-modal="true" aria-labelledby="order-details-title">
      <button type="button" className="order-details__close" aria-label="Закрити" onClick={onClose}><CloseIcon /></button>
      <h2 id="order-details-title"><span className="order-details__desktop-title">Деталі замовлення № {order.orderNumber}</span><span className="order-details__mobile-title">Замовлення № {order.orderNumber}</span></h2>
      <div className="order-details__order">
        <h3>Замовлення</h3>
        <div className="order-details__products">{order.items.map((item) => <article key={item.id}>
          <span className="order-details__image">{item.imageUrl && <img src={item.imageUrl} alt="" />}</span>
          <div><strong>{item.name}</strong><small>{item.categoryName ?? item.name}</small></div>
          <span className="order-details__quantity">x{item.quantity}</span>
          <b>{formatPrice(item.unitPrice ?? Math.round(order.totalPrice / Math.max(1, order.items.length)))} грн</b>
        </article>)}</div>
      </div>
      <div className="order-details__total"><strong>Всього:</strong><span>{formatPrice(total)} грн</span></div>
      <dl className="order-details__info">
        <div><dt>Ім’я та прізвище отримувача</dt><dd>{order.customerName}</dd></div>
        <div><dt>Номер отримувача</dt><dd>{order.phone}</dd></div>
        <div><dt>Місто доставки</dt><dd>{order.deliveryCity}</dd></div>
        <div><dt>Дата оформлення замовлення</dt><dd>{formatDate(order.createdAt)}</dd></div>
        <div className="order-details__comment"><dt>Коментар до замовлення</dt><dd>{order.comment || '—'}</dd></div>
      </dl>
    </section>
  </div>
}

export function AdminOrdersPage() {
  const { showToast } = useToast()
  const isDemo = import.meta.env.DEV && import.meta.env.VITE_ADMIN_DEMO_MODE === 'true'
  const [orders, setOrders] = useState<AdminOrder[]>(isDemo ? DEMO_ORDERS : [])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<AdminOrdersSort>('newest')
  const [page, setPage] = useState(1)
  const [mobilePages, setMobilePages] = useState(1)
  const [totalPages, setTotalPages] = useState(isDemo ? 10 : 1)
  const [loading, setLoading] = useState(!isDemo)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 600px)').matches)

  const load = useCallback(async () => {
    if (isDemo) return
    setLoading(true)
    try {
      const result = await getAdminOrders(search, sort, page - 1, PAGE_SIZE)
      setOrders(result.content)
      setTotalPages(Math.max(1, result.totalPages))
    } catch {
      showToast('Не вдалося завантажити замовлення')
    } finally {
      setLoading(false)
    }
  }, [isDemo, page, search, showToast, sort])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    const media = window.matchMedia('(max-width: 600px)')
    const update = () => setIsMobile(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => { setPage(1); setMobilePages(1) }, [search, sort])

  const filteredOrders = useMemo(() => {
    if (!isDemo) return orders
    const query = search.trim().toLocaleLowerCase('uk')
    const filtered = query ? orders.filter((order) => `${order.orderNumber} ${order.customerName} ${order.phone} ${order.totalPrice} ${order.deliveryCity}`.toLocaleLowerCase('uk').includes(query)) : orders
    return [...filtered].sort((first, second) => {
      if (sort === 'oldest') return Date.parse(first.createdAt) - Date.parse(second.createdAt)
      if (sort === 'amount-desc') return second.totalPrice - first.totalPrice
      if (sort === 'amount-asc') return first.totalPrice - second.totalPrice
      return Date.parse(second.createdAt) - Date.parse(first.createdAt)
    })
  }, [isDemo, orders, search, sort])

  const demoTotalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const effectiveTotalPages = isDemo ? demoTotalPages : totalPages
  const visibleOrders = isDemo
    ? isMobile ? filteredOrders.slice(0, mobilePages * PAGE_SIZE) : filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : orders

  return <div className="admin-orders">
    <h1>Замовлення</h1>
    <section className="admin-orders__card admin-orders__panel">
      <h2>Панель</h2>
      <OrderSortPicker value={sort} onChange={setSort} />
      <label className="admin-orders__search"><span>Пошук замовлення</span><div><input value={search} placeholder="Введіть номер замовлення, ім’я клієнта, суму" onChange={(event) => setSearch(event.target.value)} /><SearchIcon /></div></label>
    </section>
    <section className="admin-orders__card admin-orders__list">
      <h2>Замовлення</h2>
      {visibleOrders.length > 0 && <div className="admin-orders__head"><span>№ замовлення</span><span>Дата</span><span>Ім’я клієнта</span><span>Номер телефону</span><span>Товари</span><span>Сума, грн</span><span>Місто доставки</span></div>}
      {loading ? <p className="admin-orders__empty">Завантаження…</p> : visibleOrders.length > 0 ? visibleOrders.map((order) => <OrderRow key={order.id} order={order} onOpen={setSelectedOrder} />) : <EmptyOrdersState />}
      {!loading && visibleOrders.length > 0 && !isMobile && effectiveTotalPages > 1 && <nav className="admin-orders__pagination" aria-label="Сторінки замовлень"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>←</button>{pageNumbers(page, effectiveTotalPages).map((item, index) => item === 'ellipsis' ? <span key={`ellipsis-${index}`}>…</span> : <button type="button" key={item} data-active={page === item} onClick={() => setPage(item)}>{item}</button>)}<button type="button" disabled={page === effectiveTotalPages} onClick={() => setPage((value) => value + 1)}>→</button></nav>}
      {isMobile && visibleOrders.length < filteredOrders.length && <button type="button" className="admin-orders__show-more" onClick={() => setMobilePages((value) => value + 1)}>Показати ще <ChevronIcon /></button>}
    </section>
    {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
  </div>
}
