import { useState } from 'react'
import type { Order } from '../../../types/order'
import type { SiteVariant } from '../../../utils/siteVariant'
import { NoOrdersMessage } from './NoOrdersMessage'
import { OrderItem } from './OrderItem'

const PAGE_SIZE = 7

type PaginationProps = {
  current: number
  total: number
  onChange: (page: number) => void
}

function Pagination({ current, total, onChange }: PaginationProps) {
  if (total <= 1) return null

  const pages: (number | '...')[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return (
    <nav className="order-pagination" aria-label="Пагінація замовлень">
      <button
        className="order-pagination__btn order-pagination__btn--arrow"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label="Попередня сторінка"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="order-pagination__dots">...</span>
        ) : (
          <button
            key={p}
            className={`order-pagination__btn${p === current ? ' order-pagination__btn--active' : ''}`}
            onClick={() => onChange(p as number)}
            aria-label={`Сторінка ${p}`}
            aria-current={p === current ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className="order-pagination__btn order-pagination__btn--arrow"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        aria-label="Наступна сторінка"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  )
}

type OrderListProps = {
  orders: Order[]
  siteVariant: SiteVariant
}

export function OrderList({ orders, siteVariant }: OrderListProps) {
  const [page, setPage] = useState(1)
  const isUsualMode = siteVariant === 'usual'
  const totalPages = Math.ceil(orders.length / PAGE_SIZE)
  const paginated = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handlePageChange(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="order-list" aria-label="Історія замовлень">
      <h2 className="order-list__title">Історія замовлень</h2>

      {isUsualMode && (
        <div className="order-list__notice" role="note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Замовлення поки недоступні, але ви можете переглядати вироби та залишити заявку внизу сторінки.</span>
        </div>
      )}

      {orders.length === 0 ? (
        <NoOrdersMessage />
      ) : (
        <>
          <div className="order-list__items">
            {paginated.map((order) => (
              <OrderItem key={order.id} order={order} siteVariant={siteVariant} />
            ))}
          </div>
          <Pagination current={page} total={totalPages} onChange={handlePageChange} />
        </>
      )}
    </section>
  )
}