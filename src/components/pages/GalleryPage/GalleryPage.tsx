import { useEffect, useMemo, useRef, useState } from 'react'
import { galleryCategories, galleryProducts } from '../../../data/galleryProducts'
import { siteVariantFeatures } from '../../../utils/siteVariant'
import type { SiteVariant } from '../../../utils/siteVariant'
import { OrderUnavailableNotice } from '../../OrderUnavailableNotice'
import { Footer } from '../../layout/Footer/Footer'
import { Header } from '../../layout/Header/Header'
import { ContactsSection } from '../../sections/Contacts/ContactsSection'
import ContactForm from '../../sections/ContactForm/ContactForm'
import { GalleryFilters, GalleryFilterTrigger } from './GalleryFilters'
import { GalleryPagination } from './GalleryPagination'
import { GalleryProductCard } from './GalleryProductCard'
import { GalleryProductSkeletonCard } from './GalleryProductSkeletonCard'
import type { GallerySort } from './types'

type GalleryPageProps = {
  siteVariant: SiteVariant
}

const gallerySorts: GallerySort[] = ['az', 'za', 'priceHigh', 'priceLow']
const galleryStateStorageKey = 'plishkaGalleryState'
const galleryProductsPerPage = 12
const gallerySkeletonCardCount = 12

type GalleryUrlState = {
  activeCategories: string[]
  sort: GallerySort
}

function filterProductsByCategories(activeCategories: string[]) {
  if (activeCategories.length === 0) {
    return galleryProducts
  }

  return galleryProducts.filter((product) => activeCategories.includes(product.category))
}

function readStoredGalleryState(): GalleryUrlState | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.sessionStorage.getItem(galleryStateStorageKey)

    if (!rawValue) {
      return null
    }

    const parsedValue = JSON.parse(rawValue) as Partial<GalleryUrlState>
    const activeCategories = Array.isArray(parsedValue.activeCategories)
      ? parsedValue.activeCategories.filter(
          (category) => galleryCategories.includes(category) && category !== 'Усі категорії',
        )
      : []

    return {
      activeCategories,
      sort: gallerySorts.includes(parsedValue.sort as GallerySort)
        ? (parsedValue.sort as GallerySort)
        : 'az',
    }
  } catch {
    return null
  }
}

function writeStoredGalleryState(activeCategories: string[], sort: GallerySort) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(
    galleryStateStorageKey,
    JSON.stringify({ activeCategories, sort }),
  )
}

function readGalleryUrlState() {
  if (typeof window === 'undefined') {
    return { activeCategories: [] as string[], sort: 'az' as GallerySort }
  }

  const searchParams = new URLSearchParams(window.location.search)
  const activeCategories = searchParams
    .getAll('category')
    .filter((category) => galleryCategories.includes(category) && category !== 'Усі категорії')
  const sort = searchParams.get('sort')

  if (activeCategories.length === 0 && !sort) {
    return readStoredGalleryState() ?? { activeCategories, sort: 'az' }
  }

  return {
    activeCategories,
    sort: gallerySorts.includes(sort as GallerySort) ? (sort as GallerySort) : 'az',
  }
}

function writeGalleryUrlState(activeCategories: string[], sort: GallerySort) {
  if (typeof window === 'undefined') {
    return
  }

  const nextUrl = new URL(window.location.href)
  nextUrl.searchParams.delete('category')

  activeCategories.forEach((category) => nextUrl.searchParams.append('category', category))

  if (sort === 'az') {
    nextUrl.searchParams.delete('sort')
  } else {
    nextUrl.searchParams.set('sort', sort)
  }

  writeStoredGalleryState(activeCategories, sort)
  window.history.replaceState(null, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`)
}

export function GalleryPage({ siteVariant }: GalleryPageProps) {
  const [activeCategories, setActiveCategories] = useState(
    () => readGalleryUrlState().activeCategories,
  )
  const [sort, setSort] = useState<GallerySort>(() => readGalleryUrlState().sort)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isProductsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const productsRef = useRef<HTMLDivElement>(null)
  const activeFilterCount = activeCategories.length

  useEffect(() => {
    function syncFromUrl() {
      const nextState = readGalleryUrlState()
      setActiveCategories(nextState.activeCategories)
      setSort(nextState.sort)
      setCurrentPage(1)
    }

    window.addEventListener('popstate', syncFromUrl)
    window.addEventListener('hashchange', syncFromUrl)

    return () => {
      window.removeEventListener('popstate', syncFromUrl)
      window.removeEventListener('hashchange', syncFromUrl)
    }
  }, [])

  useEffect(() => {
    const isDrawerLayout = window.matchMedia('(max-width: 1100px)').matches

    if (!isFilterOpen || !isDrawerLayout) {
      return
    }

    const scrollY = window.scrollY
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousOverflow = document.body.style.overflow
    const previousPosition = document.body.style.position
    const previousTop = document.body.style.top
    const previousWidth = document.body.style.width

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousOverflow
      document.body.style.position = previousPosition
      document.body.style.top = previousTop
      document.body.style.width = previousWidth
      window.scrollTo(0, scrollY)
    }
  }, [isFilterOpen])

  const visibleProducts = useMemo(() => {
    const filteredProducts = filterProductsByCategories(activeCategories)

    return [...filteredProducts].sort((firstProduct, secondProduct) => {
      if (sort === 'za') {
        return secondProduct.name.localeCompare(firstProduct.name, 'uk')
      }

      if (sort === 'priceHigh') {
        return secondProduct.price - firstProduct.price
      }

      if (sort === 'priceLow') {
        return firstProduct.price - secondProduct.price
      }

      return firstProduct.name.localeCompare(secondProduct.name, 'uk')
    })
  }, [activeCategories, sort])
  const totalPages = Math.ceil(visibleProducts.length / galleryProductsPerPage)
  const activePage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1
  const paginatedProducts = visibleProducts.slice(
    (activePage - 1) * galleryProductsPerPage,
    activePage * galleryProductsPerPage,
  )

  function toggleCategory(category: string) {
    setCurrentPage(1)

    if (category === 'Усі категорії') {
      setActiveCategories([])
      writeGalleryUrlState([], sort)
      return
    }

    setActiveCategories((currentCategories) => {
      if (currentCategories.includes(category)) {
        const nextCategories = currentCategories.filter((item) => item !== category)
        writeGalleryUrlState(nextCategories, sort)
        return nextCategories
      }

      const nextCategories = [...currentCategories, category]
      writeGalleryUrlState(nextCategories, sort)
      return nextCategories
    })
  }

  function changeSort(nextSort: GallerySort) {
    setCurrentPage(1)
    setSort(nextSort)
    writeGalleryUrlState(activeCategories, nextSort)
  }

  function resetFilters() {
    setCurrentPage(1)
    setActiveCategories([])
    setSort('az')
    writeGalleryUrlState([], 'az')
  }

  function changePage(nextPage: number) {
    setCurrentPage(nextPage)
    productsRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  return (
    <main className="page-shell gallery-page">
      <Header activePage="gallery" siteVariant={siteVariant} />
      <section className="gallery-page__content" aria-labelledby="gallery-title">
        <GalleryFilters
          activeFilterCount={activeFilterCount}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onReset={resetFilters}
          onSortChange={changeSort}
          onToggleCategory={toggleCategory}
          activeCategories={activeCategories}
          siteVariant={siteVariant}
          sort={sort}
        />

        <div className="gallery-products" ref={productsRef}>
          <div className="gallery-products__header">
            <h1 id="gallery-title">Вироби</h1>
            <GalleryFilterTrigger
              activeFilterCount={activeFilterCount}
              onOpen={() => setIsFilterOpen(true)}
            />
          </div>

          {!siteVariantFeatures[siteVariant].showCartActions && (
            <div className="gallery-products__notice">
              <OrderUnavailableNotice />
            </div>
          )}

          {isProductsLoading ? (
            <div
              className="gallery-products__grid"
              aria-label="Вироби завантажуються"
              aria-busy="true"
            >
              {Array.from({ length: gallerySkeletonCardCount }, (_, index) => (
                <GalleryProductSkeletonCard key={index} />
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            <p className="gallery-products__empty">Немає виробів за вибраними фільтрами</p>
          ) : (
            <>
              <div className="gallery-products__grid" aria-label="Вироби галереї">
                {paginatedProducts.map((product) => (
                  <GalleryProductCard
                    key={product.id}
                    product={product}
                    siteVariant={siteVariant}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <GalleryPagination
                  currentPage={activePage}
                  totalPages={totalPages}
                  onPageChange={changePage}
                />
              )}
            </>
          )}
        </div>
      </section>
      <ContactForm />
      <ContactsSection />
      <Footer />
    </main>
  )
}
