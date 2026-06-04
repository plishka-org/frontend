import { useEffect } from 'react'
import { useRecentlyViewed } from '../../../hooks/useRecentlyViewed'
import { ProductCard } from './ProductCard'
import type { BestProduct } from '../../../data/bestProducts'
import type { SiteVariant } from '../../../utils/siteVariant'

type RecentlyViewedRailProps = {
  currentProduct?: BestProduct
  siteVariant: SiteVariant
}

export function RecentlyViewedRail({ currentProduct, siteVariant }: RecentlyViewedRailProps) {
  const { recentlyViewedProducts, trackView } = useRecentlyViewed()

  useEffect(() => {
    if (currentProduct) {
      trackView(currentProduct.id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProduct?.id])

  const displayProducts = currentProduct
    ? recentlyViewedProducts.filter((p) => p.id !== currentProduct.id)
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