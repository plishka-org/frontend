import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import {
  changePasswordApi,
  requestEmailChangeApi,
  type AuthUser,
} from '../../../services/api/authApi'

type AccountSettingsValues = {
  name: string
  phone: string
  email: string
  newPassword: string
  confirmPassword: string
}

type AccountSettingsField = keyof AccountSettingsValues
type AccountSettingsTouched = Record<AccountSettingsField, boolean>
type AccountSettingsErrors = Record<AccountSettingsField, string>
type AccountSettingsToast = {
  type: 'success' | 'error'
  message: string
}

const NAME_PATTERN = /^[a-zA-Zа-яА-ЯіїєґІЇЄҐ\s\-']+$/
const EMAIL_PATTERN = /^[^\s@[\]]+@[^\s@[\].]+(?:\.[^\s@[\].]+)+$/
const PASSWORD_ALLOWED_PATTERN = /^[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/

const emptyTouched: AccountSettingsTouched = {
  name: false,
  phone: false,
  email: false,
  newPassword: false,
  confirmPassword: false,
}

function createInitialValues(user: AuthUser | null): AccountSettingsValues {
  return {
    name: user?.name ?? '',
    phone: '',
    email: user?.email ?? '',
    newPassword: '',
    confirmPassword: '',
  }
}

function getEmailChangeStatus() {
  if (typeof window === 'undefined') return null

  const hashQuery = window.location.hash.split('?')[1] ?? ''
  return new URLSearchParams(hashQuery).get('emailChange')
}

function cleanEmailChangeStatusFromUrl() {
  if (typeof window === 'undefined') return

  const nextUrl = `${window.location.pathname}${window.location.search}#/account/settings`
  window.history.replaceState(null, '', nextUrl)
}

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

function validateName(value: string): string {
  const trimmedValue = value.trim()

  if (!trimmedValue) return "Поле обов'язкове"
  if (trimmedValue.length < 2) return 'Мінімум 2 символи'
  if (trimmedValue.length > 50) return 'Максимум 50 символів'
  if (!NAME_PATTERN.test(trimmedValue)) return 'Лише літери, пробіли, дефіс та апостроф'

  return ''
}

function validatePhone(value: string): string {
  if (!value) return ''
  if (!/^\d+$/.test(value)) return 'Тільки цифри'
  if (!value.startsWith('0')) return 'Номер повинен починатися з 0'
  if (value.length !== 10) return 'Номер має бути із 10 цифр'

  return ''
}

function validateEmail(value: string): string {
  const trimmedValue = value.trim()
  const [localPart = ''] = trimmedValue.split('@')

  if (!trimmedValue) return "Поле обов'язкове"
  if (trimmedValue.length < 6) return 'Мінімум 6 символів'
  if (trimmedValue.length > 128) return 'Email має бути не довший за 128 символів'
  if (localPart.length > 64) return 'Частина email до @ має бути не довша за 64 символи'
  if (!EMAIL_PATTERN.test(trimmedValue)) return 'Невірний формат email'

  return ''
}

function validatePassword(value: string, confirmValue: string): string {
  if (!value && !confirmValue) return ''
  if (!value) return "Поле обов'язкове"
  if (value.length < 8) return 'Мінімум 8 символів'
  if (value.length > 64) return 'Максимум 64 символи'
  if (!PASSWORD_ALLOWED_PATTERN.test(value)) return 'Пароль містить недозволені символи'
  if (!/[A-Z]/.test(value)) return 'Додайте щонайменше одну велику літеру'
  if (!/[a-z]/.test(value)) return 'Додайте щонайменше одну малу літеру'
  if (!/\d/.test(value)) return 'Додайте щонайменше одну цифру'
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value)) return 'Додайте щонайменше один спецсимвол'

  return ''
}

function validatePasswordConfirm(password: string, confirmValue: string): string {
  if (!password && !confirmValue) return ''
  if (!confirmValue) return "Поле обов'язкове"
  if (password !== confirmValue) return 'Паролі не збігаються'

  return ''
}

function validateForm(values: AccountSettingsValues): AccountSettingsErrors {
  return {
    name: validateName(values.name),
    phone: validatePhone(values.phone),
    email: validateEmail(values.email),
    newPassword: validatePassword(values.newPassword, values.confirmPassword),
    confirmPassword: validatePasswordConfirm(values.newPassword, values.confirmPassword),
  }
}

function sanitizePhone(value: string) {
  return value.replace(/\D/g, '').slice(0, 10)
}

function hasVisibleError(field: AccountSettingsField, touched: AccountSettingsTouched, errors: AccountSettingsErrors) {
  return touched[field] && Boolean(errors[field])
}

type ErrorMessageProps = {
  id: string
  message: string
}

function ErrorMessage({ id, message }: ErrorMessageProps) {
  if (!message) return null

  return (
    <span className="account-settings__field-error" id={id} role="alert">
      {message}
    </span>
  )
}

type ToastMessageProps = {
  toast: AccountSettingsToast | null
}

function ToastMessage({ toast }: ToastMessageProps) {
  if (!toast) return null

  return (
    <div
      className={`account-settings__toast account-settings__toast--${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
    >
      {toast.message}
    </div>
  )
}

type FieldProps = {
  id: string
  label: string
  error?: string
  children: ReactNode
}

function Field({ id, label, error = '', children }: FieldProps) {
  return (
    <div className="account-settings__field">
      <label htmlFor={id} className={error ? 'has-error' : ''}>
        {label}
      </label>
      {children}
      <ErrorMessage id={`${id}-error`} message={error} />
    </div>
  )
}

export function AccountSettingsSection() {
  const { user } = useAuth()

  const [savedValues, setSavedValues] = useState<AccountSettingsValues>(() => createInitialValues(user))
  const [values, setValues] = useState<AccountSettingsValues>(() => createInitialValues(user))
  const [touched, setTouched] = useState<AccountSettingsTouched>(emptyTouched)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<AccountSettingsToast | null>(null)

  const errors = validateForm(values)
  const isDirty = (Object.keys(values) as AccountSettingsField[]).some(
    (field) => values[field] !== savedValues[field],
  )
  const isFormValid = !Object.values(errors).some(Boolean)
  const isSubmitDisabled = !isDirty || !isFormValid || isSubmitting

  useEffect(() => {
    if (getEmailChangeStatus() !== 'success') return

    setToast({ type: 'success', message: 'Email успішно підтверджено.' })
    cleanEmailChangeStatusFromUrl()
  }, [])

  useEffect(() => {
    const nextValues = createInitialValues(user)

    setValues(nextValues)
    setSavedValues(nextValues)
    setTouched(emptyTouched)
  }, [user])

  function handleFieldChange(field: AccountSettingsField, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: field === 'phone' ? sanitizePhone(value) : value,
    }))
    setToast(null)
  }

  function handleFieldBlur(field: AccountSettingsField) {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [field]: true,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setTouched({
      name: true,
      phone: true,
      email: true,
      newPassword: true,
      confirmPassword: true,
    })

    if (!isDirty || !isFormValid || isSubmitting) return

    const isEmailChanged = values.email.trim() !== savedValues.email.trim()
    const isPasswordChanged = Boolean(values.newPassword)

    setIsSubmitting(true)
    setToast(null)

    try {
      await Promise.all([
        isEmailChanged ? requestEmailChangeApi({ email: values.email.trim() }) : Promise.resolve(),
        isPasswordChanged ? changePasswordApi({ newPassword: values.newPassword }) : Promise.resolve(),
      ])

      const nextSavedValues: AccountSettingsValues = {
        ...values,
        email: isEmailChanged ? savedValues.email : values.email,
        newPassword: '',
        confirmPassword: '',
      }
      const nextValues: AccountSettingsValues = {
        ...values,
        email: isEmailChanged ? savedValues.email : values.email,
        newPassword: '',
        confirmPassword: '',
      }
      const successMessages = [
        isEmailChanged ? 'Ми надіслали посилання для підтвердження нового email.' : '',
        isPasswordChanged ? 'Пароль успішно змінено.' : '',
      ].filter(Boolean)

      setSavedValues(nextSavedValues)
      setValues(nextValues)
      setTouched(emptyTouched)
      setToast({
        type: 'success',
        message: successMessages.join(' ') || 'Зміни збережено.',
      })
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Не вдалося зберегти зміни.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nameError = touched.name ? errors.name : ''
  const phoneError = touched.phone ? errors.phone : ''
  const emailError = touched.email ? errors.email : ''
  const newPasswordError = touched.newPassword ? errors.newPassword : ''
  const confirmPasswordError = touched.confirmPassword ? errors.confirmPassword : ''

  return (
    <form className="account-settings" onSubmit={handleSubmit} noValidate>
      <ToastMessage toast={toast} />

      <div className="account-settings__fields-grid">
        <div className="account-settings__col">
          <h2 className="account-settings__title">Особисті дані</h2>

          <Field id="settings-name" label="Ім'я" error={nameError}>
            <input
              id="settings-name"
              type="text"
              autoComplete="name"
              value={values.name}
              placeholder="Ваше ім'я"
              className={hasVisibleError('name', touched, errors) ? 'is-error' : ''}
              aria-invalid={hasVisibleError('name', touched, errors)}
              aria-describedby={nameError ? 'settings-name-error' : undefined}
              onChange={(event) => handleFieldChange('name', event.target.value)}
              onBlur={() => handleFieldBlur('name')}
            />
          </Field>

          <Field id="settings-phone" label="Телефон" error={phoneError}>
            <div className={`account-settings__phone-wrapper${phoneError ? ' has-error' : ''}`}>
              <span className="account-settings__phone-prefix">+38</span>
              <input
                id="settings-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={values.phone}
                placeholder="0506767677"
                aria-invalid={hasVisibleError('phone', touched, errors)}
                aria-describedby={phoneError ? 'settings-phone-error' : undefined}
                onChange={(event) => handleFieldChange('phone', event.target.value)}
                onBlur={() => handleFieldBlur('phone')}
              />
            </div>
          </Field>

          <Field id="settings-email" label="Email" error={emailError}>
            <input
              id="settings-email"
              type="email"
              autoComplete="email"
              value={values.email}
              placeholder="oleksii@olex.com"
              minLength={6}
              className={hasVisibleError('email', touched, errors) ? 'is-error' : ''}
              aria-invalid={hasVisibleError('email', touched, errors)}
              aria-describedby={emailError ? 'settings-email-error' : undefined}
              onChange={(event) => handleFieldChange('email', event.target.value)}
              onBlur={() => handleFieldBlur('email')}
            />
          </Field>
        </div>

        <div className="account-settings__col">
          <h2 className="account-settings__title">Змінити пароль</h2>

          <Field id="settings-new-password" label="Новий пароль" error={newPasswordError}>
            <div className="account-settings__password-wrapper">
              <input
                id="settings-new-password"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={values.newPassword}
                placeholder="Введіть новий пароль"
                className={hasVisibleError('newPassword', touched, errors) ? 'is-error' : ''}
                aria-invalid={hasVisibleError('newPassword', touched, errors)}
                aria-describedby={newPasswordError ? 'settings-new-password-error' : undefined}
                onChange={(event) => handleFieldChange('newPassword', event.target.value)}
                onBlur={() => handleFieldBlur('newPassword')}
              />
              <button
                type="button"
                className="account-settings__password-toggle"
                aria-label={showNewPassword ? 'Приховати пароль' : 'Показати пароль'}
                onClick={() => setShowNewPassword((isShown) => !isShown)}
              >
                {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </Field>

          <Field id="settings-confirm-password" label="Повторити пароль" error={confirmPasswordError}>
            <div className="account-settings__password-wrapper">
              <input
                id="settings-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={values.confirmPassword}
                placeholder="Повторіть новий пароль"
                className={hasVisibleError('confirmPassword', touched, errors) ? 'is-error' : ''}
                aria-invalid={hasVisibleError('confirmPassword', touched, errors)}
                aria-describedby={confirmPasswordError ? 'settings-confirm-password-error' : undefined}
                onChange={(event) => handleFieldChange('confirmPassword', event.target.value)}
                onBlur={() => handleFieldBlur('confirmPassword')}
              />
              <button
                type="button"
                className="account-settings__password-toggle"
                aria-label={showConfirmPassword ? 'Приховати пароль' : 'Показати пароль'}
                onClick={() => setShowConfirmPassword((isShown) => !isShown)}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </Field>
        </div>
      </div>

      <div className="account-settings__footer">
        <button type="submit" className="account-settings__submit" disabled={isSubmitDisabled}>
          {isSubmitting ? 'Збереження...' : 'Підтвердити зміни'}
        </button>
      </div>
    </form>
  )
}
