import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { ForgotPasswordPage } from "../ForgotPasswordPage/ForgotPasswordPage";
import "./LoginPage.scss";

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

function validateEmail(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Поле обов'язкове";
  if (trimmed.length < 6) return "Мінімум 6 символів";
  if (trimmed.length > 128) return "Максимум 128 символів";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Невірний формат email";
  return "";
}

function validatePassword(value: string): string {
  if (!value) return "Поле обов'язкове";
  if (value.length < 8) return "Мінімум 8 символів";
  if (value.length > 64) return "Максимум 64 символи";
  return "";
}

type LoginPageProps = {
  onClose?: () => void;
  onSuccess?: () => void;
  onRegister?: () => void;
};

export function LoginPage({ onClose, onSuccess, onRegister }: LoginPageProps) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);

    setEmailTouched(true);
    setPasswordTouched(true);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) return;

    setGlobalError(null);
    setIsLoading(true);

    try {
      const loggedUser = await login({ email: email.trim(), password });
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.hash =
          loggedUser.role === "admin" ? "#/admin/products" : "#/account";
      }
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : "Невірний логін або пароль",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  }

  function handleRegisterClick(e: React.MouseEvent) {
    if (onRegister) {
      e.preventDefault();
      onRegister();
    }
  }

  const showEmailError = emailTouched && emailError;
  const showPasswordError = passwordTouched && passwordError;

  if (isForgotPasswordOpen) {
    return (
      <ForgotPasswordPage onClose={() => setIsForgotPasswordOpen(false)} />
    );
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <button
          className="login-page__close"
          type="button"
          aria-label="Закрити"
          onClick={handleClose}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h1 className="login-page__title">Вхід до системи</h1>

        {globalError && (
          <div className="login-page__global-error" role="alert">
            {globalError}
          </div>
        )}

        <form className="login-page__form" onSubmit={handleSubmit} noValidate>
          <div className="login-page__field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="petro@example.com"
              value={email}
              disabled={isLoading}
              className={showEmailError ? "is-error" : ""}
              aria-invalid={Boolean(showEmailError)}
              aria-describedby={showEmailError ? "login-email-error" : undefined}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailTouched) setEmailError(validateEmail(e.target.value));
              }}
              onBlur={(e) => {
                setEmailTouched(true);
                setEmailError(validateEmail(e.target.value));
              }}
            />
            {showEmailError && (
              <span className="login-page__field-error" id="login-email-error" role="alert">
                <AlertIcon />
                {emailError}
              </span>
            )}
          </div>

          <div className="login-page__field">
            <label htmlFor="login-password">Пароль</label>
            <div className="login-page__password-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="********"
                value={password}
                disabled={isLoading}
                className={showPasswordError ? "is-error" : ""}
                aria-invalid={Boolean(showPasswordError)}
                aria-describedby={showPasswordError ? "login-password-error" : undefined}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordTouched) setPasswordError(validatePassword(e.target.value));
                }}
                onBlur={(e) => {
                  setPasswordTouched(true);
                  setPasswordError(validatePassword(e.target.value));
                }}
              />
              <button
                className="login-page__password-toggle"
                type="button"
                aria-label={showPassword ? "Приховати пароль" : "Показати пароль"}
                tabIndex={-1}
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {showPasswordError && (
              <span className="login-page__field-error" id="login-password-error" role="alert">
                <AlertIcon />
                {passwordError}
              </span>
            )}
          </div>

          <div className="login-page__links">
            <span className="login-page__links-group">
              Забули пароль?{" "}
              <button
                type="button"
                className="login-page__link login-page__link--accent"
                onClick={() => setIsForgotPasswordOpen(true)}
                style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
              >
                ВІДНОВИТИ ПАРОЛЬ
              </button>
            </span>
            <span className="login-page__links-group">
              Ще не маєте профілю?{" "}
              <a
                href="#/register"
                className="login-page__link login-page__link--accent"
                onClick={handleRegisterClick}
              >
                ЗАРЕЄСТРУВАТИСЯ
              </a>
            </span>
          </div>

          <button className="login-page__submit" type="submit" disabled={isLoading}>
            {isLoading ? "Завантаження..." : "УВІЙТИ"}
          </button>
        </form>
      </div>
    </div>
  );
}