import { getAppPath } from '../../../utils/productUrl'

const NAV_ITEMS = [
  {
    label: 'Історія замовлень',
    path: '/account/orders',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="2" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    label: 'Історія заявок',
    path: '/account/requests',
  icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 7v5l3 2" />
        
        <path d="M3.51 9a9 9 0 1 1-.46 5.5" />
        
        <polygon points="6.5,10.5 1.5,8 4,3" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Особисті дані',
    path: '/account/settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
]

export function AccountNav() {
  const currentPath = getAppPath(window.location.pathname, window.location.hash)

  return (
    <nav className="account-nav" aria-label="Навігація кабінету">
      {NAV_ITEMS.map((item) => {
        const isActive = currentPath.startsWith(item.path)
        return (
          <a
            key={item.path}
            href={`#${item.path}`}
            className={`account-nav__link${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        )
      })}
    </nav>
  )
}