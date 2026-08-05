import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../../../hooks/useToast'
import {
  getAdminCallbackRequests,
  type AdminCallbackRequest,
  type AdminCallbackRequestsSort,
} from '../../../services/api/adminCallbackRequestsApi'
import './adminCallbackRequestsPage.scss'

const PAGE_SIZE = 10
const MAX_PAGE_INDEX = 50
const MAX_SEARCH_LENGTH = 100

const DEMO_REQUESTS: AdminCallbackRequest[] = Array.from({ length: 100 }, (_, index) => ({
  id: 23456 + index,
  name: index % 4 === 0 ? 'Ольга' : index % 4 === 1 ? 'Марія' : index % 4 === 2 ? 'Олексій' : 'Ірина',
  phone: '+380505050500',
  message: index % 3 === 0
    ? 'Передзвоніть будь ласка, мені треба консультація щодо альтанки.'
    : index % 3 === 1
      ? 'Хочу уточнити деталі замовлення та термін доставки.'
      : 'Будь ласка, зв’яжіться зі мною у зручний час.',
  createdAt: new Date(2026, 4, 22 - index, 12, 0).toISOString(),
}))

const SORT_OPTIONS: Array<{ value: AdminCallbackRequestsSort; label: string }> = [
  { value: 'newest', label: 'За датою: від новішої' },
  { value: 'oldest', label: 'За датою: від старішої' },
]

function SearchIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="m13 13 4 4" /></svg>
}

function ChevronIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
}

function CloseIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>
}

function RequestsEmptyIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.1 4.5 5.7 6.9c-1.4 1.4.3 5.4 3.8 8.9s7.5 5.2 8.9 3.8l2.1-2.1-3.6-3.6-2 1.2c-1.2-.5-2.3-1.3-3.3-2.3s-1.8-2.1-2.3-3.3l1.2-2-2.4-3Z" /></svg>
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
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function RequestSortPicker({
  value,
  onChange,
}: {
  value: AdminCallbackRequestsSort
  onChange: (value: AdminCallbackRequestsSort) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedLabel = SORT_OPTIONS.find((option) => option.value === value)?.label ?? SORT_OPTIONS[0].label

  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false) }
    const isMobileViewport = window.matchMedia('(max-width: 600px)').matches
    const previousOverflow = document.body.style.overflow
    const previousRootOverflow = document.documentElement.style.overflow
    if (isMobileViewport) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      if (isMobileViewport) {
        document.body.style.overflow = previousOverflow
        document.documentElement.style.overflow = previousRootOverflow
      }
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  return <div className="admin-callbacks__sort">
    <span>Сортувати:</span>
    <button type="button" className="admin-callbacks__sort-trigger" aria-expanded={isOpen} aria-haspopup="dialog" onClick={() => setIsOpen((open) => !open)}>
      {selectedLabel}
      <ChevronIcon />
    </button>
    {isOpen && <div className="admin-callbacks__sort-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false) }}>
      <section className="admin-callbacks__sort-options" role="dialog" aria-modal={window.matchMedia('(max-width: 600px)').matches} aria-label="Сортування заявок">
        <div className="admin-callbacks__sort-title">
          <strong>Сортувати:</strong>
          <button type="button" aria-label="Закрити сортування" onClick={() => setIsOpen(false)}><CloseIcon /></button>
        </div>
        <div role="radiogroup" aria-label="Варіант сортування">
          {SORT_OPTIONS.map((option) => <label key={option.value}>
            <input type="radio" name="admin-callbacks-sort" value={option.value} checked={value === option.value} onChange={() => { onChange(option.value); setIsOpen(false) }} />
            <i />
            <span>{option.label}</span>
          </label>)}
        </div>
      </section>
    </div>}
  </div>
}

function RequestRow({ request }: { request: AdminCallbackRequest }) {
  return <article className="admin-callbacks__row">
    <strong className="admin-callbacks__number">{request.id}</strong>
    <time dateTime={request.createdAt}>{formatDate(request.createdAt)}</time>
    <b className="admin-callbacks__client">{request.name}</b>
    <a className="admin-callbacks__phone" href={`tel:${request.phone.replace(/\s/g, '')}`}>{request.phone}</a>
    <p className="admin-callbacks__message">{request.message}</p>
  </article>
}

export function AdminCallbackRequestsPage() {
  const { showToast } = useToast()
  const isDemo = import.meta.env.DEV && import.meta.env.VITE_ADMIN_DEMO_MODE === 'true'
  const [requests, setRequests] = useState<AdminCallbackRequest[]>(isDemo ? DEMO_REQUESTS : [])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<AdminCallbackRequestsSort>('newest')
  const [page, setPage] = useState(1)
  const [mobilePages, setMobilePages] = useState(1)
  const [totalPages, setTotalPages] = useState(isDemo ? 10 : 1)
  const [totalElements, setTotalElements] = useState(isDemo ? DEMO_REQUESTS.length : 0)
  const [loading, setLoading] = useState(!isDemo)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 600px)').matches)
  const requestIdRef = useRef(0)

  const load = useCallback(async () => {
    if (isDemo) return
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setLoading(true)
    try {
      const result = await getAdminCallbackRequests(
        search,
        sort,
        isMobile ? mobilePages - 1 : page - 1,
        PAGE_SIZE,
      )
      if (requestId !== requestIdRef.current) return

      setRequests((current) => {
        if (!isMobile || mobilePages === 1) return result.content

        const existingIds = new Set(current.map((request) => request.id))
        return [
          ...current,
          ...result.content.filter((request) => !existingIds.has(request.id)),
        ]
      })
      setTotalPages(Math.max(1, Math.min(result.totalPages, MAX_PAGE_INDEX + 1)))
      setTotalElements(result.totalElements)
    } catch {
      if (requestId === requestIdRef.current) {
        showToast('Не вдалося завантажити заявки на дзвінки')
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [isDemo, isMobile, mobilePages, page, search, showToast, sort])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    const media = window.matchMedia('(max-width: 600px)')
    const update = () => setIsMobile(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const filteredRequests = useMemo(() => {
    if (!isDemo) return requests
    const query = search.trim().toLocaleLowerCase('uk')
    const filtered = query
      ? requests.filter((request) => `${request.id} ${request.name} ${request.phone}`.toLocaleLowerCase('uk').includes(query))
      : requests

    return [...filtered].sort((first, second) => sort === 'oldest'
      ? Date.parse(first.createdAt) - Date.parse(second.createdAt)
      : Date.parse(second.createdAt) - Date.parse(first.createdAt))
  }, [isDemo, requests, search, sort])

  const demoTotalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE))
  const effectiveTotalPages = isDemo ? demoTotalPages : totalPages
  const visibleRequests = isDemo
    ? isMobile
      ? filteredRequests.slice(0, mobilePages * PAGE_SIZE)
      : filteredRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : requests
  const effectiveTotalElements = isDemo ? filteredRequests.length : totalElements

  return <div className="admin-callbacks">
    <h1>Заявки на дзвінки</h1>

    <section className="admin-callbacks__card admin-callbacks__panel">
      <h2>Панель</h2>
      <RequestSortPicker
        value={sort}
        onChange={(nextSort) => {
          setSort(nextSort)
          setPage(1)
          setMobilePages(1)
        }}
      />
      <label className="admin-callbacks__search">
        <span>Пошук заявки</span>
        <span className="admin-callbacks__search-wrap">
          <input
            value={search}
            maxLength={MAX_SEARCH_LENGTH}
            placeholder="Введіть номер телефону, ім’я клієнта"
            onChange={(event) => {
              setSearch(event.target.value.slice(0, MAX_SEARCH_LENGTH))
              setPage(1)
              setMobilePages(1)
            }}
          />
          <SearchIcon />
        </span>
      </label>
    </section>

    <section className="admin-callbacks__card admin-callbacks__list">
      <h2>Заявки</h2>
      {visibleRequests.length > 0 && <div className="admin-callbacks__head">
        <span>№</span>
        <span>Дата</span>
        <span>Клієнт</span>
        <span>Номер телефону</span>
        <span>Причина дзвінка</span>
      </div>}
      {loading
        ? <p className="admin-callbacks__empty">Завантаження…</p>
        : visibleRequests.length > 0
          ? visibleRequests.map((request) => <RequestRow key={request.id} request={request} />)
          : <div className="admin-callbacks__empty-state" role="status">
            <span className="admin-callbacks__empty-icon"><RequestsEmptyIcon /></span>
            <p>Заявок на дзвінки поки що немає</p>
          </div>}

      {!loading && visibleRequests.length > 0 && !isMobile && effectiveTotalPages > 1 && <nav className="admin-callbacks__pagination" aria-label="Сторінки заявок">
        <button type="button" aria-label="Попередня сторінка" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>←</button>
        {pageNumbers(page, effectiveTotalPages).map((item, index) => item === 'ellipsis'
          ? <span key={`ellipsis-${index}`}>…</span>
          : <button type="button" key={item} data-active={page === item} onClick={() => setPage(item)}>{item}</button>)}
        <button type="button" aria-label="Наступна сторінка" disabled={page === effectiveTotalPages} onClick={() => setPage((value) => value + 1)}>→</button>
      </nav>}

      {!loading && isMobile && visibleRequests.length < effectiveTotalElements && mobilePages < effectiveTotalPages && <button type="button" className="admin-callbacks__show-more" onClick={() => setMobilePages((value) => Math.min(value + 1, MAX_PAGE_INDEX + 1))}>
        Показати ще <ChevronIcon />
      </button>}
    </section>
  </div>
}
