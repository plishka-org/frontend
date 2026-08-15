import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { changePasswordApi, requestEmailChangeApi } from "../../../services/api/authApi";
import { getAdminSettings, updateAdminSettings } from "../../../services/api/adminContentApi";
import "./adminPersonalDataPage.scss";

type FieldName = "name" | "phone" | "email" | "newPassword" | "repeatPassword";
type Errors = Record<FieldName, string>;
type Touched = Record<FieldName, boolean>;

const EMPTY_ERRORS: Errors = { name: "", phone: "", email: "", newPassword: "", repeatPassword: "" };
const EMPTY_TOUCHED: Touched = { name: false, phone: false, email: false, newPassword: false, repeatPassword: false };
const NAME_PATTERN = /^[a-zA-Zа-яА-ЯіїєґІЇЄҐ]+(?:[- '][a-zA-Zа-яА-ЯіїєґІЇЄҐ]+)*$/;
const EMAIL_PATTERN = /^[^\s@[\]]+@[^\s@[\].]+(?:\.[^\s@[\].]+)+$/;

function EyeIcon({ crossed = false }: { crossed?: boolean }) {
  return crossed ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
  );
}

function AlertIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>;
}

function LogoutIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" /></svg>;
}

function localPhone(phone?: string) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  return digits.startsWith("38") ? digits.slice(2, 12) : digits.slice(0, 10);
}

function validateName(value: string) {
  const normalized = value.trim();
  if (!normalized) return "Поле обов'язкове";
  if (normalized.length < 2) return "Мінімум 2 символи";
  if (normalized.length > 50) return "Максимум 50 символів";
  if (!NAME_PATTERN.test(normalized)) return "Лише літери, пробіли, дефіс та апостроф";
  return "";
}

function validatePhone(value: string) {
  if (!value) return "";
  if (!value.startsWith("0")) return "Номер повинен починатися з 0";
  if (value.length !== 10) return "Номер має бути із 10 цифр";
  return "";
}

function validateEmail(value: string) {
  const normalized = value.trim();
  if (!normalized) return "Поле обов'язкове";
  if (normalized.length < 6) return "Мінімум 6 символів";
  if (normalized.length > 128) return "Максимум 128 символів";
  if (!EMAIL_PATTERN.test(normalized)) return "Невірний формат email";
  return "";
}

function validatePassword(value: string) {
  if (!value) return "";
  if (value.length < 8) return "Мінімум 8 символів";
  if (value.length > 64) return "Максимум 64 символи";
  if (/\s/.test(value)) return "Пароль не може містити пробіли";
  if (!/[A-Z]/.test(value)) return "Додайте щонайменше одну велику латинську літеру";
  if (!/[a-z]/.test(value)) return "Додайте щонайменше одну малу латинську літеру";
  if (!/\d/.test(value)) return "Додайте щонайменше одну цифру";
  return "";
}

function validateAll(name: string, phone: string, email: string, password: string, repeat: string, validatePasswordFields = false): Errors {
  return {
    name: validateName(name),
    phone: validatePhone(phone),
    email: validateEmail(email),
    newPassword: validatePassword(password) || (validatePasswordFields && !password ? "Щоб змінити пароль, введіть новий пароль" : ""),
    repeatPassword: validatePasswordFields && (!password || password !== repeat) ? "Паролі мають збігатися, повторіть новий пароль" : "",
  };
}

export function AdminPersonalDataPage() {
  const { user, logout, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(() => localPhone(user?.phone));
  const [email, setEmail] = useState(user?.email ?? "");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [savedNotificationEmail, setSavedNotificationEmail] = useState("");
  const [shopMode, setShopMode] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [notificationEmailTouched, setNotificationEmailTouched] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [touched, setTouched] = useState<Touched>(EMPTY_TOUCHED);
  const [errors, setErrors] = useState<Errors>(EMPTY_ERRORS);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState<string | null>(null);

  const initialName = user?.name ?? "";
  const initialPhone = localPhone(user?.phone);
  const initialEmail = user?.email ?? "";
  const notificationEmailError = notificationEmailTouched ? validateEmail(notificationEmail) : "";
  const hasChanges = name.trim() !== initialName || phone !== initialPhone || email.trim() !== initialEmail || notificationEmail.trim() !== savedNotificationEmail || Boolean(newPassword || repeatPassword);
  const needsConfirmation = email.trim() !== initialEmail || Boolean(newPassword);

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(localPhone(user?.phone));
    setEmail(user?.email ?? "");
  }, [user]);

  useEffect(() => {
    const demoMode = import.meta.env.DEV && import.meta.env.VITE_ADMIN_DEMO_MODE === "true";
    if (demoMode) {
      const demoEmail = user?.email ?? "admin@plishka.com.ua";
      setNotificationEmail(demoEmail);
      setSavedNotificationEmail(demoEmail);
      setShopMode(true);
      setSettingsLoaded(true);
      return;
    }
    let cancelled = false;
    getAdminSettings()
      .then((settings) => {
        if (cancelled) return;
        setNotificationEmail(settings.adminEmail);
        setSavedNotificationEmail(settings.adminEmail);
        setShopMode(settings.isShopModeEnabled);
        setSettingsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setMessage({ kind: "error", text: "Не вдалося завантажити email для сповіщень." });
      });
    return () => { cancelled = true; };
  }, [user?.email]);

  function changeField(field: FieldName, value: string) {
    if (field === "name") setName(value);
    if (field === "phone") setPhone(value.replace(/\D/g, "").slice(0, 10));
    if (field === "email") setEmail(value);
    if (field === "newPassword") setNewPassword(value);
    if (field === "repeatPassword") setRepeatPassword(value);
    setMessage(null);

    if (touched[field] || (field === "newPassword" && touched.repeatPassword)) {
      const nextName = field === "name" ? value : name;
      const nextPhone = field === "phone" ? value.replace(/\D/g, "").slice(0, 10) : phone;
      const nextEmail = field === "email" ? value : email;
      const nextPassword = field === "newPassword" ? value : newPassword;
      const nextRepeat = field === "repeatPassword" ? value : repeatPassword;
      setErrors(validateAll(nextName, nextPhone, nextEmail, nextPassword, nextRepeat, touched.newPassword || touched.repeatPassword));
    }
  }

  function blurField(field: FieldName) {
    setTouched((state) => ({ ...state, [field]: true }));
    setErrors(validateAll(name, phone, email, newPassword, repeatPassword, field === "newPassword" || field === "repeatPassword" || touched.newPassword || touched.repeatPassword));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateAll(name, phone, email, newPassword, repeatPassword, Boolean(newPassword || repeatPassword));
    const nextNotificationEmailError = validateEmail(notificationEmail);
    setTouched({ name: true, phone: true, email: true, newPassword: Boolean(newPassword), repeatPassword: Boolean(newPassword || repeatPassword) });
    setNotificationEmailTouched(true);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean) || nextNotificationEmailError || !hasChanges || !settingsLoaded) return;
    if (needsConfirmation) {
      setCurrentPassword("");
      setIsPasswordDialogOpen(true);
      return;
    }
    void saveChanges("");
  }

  async function saveChanges(password: string) {
    const profileChanged = name.trim() !== initialName || phone !== initialPhone;
    const emailChanged = email.trim() !== initialEmail;
    const notificationEmailChanged = notificationEmail.trim() !== savedNotificationEmail;
    const passwordChanged = Boolean(newPassword);
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (profileChanged) await updateProfile({ name: name.trim(), phone: phone ? `+38${phone}` : undefined });
      if (notificationEmailChanged) {
        const settings = await updateAdminSettings({ isShopModeEnabled: shopMode, adminEmail: notificationEmail.trim() });
        setNotificationEmail(settings.adminEmail);
        setSavedNotificationEmail(settings.adminEmail);
        setShopMode(settings.isShopModeEnabled);
      }
      if (emailChanged) await requestEmailChangeApi({ newEmail: email.trim(), currentPassword: password });
      if (passwordChanged) {
        await changePasswordApi({ currentPassword: password, newPassword, confirmPassword: repeatPassword });
        setIsPasswordDialogOpen(false);
        window.location.hash = "#/login";
        return;
      }
      setIsPasswordDialogOpen(false);
      if (emailChanged) {
        setEmailConfirmation(email.trim());
        setEmail(initialEmail);
      }
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
      setTouched(EMPTY_TOUCHED);
      setNotificationEmailTouched(false);
      if (!emailChanged) setMessage({ kind: "success", text: "Зміни збережено." });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Не вдалося зберегти зміни." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    await logout();
    window.location.hash = "#/login";
  }

  const fieldError = (field: FieldName) => touched[field] ? errors[field] : "";

  return (
    <section className="admin-personal-data">
      <h1 className="admin-personal-data__title">Особисті дані</h1>
      <form className="admin-personal-data__card" onSubmit={handleSubmit} noValidate>
        <h2 className="admin-personal-data__subtitle">Мої дані</h2>
        {message && <div className={`admin-personal-data__notice admin-personal-data__notice--${message.kind}`} role={message.kind === "error" ? "alert" : "status"}>{message.text}</div>}

        <div className="admin-personal-data__profile-grid">
          <Field id="admin-name" label="Ім’я" error={fieldError("name")}>
            <input id="admin-name" autoComplete="name" value={name} disabled={isSubmitting} onChange={(event) => changeField("name", event.target.value)} onBlur={() => blurField("name")} />
          </Field>
          <Field id="admin-phone" label="Телефон" error={fieldError("phone")}>
            <div className={`admin-personal-data__phone${fieldError("phone") ? " is-error" : ""}`}>
              <span>+38</span>
              <input id="admin-phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="0506767677" value={phone} disabled={isSubmitting} onChange={(event) => changeField("phone", event.target.value)} onBlur={() => blurField("phone")} />
            </div>
          </Field>
          <Field id="admin-email" label="Email" error={fieldError("email")}>
            <input id="admin-email" type="email" autoComplete="email" value={email} disabled={isSubmitting} onChange={(event) => changeField("email", event.target.value)} onBlur={() => blurField("email")} />
          </Field>
          <Field id="admin-notification-email" label="Email для сповіщень" error={notificationEmailError}>
            <input id="admin-notification-email" type="email" autoComplete="email" value={notificationEmail} disabled={isSubmitting || !settingsLoaded} onChange={(event) => { setNotificationEmail(event.target.value); setMessage(null); }} onBlur={() => setNotificationEmailTouched(true)} />
          </Field>
        </div>

        <div className="admin-personal-data__password-grid">
          <Field id="admin-new-password" label="Новий пароль" error={fieldError("newPassword")}>
            <PasswordInput id="admin-new-password" placeholder="Введіть новий пароль" value={newPassword} show={showNewPassword} disabled={isSubmitting} hasError={Boolean(fieldError("newPassword"))} onToggle={() => setShowNewPassword((value) => !value)} onChange={(value) => changeField("newPassword", value)} onBlur={() => blurField("newPassword")} />
          </Field>
          <Field id="admin-repeat-password" label="Повторити пароль" error={fieldError("repeatPassword")}>
            <PasswordInput id="admin-repeat-password" placeholder="Повторіть новий пароль" value={repeatPassword} show={showRepeatPassword} disabled={isSubmitting} hasError={Boolean(fieldError("repeatPassword"))} onToggle={() => setShowRepeatPassword((value) => !value)} onChange={(value) => changeField("repeatPassword", value)} onBlur={() => blurField("repeatPassword")} />
          </Field>
        </div>

        <div className="admin-personal-data__actions">
          <button className="admin-personal-data__submit" type="submit" disabled={!hasChanges || isSubmitting || !settingsLoaded}>{isSubmitting ? "Збереження…" : "Підтвердити зміни"}</button>
          <button className="admin-personal-data__logout" type="button" disabled={isSubmitting} onClick={() => void handleLogout()}><LogoutIcon />Вийти з акаунта</button>
        </div>
      </form>

      {isPasswordDialogOpen && (
        <div className="admin-personal-data__dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsPasswordDialogOpen(false)}>
          <div className="admin-personal-data__dialog" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
            <button className="admin-personal-data__dialog-close" type="button" aria-label="Закрити" onClick={() => setIsPasswordDialogOpen(false)}>×</button>
            <h2 id="admin-confirm-title">Підтвердіть зміни</h2>
            <p>Введіть поточний пароль для зміни email або пароля.</p>
            <label htmlFor="admin-current-password">Поточний пароль</label>
            <PasswordInput id="admin-current-password" placeholder="Введіть поточний пароль" value={currentPassword} show={showCurrentPassword} disabled={isSubmitting} hasError={Boolean(message?.kind === "error")} onToggle={() => setShowCurrentPassword((value) => !value)} onChange={(value) => { setCurrentPassword(value); setMessage(null); }} />
            {message?.kind === "error" && <span className="admin-personal-data__dialog-error" role="alert">{message.text}</span>}
            <button className="admin-personal-data__dialog-submit" type="button" disabled={!currentPassword || isSubmitting} onClick={() => void saveChanges(currentPassword)}>{isSubmitting ? "Збереження…" : "Підтвердити"}</button>
          </div>
        </div>
      )}

      {emailConfirmation && (
        <div className="admin-personal-data__dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEmailConfirmation(null)}>
          <div className="admin-personal-data__dialog admin-personal-data__dialog--email" role="dialog" aria-modal="true" aria-labelledby="admin-email-confirmation-title">
            <button className="admin-personal-data__dialog-close" type="button" aria-label="Закрити" onClick={() => setEmailConfirmation(null)}>×</button>
            <h2 id="admin-email-confirmation-title">Зміна пошти</h2>
            <p>На вказану електронну пошту <strong>{emailConfirmation}</strong> відправлено посилання для підтвердження. Перейдіть за посиланням, щоб підтвердити електронну пошту.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error: string; children: React.ReactNode }) {
  return <div className={`admin-personal-data__field${error ? " is-error" : ""}`}><label htmlFor={id}>{label}</label>{children}{error && <span className="admin-personal-data__field-error" role="alert"><AlertIcon />{error}</span>}</div>;
}

function PasswordInput({ id, placeholder, value, show, disabled, hasError, onToggle, onChange, onBlur }: { id: string; placeholder: string; value: string; show: boolean; disabled: boolean; hasError: boolean; onToggle: () => void; onChange: (value: string) => void; onBlur?: () => void }) {
  return <div className={`admin-personal-data__password${hasError ? " is-error" : ""}`}><input id={id} type={show ? "text" : "password"} autoComplete={id.includes("current") ? "current-password" : "new-password"} placeholder={placeholder} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} /><button type="button" aria-label={show ? "Приховати пароль" : "Показати пароль"} onClick={onToggle}><EyeIcon crossed={show} /></button></div>;
}
