import { useState } from 'react'
import { bestProducts } from '../../../data/bestProducts'
import type { BestProduct } from '../../../data/bestProducts'
import { getGalleryUrl, getProductUrl } from '../../../utils/productUrl'
import { siteVariantFeatures } from '../../../utils/siteVariant'
import type { SiteVariant } from '../../../utils/siteVariant'
import { CheckIcon, HeartIcon } from '../../icons/UiIcons'

type BestProductsSectionProps = {
  siteVariant?: SiteVariant
}

export function BestProductsSection({ siteVariant = 'usual' }: BestProductsSectionProps) {
  return (
    <section
      className="best-products-section"
      id="best-products"
      aria-labelledby="best-products-title"
    >
      <div className="best-products-section__inner">
        <div className="best-products-section__header">
          <h1 id="best-products-title">Наші найкращі вироби</h1>

          <a className="best-products-section__link" href={getGalleryUrl(siteVariant)}>
            <span>Всі товари</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="best-products-carousel" aria-label="Найкращі вироби">
          {bestProducts.map((product) => (
            <BestProductCard key={product.id} product={product} siteVariant={siteVariant} />
          ))}
        </div>
      </div>
    </section>
  )
}

type BestProductCardProps = {
  product: BestProduct
  siteVariant: SiteVariant
}

function BestProductCard({ product, siteVariant }: BestProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const features = siteVariantFeatures[siteVariant]

  return (
    <article className="best-product-card" data-cart-actions={features.showCartActions}>
      <a className="best-product-card__link" href={getProductUrl(product.id, siteVariant)}>
        <img src={product.image} alt={product.name} />

        <div className="best-product-card__body">
          <p>{product.category}</p>
          <h2 title={product.name}>{product.displayName ?? product.name}</h2>
          {features.showPrices && <span>Ціна у грн</span>}
        </div>
      </a>

      <div className="best-product-card__actions">
        {features.showCartActions && (
          <button
            className="best-product-card__cart"
            type="button"
            aria-pressed={isInCart}
            onClick={() => setIsInCart(true)}
          >
            <span>{isInCart ? 'Додано' : 'Додати'}</span>
            {isInCart && <CheckIcon />}
          </button>
        )}

        {features.showFavorites && (
          <button
            className="best-product-card__favorite"
            data-active={isFavorite}
            type="button"
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Прибрати з обраного' : `Додати ${product.name} до обраного`}
            onClick={() => setIsFavorite((value) => !value)}
          >
            <HeartIcon />
          </button>
        )}
      </div>
    </article>
  )
}
