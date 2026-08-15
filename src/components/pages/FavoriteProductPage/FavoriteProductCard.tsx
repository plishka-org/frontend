import type { ProductUi } from '../../../services/api/productsApi'
import { useShop } from '../../../hooks/useShop'
import { formatPrice } from '../../../utils/formatPrice'
import type { SiteVariant } from '../../../utils/siteVariant'
import { getProductUrl } from '../../../utils/productUrl'
import { HeartIcon } from '../../icons/UiIcons'

type FavoriteProductCardProps = {
  product: ProductUi
  siteVariant: SiteVariant
}

export function FavoriteProductCard({ product, siteVariant }: FavoriteProductCardProps) {
  const href = getProductUrl(product.id, siteVariant)
  const { isFavorite, toggleFavorite } = useShop()
  const productIsFavorite = isFavorite(product.id)

  return (
    <article className="gallery-card" data-has-price={siteVariant === 'order'}>
      <a className="gallery-card__image-link" href={href}>
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
      </a>

      <p>{product.category}</p>

      <a className="gallery-card__title-link" href={href}>
        <h2 title={product.name}>{product.displayName ?? product.name}</h2>
      </a>

      {siteVariant === 'order' && (
        <span className="gallery-card__price">{formatPrice(product.price)}</span>
      )}

      {siteVariant === 'usual' && (
        <div className="gallery-card__actions favorite-card__actions">
          <button
            className="gallery-card__favorite"
            data-active={productIsFavorite}
            type="button"
            aria-pressed={productIsFavorite}
            aria-label={
              productIsFavorite
                ? 'Прибрати з обраного'
                : `Додати ${product.name} до обраного`
            }
            onClick={() => toggleFavorite(product)}
          >
            <HeartIcon />
          </button>
        </div>
      )}
    </article>
  )
}
