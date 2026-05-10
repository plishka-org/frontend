import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import contactImage from "../../../icons/contact-form-image.png";
import "../../../styles/sections/_contact-form.scss";

const ContactForm = () => {
  const { user } = useAuth();

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameTouched, setNameTouched] = useState(false);

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);

  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [descriptionTouched, setDescriptionTouched] = useState(false);

  const validateName = (value: string): string => {
    if (!value) return "Поле обов'язкове";
    if (value.length < 2) return "Мінімум 2 символи";
    if (value.length > 50) return "Максимум 50 символів";
    if (!/^[a-zA-Zа-яА-ЯіІїЇєЄ' -]+$/.test(value))
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
    const value = e.target.value;
    setName(value);
    if (nameTouched) setNameError(validateName(value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
    if (phoneTouched) setPhoneError(validatePhone(value));
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;
    if (value.length <= 300) setDescription(value);
    if (descriptionTouched) setDescriptionError(validateDescription(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: замінити на реальний API запит після підключення бекенду
    const newRequest = {
      id: Date.now(),
      name,
      phone: `+38${phone}`,
      description,
      date: new Date().toLocaleDateString("uk-UA"),
    };

    // TODO: ТИМЧАСОВО — зберігаємо в localStorage
    // Після підключення бекенду і сторінки Профілю — видалити цей блок.
    // Історія заявок буде братись з API і відображатись в особистому кабінеті.
    const existing = JSON.parse(
      localStorage.getItem("contactRequests") || "[]",
    );
    localStorage.setItem(
      "contactRequests",
      JSON.stringify([...existing, newRequest]),
    );

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
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

  return (
    <section className="contact-form-section">
      <div className="contact-form__inner">
        <div className="contact-form__wrapper">
          <h2 className="contact-form__title">Контактна форма</h2>
          <p className="contact-form__subtitle">Лише для авторизованих</p>
          {isSubmitted ? (
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
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form__row">
                {/* Ім'я */}
                <div className="contact-form__field">
                  <label className="contact-form__label" htmlFor="name">
                    Ім'я
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    placeholder="Ваше ім'я"
                    onChange={handleNameChange}
                    onBlur={() => {
                      setNameTouched(true);
                      setNameError(validateName(name));
                    }}
                    className={`contact-form__input ${nameTouched && nameError ? "contact-form__input--error" : ""}`}
                  />
                  {nameTouched && nameError && (
                    <span className="contact-form__error">{nameError}</span>
                  )}
                </div>
                {/* Телефон */}
                <div className="contact-form__field">
                  <label className="contact-form__label" htmlFor="phone">
                    Телефон *
                  </label>
                  <div className="contact-form__phone-wrapper">
                    <span className="contact-form__prefix">+38</span>
                    <input
                      id="phone"
                      type="text"
                      autoComplete="tel-national"
                      value={phone}
                      placeholder="0XXXXXXXXX"
                      onChange={handlePhoneChange}
                      onBlur={() => {
                        setPhoneTouched(true);
                        setPhoneError(validatePhone(phone));
                      }}
                      maxLength={10}
                      className={`contact-form__input ${phoneTouched && phoneError ? "contact-form__input--error" : ""}`}
                    />
                  </div>
                  {phoneTouched && phoneError && (
                    <span className="contact-form__error">{phoneError}</span>
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
                    onChange={handleDescriptionChange}
                    onBlur={() => {
                      setDescriptionTouched(true);
                      setDescriptionError(validateDescription(description));
                    }}
                    className={`contact-form__textarea ${descriptionTouched && descriptionError ? "contact-form__input--error" : ""}`}
                  />
                  <span className="contact-form__counter">
                    {description.length}/300
                  </span>
                </div>
                {descriptionTouched && descriptionError && (
                  <span className="contact-form__error">{descriptionError}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={!isFormValid}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    window.location.href = "/login";
                  }
                }}
                className="contact-form__button"
              >
                {user ? "Відправити заявку" : "Увійдіть щоб надіслати"}
              </button>
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