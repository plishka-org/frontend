import './AuthPromptModal.scss'

type AuthPromptModalProps = {
  isOpen: boolean
  onClose: () => void
  onLogin?: () => void
}

export function AuthPromptModal({ isOpen, onClose, onLogin }: AuthPromptModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="auth-modal__backdrop" onClick={onClose} />
      <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button
          className="auth-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Закрити"
        >
          ✕
        </button>
        <div className="auth-modal__icon" aria-hidden="true">♡</div>
        <h2 id="auth-modal-title" className="auth-modal__title">
          Увійдіть, щоб зберегти товар
        </h2>
        <p className="auth-modal__text">
          Будь ласка, увійдіть або зареєструйтесь, щоб додавати товари до обраного.
        </p>
        <div className="auth-modal__actions">
          {onLogin ? (
            <button
              className="auth-modal__btn auth-modal__btn--primary"
              type="button"
              onClick={onLogin}
            >
              Увійти
            </button>
          ) : (
            // замінити на реальний перехід до сторінки логіну коли буде готова
            <button
              className="auth-modal__btn auth-modal__btn--primary"
              type="button"
              onClick={onClose}
            >
              Увійти
            </button>
          )}
          <button
            className="auth-modal__btn auth-modal__btn--secondary"
            type="button"
            onClick={onClose}
          >
            Пізніше
          </button>
        </div>
      </div>
    </>
  )
}