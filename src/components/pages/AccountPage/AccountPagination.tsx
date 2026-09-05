type AccountPaginationProps = {
  current: number
  total: number
  ariaLabel: string
  onChange: (page: number) => void
}

export function AccountPagination({
  current,
  total,
  ariaLabel,
  onChange,
}: AccountPaginationProps) {
  if (total <= 1) return null

  const pages: (number | '...')[] = []

  if (total <= 7) {
    for (let page = 1; page <= total; page += 1) pages.push(page)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (
      let page = Math.max(2, current - 1);
      page <= Math.min(total - 1, current + 1);
      page += 1
    ) {
      pages.push(page)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return (
    <nav className="order-pagination" aria-label={ariaLabel}>
      <button
        className="order-pagination__btn order-pagination__btn--arrow"
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label="Попередня сторінка"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`dots-${index}`} className="order-pagination__dots">...</span>
        ) : (
          <button
            key={page}
            className={`order-pagination__btn${page === current ? ' order-pagination__btn--active' : ''}`}
            type="button"
            onClick={() => {
              if (page !== current) onChange(page)
            }}
            aria-label={`Сторінка ${page}`}
            aria-current={page === current ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        className="order-pagination__btn order-pagination__btn--arrow"
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        aria-label="Наступна сторінка"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  )
}
