import { useState } from 'react'
import cartIcon from '../../../assets/header/icons-header/cart-shopping-2.svg'
import { BrandMark } from '../Footer/BrandMark'
import { CloseIcon, HeartIcon, MenuIcon, UserIcon } from '../../icons/UiIcons'
import { getGalleryUrl, getHomeUrl } from '../../../utils/productUrl'
import type { SiteVariant } from '../../../utils/siteVariant'
import { useShop } from '../../../hooks/useShop'
import { CartModal } from '../../../ui/CartModal'

type HeaderProps = {
  activePage?: 'home' | 'gallery'
  siteVariant: SiteVariant
}

export function Header({ activePage, siteVariant }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { cartCount } = useShop()
  const homeHref = getHomeUrl(siteVariant)

  const navItems = [
    { href: homeHref, label: 'Головна', page: 'home' },
    { href: getGalleryUrl(siteVariant), label: 'Галерея', page: 'gallery' },
    { href: `${homeHref}#about`, label: 'Про майстерню' },
    { href: `${homeHref}#reviews`, label: 'Відгуки' },
    { href: '#favorites', label: 'Обрані' },
    { href: '#profile', label: 'Особистий кабінет' },
  ]

  function getNavItemClassName(item: { page?: string }) {
    return item.page === activePage ? 'is-active' : undefined
  }

  return (
    <header className="site-header">
      <a className="site-header__brand" href={homeHref} aria-label="На головну Plishka">
        <BrandMark />
      </a>

      <nav className="site-header__nav" aria-label="Головна навігація">
        {navItems.slice(0, 4).map((item) => (
          
           <a className={getNavItemClassName(item)}
            href={item.href}
            key={item.label}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="site-header__actions">
        <button className="icon-button" type="button" aria-label="Обрані вироби">
          <HeartIcon />
        </button>
        {siteVariant === 'order' && (
          <>
            <button
              className="icon-button icon-button--cart"
              data-has-items={cartCount > 0}
              type="button"
              aria-label={`Кошик, ${cartCount} товарів`}
              onClick={() => setIsCartOpen(true)}
            >
              <img src={cartIcon} alt="" aria-hidden="true" />
              <span>({cartCount})</span>
            </button>
            <CartModal
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
            />
          </>
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
          {navItems.map((item) => (
            
              <a className={getNavItemClassName(item)}
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