import { useState } from 'react'
import cartIcon from '../../../assets/header/icons-header/cart-shopping-2.svg'
import { BrandMark } from '../Footer/BrandMark'
import { CloseIcon, HeartIcon, MenuIcon, UserIcon } from '../../icons/UiIcons'
import { getAboutUrl, getGalleryUrl, getHomeUrl, getReviewsUrl } from '../../../utils/productUrl'
import type { SiteVariant } from '../../../utils/siteVariant'
import { useShop } from '../../../hooks/useShop'
import { CartModal } from '../../CartModal'

type HeaderProps = {
  activePage?: 'home' | 'gallery' | 'about' | 'reviews'
  siteVariant: SiteVariant
}

export function Header({ activePage, siteVariant }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { cartCount } = useShop()
  const homeHref = getHomeUrl(siteVariant)
  const switchHref = getVariantSwitchUrl(siteVariant === 'order' ? 'usual' : 'order')
  const navItems = [
    { href: homeHref, label: 'Головна', page: 'home' },
    { href: getGalleryUrl(siteVariant), label: 'Галерея', page: 'gallery' },
    { href: getAboutUrl(siteVariant), label: 'Про майстерню', page: 'about' },
    { href: getReviewsUrl(siteVariant), label: 'Відгуки', page: 'reviews' },
    { href: '#favorites', label: 'Обрані' },
    { href: '#profile', label: 'Особистий кабінет' },
  ]

  function getNavItemClassName(item: (typeof navItems)[number]) {
    return item.page && item.page === activePage ? 'is-active' : undefined
  }

  return (
    <header className="site-header">
      <a className="site-header__brand" href={homeHref} aria-label="На головну Plishka">
        <BrandMark />
      </a>

      <nav className="site-header__nav" aria-label="Головна навігація">
        {navItems.slice(0, 4).map((item) => (
          <a
            className={getNavItemClassName(item)}
            href={item.href}
            key={item.label}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="site-header__actions">
        <VariantSwitch siteVariant={siteVariant} href={switchHref} />
        <button className="icon-button" type="button" aria-label="Обрані вироби">
          <HeartIcon />
        </button>
        {siteVariant === 'order' && (
          <CartButton cartCount={cartCount} onClick={() => setIsCartOpen(true)} />
        )}
        <button className="icon-button" type="button" aria-label="Профіль">
          <UserIcon />
        </button>
      </div>

      <div className="site-header__mobile-actions">
        {siteVariant === 'order' && (
          <CartButton cartCount={cartCount} onClick={() => setIsCartOpen(true)} />
        )}
        <button
          className="site-header__menu"
          type="button"
          aria-label="Відкрити меню"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen(true)}
        >
          <MenuIcon />
        </button>
      </div>

      <div
        className="site-header__drawer"
        data-open={isMenuOpen}
        id="mobile-menu"
        aria-hidden={!isMenuOpen}
      >
        <div className="site-header__drawer-top">
          <a href={homeHref} aria-label="На головну Plishka" onClick={() => setIsMenuOpen(false)}>
            <BrandMark />
          </a>
          <button type="button" onClick={() => setIsMenuOpen(false)} aria-label="Закрити меню">
            <CloseIcon />
          </button>
        </div>

        <nav className="site-header__drawer-nav" aria-label="Мобільна навігація">
          <VariantSwitch siteVariant={siteVariant} href={switchHref} />
          {navItems.map((item) => (
            <a
              className={getNavItemClassName(item)}
              href={item.href}
              key={item.label}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      {siteVariant === 'order' && (
        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}
    </header>
  )
}

type CartButtonProps = {
  cartCount: number
  onClick: () => void
}

function CartButton({ cartCount, onClick }: CartButtonProps) {
  return (
    <button
      className="icon-button icon-button--cart"
      data-has-items={cartCount > 0}
      type="button"
      aria-label={`Кошик, ${cartCount} товарів`}
      onClick={onClick}
    >
      <img src={cartIcon} alt="" aria-hidden="true" />
      <span>({cartCount})</span>
    </button>
  )
}

function getVariantSwitchUrl(siteVariant: SiteVariant) {
  if (typeof window === 'undefined') {
    return siteVariant === 'order' ? '?site=order' : '/'
  }

  const nextUrl = new URL(window.location.href)

  if (siteVariant === 'order') {
    nextUrl.searchParams.set('site', 'order')
  } else {
    nextUrl.searchParams.delete('site')
  }

  return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
}

type VariantSwitchProps = {
  href: string
  siteVariant: SiteVariant
}

function VariantSwitch({ href, siteVariant }: VariantSwitchProps) {
  return (
    <a
      className="site-variant-switch"
      data-variant={siteVariant}
      href={href}
      aria-label={`Перемкнути на ${siteVariant === 'order' ? 'звичайний сайт' : 'сайт замовлення'}`}
      title="Тимчасовий перемикач режиму сайту"
    >
      <span aria-hidden="true" />
    </a>
  )
}
