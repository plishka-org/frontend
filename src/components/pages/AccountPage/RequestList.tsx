import type { Request } from '../../../types/request'
import { RequestItem } from './RequestItem'

const MAX_VISIBLE = 10

type Props = {
  requests: Request[]
}

export function RequestList({ requests }: Props) {
  const visible = requests

  return (
    <div className="request-list">
      <h2 className="request-list__title">Історія заявок</h2>

      {requests.length === 0 ? (
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
        <ul
          className="request-list__items"
          style={requests.length >= MAX_VISIBLE ? { maxHeight: '640px', overflowY: 'auto' } : undefined}
        >
          {visible.map((r) => (
            <RequestItem key={r.id} request={r} />
          ))}
        </ul>
      )}
    </div>
  )
}
