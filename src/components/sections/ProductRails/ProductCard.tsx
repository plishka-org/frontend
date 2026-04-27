import type { BestProduct } from '../../../data/bestProducts'
import { HeartIcon } from '../../icons/UiIcons'
import type { SiteVariant } from '../../../utils/siteVariant'
import { getProductUrl } from '../../../utils/productUrl'

type ProductCardProps = {
  product: BestProduct
  siteVariant: SiteVariant
}

export function ProductCard({ product, siteVariant }: ProductCardProps) {
  const href = getProductUrl(product.id, siteVariant)

  return (
    <article className="product-rail-card">
      <a className="product-rail-card__link" href={href}>
        <img src={product.image} alt={product.name} />
        <span>{product.category}</span>
        <h3 title={product.name}>{product.displayName ?? product.name}</h3>
        {siteVariant === 'order' && <p>Ціна у грн</p>}
      </a>

      {siteVariant === 'usual' && (
        <button
          className="product-rail-card__favorite"
          type="button"
          aria-label={`Додати ${product.name} до обраного`}
        >
          <HeartIcon />
        </button>
      )}
    </article>
  )
}
