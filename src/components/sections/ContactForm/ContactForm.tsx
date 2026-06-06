import { useState } from "react";
import { IMaskInput } from "react-imask";
import contactImage from "../../../icons/contact-form-image.png";
import { useAuth } from "../../../hooks/useAuth";
import { createContactRequest } from "../../../services/api/contactRequestsApi";
import "../../../styles/sections/_contact-form.scss";
import { ContactInput } from "./ContactInput";

const ContactForm = () => {
  const { isAuthChecked, user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameTouched, setNameTouched] = useState(false);

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);

  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const isFormDisabled = !isAuthChecked || !user;

  const validateName = (value: string): string => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return "Поле обов'язкове";
    if (trimmedValue.length < 2) return "Мінімум 2 символи";
    if (trimmedValue.length > 50) return "Максимум 50 символів";
    if (!/^[a-zA-Zа-яА-ЯіїєґІЇЄҐ\s\-']+$/.test(trimmedValue))
      return "Лише літери, дефіс та апостроф";
    return "";
  };

  const validatePhone = (value: string): string => {
    if (!value) return "Поле обов'язкове";
    if (!value.startsWith("0")) return 'Номер повинен починатися з "0"';
    if (!/^\d+$/.test(value)) return "Тільки цифри";
    if (value.length !== 10) return "Номер має бути із 10 цифр";
    return "";
  };

  const validateDescription = (value: string): string => {
    if (!value) return "Введіть, будь ласка, ваш запит";
    if (value.length > 300) return "Максимум 300 символів";
    return "";
  };

  const isFormValid =
    !validateName(name) &&
    !validatePhone(phone) &&
    !validateDescription(description);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFormDisabled) return;

    const value = e.target.value;
    setName(value);
    if (nameTouched) setNameError(validateName(value));
  };

  const handlePhoneAccept = (value: string) => {
    if (isFormDisabled) return;

    const nextPhone = value.replace(/\D/g, "").slice(0, 10);
    setPhone(nextPhone);
    if (phoneTouched) setPhoneError(validatePhone(nextPhone));
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    if (isFormDisabled) return;

    const value = e.target.value;
    if (value.length <= 300) setDescription(value);
    if (descriptionTouched) setDescriptionError(validateDescription(value));
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setDescription("");
    setNameTouched(false);
    setPhoneTouched(false);
    setDescriptionTouched(false);
    setNameError("");
    setPhoneError("");
    setDescriptionError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormDisabled) return;

    setSubmitError("");

    const trimmedName = name.trim();
    const nextNameError = validateName(trimmedName);
    const nextPhoneError = validatePhone(phone);
    const nextDescriptionError = validateDescription(description);

    setNameTouched(true);
    setPhoneTouched(true);
    setDescriptionTouched(true);
    setNameError(nextNameError);
    setPhoneError(nextPhoneError);
    setDescriptionError(nextDescriptionError);

    if (nextNameError || nextPhoneError || nextDescriptionError) return;

    setIsSubmitting(true);

    try {
      await createContactRequest({
        name: trimmedName,
        phone: `+38${phone}`,
        description,
      });
      resetForm();
      setIsSubmitted(true);
    } catch {
      setSubmitError("Не вдалося відправити заявку. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmitError("");
    resetForm();
  };

  return (
    <section className="contact-form-section">
      <div className="contact-form__inner">
        <div className="contact-form__wrapper">
          <h2 className="contact-form__title">Контактна форма</h2>
          <p className="contact-form__subtitle">Лише для авторизованих</p>
          {isSubmitted && !isFormDisabled ? (
            <div className="contact-form__success">
              <h3 className="contact-form__success-title">Заявку надіслано!</h3>
              <p className="contact-form__success-text">
                Ми зв'яжемося з вами найближчим часом. Заявку збережено в історії.
              </p>
              <button className="contact-form__button" onClick={handleReset}>
                Надіслати ще
              </button>
            </div>
          ) : (
            <form
              className={
                isFormDisabled
                  ? "contact-form contact-form--disabled"
                  : "contact-form"
              }
              onSubmit={handleSubmit}
            >
                <div className="contact-form__row">
                  <ContactInput
                    id="name"
                    type="text"
                    autoComplete="name"
                    error={nameTouched ? nameError : ""}
                    label="Ім'я"
                    value={name}
                    placeholder="Ваше ім'я"
                    disabled={isFormDisabled}
                    onChange={handleNameChange}
                    onBlur={() => {
                      if (isFormDisabled) return;
                      setNameTouched(true);
                      setNameError(validateName(name));
                    }}
                  />
                  {/* Телефон */}
                  <div className="contact-form__field">
                    <label className="contact-form__label" htmlFor="phone">
                      Телефон *
                    </label>
                    <div className="contact-form__phone-wrapper">
                      <span className="contact-form__prefix">+38</span>
                      <IMaskInput
                        id="phone"
                        autoComplete="tel-national"
                        className={`contact-form__input ${phoneTouched && phoneError ? "contact-form__input--error" : ""}`}
                        mask="000 000 00 00"
                        unmask={true}
                        value={phone}
                        placeholder="0XX XXX XX XX"
                        disabled={isFormDisabled}
                        onAccept={(value) => handlePhoneAccept(String(value))}
                        onBlur={() => {
                          if (isFormDisabled) return;
                          setPhoneTouched(true);
                          setPhoneError(validatePhone(phone));
                        }}
                        aria-describedby={phoneTouched && phoneError ? "phone-error" : undefined}
                        aria-invalid={Boolean(phoneTouched && phoneError)}
                      />
                    </div>
                    {phoneTouched && phoneError && (
                      <span className="contact-form__error" id="phone-error">
                        {phoneError}
                      </span>
                    )}
                  </div>
                </div>
                {/* Причина дзвінка */}
                <div className="contact-form__field">
                  <label className="contact-form__label" htmlFor="description">
                    Причина дзвінка *
                  </label>
                  <div className="contact-form__textarea-wrapper">
                    <textarea
                      id="description"
                      autoComplete="off"
                      value={description}
                      placeholder="Коротко опишіть ваше питання або що вас цікавить..."
                      disabled={isFormDisabled}
                      onChange={handleDescriptionChange}
                      onBlur={() => {
                        if (isFormDisabled) return;
                        setDescriptionTouched(true);
                        setDescriptionError(validateDescription(description));
                      }}
                      className={`contact-form__textarea ${descriptionTouched && descriptionError ? "contact-form__input--error" : ""}`}
                    />
                    <span className="contact-form__counter">
                      символів: {description.length}/300
                    </span>
                  </div>
                  {descriptionTouched && descriptionError && (
                    <span className="contact-form__error">{descriptionError}</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isFormDisabled || !isFormValid || isSubmitting}
                  className="contact-form__button"
                >
                  {isSubmitting ? "Відправляємо..." : "Відправити заявку"}
                </button>
                {submitError && (
                  <span className="contact-form__error">{submitError}</span>
                )}
            </form>
          )}
        </div>
        <div className="contact-form__image-wrapper">
          <img src={contactImage} alt="Контактна форма" />
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
