import { useState } from 'react'
import { forgotPasswordApi, resetPasswordApi } from '../../../services/api/authApi'
import './ForgotPasswordPage.scss'

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

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="forgot-page__close" type="button" aria-label="Закрити" onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  )
}

function StepEmail({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  function validateEmail(value: string): string {
    const trimmed = value.trim()
    if (!trimmed) return "Поле обов'язкове"
    if (trimmed.length < 6) return 'Мінімум 6 символів'
    if (trimmed.length > 128) return 'Максимум 128 символів'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Невірний формат email'
    return ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const err = validateEmail(email)
    setEmailTouched(true)
    setEmailError(err)
    if (err) return

    setGlobalError(null)
    setIsLoading(true)
    try {
      await forgotPasswordApi(email.trim())
      onSuccess()
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Сталася помилка. Спробуйте ще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <CloseButton onClick={onClose} />
      <h1 className="forgot-page__title">Відновлення паролю</h1>
      {globalError && (
        <div className="forgot-page__global-error" role="alert">{globalError}</div>
      )}
      <form className="forgot-page__form" onSubmit={handleSubmit} noValidate>
        <div className="forgot-page__field">
          <label htmlFor="forgot-email">Введіть email для відновлення паролю</label>
          <input
            id="forgot-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="petro@example.com"
            value={email}
            maxLength={128}
            disabled={isLoading}
            className={emailTouched && emailError ? 'is-error' : ''}
            aria-invalid={Boolean(emailTouched && emailError)}
            aria-describedby={emailTouched && emailError ? 'forgot-email-error' : undefined}
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
            <span className="forgot-page__field-error" id="forgot-email-error" role="alert">
              <AlertIcon />
              {emailError}
            </span>
          )}
        </div>
        <button className="forgot-page__submit" type="submit" disabled={isLoading}>
          {isLoading ? 'Надсилання...' : 'ВІДНОВИТИ ПАРОЛЬ'}
        </button>
      </form>
    </>
  )
}

function StepSuccess({ onClose }: { onClose: () => void }) {
  return (
    <>
      <CloseButton onClick={onClose} />
      <h1 className="forgot-page__title">Відновлення паролю</h1>
      <p className="forgot-page__success-text">
        Якщо акаунт існує, інструкції для відновлення паролю надіслані на вказану пошту.
      </p>
      <button
        className="forgot-page__submit"
        type="button"
        onClick={onClose}
      >
        НА ГОЛОВНУ
      </button>
    </>
  )
}

function StepNewPassword({ token, onClose }: { token: string; onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [confirm, setConfirm] = useState('')
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [confirmError, setConfirmError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  function validatePassword(value: string): string {
    if (!value) return "Поле обов'язкове"
    if (value.length < 8) return 'Мінімум 8 символів'
    if (value.length > 64) return 'Максимум 64 символи'
    return ''
  }

  function validateConfirm(value: string, pw = password): string {
    if (!value) return "Поле обов'язкове"
    if (value !== pw) return 'Паролі не збігаються'
    return ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const pErr = validatePassword(password)
    const cErr = validateConfirm(confirm)
    setPasswordTouched(true)
    setConfirmTouched(true)
    setPasswordError(pErr)
    setConfirmError(cErr)
    if (pErr || cErr) return

    setGlobalError(null)
    setIsLoading(true)
    try {
      await resetPasswordApi(token, password)
      onClose()
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Сталася помилка. Спробуйте ще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <CloseButton onClick={onClose} />
      <h1 className="forgot-page__title">Відновлення паролю</h1>
      {globalError && (
        <div className="forgot-page__global-error" role="alert">{globalError}</div>
      )}
      <form className="forgot-page__form" onSubmit={handleSubmit} noValidate>
        <div className="forgot-page__field">
          <label htmlFor="new-password">Введіть новий пароль</label>
          <div className="forgot-page__password-wrapper">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              name="new-password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              maxLength={64}
              disabled={isLoading}
              className={passwordTouched && passwordError ? 'is-error' : ''}
              aria-invalid={Boolean(passwordTouched && passwordError)}
              onChange={(e) => {
                setPassword(e.target.value)
                if (passwordTouched) setPasswordError(validatePassword(e.target.value))
                if (confirmTouched) setConfirmError(validateConfirm(confirm, e.target.value))
              }}
              onBlur={() => {
                setPasswordTouched(true)
                setPasswordError(validatePassword(password))
              }}
            />
            <button className="forgot-page__password-toggle" type="button" tabIndex={-1}
              aria-label={showPassword ? 'Приховати' : 'Показати'}
              onClick={() => setShowPassword((p) => !p)}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {passwordTouched && passwordError && (
            <span className="forgot-page__field-error" role="alert"><AlertIcon />{passwordError}</span>
          )}
        </div>

        <div className="forgot-page__field">
          <label htmlFor="confirm-password">Повторіть новий пароль</label>
          <div className="forgot-page__password-wrapper">
            <input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              name="confirm-password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              maxLength={64}
              disabled={isLoading}
              className={confirmTouched && confirmError ? 'is-error' : ''}
              aria-invalid={Boolean(confirmTouched && confirmError)}
              onChange={(e) => {
                setConfirm(e.target.value)
                if (confirmTouched) setConfirmError(validateConfirm(e.target.value))
              }}
              onBlur={() => {
                setConfirmTouched(true)
                setConfirmError(validateConfirm(confirm))
              }}
            />
            <button className="forgot-page__password-toggle" type="button" tabIndex={-1}
              aria-label={showConfirm ? 'Приховати' : 'Показати'}
              onClick={() => setShowConfirm((p) => !p)}>
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {confirmTouched && confirmError && (
            <span className="forgot-page__field-error" role="alert"><AlertIcon />{confirmError}</span>
          )}
        </div>

        <button className="forgot-page__submit" type="submit" disabled={isLoading}>
          {isLoading ? 'Збереження...' : 'ЗМІНИТИ ПАРОЛЬ'}
        </button>
      </form>
    </>
  )
}

type ForgotPasswordPageProps = {
  onClose?: () => void
}

export function ForgotPasswordPage({ onClose }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<'email' | 'success'>('email')

  const hashSearch = window.location.hash.includes('?')
    ? window.location.hash.split('?')[1]
    : ''
  const resetToken = new URLSearchParams(hashSearch).get('token')

  function handleClose() {
    if (onClose) {
      onClose()
    } else {
      window.history.back()
    }
  }

  return (
    <div className="forgot-page">
      <div className="forgot-page__card">
        {resetToken ? (
          <StepNewPassword token={resetToken} onClose={handleClose} />
        ) : step === 'email' ? (
          <StepEmail onClose={handleClose} onSuccess={() => setStep('success')} />
        ) : (
          <StepSuccess onClose={handleClose} />
        )}
      </div>
    </div>
  )
}