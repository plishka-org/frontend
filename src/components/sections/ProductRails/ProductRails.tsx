import type { BestProduct } from '../../../data/bestProducts'
import { getRelatedProducts } from '../../../data/bestProducts'
import type { SiteVariant } from '../../../utils/siteVariant'
import { ProductCard } from './ProductCard'

type ProductRailsProps = {
  product: BestProduct
  siteVariant: SiteVariant
}

export function ProductRails({ product, siteVariant }: ProductRailsProps) {
  const relatedProducts = getRelatedProducts(product)
  const recentlyViewed = relatedProducts.slice(0, 10)

  return (
    <div className="product-rails">
      <section className="product-rail" aria-labelledby="related-products-title">
        <h2 id="related-products-title">Схожі вироби</h2>
        <div className="product-rail__scroller">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} siteVariant={siteVariant} />
          ))}
        </div>
      </section>

      <section className="product-rail" aria-labelledby="recent-products-title">
        <h2 id="recent-products-title">Останні переглянуті вироби</h2>
        <div className="product-rail__scroller">
          {recentlyViewed.map((item) => (
            <ProductCard key={item.id} product={item} siteVariant={siteVariant} />
          ))}
        </div>
      </section>
    </div>
  )
}
