import type { MouseEvent } from 'react'
import type { GalleryProduct } from '../../../data/galleryProducts'
import { useShop } from '../../../hooks/useShop'
import { formatPrice } from '../../../utils/formatPrice'
import { getProductUrl } from '../../../utils/productUrl'
import { siteVariantFeatures } from '../../../utils/siteVariant'
import type { SiteVariant } from '../../../utils/siteVariant'
import { CheckIcon, HeartIcon } from '../../icons/UiIcons'

type GalleryProductCardProps = {
  product: GalleryProduct
  siteVariant: SiteVariant
  onImageClick: () => void
}

export function GalleryProductCard({ product, siteVariant, onImageClick }: GalleryProductCardProps) {
  const { addToCart, isFavorite, isInCart, toggleFavorite } = useShop()
  const features = siteVariantFeatures[siteVariant]
  const productIsFavorite = isFavorite(product.id)
  const productIsInCart = isInCart(product.id)
  const productUrl = getProductUrl(product.id, siteVariant)

  function handleCartClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 0) {
      event.currentTarget.blur()
    }

    if (productIsInCart) {
      return
    }

    addToCart(product.id)
  }

  function handleFavoriteClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (event.detail > 0) {
      event.currentTarget.blur()
    }

    toggleFavorite(product.id)
  }

  return (
    <article
      className="gallery-card"
      data-cart-actions={features.showCartActions}
      data-has-price={features.showPrices}
    >
      <button
        className="gallery-card__image-link"
        type="button"
        aria-label={`Переглянути ${product.name}`}
        onClick={onImageClick}
      >
        <img src={product.image} alt={product.name} />
      </button>
      <p>{product.category}</p>
      <a className="gallery-card__title-link" href={productUrl}>
        <h2 title={product.name}>{product.name}</h2>
      </a>
      {features.showPrices && (
        <span className="gallery-card__price">{formatPrice(product.price)}</span>
      )}
      {(features.showCartActions || features.showFavorites) && (
        <div className="gallery-card__actions">
          {features.showCartActions && (
            <button
              className="gallery-card__cart"
              type="button"
              aria-pressed={productIsInCart}
              disabled={productIsInCart}
              onClick={handleCartClick}
            >
              <span>{productIsInCart ? 'Додано' : 'Додати'}</span>
              {productIsInCart && <CheckIcon />}
            </button>
          )}

          {features.showFavorites && (
            <button
              className="gallery-card__favorite"
              data-active={productIsFavorite}
              type="button"
              aria-pressed={productIsFavorite}
              aria-label={
                productIsFavorite ? 'Прибрати з обраного' : `Додати ${product.name} до обраного`
              }
              onClick={handleFavoriteClick}
            >
              <HeartIcon />
            </button>
          )}
        </div>
      )}
    </article>
  )
}