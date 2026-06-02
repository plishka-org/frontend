import { useState } from 'react'
import './AuthPromptModal.scss'

type AuthPromptModalProps = {
  isOpen: boolean
  onClose: () => void
  onLogin: (credentials: { email: string; password: string }) => Promise<void>
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function validateEmail(value: string): string {
  if (!value.trim()) return "Поле обов'язкове"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Невірний формат email'
  return ''
}

function validatePassword(value: string): string {
  if (!value) return "Поле обов'язкове"
  if (value.length < 6) return 'Мінімум 6 символів'
  return ''
}

export function AuthPromptModal({ isOpen, onClose, onLogin }: AuthPromptModalProps) {
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState('')

  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null


  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextEmailError = validateEmail(email)
    const nextPasswordError = validatePassword(password)

    setEmailTouched(true)
    setPasswordTouched(true)
    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)

    if (nextEmailError || nextPasswordError) return

    setGlobalError(null)
    setIsLoading(true)

    try {
      await onLogin({ email: email.trim(), password })
      setEmail('')
      setPassword('')
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Невірний email або пароль')
    } finally {
      setIsLoading(false)
    }
  }

  function handleClose() {
    if (isLoading) return
    setEmail('')
    setPassword('')
    setEmailError('')
    setPasswordError('')
    setEmailTouched(false)
    setPasswordTouched(false)
    setGlobalError(null)
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="auth-modal__icon" aria-hidden="true">♡</div>
        <h2 id="auth-modal-title" className="auth-modal__title">
          Увійдіть, щоб зберегти товар
        </h2>
        <p className="auth-modal__text">
          Будь ласка, увійдіть, щоб додавати товари до обраного.
        </p>

        {globalError && (
          <div className="auth-modal__global-error" role="alert">
            {globalError}
          </div>
        )}

        <div className="auth-modal__fields">
          {/* Email */}
          <div className="auth-modal__field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              autoComplete="email"
              name="email"
              placeholder="petro@example.com"
              type="email"
              value={email}
              disabled={isLoading}
              className={emailTouched && emailError ? 'is-error' : ''}
              aria-describedby={emailTouched && emailError ? 'auth-email-error' : undefined}
              aria-invalid={Boolean(emailTouched && emailError)}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailTouched) setEmailError(validateEmail(e.target.value))
              }}
              onBlur={() => {
                setEmailTouched(true)
                setEmailError(validateEmail(email))
              }}
            />
            {emailTouched && emailError && (
              <span className="auth-modal__field-error" id="auth-email-error" role="alert">
                <AlertIcon />
                {emailError}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="auth-modal__field">
            <label htmlFor="auth-password">Пароль</label>
            <div className="auth-modal__password-wrapper">
              <input
                id="auth-password"
                autoComplete="current-password"
                name="password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={isLoading}
                className={passwordTouched && passwordError ? 'is-error' : ''}
                aria-describedby={passwordTouched && passwordError ? 'auth-password-error' : undefined}
                aria-invalid={Boolean(passwordTouched && passwordError)}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordTouched) setPasswordError(validatePassword(e.target.value))
                }}
                onBlur={() => {
                  setPasswordTouched(true)
                  setPasswordError(validatePassword(password))
                }}
              />
              <button
                className="auth-modal__password-toggle"
                type="button"
                aria-label={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordTouched && passwordError && (
              <span className="auth-modal__field-error" id="auth-password-error" role="alert">
                <AlertIcon />
                {passwordError}
              </span>
            )}
          </div>
        </div>

        <div className="auth-modal__actions">
          <button
            className="auth-modal__btn auth-modal__btn--primary"
            type="submit"
            disabled={isLoading}
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