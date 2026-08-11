import { useEffect, useState, type MouseEvent } from 'react'
import { bestProducts } from '../../../data/bestProducts'
import { useShop } from '../../../hooks/useShop'
import { formatPrice } from '../../../utils/formatPrice'
import { getGalleryUrl, getProductUrl } from '../../../utils/productUrl'
import { siteVariantFeatures } from '../../../utils/siteVariant'
import type { SiteVariant } from '../../../utils/siteVariant'
import { OrderUnavailableNotice } from '../../OrderUnavailableNotice'
import { CheckIcon, HeartIcon } from '../../icons/UiIcons'
import { getHomeApi } from '../../../services/api/contentApi'
import { getProductApi, type ProductUi } from '../../../services/api/productsApi'

type BestProductsSectionProps = {
  siteVariant?: SiteVariant
}

const fallbackProducts = bestProducts

export function BestProductsSection({ siteVariant = 'usual' }: BestProductsSectionProps) {
  const [products, setProducts] = useState<ProductUi[]>(fallbackProducts)

  useEffect(() => {
    getHomeApi()
      .then((home) => Promise.all(home.products.map((product) => getProductApi(String(product.productId)))))
      .then((items) => { if (items.length) setProducts(items) })
      .catch(() => undefined)
  }, [])

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
            <span>УСІ ВИРОБИ</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {siteVariant === 'usual' && <OrderUnavailableNotice />}

        <div className="best-products-carousel" aria-label="Найкращі вироби">
          {products.map((product) => (
            <BestProductCard key={product.id} product={product} siteVariant={siteVariant} />
          ))}
        </div>
      </div>
    </section>
  )
}

type BestProductCardProps = {
  product: ProductUi
  siteVariant: SiteVariant
}

function BestProductCard({ product, siteVariant }: BestProductCardProps) {
  const { addToCart, isFavorite, isInCart, toggleFavorite } = useShop()
  const features = siteVariantFeatures[siteVariant]
  const productIsFavorite = isFavorite(product.id)
  const productIsInCart = isInCart(product.id)

  function handleFavoriteClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 0) {
      event.currentTarget.blur()
    }

    toggleFavorite(product.id)
  }

  function handleCartClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail > 0) {
      event.currentTarget.blur()
    }

    if (productIsInCart) {
      return
    }

    addToCart(product)
  }

  return (
    <article className="best-product-card" data-cart-actions={features.showCartActions}>
      <a className="best-product-card__link" href={getProductUrl(product.id, siteVariant)}>
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" />

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
            disabled={productIsInCart}
            onClick={handleCartClick}
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
            onClick={handleFavoriteClick}
          >
            <HeartIcon />
          </button>
        )}
      </div>
    </article>
  )
}
