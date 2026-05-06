import type { BestProduct } from '../../../data/bestProducts'
import { useShop } from '../../../hooks/useShop'
import { formatPrice } from '../../../utils/formatPrice'
import { HeartIcon } from '../../icons/UiIcons'
import type { SiteVariant } from '../../../utils/siteVariant'
import { getProductUrl } from '../../../utils/productUrl'

type ProductCardProps = {
  product: BestProduct
  siteVariant: SiteVariant
}

export function ProductCard({ product, siteVariant }: ProductCardProps) {
  const href = getProductUrl(product.id, siteVariant)
  const { isFavorite, toggleFavorite } = useShop()
  const productIsFavorite = isFavorite(product.id)

  return (
    <article className="product-rail-card">
      <a className="product-rail-card__link" href={href}>
        <img src={product.image} alt={product.name} />
        <span>{product.category}</span>
        <h3 title={product.name}>{product.displayName ?? product.name}</h3>
        {siteVariant === 'order' && <p>{formatPrice(product.price)}</p>}
      </a>

      {siteVariant === 'usual' && (
        <button
          className="product-rail-card__favorite"
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
    </article>
  )
}
