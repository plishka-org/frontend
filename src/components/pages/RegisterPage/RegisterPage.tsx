import { useEffect, useState } from 'react'
import { IMaskInput } from 'react-imask'
import { registerApi, verifyEmailApi } from '../../../services/api/authApi'
import './RegisterPage.scss'

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
    <button className="register-page__close" type="button" aria-label="Закрити" onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  )
}

function validateName(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return "Поле обов'язкове"
  if (trimmed.length < 2) return 'Мінімум 2 символи'
  if (trimmed.length > 50) return 'Максимум 50 символів'
  if (!/^[A-Za-zА-ЯЇІЄҐа-яїієґ'\- ]+$/.test(trimmed)) {
    return 'Допускаються лише літери, пробіл, дефіс та апостроф'
  }
  return ''
}

function validateEmail(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return "Поле обов'язкове"
  if (trimmed.length < 6) return 'Мінімум 6 символів'
  if (trimmed.length > 128) return 'Максимум 128 символів'
  if (!/^[^\s@]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(trimmed)) {
    return 'Невірний формат email'
  }
  return ''
}

function validatePhone(value: string): string {
  if (!value) return ''
  if (!value.startsWith('0')) return 'Номер повинен починатися з "0"'
  if (!/^\d+$/.test(value)) return 'Тільки цифри'
  if (value.length !== 10) return 'Номер має бути із 10 цифр'
  return ''
}

function validatePassword(value: string): string {
  if (!value) return "Поле обов'язкове"
  if (value.length < 8) return 'Мінімум 8 символів'
  if (value.length > 64) return 'Максимум 64 символи'
  if (!/[A-ZА-ЯЇІЄҐ]/.test(value)) return 'Потрібна хоча б одна велика літера'
  if (!/[a-zа-яїієґ]/.test(value)) return 'Потрібна хоча б одна мала літера'
  if (!/[0-9]/.test(value)) return 'Потрібна хоча б одна цифра'
  if (!/[^A-Za-zА-Яа-яЇїІіЄєҐґ0-9]/.test(value)) return 'Потрібен хоча б один спецсимвол'
  return ''
}

function validateConfirm(value: string, pw: string): string {
  if (!value) return "Поле обов'язкове"
  if (value !== pw) return 'Паролі не збігаються'
  return ''
}

type StepRegisterProps = {
  onClose: () => void
  onSuccess: (email: string) => void
  onLogin?: () => void
}

function StepRegister({ onClose, onSuccess, onLogin }: StepRegisterProps) {
  const [name, setName] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [nameError, setNameError] = useState('')

  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState('')

  const [phone, setPhone] = useState('')
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [phoneError, setPhoneError] = useState('')

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

  const handlePhoneAccept = (value: string) => {
    const nextPhone = value.replace(/\D/g, '').slice(0, 10)
    setPhone(nextPhone)
    if (phoneTouched) setPhoneError(validatePhone(nextPhone))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const nErr = validateName(name)
    const eErr = validateEmail(email)
    const phErr = validatePhone(phone)
    const pwErr = validatePassword(password)
    const cErr = validateConfirm(confirm, password)

    setNameTouched(true)
    setEmailTouched(true)
    setPhoneTouched(Boolean(phone))
    setPasswordTouched(true)
    setConfirmTouched(true)

    setNameError(nErr)
    setEmailError(eErr)
    setPhoneError(phErr)
    setPasswordError(pwErr)
    setConfirmError(cErr)

    if (nErr || eErr || phErr || pwErr || cErr) return

    setGlobalError(null)
    setIsLoading(true)
    try {
      await registerApi({
        name: name.trim(),
        email: email.trim(),
        phone: phone ? `+38${phone}` : undefined,
        password,
        confirmPassword: confirm,
      })
      onSuccess(email.trim())
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Сталася помилка. Спробуйте ще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleLoginClick(e: React.MouseEvent) {
    if (onLogin) {
      e.preventDefault()
      onLogin()
    }
  }

  return (
    <>
      <CloseButton onClick={onClose} />
      <h1 className="register-page__title">Реєстрація</h1>
      {globalError && (
        <div className="register-page__global-error" role="alert">{globalError}</div>
      )}
      <form className="register-page__form" onSubmit={handleSubmit} noValidate>

        {/* Ім'я */}
        <div className="register-page__field">
          <label htmlFor="register-name">Ім'я</label>
          <input
            id="register-name"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Олексій Петренко"
            value={name}
            disabled={isLoading}
            className={nameTouched && nameError ? 'is-error' : ''}
            aria-invalid={Boolean(nameTouched && nameError)}
            aria-describedby={nameTouched && nameError ? 'register-name-error' : undefined}
            onChange={(e) => {
              setName(e.target.value)
              if (nameTouched) setNameError(validateName(e.target.value))
            }}
            onBlur={() => {
              setNameTouched(true)
              setNameError(validateName(name))
            }}
          />
          {nameTouched && nameError && (
            <span className="register-page__field-error" id="register-name-error" role="alert">
              <AlertIcon />{nameError}
            </span>
          )}
        </div>

        {/* Пошта */}
        <div className="register-page__field">
          <label htmlFor="register-email">Пошта</label>
          <input
            id="register-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="petro@example.com"
            value={email}
            disabled={isLoading}
            className={emailTouched && emailError ? 'is-error' : ''}
            aria-invalid={Boolean(emailTouched && emailError)}
            aria-describedby={emailTouched && emailError ? 'register-email-error' : undefined}
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
            <span className="register-page__field-error" id="register-email-error" role="alert">
              <AlertIcon />{emailError}
            </span>
          )}
        </div>

        {/* Телефон */}
        <div className="register-page__field">
          <label htmlFor="register-phone">Номер телефону</label>
          <div className="register-page__phone-wrapper">
            <span className="register-page__phone-prefix">+38</span>
            <IMaskInput
              id="register-phone"
              autoComplete="tel-national"
              className={`register-page__phone-input${phoneTouched && phoneError ? ' is-error' : ''}`}
              mask="000 000 00 00"
              unmask={true}
              value={phone}
              placeholder="0XX XXX XX XX"
              disabled={isLoading}
              onAccept={(value) => handlePhoneAccept(String(value))}
              onBlur={() => {
                if (!phone) return
                setPhoneTouched(true)
                setPhoneError(validatePhone(phone))
              }}
              aria-describedby={phoneTouched && phoneError ? 'register-phone-error' : undefined}
              aria-invalid={Boolean(phoneTouched && phoneError)}
            />
          </div>
          {phoneTouched && phoneError && (
            <span className="register-page__field-error" id="register-phone-error" role="alert">
              <AlertIcon />{phoneError}
            </span>
          )}
        </div>

        {/* Пароль */}
        <div className="register-page__field">
          <label htmlFor="register-password">Пароль</label>
          <div className="register-page__password-wrapper">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              disabled={isLoading}
              className={passwordTouched && passwordError ? 'is-error' : ''}
              aria-invalid={Boolean(passwordTouched && passwordError)}
              aria-describedby={passwordTouched && passwordError ? 'register-password-error' : undefined}
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
            <button className="register-page__password-toggle" type="button" tabIndex={-1}
              aria-label={showPassword ? 'Приховати' : 'Показати'}
              onClick={() => setShowPassword((p) => !p)}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {passwordTouched && passwordError && (
            <span className="register-page__field-error" id="register-password-error" role="alert">
              <AlertIcon />{passwordError}
            </span>
          )}
        </div>

        {/* Повторіть пароль */}
        <div className="register-page__field">
          <label htmlFor="register-confirm-password">Повторіть пароль</label>
          <div className="register-page__password-wrapper">
            <input
              id="register-confirm-password"
              type={showConfirm ? 'text' : 'password'}
              name="confirm-password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              disabled={isLoading}
              className={confirmTouched && confirmError ? 'is-error' : ''}
              aria-invalid={Boolean(confirmTouched && confirmError)}
              aria-describedby={confirmTouched && confirmError ? 'register-confirm-password-error' : undefined}
              onChange={(e) => {
                setConfirm(e.target.value)
                if (confirmTouched) setConfirmError(validateConfirm(e.target.value, password))
              }}
              onBlur={() => {
                setConfirmTouched(true)
                setConfirmError(validateConfirm(confirm, password))
              }}
            />
            <button className="register-page__password-toggle" type="button" tabIndex={-1}
              aria-label={showConfirm ? 'Приховати' : 'Показати'}
              onClick={() => setShowConfirm((p) => !p)}>
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {confirmTouched && confirmError && (
            <span className="register-page__field-error" id="register-confirm-password-error" role="alert">
              <AlertIcon />{confirmError}
            </span>
          )}
        </div>

        <div className="register-page__links">
          <span className="register-page__links-group">
            Вже маєте профіль?{' '}
            <a
              href="#/login"
              className="register-page__link register-page__link--accent"
              onClick={handleLoginClick}
            >
              УВІЙТИ
            </a>
          </span>
        </div>

        <button className="register-page__submit" type="submit" disabled={isLoading}>
          {isLoading ? 'Реєстрація...' : 'ЗАРЕЄСТРУВАТИСЯ'}
        </button>
      </form>
    </>
  )
}

function StepSuccess({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <>
      <CloseButton onClick={onClose} />
      <h1 className="register-page__title">Реєстрація</h1>
      <p className="register-page__success-text">
        На вказану електронну пошту <strong>{email}</strong> відправлено посилання для підтвердження.
        Перейдіть за посиланням, щоб підтвердити електронну пошту.
      </p>
      <button className="register-page__submit" type="button" onClick={onClose}>
        НА ГОЛОВНУ
      </button>
    </>
  )
}

function StepVerify({ token }: { token: string }) {
  const [status, setStatus] = useState<'pending' | 'error'>('pending')

  useEffect(() => {
    let cancelled = false

    verifyEmailApi(token)
      .then(() => {
        if (cancelled) return
        window.location.hash = '#/account'
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })

    return () => { cancelled = true }
  }, [token])

  return (
    <>
      <h1 className="register-page__title">Реєстрація</h1>
      {status === 'pending' ? (
        <p className="register-page__success-text">Підтверджуємо вашу електронну пошту...</p>
      ) : (
        <>
          <p className="register-page__success-text">
            Не вдалося підтвердити електронну пошту. Можливо, посилання застаріло.
          </p>
          <a href="#/login" className="register-page__submit register-page__submit--link">
            НА СТОРІНКУ ВХОДУ
          </a>
        </>
      )}
    </>
  )
}

type RegisterPageProps = {
  onClose?: () => void
  onLogin?: () => void
}

export function RegisterPage({ onClose, onLogin }: RegisterPageProps) {
  const [step, setStep] = useState<'register' | 'success'>('register')
  const [registeredEmail, setRegisteredEmail] = useState('')

  const hashSearch = window.location.hash.includes('?')
    ? window.location.hash.split('?')[1]
    : ''
  const verifyToken = new URLSearchParams(hashSearch).get('token')

  function handleClose() {
    if (onClose) {
      onClose()
    } else {
      window.history.back()
    }
  }

  return (
    <div className="register-page">
      <div className="register-page__card">
        {verifyToken ? (
          <StepVerify token={verifyToken} />
        ) : step === 'register' ? (
          <StepRegister
            onClose={handleClose}
            onLogin={onLogin}
            onSuccess={(email) => {
              setRegisteredEmail(email)
              setStep('success')
            }}
          />
        ) : (
          <StepSuccess email={registeredEmail} onClose={handleClose} />
        )}
      </div>
    </div>
  )
}
