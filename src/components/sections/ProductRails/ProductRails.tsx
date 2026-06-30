import { useEffect, useState } from 'react'
import { getRelatedProducts } from '../../../data/bestProducts'
import type { ProductUi } from '../../../services/api/productsApi'
import { getRelatedProductsApi } from '../../../services/api/productsApi'
import type { SiteVariant } from '../../../utils/siteVariant'
import { ProductCard } from './ProductCard'
import { RecentlyViewedRail } from './RecentlyViewedRail'

type ProductRailsProps = {
  product: ProductUi
  siteVariant: SiteVariant
}

export function ProductRails({ product, siteVariant }: ProductRailsProps) {
  const [relatedProducts, setRelatedProducts] = useState<ProductUi[]>(() => getRelatedProducts(product))

  useEffect(() => {
    let cancelled = false
    getRelatedProductsApi(product.id)
      .then((page) => { if (!cancelled) setRelatedProducts(page.content) })
      .catch(() => { if (!cancelled) setRelatedProducts(getRelatedProducts(product)) })
    return () => { cancelled = true }
  }, [product])

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

      <RecentlyViewedRail currentProduct={product} siteVariant={siteVariant} />
    </div>
  )
}
