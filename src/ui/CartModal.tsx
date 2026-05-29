import { useState } from "react";
import { useShop } from "../hooks/useShop";
import { useAuth } from "../hooks/useAuth";
import { CloseIcon, TrashIcon } from "../components/icons/UiIcons";
import "./CartModal.scss";
import ImgMinus from "../icons/minus.png";
import ImgPlus from "../icons/plus.png";
import ImgCart from "../icons/Type=Cart.svg";

type Step = "cart" | "login" | "register" | "order" | "success";

type CartModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type OrderForm = {
  name: string;
  phone: string;
  city: string;
  comment: string;
};

type LoginForm = {
  email: string;
  password: string;
  showPassword: boolean;
};

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirm: boolean;
};

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cartItemsResolved, removeFromCart, updateQuantity, clearCart, cartTotalPrice } = useShop();
  const { user, login } = useAuth();

  const [step, setStep] = useState<Step>("cart");
  const [orderNumber] = useState(() => Math.floor(Math.random() * 900) + 100);

  const [orderForm, setOrderForm] = useState<OrderForm>({
    name: user?.name ?? "",
    phone: "",
    city: "",
    comment: "",
  });

  const [orderErrors, setOrderErrors] = useState({ name: "", phone: "", city: "" });
  const [orderTouched, setOrderTouched] = useState({ name: false, phone: false, city: false });

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
    showPassword: false,
  });

  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirm: false,
  });

  if (!isOpen) return null;

  function validateOrderField(field: keyof OrderForm, value: string): string {
    if (field === "name") {
      if (!value) return "Поле обов'язкове";
      if (value.length < 2) return "Мінімум 2 символи";
      return "";
    }
    if (field === "phone") {
      if (!value) return "Поле обов'язкове";
      if (!value.startsWith("0")) return "Починається з 0";
      if (!/^\d+$/.test(value)) return "Тільки цифри";
      if (value.length !== 10) return "10 цифр";
      return "";
    }
    if (field === "city") {
      if (!value) return "Поле обов'язкове";
      if (value.length < 2) return "Мінімум 2 символи";
      return "";
    }
    return "";
  }

  function handleClose() {
    setStep("cart");
    onClose();
  }

  function handleCheckout() {
    if (!user) {
      setStep("login");
    } else {
      setStep("order");
    }
  }

  function handleLogin() {
    login({ id: 1, name: loginForm.email.split("@")[0], email: loginForm.email });
    setOrderForm((f) => ({ ...f, name: loginForm.email.split("@")[0] }));
    setStep("order");
  }

  function handleRegister() {
    login({ id: 2, name: registerForm.name, email: registerForm.email });
    setOrderForm((f) => ({ ...f, name: registerForm.name }));
    setStep("order");
  }

  function handlePlaceOrder() {
    const nameErr = validateOrderField("name", orderForm.name);
    const phoneErr = validateOrderField("phone", orderForm.phone);
    const cityErr = validateOrderField("city", orderForm.city);

    setOrderTouched({ name: true, phone: true, city: true });
    setOrderErrors({ name: nameErr, phone: phoneErr, city: cityErr });

    if (nameErr || phoneErr || cityErr) return;

    clearCart();
    setStep("success");
  }

  return (
    <>
      <div className="cart-modal__backdrop" onClick={handleClose} />
      <div className="cart-modal" data-step={step} role="dialog" aria-modal="true" aria-label="Кошик">

        {step === "cart" && (
          <>
            <div className="cart-modal__header">
              <h2 className="cart-modal__title">Кошик</h2>
              <button className="cart-modal__close" type="button" aria-label="Закрити" onClick={handleClose}>
                <CloseIcon />
              </button>
            </div>

            {cartItemsResolved.length === 0 ? (
              <>
                <div className="cart-modal__empty">
                  <div className="cart-modal__empty-icon-wrap">
                    <img src={ImgCart} alt="" aria-hidden="true" className="cart-modal__empty-icon" />
                  </div>
                  <p>Кошик поки порожній. Додайте вироби для оформлення замовлення</p>
                  <button className="cart-modal__order" type="button" onClick={handleClose}>
                    Перейти до виробів
                  </button>
                </div>
                <div className="cart-modal__actions">
                  <button className="cart-modal__clear" type="button" disabled>Очистити кошик</button>
                  <button className="cart-modal__order" type="button" disabled>Оформити замовлення</button>
                </div>
              </>
            ) : (
              <>
                <p className="cart-modal__auth-note">Лише для авторизованих користувачів*</p>
                <div className="cart-modal__items">
                  {cartItemsResolved.map((item) => (
                    <div className="cart-modal__item" key={item.id}>
                      <img className="cart-modal__item-image" src={item.image} alt={item.name} />
                      <div className="cart-modal__item-info">
                        <p className="cart-modal__item-name">{item.name}</p>
                        <p className="cart-modal__item-category">{item.category}</p>
                      </div>
                      <div className="cart-modal__item-qty">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                          <img src={ImgMinus} alt="minus" className="imgMath" />
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, 10))}>
                          <img src={ImgPlus} alt="plus" className="imgMath" />
                        </button>
                      </div>
                      <p className="cart-modal__item-price">
                        {(item.price).toLocaleString("uk-UA")} грн
                      </p>
                      <button className="cart-modal__item-remove" type="button" aria-label={`Видалити ${item.name}`} onClick={() => removeFromCart(item.id)}>
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-modal__total">
                  <span>Загальна сума замовлення:</span>
                  <strong>{cartTotalPrice.toLocaleString("uk-UA")} грн</strong>
                </div>
                <div className="cart-modal__actions">
                  <button className="cart-modal__clear" type="button" onClick={clearCart}>Очистити кошик</button>
                  <button className="cart-modal__order" type="button" onClick={handleCheckout}>Оформити замовлення</button>
                </div>
              </>
            )}
          </>
        )}

        {step === "login" && (
          <>
            <div className="cart-modal__header">
              <h2 className="cart-modal__title">Оформлення замовлення</h2>
              <button className="cart-modal__close" type="button" aria-label="Закрити" onClick={handleClose}>
                <CloseIcon />
              </button>
            </div>
            <p className="cart-modal__step-subtitle">Увійдіть для оформлення замовлення</p>

            <div className="cart-modal__form">
              <label className="cart-modal__label">
                Email
                <input
                  className="cart-modal__input"
                  type="email"
                  placeholder="petro@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                />
              </label>
              <label className="cart-modal__label">
                Пароль
                <div className="cart-modal__input-wrap">
                  <input
                    className="cart-modal__input"
                    type={loginForm.showPassword ? "text" : "password"}
                    placeholder="********"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="cart-modal__eye"
                    onClick={() => setLoginForm((f) => ({ ...f, showPassword: !f.showPassword }))}
                    aria-label="Показати пароль"
                  >
                    <EyeIcon />
                  </button>
                </div>
              </label>
              <div className="cart-modal__forgot">
                <span>Забули пароль?</span>
                <button type="button" className="cart-modal__link">ВІДНОВИТИ ПАРОЛЬ</button>
              </div>
              <div className="cart-modal__forgot">
                <span>Ще не маєте профілю?</span>
                <button type="button" className="cart-modal__link" onClick={() => setStep("register")}>ЗАРЕЄСТРУВАТИСЯ</button>
              </div>
            </div>

            <div className="cart-modal__actions">
              <button className="cart-modal__clear" type="button" onClick={() => setStep("cart")}>Повернутися назад</button>
              <button className="cart-modal__order" type="button" onClick={handleLogin} disabled={!loginForm.email || !loginForm.password}>
                Продовжити
              </button>
            </div>
          </>
        )}

        {step === "register" && (
          <>
            <div className="cart-modal__header">
              <h2 className="cart-modal__title">Оформлення замовлення</h2>
              <button className="cart-modal__close" type="button" aria-label="Закрити" onClick={handleClose}>
                <CloseIcon />
              </button>
            </div>
            <p className="cart-modal__step-subtitle">Зареєструйтеся для оформлення замовлення</p>

            <div className="cart-modal__form">
              <label className="cart-modal__label">
                Ім'я
                <input
                  className="cart-modal__input"
                  type="text"
                  placeholder="Олексій Петренко"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="cart-modal__label">
                Email
                <input
                  className="cart-modal__input"
                  type="email"
                  placeholder="petro@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                />
              </label>
              <label className="cart-modal__label">
                Пароль
                <div className="cart-modal__input-wrap">
                  <input
                    className="cart-modal__input"
                    type={registerForm.showPassword ? "text" : "password"}
                    placeholder="********"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
                  />
                  <button type="button" className="cart-modal__eye" onClick={() => setRegisterForm((f) => ({ ...f, showPassword: !f.showPassword }))}>
                    <EyeIcon />
                  </button>
                </div>
              </label>
              <label className="cart-modal__label">
                Повторіть пароль
                <div className="cart-modal__input-wrap">
                  <input
                    className="cart-modal__input"
                    type={registerForm.showConfirm ? "text" : "password"}
                    placeholder="********"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  />
                  <button type="button" className="cart-modal__eye" onClick={() => setRegisterForm((f) => ({ ...f, showConfirm: !f.showConfirm }))}>
                    <EyeIcon />
                  </button>
                </div>
              </label>
              <div className="cart-modal__forgot">
                <span>Вже маєте профіль?</span>
                <button type="button" className="cart-modal__link" onClick={() => setStep("login")}>УВІЙТИ</button>
              </div>
            </div>

            <div className="cart-modal__actions">
              <button className="cart-modal__clear" type="button" onClick={() => setStep("login")}>Повернутися назад</button>
              <button
                className="cart-modal__order"
                type="button"
                onClick={handleRegister}
                disabled={!registerForm.name || !registerForm.email || !registerForm.password || registerForm.password !== registerForm.confirmPassword}
              >
                Продовжити
              </button>
            </div>
          </>
        )}

        {step === "order" && (
          <>
            <div className="cart-modal__header">
              <h2 className="cart-modal__title">Оформлення замовлення</h2>
              <button className="cart-modal__close" type="button" aria-label="Закрити" onClick={handleClose}>
                <CloseIcon />
              </button>
            </div>

            <div className="cart-modal__order-summary">
              <p className="cart-modal__order-summary-title">Замовлення</p>
              {cartItemsResolved.map((item) => (
                <div className="cart-modal__order-item" key={item.id}>
                  <img src={item.image} alt={item.name} className="cart-modal__order-item-img" />
                  <div className="cart-modal__order-item-info">
                    <span className="cart-modal__order-item-name">{item.name}</span>
                    <span className="cart-modal__order-item-cat">{item.category}</span>
                  </div>
                  <span className="cart-modal__order-item-qty">x{item.quantity}</span>
                  <span className="cart-modal__order-item-price">{item.price.toLocaleString("uk-UA")} грн</span>
                </div>
              ))}
            </div>

            <div className="cart-modal__order-total">
              <span>Всього:</span>
              <strong>{cartTotalPrice.toLocaleString("uk-UA")} грн</strong>
            </div>

            <div className="cart-modal__form cart-modal__form--order">
              <div className="cart-modal__form-row">
                <label className={`cart-modal__label ${orderTouched.name && orderErrors.name ? "cart-modal__label--error" : ""}`}>
                  Ім'я та прізвище отримувача *
                  <input
                    className={`cart-modal__input ${orderTouched.name && orderErrors.name ? "cart-modal__input--error" : ""}`}
                    type="text"
                    placeholder="Олексій Петренко"
                    value={orderForm.name}
                    onChange={(e) => {
                      setOrderForm((f) => ({ ...f, name: e.target.value }));
                      if (orderTouched.name) setOrderErrors((err) => ({ ...err, name: validateOrderField("name", e.target.value) }));
                    }}
                    onBlur={() => {
                      setOrderTouched((t) => ({ ...t, name: true }));
                      setOrderErrors((err) => ({ ...err, name: validateOrderField("name", orderForm.name) }));
                    }}
                  />
                  {orderTouched.name && orderErrors.name && (
                    <span className="cart-modal__error">{orderErrors.name}</span>
                  )}
                </label>

                <label className={`cart-modal__label ${orderTouched.phone && orderErrors.phone ? "cart-modal__label--error" : ""}`}>
                  Номер отримувача *
                  <div className={`cart-modal__phone-wrap ${orderTouched.phone && orderErrors.phone ? "cart-modal__phone-wrap--error" : ""}`}>
                    <span className="cart-modal__phone-prefix">+38</span>
                    <input
                      className={`cart-modal__input cart-modal__input--phone ${orderTouched.phone && orderErrors.phone ? "cart-modal__input--error" : ""}`}
                      type="tel"
                      placeholder="0XXXXXXXXX"
                      value={orderForm.phone}
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setOrderForm((f) => ({ ...f, phone: value }));
                        if (orderTouched.phone) setOrderErrors((err) => ({ ...err, phone: validateOrderField("phone", value) }));
                      }}
                      onBlur={() => {
                        setOrderTouched((t) => ({ ...t, phone: true }));
                        setOrderErrors((err) => ({ ...err, phone: validateOrderField("phone", orderForm.phone) }));
                      }}
                    />
                  </div>
                  {orderTouched.phone && orderErrors.phone && (
                    <span className="cart-modal__error">{orderErrors.phone}</span>
                  )}
                </label>
              </div>

              <label className={`cart-modal__label ${orderTouched.city && orderErrors.city ? "cart-modal__label--error" : ""}`}>
                Місто доставки *
                <input
                  className={`cart-modal__input ${orderTouched.city && orderErrors.city ? "cart-modal__input--error" : ""}`}
                  type="text"
                  placeholder="Київ"
                  value={orderForm.city}
                  onChange={(e) => {
                    setOrderForm((f) => ({ ...f, city: e.target.value }));
                    if (orderTouched.city) setOrderErrors((err) => ({ ...err, city: validateOrderField("city", e.target.value) }));
                  }}
                  onBlur={() => {
                    setOrderTouched((t) => ({ ...t, city: true }));
                    setOrderErrors((err) => ({ ...err, city: validateOrderField("city", orderForm.city) }));
                  }}
                />
                {orderTouched.city && orderErrors.city && (
                  <span className="cart-modal__error">{orderErrors.city}</span>
                )}
              </label>

              <label className="cart-modal__label">
                Коментар
                <div className="cart-modal__textarea-wrap">
                  <textarea
                    className="cart-modal__textarea"
                    placeholder="Напишіть щось додатково, якщо це необхідно"
                    maxLength={300}
                    rows={2}
                    value={orderForm.comment}
                    onChange={(e) => setOrderForm((f) => ({ ...f, comment: e.target.value }))}
                  />
                  <span className="cart-modal__char-count">{orderForm.comment.length}/300</span>
                </div>
              </label>
            </div>

            <div className="cart-modal__actions">
              <button className="cart-modal__clear" type="button" onClick={() => setStep("cart")}>Повернутися назад</button>
              <button className="cart-modal__order" type="button" onClick={handlePlaceOrder}>
                Оформити замовлення
              </button>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <div className="cart-modal__header">
              <h2 className="cart-modal__title">Оформлення замовлення</h2>
              <button className="cart-modal__close" type="button" aria-label="Закрити" onClick={handleClose}>
                <CloseIcon />
              </button>
            </div>
            <div className="cart-modal__success">
              <h3 className="cart-modal__success-title">Замовлення №{orderNumber} оформлене успішно!</h3>
              <p className="cart-modal__success-text">Ми зв'яжемося з вами незабаром для уточнення деталей.</p>
              <button className="cart-modal__order" type="button" onClick={handleClose}>
                На головну
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}