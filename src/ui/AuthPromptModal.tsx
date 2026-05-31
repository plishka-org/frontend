import { useState } from 'react'
import './AuthPromptModal.scss'

type AuthPromptModalProps = {
  isOpen: boolean
  onClose: () => void
  onLogin: (credentials: { email: string; password: string }) => void
}

export function AuthPromptModal({ isOpen, onClose, onLogin }: AuthPromptModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  const canLogin = Boolean(email.trim() && password.trim())

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canLogin) {
      return
    }

    onLogin({ email: email.trim(), password })
    setEmail('')
    setPassword('')
  }

  function handleClose() {
    setEmail('')
    setPassword('')
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
        <div className="auth-modal__fields">
          <label className="auth-modal__field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              placeholder="petro@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="auth-modal__field">
            <span>Пароль</span>
            <input
              autoComplete="current-password"
              name="password"
              placeholder="********"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        </div>
        <div className="auth-modal__actions">
          <button
            className="auth-modal__btn auth-modal__btn--primary"
            type="submit"
            disabled={!canLogin}
          >
            Увійти
          </button>
          <button
            className="auth-modal__btn auth-modal__btn--secondary"
            type="button"
            onClick={handleClose}
          >
            Пізніше
          </button>
        </div>
      </form>
    </>
  )
}
