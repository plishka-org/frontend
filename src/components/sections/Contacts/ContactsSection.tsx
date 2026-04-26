import { contacts } from '../../../data/contacts'
import {
  FacebookIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
} from '../../icons/ContactIcons'

export function ContactsSection() {
  return (
    <section className="contacts-section" id="contacts" aria-labelledby="contacts-title">
      <div className="contacts-section__inner">
        <div className="contacts-section__content">
          <h1 id="contacts-title">Наші контакти</h1>

          <div className="contacts-grid" aria-label="Контактна інформація">
            <article className="contact-card contact-card--compact">
              <h2>Телефон і пошта</h2>
              <a href={contacts.phoneHref} className="contact-link">
                <PhoneIcon />
                <span>{contacts.phoneDisplay}</span>
              </a>
              <a href={`mailto:${contacts.email}`} className="contact-link">
                <MailIcon />
                <span>{contacts.email}</span>
              </a>
            </article>

            <article className="contact-card contact-card--compact">
              <h2>Соцмережі</h2>
              <a
                href={contacts.facebookUrl}
                className="social-link"
                target="_blank"
                rel="noreferrer"
                aria-label="Відкрити Facebook Plishka"
              >
                <FacebookIcon />
              </a>
            </article>

            <article className="contact-card contact-card--wide">
              <h2>Адреса майстерні</h2>
              <a
                href={contacts.mapUrl}
                className="contact-link contact-link--address"
                target="_blank"
                rel="noreferrer"
              >
                <PinIcon />
                <span className="contact-address-text">
                  <span className="contact-address-text__desktop">
                    Село Город, Косівський район, Івано-Франківська обл.,
                    <br />
                    вул. Незалежності, 55
                  </span>
                  <span className="contact-address-text__mobile">
                    Село Город, Косівський
                    <br />
                    район, Івано-Франківська
                    <br />
                    обл.,
                    <br />
                    вул. Незалежності, 55
                  </span>
                </span>
              </a>
            </article>
          </div>
        </div>

        <div className="map-card">
          <iframe
            src={contacts.mapEmbedUrl}
            title="Адреса майстерні Plishka на Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
