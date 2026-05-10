import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { MouseEvent } from 'react'
import filterButtonIcon from '../../../assets/galery-block/icons/button-filter-2.svg'
import { galleryCategories, galleryProducts } from '../../../data/galleryProducts'
import type { GalleryProduct } from '../../../data/galleryProducts'
import { useShop } from '../../../hooks/useShop'
import { formatPrice } from '../../../utils/formatPrice'
import { getProductUrl } from '../../../utils/productUrl'
import type { SiteVariant } from '../../../utils/siteVariant'
import { ArrowIcon, CloseIcon, HeartIcon, TrashIcon } from '../../icons/UiIcons'
import { Footer } from '../../layout/Footer/Footer'
import { Header } from '../../layout/Header/Header'
import { ContactsSection } from '../../sections/Contacts/ContactsSection'
import ContactForm from '../../sections/ContactForm/ContactForm'

type GalleryPageProps = {
  siteVariant: SiteVariant
}

type GallerySort = 'az' | 'za' | 'priceHigh' | 'priceLow'

const gallerySorts: GallerySort[] = ['az', 'za', 'priceHigh', 'priceLow']
const galleryStateStorageKey = 'plishkaGalleryState'

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
  if (typeof window === 'undefined') return null

  try {
    const rawValue = window.sessionStorage.getItem(galleryStateStorageKey)
    if (!rawValue) return null

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
  if (typeof window === 'undefined') return
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
  if (typeof window === 'undefined') return

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
  const activeFilterCount = activeCategories.length

  useEffect(() => {
    function syncFromUrl() {
      const nextState = readGalleryUrlState()
      setActiveCategories(nextState.activeCategories)
      setSort(nextState.sort)
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
    if (!isFilterOpen || !isDrawerLayout) return

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
      if (sort === 'za') return secondProduct.name.localeCompare(firstProduct.name, 'uk')
      if (sort === 'priceHigh') return secondProduct.price - firstProduct.price
      if (sort === 'priceLow') return firstProduct.price - secondProduct.price
      return firstProduct.name.localeCompare(secondProduct.name, 'uk')
    })
  }, [activeCategories, sort])

  function toggleCategory(category: string) {
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
    setSort(nextSort)
    writeGalleryUrlState(activeCategories, nextSort)
  }

  function resetFilters() {
    setActiveCategories([])
    setSort('az')
    writeGalleryUrlState([], 'az')
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

        <div className="gallery-products">
          <div className="gallery-products__header">
            <h1 id="gallery-title">Вироби</h1>
            <button
              className="gallery-filter-trigger"
              type="button"
              aria-label={`Відкрити фільтри, застосовано ${activeFilterCount}`}
              onClick={() => setIsFilterOpen(true)}
            >
              <span className="gallery-filter-trigger__label">Фільтри</span>
              <span className="gallery-filter-trigger__count">({activeFilterCount})</span>
              <img src={filterButtonIcon} alt="" aria-hidden="true" />
            </button>
          </div>

          {visibleProducts.length === 0 ? (
            <p className="gallery-products__empty">Немає виробів за вибраними фільтрами</p>
          ) : (
            <div className="gallery-products__grid" aria-label="Вироби галереї">
              {visibleProducts.map((product) => (
                <GalleryProductCard key={product.id} product={product} siteVariant={siteVariant} />
              ))}
            </div>
          )}
        </div>
      </section>
      <ContactForm />
      <ContactsSection />
      <Footer />
    </main>
  )
}

type GalleryProductCardProps = {
  product: GalleryProduct
  siteVariant: SiteVariant
}

function GalleryProductCard({ product, siteVariant }: GalleryProductCardProps) {
  const { isFavorite, toggleFavorite } = useShop()
  const productIsFavorite = isFavorite(product.id)
  const productUrl = getProductUrl(product.id, siteVariant)

  function handleFavoriteClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    toggleFavorite(product.id)
  }

  return (
    <article className="gallery-card">
      <a className="gallery-card__image-link" href={productUrl} tabIndex={-1} aria-hidden="true">
        <img src={product.image} alt={product.name} />
      </a>
      <p>{product.category}</p>
      <a className="gallery-card__title-link" href={productUrl}>
        <h2 title={product.name}>{product.name}</h2>
      </a>
      {siteVariant === 'order' && (
        <span className="gallery-card__price">{formatPrice(product.price)}</span>
      )}
      {siteVariant === 'usual' && (
        <button
          className="gallery-card__favorite"
          data-active={productIsFavorite}
          type="button"
          aria-pressed={productIsFavorite}
          aria-label={
            productIsFavorite ? 'Прибрати з обраного' : `Додати ${product.name} до обраного`
          }
          onClick={handleFavoriteClick}
        >
          <HeartIcon />
        </button>
      )}
    </article>
  )
}

type GalleryFiltersProps = {
  activeFilterCount: number
  isOpen: boolean
  onClose: () => void
  onReset: () => void
  onSortChange: (sort: GallerySort) => void
  onToggleCategory: (category: string) => void
  activeCategories: string[]
  siteVariant: SiteVariant
  sort: GallerySort
}

function GalleryFilters({
  activeFilterCount,
  isOpen,
  onClose,
  onReset,
  onSortChange,
  onToggleCategory,
  activeCategories,
  siteVariant,
  sort,
}: GalleryFiltersProps) {
  const categoryListRef = useRef<HTMLDivElement>(null)
  const [categoryScrollState, setCategoryScrollState] = useState({
    canScrollBackward: false,
    canScrollForward: false,
  })

  const updateCategoryScrollState = useCallback(() => {
    const categoryList = categoryListRef.current
    if (!categoryList) return

    const maxScrollTop = categoryList.scrollHeight - categoryList.clientHeight
    setCategoryScrollState({
      canScrollBackward: categoryList.scrollTop > 0,
      canScrollForward: categoryList.scrollTop < maxScrollTop - 1,
    })
  }, [])

  useEffect(() => {
    updateCategoryScrollState()
    window.addEventListener('resize', updateCategoryScrollState)
    return () => window.removeEventListener('resize', updateCategoryScrollState)
  }, [updateCategoryScrollState])

  function scrollCategoryList(direction: -1 | 1) {
    categoryListRef.current?.scrollBy({ top: direction * 168, behavior: 'smooth' })
  }

  return (
    <>
      <button
        className="gallery-filter-backdrop"
        data-open={isOpen}
        type="button"
        aria-label="Закрити фільтри"
        onClick={onClose}
      />
      <aside className="gallery-filters" data-open={isOpen} aria-label="Фільтри галереї">
        <div className="gallery-filters__top">
          <h2>Фільтри</h2>
          <button type="button" aria-label="Закрити фільтри" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <FilterGroup title="Категорії">
          <div className="gallery-filters__category-list">
            <button
              className="gallery-filters__category-nav"
              type="button"
              aria-label="Прокрутити категорії вгору"
              disabled={!categoryScrollState.canScrollBackward}
              onClick={() => scrollCategoryList(-1)}
            >
              <ArrowIcon />
            </button>
            <div
              className="gallery-filters__scroll"
              ref={categoryListRef}
              aria-label="Категорії виробів"
              onScroll={updateCategoryScrollState}
            >
              {galleryCategories.map((category) => (
                <CategoryTag
                  isActive={
                    category === 'Усі категорії'
                      ? activeCategories.length === 0
                      : activeCategories.includes(category)
                  }
                  key={category}
                  label={category}
                  onClick={() => onToggleCategory(category)}
                />
              ))}
            </div>
            <button
              className="gallery-filters__category-nav"
              type="button"
              aria-label="Прокрутити категорії вниз"
              disabled={!categoryScrollState.canScrollForward}
              onClick={() => scrollCategoryList(1)}
            >
              <ArrowIcon />
            </button>
          </div>
        </FilterGroup>

        <FilterGroup title="Сортування">
          <label className="gallery-radio">
            <input checked={sort === 'az'} type="radio" onChange={() => onSortChange('az')} />
            <span aria-hidden="true" />
            За алфавітом: від А до Я
          </label>
          <label className="gallery-radio">
            <input checked={sort === 'za'} type="radio" onChange={() => onSortChange('za')} />
            <span aria-hidden="true" />
            За алфавітом: від Я до А
          </label>
          {siteVariant === 'order' && (
            <>
              <label className="gallery-radio">
                <input
                  checked={sort === 'priceHigh'}
                  type="radio"
                  onChange={() => onSortChange('priceHigh')}
                />
                <span aria-hidden="true" />
                За ціною: від найбільшої
              </label>
              <label className="gallery-radio">
                <input
                  checked={sort === 'priceLow'}
                  type="radio"
                  onChange={() => onSortChange('priceLow')}
                />
                <span aria-hidden="true" />
                За ціною: від найменшої
              </label>
            </>
          )}
        </FilterGroup>

        <button className="gallery-filters__reset" type="button" onClick={onReset}>
          <span>Очистити фільтри</span>
          <TrashIcon />
        </button>
        <span className="gallery-filters__count" aria-live="polite">
          {activeFilterCount}
        </span>
      </aside>
    </>
  )
}

type CategoryTagProps = {
  isActive: boolean
  label: string
  onClick: () => void
}

function CategoryTag({ isActive, label, onClick }: CategoryTagProps) {
  return (
    <button
      className="category-tag"
      data-active={isActive}
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
    >
      <span aria-hidden="true" />
      {label}
    </button>
  )
}

type FilterGroupProps = {
  children: ReactNode
  title: string
}

function FilterGroup({ children, title }: FilterGroupProps) {
  return (
    <section className="gallery-filters__group">
      <h3>{title}</h3>
      {children}
    </section>
  )
}