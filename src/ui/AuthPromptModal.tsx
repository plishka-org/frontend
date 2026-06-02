import { useState } from 'react'
import './AuthPromptModal.scss'

type AuthPromptModalProps = {
  isOpen: boolean
  onClose: () => void
  onLogin: (credentials: { email: string; password: string }) => Promise<void>
}

export function AuthPromptModal({ isOpen, onClose, onLogin }: AuthPromptModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const canLogin = Boolean(email.trim() && password.trim())

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canLogin) return

    setError(null)
    setIsLoading(true)

    try {
      await onLogin({ email: email.trim(), password })
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невірний email або пароль')
    } finally {
      setIsLoading(false)
    }
  }

  function handleClose() {
    if (isLoading) return
    setEmail('')
    setPassword('')
    setError(null)
    setShowPassword(false)
    onClose()
  }

  return (
    <>
      <div className="auth-modal__backdrop" onClick={handleClose} />
      <form
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onSubmit={handleSubmit}
      >
        <button
          className="auth-modal__close"
          type="button"
          onClick={handleClose}
          aria-label="Закрити"
          disabled={isLoading}
        >
          ✕
        </button>
        <div className="auth-modal__icon" aria-hidden="true">♡</div>
        <h2 id="auth-modal-title" className="auth-modal__title">
          Увійдіть, щоб зберегти товар
        </h2>
        <p className="auth-modal__text">
          Будь ласка, увійдіть, щоб додавати товари до обраного.
        </p>

        {error && (
          <div className="auth-modal__error" role="alert">
            {error}
          </div>
        )}

        <div className="auth-modal__fields">
          <label className="auth-modal__field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              placeholder="petro@example.com"
              type="email"
              value={email}
              disabled={isLoading}
              onChange={(event) => {
                setError(null)
                setEmail(event.target.value)
              }}
            />
          </label>
          <label className="auth-modal__field">
            <span>Пароль</span>
            <div className="auth-modal__password-wrapper">
              <input
                autoComplete="current-password"
                name="password"
                placeholder="********"
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={isLoading}
                onChange={(event) => {
                  setError(null)
                  setPassword(event.target.value)
                }}
              />
              <button
                className="auth-modal__password-toggle"
                type="button"
                aria-label={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </label>
        </div>

        <div className="auth-modal__actions">
          <button
            className="auth-modal__btn auth-modal__btn--primary"
            type="submit"
            disabled={!canLogin || isLoading}
          >
            {isLoading ? 'Завантаження...' : 'Увійти'}
          </button>
          <button
            className="auth-modal__btn auth-modal__btn--secondary"
            type="button"
            disabled={isLoading}
            onClick={handleClose}
          >
            Пізніше
          </button>
        </div>
      </form>
    </>
  )
}