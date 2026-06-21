import { useEffect, useState } from 'react'
import { contacts } from '../../../data/contacts'
import { getContactsApi } from '../../../services/api/contentApi'
import {
  FacebookIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
} from '../../icons/ContactIcons'

export function ContactsSection() {
  const [content, setContent] = useState({
    phone: contacts.phoneDisplay,
    email: contacts.email,
    address: 'Село Город, Косівський район, Івано-Франківська обл., вул. Незалежності, 55',
    mapUrl: contacts.mapUrl,
    facebookUrl: contacts.facebookUrl,
  })

  useEffect(() => {
    getContactsApi().then((response) => {
      const facebookUrl = response.socialLinks.find((link) => link.name.toLowerCase().includes('facebook'))?.url ?? contacts.facebookUrl
      setContent({ phone: response.phoneNumber, email: response.email, address: response.address, mapUrl: response.googleMapsUrl, facebookUrl })
    }).catch(() => undefined)
  }, [])

  return (
    <section className="contacts-section" id="contacts" aria-labelledby="contacts-title">
      <div className="contacts-section__inner">
        <div className="contacts-section__content">
          <h1 id="contacts-title">Наші контакти</h1>

          <div className="contacts-grid" aria-label="Контактна інформація">
            <article className="contact-card contact-card--compact">
              <h2>Телефон і пошта</h2>
              <a href={`tel:${content.phone.replace(/\s/g, '')}`} className="contact-link">
                <PhoneIcon />
                <span>{content.phone}</span>
              </a>
              <a href={`mailto:${content.email}`} className="contact-link">
                <MailIcon />
                <span>{content.email}</span>
              </a>
            </article>

            <article className="contact-card contact-card--compact">
              <h2>Соцмережі</h2>
              <a
                href={content.facebookUrl}
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
                href={content.mapUrl}
                className="contact-link contact-link--address"
                target="_blank"
                rel="noreferrer"
              >
                <PinIcon />
                <span className="contact-address-text">
                  <span className="contact-address-text__desktop">
                    {content.address}
                  </span>
                  <span className="contact-address-text__mobile">
                    {content.address}
                  </span>
                </span>
              </a>
            </article>
          </div>
        </div>

        <div className="map-card">
          <iframe
            src={content.mapUrl}
            title="Адреса майстерні Plishka на Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
