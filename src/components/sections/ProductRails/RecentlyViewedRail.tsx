import { useEffect } from 'react'
import { useRecentlyViewed } from '../../../hooks/useRecentlyViewed'
import { ProductCard } from './ProductCard'
import type { ProductUi } from '../../../services/api/productsApi'
import type { SiteVariant } from '../../../utils/siteVariant'

type RecentlyViewedRailProps = {
  currentProduct?: ProductUi
  siteVariant: SiteVariant
}

export function RecentlyViewedRail({ currentProduct, siteVariant }: RecentlyViewedRailProps) {
  const { recentlyViewedProducts, trackView } = useRecentlyViewed()
  const currentProductId = currentProduct?.id

  useEffect(() => {
    if (currentProductId) {
      trackView(currentProductId)
    }
  }, [currentProductId, trackView])

  const displayProducts = currentProductId
    ? recentlyViewedProducts.filter((p) => p.id !== currentProductId)
    : recentlyViewedProducts

  if (displayProducts.length === 0) return null

  return (
    <section className="product-rail" aria-labelledby="recently-viewed-title">
      <h2 id="recently-viewed-title">Останні переглянуті вироби</h2>
      <div className="product-rail__scroller">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} siteVariant={siteVariant} />
        ))}
      </div>
    </section>
  )
}
