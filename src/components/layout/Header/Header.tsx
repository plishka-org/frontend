import { useState } from 'react'
import { BrandMark } from '../Footer/BrandMark'
import { CartIcon, CloseIcon, HeartIcon, MenuIcon, UserIcon } from '../../icons/UiIcons'
import type { SiteVariant } from '../../../utils/siteVariant'

type HeaderProps = {
  cartCount?: number
  siteVariant: SiteVariant
}

export function Header({ cartCount = 0, siteVariant }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const homeHref = siteVariant === 'order' ? '/?site=order' : '/'
  const navItems = [
    { href: homeHref, label: 'Головна' },
    { href: `${homeHref}#gallery`, label: 'Галерея' },
    { href: `${homeHref}#about`, label: 'Про майстерню' },
    { href: `${homeHref}#reviews`, label: 'Відгуки' },
    { href: '#favorites', label: 'Обрані' },
    { href: '#profile', label: 'Особистий кабінет' },
  ]

  return (
    <header className="site-header">
      <a className="site-header__brand" href={homeHref} aria-label="На головну Plishka">
        <BrandMark />
      </a>

      <nav className="site-header__nav" aria-label="Головна навігація">
        {navItems.slice(0, 4).map((item) => (
          <a href={item.href} key={item.label}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="site-header__actions">
        <button className="icon-button" type="button" aria-label="Обрані вироби">
          <HeartIcon />
        </button>
        {siteVariant === 'order' && (
          <button
            className="icon-button icon-button--cart"
            data-has-items={cartCount > 0}
            type="button"
            aria-label={`Кошик, ${cartCount} товарів`}
          >
            <CartIcon />
            <span>({cartCount})</span>
          </button>
        )}
        <button className="icon-button" type="button" aria-label="Профіль">
          <UserIcon />
        </button>
      </div>

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
          {navItems.map((item, index) => (
            <a
              className={index === 0 ? 'is-active' : undefined}
              href={item.href}
              key={item.label}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
