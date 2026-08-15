import cartIcon from '../../assets/block-contacts-icons/Cart shopping.svg'
import locationIcon from '../../assets/block-contacts-icons/Icons 24_24.svg'
import emailIcon from '../../assets/block-contacts-icons/email.svg'
import facebookIcon from '../../assets/block-contacts-icons/facebook.svg'
import phoneIcon from '../../assets/block-contacts-icons/telefon.svg'

export function PhoneIcon() {
  return <img src={phoneIcon} alt="" aria-hidden="true" />
}

export function MailIcon() {
  return <img src={emailIcon} alt="" aria-hidden="true" />
}

export function PinIcon() {
  return <img src={locationIcon} alt="" aria-hidden="true" />
}

export function FacebookIcon() {
  return <img src={facebookIcon} alt="" aria-hidden="true" />
}

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
}

function TelegramIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="m3 11 17-7-4 16-5-6-4 3 1-5 8-5-10 4-3 0Z" /></svg>
}

function ViberIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4.5A16 16 0 0 1 19 4c2 3 2 9 0 12-1 1-3 2-5 2l-4 3v-3c-2 0-4-1-5-2-2-3-2-8 0-11.5Z" /><path d="M9 8c.5 3 2 4.5 5 5M14 7c2 .5 3 1.5 3 3" /></svg>
}

export function SocialIcon({ name }: { name: string }) {
  const platform = name.trim().toLowerCase()
  if (platform.includes('facebook')) return <FacebookIcon />
  if (platform.includes('instagram')) return <InstagramIcon />
  if (platform.includes('telegram')) return <TelegramIcon />
  if (platform.includes('viber')) return <ViberIcon />
  return <span className="social-link__fallback" aria-hidden="true">{name.trim().slice(0, 2).toUpperCase() || '↗'}</span>
}

export function CartIcon() {
  return <img src={cartIcon} alt="" aria-hidden="true" />
}
