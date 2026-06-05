type DeleteAccountModalProps = {
  error: string | null;
  isDeleting: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function DeleteAccountModal({
  error,
  isDeleting,
  isOpen,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div className="delete-account-modal-shell" role="presentation">
      <div className="delete-account-modal-shell__backdrop" onClick={isDeleting ? undefined : onClose} />
      <section
        className="delete-account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-modal-title"
        aria-describedby="delete-account-modal-description"
      >
        <button
          className="delete-account-modal__close"
          type="button"
          aria-label="Закрити"
          disabled={isDeleting}
          onClick={onClose}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="delete-account-modal__icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>

        <h2 className="delete-account-modal__title" id="delete-account-modal-title">
          Видалити акаунт?
        </h2>
        <p className="delete-account-modal__text" id="delete-account-modal-description">
          Цю дію неможливо скасувати. Дані профілю будуть видалені, а вас буде повернуто на головну сторінку.
        </p>

        {error && (
          <p className="delete-account-modal__error" role="alert">
            {error}
          </p>
        )}

        <div className="delete-account-modal__actions">
          <button
            className="delete-account-modal__btn delete-account-modal__btn--secondary"
            type="button"
            disabled={isDeleting}
            onClick={onClose}
          >
            Ні
          </button>
          <button
            className="delete-account-modal__btn delete-account-modal__btn--danger"
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? 'Видалення...' : 'Так'}
          </button>
        </div>
      </section>
    </div>
  );
}
