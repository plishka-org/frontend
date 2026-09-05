import { useState } from 'react'
import type { Order } from '../../../types/order'
import type { SiteVariant } from '../../../utils/siteVariant'
import { AccountPagination } from './AccountPagination'
import { NoOrdersMessage } from './NoOrdersMessage'
import { OrderItem } from './OrderItem'

const PAGE_SIZE = 7

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
          <AccountPagination
            current={page}
            total={totalPages}
            ariaLabel="Пагінація замовлень"
            onChange={handlePageChange}
          />
        </>
      )}
    </section>
  )
}
