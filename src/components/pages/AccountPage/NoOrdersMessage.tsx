export function NoOrdersMessage() {
  return (
    <div className="no-orders">
      <div className="no-orders__icon-wrap">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="2" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      </div>
      <p className="no-orders__text">Поки що немає замовлень</p>
    </div>
  )
}