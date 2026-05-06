import { bestProducts } from '../../../data/bestProducts'
import type { BestProduct } from '../../../data/bestProducts'
import { useShop } from '../../../hooks/useShop'
import { formatPrice } from '../../../utils/formatPrice'
import { getGalleryUrl, getProductUrl } from '../../../utils/productUrl'
import { siteVariantFeatures } from '../../../utils/siteVariant'
import type { SiteVariant } from '../../../utils/siteVariant'
import { CheckIcon, HeartIcon } from '../../icons/UiIcons'

type BestProductsSectionProps = {
  siteVariant?: SiteVariant
}

const featuredProducts = Array.from({ length: 10 }, (_, index) => ({
  product: bestProducts[index % bestProducts.length],
  renderKey: `${bestProducts[index % bestProducts.length].id}-${index}`,
}))

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
          {featuredProducts.map(({ product, renderKey }) => (
            <BestProductCard key={renderKey} product={product} siteVariant={siteVariant} />
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
  const { addToCart, isFavorite, isInCart, toggleFavorite } = useShop()
  const features = siteVariantFeatures[siteVariant]
  const productIsFavorite = isFavorite(product.id)
  const productIsInCart = isInCart(product.id)

  return (
    <article className="best-product-card" data-cart-actions={features.showCartActions}>
      <a className="best-product-card__link" href={getProductUrl(product.id, siteVariant)}>
        <img src={product.image} alt={product.name} />

        <div className="best-product-card__body">
          <p>{product.category}</p>
          <h2 title={product.name}>{product.displayName ?? product.name}</h2>
          {features.showPrices && <span>{formatPrice(product.price)}</span>}
        </div>
      </a>

      <div className="best-product-card__actions">
        {features.showCartActions && (
          <button
            className="best-product-card__cart"
            type="button"
            aria-pressed={productIsInCart}
            onClick={() => addToCart(product.id)}
          >
            <span>{productIsInCart ? 'Додано' : 'Додати'}</span>
            {productIsInCart && <CheckIcon />}
          </button>
        )}

        {features.showFavorites && (
          <button
            className="best-product-card__favorite"
            data-active={productIsFavorite}
            type="button"
            aria-pressed={productIsFavorite}
            aria-label={
              productIsFavorite ? 'Прибрати з обраного' : `Додати ${product.name} до обраного`
            }
            onClick={() => toggleFavorite(product.id)}
          >
            <HeartIcon />
          </button>
        )}
      </div>
    </article>
  )
}
