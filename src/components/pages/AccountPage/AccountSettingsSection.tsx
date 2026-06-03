import { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateName(value: string): string {
  const v = value.trim()
  if (!v) return "Поле обов'язкове"
  if (v.length < 2) return 'Мінімум 2 символи'
  if (v.length > 50) return 'Максимум 50 символів'
  if (!/^[a-zA-Zа-яА-ЯіїєґІЇЄҐ\s\-']+$/.test(v)) return 'Лише літери, дефіс та апостроф'
  return ''
}

function validatePhone(value: string): string {
  if (!value) return "Поле обов'язкове"
  if (!value.startsWith('0')) return 'Номер повинен починатися з "0"'
  if (!/^\d+$/.test(value)) return 'Тільки цифри'
  if (value.length !== 10) return 'Номер має бути із 10 цифр'
  return ''
}

function validateEmail(value: string): string {
  if (!value.trim()) return "Поле обов'язкове"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Невірний формат email'
  return ''
}

function validatePassword(value: string): string {
  if (!value) return ''
  if (value.length < 6) return 'Мінімум 6 символів'
  return ''
}

function validatePasswordConfirm(pass: string, confirm: string): string {
  if (!confirm) return ''
  if (pass !== confirm) return 'Паролі не збігаються'
  return ''
}

// ── Field (патерн як у ContactInput) ─────────────────────────────────────────

type FieldProps = {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="account-settings__field">
      <label htmlFor={id} className={error ? 'has-error' : ''}>
        {label}
      </label>
      {children}
      {error && (
        <span className="account-settings__field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function AccountSettingsSection() {
  const { user } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [nameTouched, setNameTouched] = useState(false)
  const [nameError, setNameError] = useState('')

  const [phone, setPhone] = useState('')
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  const [email, setEmail] = useState(user?.email ?? '')
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [newPasswordTouched, setNewPasswordTouched] = useState(false)
  const [newPasswordError, setNewPasswordError] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSaved, setIsSaved] = useState(false)

  const hasErrors =
    (nameTouched && !!nameError) ||
    (phoneTouched && !!phoneError) ||
    (emailTouched && !!emailError) ||
    (newPasswordTouched && !!newPasswordError) ||
    (confirmPasswordTouched && !!confirmPasswordError)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n  = validateName(name)
    const p  = validatePhone(phone)
    const em = validateEmail(email)
    const np = validatePassword(newPassword)
    const cp = validatePasswordConfirm(newPassword, confirmPassword)

    setNameTouched(true);            setNameError(n)
    setPhoneTouched(true);           setPhoneError(p)
    setEmailTouched(true);           setEmailError(em)
    setNewPasswordTouched(true);     setNewPasswordError(np)
    setConfirmPasswordTouched(true); setConfirmPasswordError(cp)

    if (n || p || em || np || cp) return

    // TODO: підключити API
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <form className="account-settings" onSubmit={handleSubmit} noValidate>

      {/* Заголовки — окремий ряд над полями */}
      <div className="account-settings__headers">
        <h2 className="account-settings__title">Особисті дані</h2>
        <h2 className="account-settings__title">Змінити пароль</h2>
      </div>

      {/* Поля — subgrid щоб ряди вирівнювались між колонками */}
      <div className="account-settings__fields-grid">

        {/* Ліва колонка */}
        <div className="account-settings__col">
          <Field id="settings-name" label="Ім'я" error={nameTouched ? nameError : ''}>
            <input
              id="settings-name"
              type="text"
              autoComplete="name"
              value={name}
              placeholder="Ваше ім'я"
              className={nameTouched && nameError ? 'is-error' : ''}
              aria-invalid={Boolean(nameTouched && nameError)}
              aria-describedby={nameTouched && nameError ? 'settings-name-error' : undefined}
              onChange={(e) => {
                setName(e.target.value)
                if (nameTouched) setNameError(validateName(e.target.value))
              }}
              onBlur={() => { setNameTouched(true); setNameError(validateName(name)) }}
            />
          </Field>

          <Field id="settings-phone" label="Телефон" error={phoneTouched ? phoneError : ''}>
            <div className={`account-settings__phone-wrapper${phoneTouched && phoneError ? ' has-error' : ''}`}>
              <span className="account-settings__phone-prefix">+38</span>
              <input
                id="settings-phone"
                type="tel"
                autoComplete="tel-national"
                value={phone}
                placeholder="0506767677"
                aria-invalid={Boolean(phoneTouched && phoneError)}
                aria-describedby={phoneTouched && phoneError ? 'settings-phone-error' : undefined}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setPhone(val)
                  if (phoneTouched) setPhoneError(validatePhone(val))
                }}
                onBlur={() => { setPhoneTouched(true); setPhoneError(validatePhone(phone)) }}
              />
            </div>
          </Field>

          <Field id="settings-email" label="Email" error={emailTouched ? emailError : ''}>
            <input
              id="settings-email"
              type="email"
              autoComplete="email"
              value={email}
              placeholder="oleksii@olex.com"
              className={emailTouched && emailError ? 'is-error' : ''}
              aria-invalid={Boolean(emailTouched && emailError)}
              aria-describedby={emailTouched && emailError ? 'settings-email-error' : undefined}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailTouched) setEmailError(validateEmail(e.target.value))
              }}
              onBlur={() => { setEmailTouched(true); setEmailError(validateEmail(email)) }}
            />
          </Field>
        </div>

        {/* Права колонка */}
        <div className="account-settings__col">
          <Field id="settings-new-password" label="Новий пароль" error={newPasswordTouched ? newPasswordError : ''}>
            <div className="account-settings__password-wrapper">
              <input
                id="settings-new-password"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                placeholder="Введіть новий пароль"
                className={newPasswordTouched && newPasswordError ? 'is-error' : ''}
                aria-invalid={Boolean(newPasswordTouched && newPasswordError)}
                aria-describedby={newPasswordTouched && newPasswordError ? 'settings-new-password-error' : undefined}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (newPasswordTouched) setNewPasswordError(validatePassword(e.target.value))
                  if (confirmPasswordTouched) setConfirmPasswordError(validatePasswordConfirm(e.target.value, confirmPassword))
                }}
                onBlur={() => { setNewPasswordTouched(true); setNewPasswordError(validatePassword(newPassword)) }}
              />
              <button type="button" className="account-settings__password-toggle"
                aria-label={showNewPassword ? 'Приховати пароль' : 'Показати пароль'}
                onClick={() => setShowNewPassword((v) => !v)}>
                {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </Field>

          <Field id="settings-confirm-password" label="Повторити пароль" error={confirmPasswordTouched ? confirmPasswordError : ''}>
            <div className="account-settings__password-wrapper">
              <input
                id="settings-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                placeholder="Повторіть новий пароль"
                className={confirmPasswordTouched && confirmPasswordError ? 'is-error' : ''}
                aria-invalid={Boolean(confirmPasswordTouched && confirmPasswordError)}
                aria-describedby={confirmPasswordTouched && confirmPasswordError ? 'settings-confirm-password-error' : undefined}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (confirmPasswordTouched) setConfirmPasswordError(validatePasswordConfirm(newPassword, e.target.value))
                }}
                onBlur={() => { setConfirmPasswordTouched(true); setConfirmPasswordError(validatePasswordConfirm(newPassword, confirmPassword)) }}
              />
              <button type="button" className="account-settings__password-toggle"
                aria-label={showConfirmPassword ? 'Приховати пароль' : 'Показати пароль'}
                onClick={() => setShowConfirmPassword((v) => !v)}>
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </Field>
        </div>

      </div>

      <div className="account-settings__footer">
        <button type="submit" className="account-settings__submit" disabled={hasErrors}>
          {isSaved ? 'Збережено ✓' : 'Підтвердити зміни'}
        </button>
      </div>
    </form>
  )
}