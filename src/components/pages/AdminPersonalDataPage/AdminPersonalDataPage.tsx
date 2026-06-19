import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { changePasswordApi, requestEmailChangeApi } from "../../../services/api/authApi";
import "./adminPersonalDataPage.scss";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function LogoutArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9" />
      <path d="M16 17L21 12L16 7" />
      <path d="M21 12H9" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function validateName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Поле обов'язкове";
  if (trimmed.length < 2) return "Мінімум 2 символи";
  if (trimmed.length > 50) return "Максимум 50 символів";
  if (!/^[A-Za-zА-ЯЇІЄҐа-яїієґ'\- ]+$/.test(trimmed)) {
    return "Допускаються лише літери, пробіл, дефіс та апостроф";
  }
  return "";
}

function validateEmail(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Поле обов'язкове";
  if (trimmed.length < 6) return "Мінімум 6 символів";
  if (trimmed.length > 128) return "Максимум 128 символів";
  if (!/^[^\s@]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(trimmed)) {
    return "Невірний формат email";
  }
  return "";
}

function validatePhone(value: string): string {
  if (!value) return "";
  if (!value.startsWith("0")) return 'Номер повинен починатися з "0"';
  if (!/^\d+$/.test(value)) return "Тільки цифри";
  if (value.length !== 10) return "Номер має бути із 10 цифр";
  return "";
}

function validatePassword(value: string, repeatValue: string): string {
  if (!value && !repeatValue) return "";
  if (!value) return "Щоб змінити пароль, введіть новий пароль";
  if (value.length < 8) return "Мінімум 8 символів";
  if (value.length > 64) return "Максимум 64 символи";
  if (!/[A-ZА-ЯЇІЄҐ]/.test(value)) return "Потрібна хоча б одна велика літера";
  if (!/[a-zа-яїієґ]/.test(value)) return "Потрібна хоча б одна мала літера";
  if (!/[0-9]/.test(value)) return "Потрібна хоча б одна цифра";
  if (!/[^A-Za-zА-Яа-яЇїІіЄєҐґ0-9]/.test(value)) return "Потрібен хоча б один спецсимвол";
  return "";
}

function validateConfirm(value: string, pw: string): string {
  if (!pw) return "";
  if (!value || value !== pw) return "Паролі мають збігатися, повторіть новий пароль";
  return "";
}

export function AdminPersonalDataPage() {
  const { user, logout } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [nameTouched, setNameTouched] = useState(false);
  const [nameError, setNameError] = useState("");

  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const [email, setEmail] = useState(user?.email ?? "");
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [repeatPassword, setRepeatPassword] = useState("");
  const [repeatPasswordTouched, setRepeatPasswordTouched] = useState(false);
  const [repeatPasswordError, setRepeatPasswordError] = useState("");
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [changedEmail, setChangedEmail] = useState("");

  const hasChanges =
    name !== (user?.name ?? "") ||
    email !== (user?.email ?? "") ||
    phone !== "" ||
    newPassword !== "" ||
    repeatPassword !== "";

  async function handleLogout() {
    await logout();
    window.location.hash = "#/login";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const phErr = phone ? validatePhone(phone) : "";
    const pwErr = validatePassword(newPassword, repeatPassword);
    const cErr = validateConfirm(repeatPassword, newPassword);

    setNameTouched(true);
    setEmailTouched(true);
    setPhoneTouched(Boolean(phone));
    setNewPasswordTouched(Boolean(newPassword) || Boolean(repeatPassword));
    setRepeatPasswordTouched(Boolean(newPassword) || Boolean(repeatPassword));

    setNameError(nErr);
    setEmailError(eErr);
    setPhoneError(phErr);
    setNewPasswordError(pwErr);
    setRepeatPasswordError(cErr);

    if (nErr || eErr || phErr || pwErr || cErr) return;

    setGlobalError(null);
    setGlobalSuccess(null);
    setIsSubmitting(true);

    try {
      const isEmailChanged = email !== (user?.email ?? "");

      if (isEmailChanged) {
        await requestEmailChangeApi({ email: email.trim() });
      }
      if (newPassword) {
        await changePasswordApi({ newPassword });
      }

      if (isEmailChanged) {
        setChangedEmail(email.trim());
        setShowEmailChangeModal(true);
      } else {
        setGlobalSuccess("Зміни збережено.");
      }

      setNewPassword("");
      setRepeatPassword("");
      setNewPasswordTouched(false);
      setRepeatPasswordTouched(false);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Сталася помилка. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-personal-data">
      <h1 className="admin-personal-data__title">Особисті дані</h1>

      <form className="admin-personal-data__card" onSubmit={handleSubmit} noValidate>
        <h2 className="admin-personal-data__subtitle">Мої дані</h2>

        {globalError && (
          <div className="admin-personal-data__global-error" role="alert">{globalError}</div>
        )}
        {globalSuccess && (
          <div className="admin-personal-data__global-success" role="status">{globalSuccess}</div>
        )}

        <div className="admin-personal-data__row">
          <label className={`admin-personal-data__field${nameTouched && nameError ? " is-error" : ""}`}>
            <span>Ім'я</span>
            <input
              type="text"
              value={name}
              disabled={isSubmitting}
              className={nameTouched && nameError ? "is-error" : ""}
              aria-invalid={Boolean(nameTouched && nameError)}
              onChange={(e) => {
                setName(e.target.value);
                if (nameTouched) setNameError(validateName(e.target.value));
              }}
              onBlur={() => {
                setNameTouched(true);
                setNameError(validateName(name));
              }}
            />
            {nameTouched && nameError && (
              <span className="admin-personal-data__field-error" role="alert">
                <AlertIcon />{nameError}
              </span>
            )}
          </label>

          <label className={`admin-personal-data__field${phoneTouched && phoneError ? " is-error" : ""}`}>
            <span>Телефон</span>
            <div className={`admin-personal-data__phone${phoneTouched && phoneError ? " is-error" : ""}`}>
              <span className="admin-personal-data__phone-prefix">+38</span>
              <input
                type="tel"
                value={phone}
                disabled={isSubmitting}
                placeholder="0506767677"
                onChange={(e) => {
                  const next = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(next);
                  if (phoneTouched) setPhoneError(validatePhone(next));
                }}
                onBlur={() => {
                  if (!phone) return;
                  setPhoneTouched(true);
                  setPhoneError(validatePhone(phone));
                }}
              />
            </div>
            {phoneTouched && phoneError && (
              <span className="admin-personal-data__field-error" role="alert">
                <AlertIcon />{phoneError}
              </span>
            )}
          </label>

          <label className={`admin-personal-data__field${emailTouched && emailError ? " is-error" : ""}`}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              disabled={isSubmitting}
              className={emailTouched && emailError ? "is-error" : ""}
              aria-invalid={Boolean(emailTouched && emailError)}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailTouched) setEmailError(validateEmail(e.target.value));
              }}
              onBlur={() => {
                setEmailTouched(true);
                setEmailError(validateEmail(email));
              }}
            />
            {emailTouched && emailError && (
              <span className="admin-personal-data__field-error" role="alert">
                <AlertIcon />{emailError}
              </span>
            )}
          </label>
        </div>

        <div className="admin-personal-data__row">
          <label className={`admin-personal-data__field${newPasswordTouched && newPasswordError ? " is-error" : ""}`}>
            <span>Новий пароль</span>
            <div className="admin-personal-data__password">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Введіть новий пароль"
                value={newPassword}
                disabled={isSubmitting}
                className={newPasswordTouched && newPasswordError ? "is-error" : ""}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordTouched) {
                    setNewPasswordError(validatePassword(e.target.value, repeatPassword));
                  }
                  if (repeatPasswordTouched) {
                    setRepeatPasswordError(validateConfirm(repeatPassword, e.target.value));
                  }
                }}
                onBlur={() => {
                  setNewPasswordTouched(true);
                  setNewPasswordError(validatePassword(newPassword, repeatPassword));
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                aria-label="Показати пароль"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {newPasswordTouched && newPasswordError && (
              <span className="admin-personal-data__field-error" role="alert">
                <AlertIcon />{newPasswordError}
              </span>
            )}
          </label>

          <label className={`admin-personal-data__field${repeatPasswordTouched && repeatPasswordError ? " is-error" : ""}`}>
            <span>Повторити пароль</span>
            <div className="admin-personal-data__password">
              <input
                type={showRepeatPassword ? "text" : "password"}
                placeholder="Повторіть новий пароль"
                value={repeatPassword}
                disabled={isSubmitting}
                className={repeatPasswordTouched && repeatPasswordError ? "is-error" : ""}
                onChange={(e) => {
                  setRepeatPassword(e.target.value);
                  if (repeatPasswordTouched) {
                    setRepeatPasswordError(validateConfirm(e.target.value, newPassword));
                  }
                }}
                onBlur={() => {
                  setRepeatPasswordTouched(true);
                  setRepeatPasswordError(validateConfirm(repeatPassword, newPassword));
                }}
              />
              <button
                type="button"
                onClick={() => setShowRepeatPassword((v) => !v)}
                aria-label="Показати пароль"
                tabIndex={-1}
              >
                {showRepeatPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {repeatPasswordTouched && repeatPasswordError && (
              <span className="admin-personal-data__field-error" role="alert">
                <AlertIcon />{repeatPasswordError}
              </span>
            )}
          </label>
        </div>

        <button
          type="submit"
          className="admin-personal-data__submit"
          disabled={!hasChanges || isSubmitting}
        >
          {isSubmitting ? "Збереження..." : "Підтвердити зміни"}
        </button>

        <button
          type="button"
          className="admin-personal-data__logout"
          onClick={handleLogout}
        >
          <LogoutArrowIcon />
          <span>Вийти з акаунта</span>
        </button>
      </form>

      {showEmailChangeModal && (
        <div className="email-change-modal">
          <div className="email-change-modal__card">
            <button
              type="button"
              className="email-change-modal__close"
              aria-label="Закрити"
              onClick={() => setShowEmailChangeModal(false)}
            >
              <CloseIcon />
            </button>
            <h2 className="email-change-modal__title">Зміна пошти</h2>
            <p className="email-change-modal__text">
              На вказану електронну пошту <strong>{changedEmail}</strong> відправлено
              посилання для підтвердження. Перейдіть за посиланням, щоб підтвердити
              електронну пошту.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}