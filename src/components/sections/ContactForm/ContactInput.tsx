import type { InputHTMLAttributes } from "react";

type ContactInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label: string;
};

export function ContactInput({
  className = "",
  error,
  id,
  label,
  ...inputProps
}: ContactInputProps) {
  const errorId = error && id ? `${id}-error` : undefined;
  const inputClassName = [
    "contact-form__input",
    error ? "contact-form__input--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="contact-form__field">
      {id && (
        <label className="contact-form__label" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        {...inputProps}
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={inputClassName}
        id={id}
      />
      {error && (
        <span className="contact-form__error" id={errorId}>
          {error}
        </span>
      )}
    </div>
  );
}
