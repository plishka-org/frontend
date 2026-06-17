import { useCallback, useEffect, useMemo, useState } from 'react'
import emptyCartIcon from '../assets/cart-modal/icon-cart.svg'
import { CloseIcon, EyeIcon, TrashIcon } from './icons/UiIcons'
import { useAuth } from '../hooks/useAuth'
import { maxCartQuantity, useShop } from '../hooks/useShop'
import { useToast } from '../hooks/useToast'
import { formatPrice } from '../utils/formatPrice'
import { getGalleryUrl, getHomeUrl } from '../utils/productUrl'
import { createOrderApi } from '../services/api/ordersApi'

type CartModalProps = {
  isOpen: boolean
  onClose: () => void
}

type CheckoutStep = 'cart' | 'login' | 'register' | 'order' | 'success'
type OrderBackStep = Extract<CheckoutStep, 'cart' | 'login' | 'register'>

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { user, login } = useAuth()
  const {
    cartLines,
    cartTotal,
    clearCart,
    removeFromCart,
    updateCartQuantity,
  } = useShop()
  const { showToast } = useToast()

  const [step, setStep] = useState<CheckoutStep>('cart')
  const [orderBackStep, setOrderBackStep] = useState<OrderBackStep>('cart')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [orderForm, setOrderForm] = useState({
    recipientName: '',
    phone: '',
    city: '',
    comment: '',
  })
  const [orderTouched, setOrderTouched] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const hasCartItems = cartLines.length > 0
  const activeStep = !hasCartItems && step !== 'success' ? 'cart' : step
  const canLogin = loginForm.email.trim() && loginForm.password.trim()
  const canRegister =
    registerForm.name.trim() &&
    registerForm.email.trim() &&
    registerForm.password &&
    registerForm.password === registerForm.confirmPassword

  const orderErrors = useMemo(
    () => ({
      recipientName: !orderForm.recipientName.trim(),
      phone: !orderForm.phone.trim(),
      city: !orderForm.city.trim(),
    }),
    [orderForm],
  )
  const hasOrderErrors = Object.values(orderErrors).some(Boolean)

  const handleClose = useCallback(() => {
    setStep('cart')
    setAuthError('')
    setOrderError('')
    setIsAuthSubmitting(false)
    setIsOrderSubmitting(false)
    setOrderTouched(false)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose, isOpen])

  if (!isOpen) {
    return null
  }

  function handleGoToProducts() {
    handleClose()
    window.location.href = getGalleryUrl('order')
  }

  function handleGoHome() {
    handleClose()
    window.location.href = getHomeUrl('order')
  }

  function handleCheckout() {
    if (!hasCartItems) {
      return
    }

    if (user) {
      setOrderForm((currentForm) => ({
        ...currentForm,
        recipientName: currentForm.recipientName || user.name,
      }))
      setOrderBackStep('cart')
      setStep('order')
      return
    }

    setStep('login')
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canLogin || isAuthSubmitting) {
      return
    }

    setAuthError('')
    setIsAuthSubmitting(true)

    try {
      const authenticatedUser = await login({
        email: loginForm.email.trim(),
        password: loginForm.password,
      })

      setOrderForm((currentForm) => ({
        ...currentForm,
        recipientName: currentForm.recipientName || authenticatedUser.name,
      }))
      setOrderBackStep('login')
      setStep('order')
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Не вдалося увійти. Спробуйте ще раз.')
    } finally {
      setIsAuthSubmitting(false)
    }
  }

  function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canRegister || isAuthSubmitting) {
      return
    }

    setAuthError('Реєстрація буде доступна після підключення endpoint бекенду.')
  }

  // PLIS-432: валідація всієї форми перед відправкою
  // PLIS-433: очищення стейту кошика + localStorage після успіху + Toast
  async function handleOrderSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOrderTouched(true)

    if (hasOrderErrors || isOrderSubmitting) {
      return
    }

    setOrderError('')
    setIsOrderSubmitting(true)

    try {
      const { orderNumber: newOrderNumber } = await createOrderApi({
        customerName: orderForm.recipientName,
        phone: `+38${orderForm.phone}`,
        deliveryCity: orderForm.city,
        notes: orderForm.comment || undefined,
      })

      // clearCart() скидає стейт і через useEffect в useShop персистить [] в localStorage
      clearCart()
      setOrderNumber(newOrderNumber)
      setStep('success')
      showToast('Замовлення оформлено успішно!')
    } catch (err) {
      setOrderError(
        err instanceof Error ? err.message : 'Не вдалося оформити замовлення. Спробуйте ще раз.',
      )
    } finally {
      setIsOrderSubmitting(false)
    }
  }

  function setQuantity(productId: string, quantity: number) {
    updateCartQuantity(productId, Math.min(maxCartQuantity, Math.max(1, quantity)))
  }

  return (
    <div className="cart-modal-shell" role="presentation">
      <button
        className="cart-modal-shell__backdrop"
        type="button"
        aria-label="Закрити кошик"
        onClick={handleClose}
      />
      <section
        className="cart-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
      >
        <div className="cart-modal__top">
          <h2 id="cart-modal-title">
            {activeStep === 'cart' ? 'Кошик' : 'Оформлення замовлення'}
          </h2>
          <button
            className="cart-modal__close"
            type="button"
            aria-label="Закрити"
            onClick={handleClose}
          >
            <CloseIcon />
          </button>
        </div>

        {activeStep === 'cart' && (
          hasCartItems ? (
            <CartProductList
              cartLines={cartLines}
              cartTotal={cartTotal}
              onCheckout={handleCheckout}
              onClear={clearCart}
              onDecrease={(productId, quantity) => setQuantity(productId, quantity - 1)}
              onIncrease={(productId, quantity) => setQuantity(productId, quantity + 1)}
              onRemove={removeFromCart}
              onSetQuantity={setQuantity}
            />
          ) : (
            <EmptyCart onGoToProducts={handleGoToProducts} />
          )
        )}

        {activeStep === 'login' && (
          <form className="cart-modal__form" onSubmit={handleLoginSubmit}>
            <p className="cart-modal__subtitle">Увійдіть для оформлення замовлення</p>
            <TextField
              label="Email"
              name="email"
              placeholder="petro@example.com"
              type="email"
              value={loginForm.email}
              onChange={(value) => setLoginForm((form) => ({ ...form, email: value }))}
            />
            <TextField
              label="Пароль"
              name="password"
              placeholder="********"
              type="password"
              value={loginForm.password}
              withVisibilityToggle
              onChange={(value) => setLoginForm((form) => ({ ...form, password: value }))}
            />
            <p className="cart-modal__link-row">
              <span>Забули пароль?</span>
              <button type="button">Відновити пароль</button>
            </p>
            <p className="cart-modal__link-row">
              <span>Ще не маєте профілю?</span>
              <button
                type="button"
                onClick={() => {
                  setAuthError('')
                  setStep('register')
                }}
              >
                Зареєструватися
              </button>
            </p>
            {authError && (
              <p className="cart-modal__form-error" role="alert">
                {authError}
              </p>
            )}
            <ModalActions
              primaryLabel={isAuthSubmitting ? 'Входимо...' : 'Продовжити'}
              secondaryLabel="Повернутися назад"
              primaryDisabled={!canLogin || isAuthSubmitting}
              onSecondary={() => {
                setAuthError('')
                setStep('cart')
              }}
            />
          </form>
        )}

        {activeStep === 'register' && (
          <form className="cart-modal__form" onSubmit={handleRegisterSubmit}>
            <p className="cart-modal__subtitle">Зареєструйтеся для оформлення замовлення</p>
            <TextField
              label="Ім'я"
              name="name"
              placeholder="Олексій Петренко"
              value={registerForm.name}
              onChange={(value) => setRegisterForm((form) => ({ ...form, name: value }))}
            />
            <TextField
              label="Email"
              name="email"
              placeholder="petro@example.com"
              type="email"
              value={registerForm.email}
              onChange={(value) => setRegisterForm((form) => ({ ...form, email: value }))}
            />
            <TextField
              label="Пароль"
              name="password"
              placeholder="********"
              type="password"
              value={registerForm.password}
              withVisibilityToggle
              onChange={(value) => setRegisterForm((form) => ({ ...form, password: value }))}
            />
            <TextField
              label="Повторіть пароль"
              name="confirmPassword"
              placeholder="********"
              type="password"
              value={registerForm.confirmPassword}
              withVisibilityToggle
              error={
                registerForm.confirmPassword.length > 0 && !canRegister
                  ? 'Паролі мають збігатися'
                  : undefined
              }
              onChange={(value) =>
                setRegisterForm((form) => ({ ...form, confirmPassword: value }))
              }
            />
            <p className="cart-modal__link-row">
              <span>Вже маєте профіль?</span>
              <button
                type="button"
                onClick={() => {
                  setAuthError('')
                  setStep('login')
                }}
              >
                Увійти
              </button>
            </p>
            {authError && (
              <p className="cart-modal__form-error" role="alert">
                {authError}
              </p>
            )}
            <ModalActions
              primaryLabel="Продовжити"
              secondaryLabel="Повернутися назад"
              primaryDisabled={!canRegister || isAuthSubmitting}
              onSecondary={() => {
                setAuthError('')
                setStep('cart')
              }}
            />
          </form>
        )}

        {activeStep === 'order' && (
          <form
            className="cart-modal__form cart-modal__form--order"
            onSubmit={handleOrderSubmit}
          >
            <OrderSummary cartLines={cartLines} cartTotal={cartTotal} compact />
            <div className="cart-modal__order-grid">
              <TextField
                label="Ім'я та прізвище отримувача *"
                name="recipientName"
                placeholder="Олексій Петренко"
                value={orderForm.recipientName}
                error={orderTouched && orderErrors.recipientName ? 'Заповніть ім\u2019я' : undefined}
                onChange={(value) => setOrderForm((form) => ({ ...form, recipientName: value }))}
              />
              <TextField
                label="Номер отримувача *"
                name="phone"
                placeholder="0XXXXXXXXX"
                value={orderForm.phone}
                prefix="+38"
                inputMode="numeric"
                error={orderTouched && orderErrors.phone ? 'Заповніть номер' : undefined}
                onChange={(value) =>
                  setOrderForm((form) => ({
                    ...form,
                    phone: value.replace(/\D/g, '').slice(0, 10),
                  }))
                }
              />
              <TextField
                className="cart-modal__field--wide"
                label="Місто доставки *"
                name="city"
                placeholder="Київ"
                value={orderForm.city}
                error={orderTouched && orderErrors.city ? 'Вкажіть місто' : undefined}
                onChange={(value) => setOrderForm((form) => ({ ...form, city: value }))}
              />
              <label className="cart-modal__field cart-modal__field--wide">
                <span>Коментар</span>
                <span className="cart-modal__textarea-wrap">
                  <textarea
                    name="comment"
                    placeholder="Напишіть щось додатково, якщо це необхідно"
                    maxLength={300}
                    value={orderForm.comment}
                    onChange={(event) =>
                      setOrderForm((form) => ({ ...form, comment: event.target.value }))
                    }
                  />
                  <small>{orderForm.comment.length}/300</small>
                </span>
              </label>
            </div>
            {orderError && (
              <p className="cart-modal__form-error" role="alert">
                {orderError}
              </p>
            )}
            <ModalActions
              primaryLabel={isOrderSubmitting ? 'Оформляємо...' : 'Оформити замовлення'}
              secondaryLabel="Повернутися назад"
              primaryDisabled={isOrderSubmitting}
              onSecondary={() => {
                setOrderError('')
                setStep(orderBackStep)
              }}
            />
          </form>
        )}

        {/* PLIS-434: кнопка "Продовжити покупки" → редирект на каталог */}
        {activeStep === 'success' && (
          <div className="cart-modal__success">
            <p>Замовлення №{orderNumber} оформлене успішно!</p>
            <span>Ми зв'яжемося з вами незабаром для уточнення деталей.</span>
            <div className="cart-modal__actions">
              <button className="cart-modal__secondary" type="button" onClick={handleGoHome}>
                На головну
              </button>
              <button
                className="cart-modal__primary"
                type="button"
                onClick={handleGoToProducts}
              >
                Продовжити покупки
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

type CartProductListProps = {
  cartLines: ReturnType<typeof useShop>['cartLines']
  cartTotal: number
  onCheckout: () => void
  onClear: () => void
  onDecrease: (productId: string, quantity: number) => void
  onIncrease: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onSetQuantity: (productId: string, quantity: number) => void
}

function CartProductList({
  cartLines,
  cartTotal,
  onCheckout,
  onClear,
  onDecrease,
  onIncrease,
  onRemove,
  onSetQuantity,
}: CartProductListProps) {
  return (
    <div className="cart-modal__content">
      <p className="cart-modal__muted">Лише для авторизованих користувачів*</p>
      <OrderSummary
        cartLines={cartLines}
        cartTotal={cartTotal}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        onRemove={onRemove}
        onSetQuantity={onSetQuantity}
      />
      <ModalActions
        primaryLabel="Оформити замовлення"
        secondaryLabel="Очистити кошик"
        onPrimary={onCheckout}
        onSecondary={onClear}
      />
    </div>
  )
}

type OrderSummaryProps = {
  cartLines: ReturnType<typeof useShop>['cartLines']
  cartTotal: number
  compact?: boolean
  onDecrease?: (productId: string, quantity: number) => void
  onIncrease?: (productId: string, quantity: number) => void
  onRemove?: (productId: string) => void
  onSetQuantity?: (productId: string, quantity: number) => void
}

function OrderSummary({
  cartLines,
  cartTotal,
  compact,
  onDecrease,
  onIncrease,
  onRemove,
  onSetQuantity,
}: OrderSummaryProps) {
  return (
    <div
      className={
        compact ? 'cart-modal__summary cart-modal__summary--compact' : 'cart-modal__summary'
      }
    >
      {compact && <h3>Замовлення</h3>}
      <div className="cart-modal__items">
        {cartLines.map(({ product, productId, quantity }) => (
          <article className="cart-modal__item" key={productId}>
            <img src={product.image} alt={product.name} />
            <div className="cart-modal__item-name">
              <strong>{product.name}</strong>
              <span>{product.category}</span>
            </div>
            {compact ? (
              <span className="cart-modal__compact-quantity">x{quantity}</span>
            ) : (
              <div className="cart-modal__quantity">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  aria-label={`Зменшити кількість ${product.name}`}
                  onClick={() => onDecrease?.(productId, quantity)}
                >
                  -
                </button>
                <input
                  aria-label={`Кількість ${product.name}`}
                  inputMode="numeric"
                  max={maxCartQuantity}
                  min={1}
                  value={quantity}
                  onChange={(event) =>
                    onSetQuantity?.(productId, Number(event.target.value) || 1)
                  }
                />
                <button
                  type="button"
                  disabled={quantity >= maxCartQuantity}
                  aria-label={`Збільшити кількість ${product.name}`}
                  onClick={() => onIncrease?.(productId, quantity)}
                >
                  +
                </button>
              </div>
            )}
            <strong className="cart-modal__price">{formatPrice(product.price)}</strong>
            {!compact && (
              <button
                className="cart-modal__remove"
                type="button"
                aria-label={`Видалити ${product.name} з кошика`}
                onClick={() => onRemove?.(productId)}
              >
                <TrashIcon />
              </button>
            )}
          </article>
        ))}
      </div>
      <div className="cart-modal__total">
        <strong>{compact ? 'Всього:' : 'Загальна сума замовлення:'}</strong>
        <span>{formatPrice(cartTotal)}</span>
      </div>
    </div>
  )
}

function EmptyCart({ onGoToProducts }: { onGoToProducts: () => void }) {
  return (
    <div className="cart-modal__empty">
      <span className="cart-modal__empty-icon">
        <img src={emptyCartIcon} alt="" aria-hidden="true" />
      </span>
      <p>Кошик поки порожній. Додайте вироби для оформлення замовлення</p>
      <button className="cart-modal__primary" type="button" onClick={onGoToProducts}>
        Перейти до виробів
      </button>
      <ModalActions
        primaryLabel="Оформити замовлення"
        secondaryLabel="Очистити кошик"
        primaryDisabled
        secondaryDisabled
      />
    </div>
  )
}

type ModalActionsProps = {
  primaryLabel: string
  secondaryLabel: string
  primaryDisabled?: boolean
  secondaryDisabled?: boolean
  onPrimary?: () => void
  onSecondary?: () => void
}

function ModalActions({
  primaryLabel,
  secondaryLabel,
  primaryDisabled,
  secondaryDisabled,
  onPrimary,
  onSecondary,
}: ModalActionsProps) {
  return (
    <div className="cart-modal__actions">
      <button
        className="cart-modal__secondary"
        type="button"
        disabled={secondaryDisabled}
        onClick={onSecondary}
      >
        {secondaryLabel}
      </button>
      <button
        className="cart-modal__primary"
        type={onPrimary ? 'button' : 'submit'}
        disabled={primaryDisabled}
        onClick={onPrimary}
      >
        {primaryLabel}
      </button>
    </div>
  )
}

type TextFieldProps = {
  className?: string
  error?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  label: string
  name: string
  placeholder: string
  prefix?: string
  type?: string
  value: string
  withVisibilityToggle?: boolean
  onChange: (value: string) => void
}

function TextField({
  className = '',
  error,
  inputMode,
  label,
  name,
  placeholder,
  prefix,
  type = 'text',
  value,
  withVisibilityToggle,
  onChange,
}: TextFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const resolvedType = withVisibilityToggle && isVisible ? 'text' : type

  return (
    <label className={`cart-modal__field ${className}`} data-invalid={Boolean(error)}>
      <span>{label}</span>
      <span className="cart-modal__input-wrap">
        {prefix && <span className="cart-modal__input-prefix">{prefix}</span>}
        <input
          inputMode={inputMode}
          name={name}
          placeholder={placeholder}
          type={resolvedType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {withVisibilityToggle && (
          <button
            type="button"
            aria-label={isVisible ? 'Сховати пароль' : 'Показати пароль'}
            onClick={() => setIsVisible((currentValue) => !currentValue)}
          >
            <EyeIcon />
          </button>
        )}
      </span>
      {error && <small>{error}</small>}
    </label>
  )
}
