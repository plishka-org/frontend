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
    mapEmbedUrl: contacts.mapEmbedUrl,
    mapLinkUrl: contacts.mapUrl,
    facebookUrl: contacts.facebookUrl,
  })

  useEffect(() => {
    getContactsApi().then((response) => {
      const facebookUrl = response.socialLinks.find((link) => link.name.toLowerCase().includes('facebook'))?.url ?? contacts.facebookUrl
      const phoneNumber = response.phoneNumber?.trim()
      const email = response.email?.trim()
      const address = response.address?.trim()
      const googleMapsUrl = response.googleMapsUrl?.trim()

      setContent({
        phone: phoneNumber && phoneNumber !== '+380000000000' ? phoneNumber : contacts.phoneDisplay,
        email: email && email !== 'team@plishka.com.ua' ? email : contacts.email,
        address: address && address !== 'Косівщина, Україна' ? address : contacts.address,
        mapEmbedUrl: googleMapsUrl || contacts.mapEmbedUrl,
        mapLinkUrl: googleMapsUrl || contacts.mapUrl,
        facebookUrl,
      })
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
                href={content.mapLinkUrl}
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
            src={content.mapEmbedUrl}
            title="Адреса майстерні Plishka на Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
