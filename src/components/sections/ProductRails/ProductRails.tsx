import type { BestProduct } from '../../../data/bestProducts'
import { getRelatedProducts } from '../../../data/bestProducts'
import type { SiteVariant } from '../../../utils/siteVariant'
import { ProductCard } from './ProductCard'
import { RecentlyViewedRail } from './RecentlyViewedRail'

type ProductRailsProps = {
  product: BestProduct
  siteVariant: SiteVariant
}

function repeatProducts(products: BestProduct[], count: number) {
  return Array.from({ length: count }, (_, index) => ({
    product: products[index % products.length],
    renderKey: `${products[index % products.length].id}-${index}`,
  }))
}

export function ProductRails({ product, siteVariant }: ProductRailsProps) {
  const relatedProducts = getRelatedProducts(product)
  const relatedRailProducts = repeatProducts(relatedProducts, 10)

  return (
    <div className="product-rails">
      <section className="product-rail" aria-labelledby="related-products-title">
        <h2 id="related-products-title">Схожі вироби</h2>
        <div className="product-rail__scroller">
          {relatedRailProducts.map(({ product: item, renderKey }) => (
            <ProductCard key={renderKey} product={item} siteVariant={siteVariant} />
          ))}
        </div>
      </section>

      <RecentlyViewedRail currentProduct={product} siteVariant={siteVariant} />
    </div>
  )
}