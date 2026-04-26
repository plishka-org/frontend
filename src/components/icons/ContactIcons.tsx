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

export function CartIcon() {
  return <img src={cartIcon} alt="" aria-hidden="true" />
}
