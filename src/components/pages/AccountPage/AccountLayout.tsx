import type { ReactNode } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { AccountNav } from './AccountNav'

type AccountLayoutProps = {
  children: ReactNode
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    window.location.href = '/'
  }

  function handleDeleteAccount() {
    if (window.confirm('Ви впевнені, що хочете видалити акаунт? Цю дію неможливо скасувати.')) {
      logout()
      window.location.href = '/'
    }
  }

  return (
    <div className="account-layout">
      <aside className="account-sidebar">
        <div className="account-sidebar__panel">
          <p className="account-sidebar__panel-label">Панель</p>
          <AccountNav />

          <p className="account-sidebar__panel-label account-sidebar__panel-label--actions">Дії з акаунтом</p>
          <div className="account-sidebar__actions">
            <button
              className="account-sidebar__action-btn"
              type="button"
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Вийти з акаунта
            </button>
            <button
              className="account-sidebar__action-btn account-sidebar__action-btn--delete"
              type="button"
              onClick={handleDeleteAccount}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Видалити акаунт
            </button>
          </div>
        </div>
      </aside>

      <main className="account-content" id="account-main">
        {children}
      </main>
    </div>
  )
}