import type { Request } from '../../../types/request'
import { AccountPagination } from './AccountPagination'
import { RequestItem } from './RequestItem'

type Props = {
  requests: Request[]
  currentPage: number
  totalPages: number
  isLoading: boolean
  error: string | null
  onPageChange: (page: number) => void
  onRetry: () => void
}

export function RequestList({
  requests,
  currentPage,
  totalPages,
  isLoading,
  error,
  onPageChange,
  onRetry,
}: Props) {
  return (
    <div className="request-list">
      <h2 className="request-list__title">Історія заявок</h2>

      {isLoading ? (
        <p className="request-list__status" aria-live="polite">Завантаження…</p>
      ) : error ? (
        <div className="request-list__error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={onRetry}>Спробувати ще раз</button>
        </div>
      ) : requests.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders__icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 7v5l3 2" />
              <path d="M3.51 9a9 9 0 1 1-.46 5.5" />
              <polygon points="6.5,10.5 1.5,8 4,3" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <p className="no-orders__text">Поки що немає заявок</p>
        </div>
      ) : (
        <>
          <ul className="request-list__items">
            {requests.map((request) => (
              <RequestItem key={request.id} request={request} />
            ))}
          </ul>
          <AccountPagination
            current={currentPage}
            total={totalPages}
            ariaLabel="Пагінація заявок"
            onChange={onPageChange}
          />
        </>
      )}
    </div>
  )
}
