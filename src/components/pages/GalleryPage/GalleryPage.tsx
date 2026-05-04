import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import filterButtonIcon from '../../../assets/galery-block/icons/button-filter-2.svg'
import { galleryCategories, galleryProducts } from '../../../data/galleryProducts'
import type { SiteVariant } from '../../../utils/siteVariant'
import { CloseIcon, HeartIcon, TrashIcon } from '../../icons/UiIcons'
import { Footer } from '../../layout/Footer/Footer'
import { Header } from '../../layout/Header/Header'
import { ContactsSection } from '../../sections/Contacts/ContactsSection'
import ContactForm from '../../sections/ContactForm/ContactForm'

type GalleryPageProps = {
  siteVariant: SiteVariant
}

type GallerySort = 'az' | 'za' | 'priceHigh' | 'priceLow'

const defaultSelectedCategories = ['Альтанки']

export function GalleryPage({ siteVariant }: GalleryPageProps) {
  const [selectedCategories, setSelectedCategories] = useState(defaultSelectedCategories)
  const [sort, setSort] = useState<GallerySort>('az')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const activeFilterCount = selectedCategories.includes('Усі категорії')
    ? 0
    : selectedCategories.length

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
    const filteredProducts =
      selectedCategories.length === 0 || selectedCategories.includes('Усі категорії')
        ? galleryProducts
        : galleryProducts.filter((product) => selectedCategories.includes(product.category))

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
  }, [selectedCategories, sort])

  function toggleCategory(category: string) {
    if (category === 'Усі категорії') {
      setSelectedCategories((currentCategories) =>
        currentCategories.includes(category) ? [] : [category],
      )
      return
    }

    setSelectedCategories((currentCategories) => {
      const withoutAll = currentCategories.filter((item) => item !== 'Усі категорії')

      if (withoutAll.includes(category)) {
        return withoutAll.filter((item) => item !== category)
      }

      return [...withoutAll, category]
    })
  }

  function resetFilters() {
    setSelectedCategories([])
    setSort('az')
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
          onSortChange={setSort}
          onToggleCategory={toggleCategory}
          selectedCategories={selectedCategories}
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

          <div className="gallery-products__grid" aria-label="Вироби галереї">
            {visibleProducts.map((product) => (
              <article className="gallery-card" key={product.id}>
                <img src={product.image} alt={product.name} />
                <p>{product.category}</p>
                <h2 title={product.name}>{product.name}</h2>
                {siteVariant === 'order' && <span>Ціна у грн</span>}
                {siteVariant === 'usual' && (
                  <button
                    className="gallery-card__favorite"
                    type="button"
                    aria-label={`Додати ${product.name} до обраного`}
                  >
                    <HeartIcon />
                  </button>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
      <ContactForm />
      <ContactsSection />
      <Footer />
    </main>
  )
}

type GalleryFiltersProps = {
  activeFilterCount: number
  isOpen: boolean
  onClose: () => void
  onReset: () => void
  onSortChange: (sort: GallerySort) => void
  onToggleCategory: (category: string) => void
  selectedCategories: string[]
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
  selectedCategories,
  siteVariant,
  sort,
}: GalleryFiltersProps) {
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
          <div className="gallery-filters__scroll">
            {galleryCategories.map((category) => (
              <label className="gallery-checkbox" key={category}>
                <input
                  checked={selectedCategories.includes(category)}
                  type="checkbox"
                  onChange={() => onToggleCategory(category)}
                />
                <span aria-hidden="true" />
                {category}
              </label>
            ))}
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

type FilterGroupProps = {
  children: ReactNode
  title: string
}

function FilterGroup({ children, title }: FilterGroupProps) {
  return (
    <section className="gallery-filters__group">
      <h3>
        {title}
        <span aria-hidden="true">⌃</span>
      </h3>
      {children}
    </section>
  )
}
