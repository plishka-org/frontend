import { useEffect, useState } from 'react'
import type { BestProduct } from '../../../data/bestProducts'
import type { SiteVariant } from '../../../utils/siteVariant'
import { OrderUnavailableNotice } from '../../OrderUnavailableNotice'
import { GalleryPagination } from '../GalleryPage/GalleryPagination'
import { FavoriteProductCard } from './FavoriteProductCard'

type FavoritesSectionProps = {
  products: BestProduct[]
  siteVariant: SiteVariant
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

const PAGE_SIZE = 12
const MOBILE_INITIAL_COUNT = 10
const MOBILE_LOAD_STEP = 10
const MOBILE_BREAKPOINT = 760
const SKELETON_COUNT = 8

export function FavoritesSection({
  products,
  siteVariant,
  isLoading = false,
  error = null,
  onRetry,
}: FavoritesSectionProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT,
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [visibleCount, setVisibleCount] = useState(MOBILE_INITIAL_COUNT)

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const visibleProducts = isMobile
    ? products.slice(0, visibleCount)
    : products.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const hasMore = isMobile && visibleCount < products.length

  return (
    <section className="favorites-section" aria-labelledby="favorites-title">
      <h1 id="favorites-title">Обрані вироби</h1>

      {siteVariant === 'usual' && (
        <div className="favorites-section__notice">
          <OrderUnavailableNotice />
        </div>
      )}

      {isLoading ? (
        <div className="favorites-grid" aria-busy="true" aria-label="Завантаження обраного">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <div className="favorite-card-skeleton" key={index}>
              <div className="favorite-card-skeleton__image" />
              <div className="favorite-card-skeleton__line favorite-card-skeleton__line--short" />
              <div className="favorite-card-skeleton__line" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="favorites-section__error" role="alert">
          <p>{error}</p>
          {onRetry && (
            <button
              className="favorites-section__retry"
              type="button"
              onClick={onRetry}
            >
              Спробувати ще раз
            </button>
          )}
        </div>
      ) : products.length === 0 ? (
        <p className="favorites-section__empty">
          Ви ще не додали жодного виробу до обраного.
        </p>
      ) : (
        <>
          <div className="favorites-grid">
            {visibleProducts.map((product) => (
              <FavoriteProductCard key={product.id} product={product} siteVariant={siteVariant} />
            ))}
          </div>

          {!isMobile && totalPages > 1 && (
            <GalleryPagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {isMobile && hasMore && (
            <button
              className="favorites-section__load-more"
              type="button"
              onClick={() => setVisibleCount((count) => count + MOBILE_LOAD_STEP)}
            >
              Показати ще
            </button>
          )}
        </>
      )}
    </section>
  )
}