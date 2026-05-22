import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import filterButtonIcon from '../../../assets/galery-block/icons/button-filter-2.svg'
import { galleryCategories } from '../../../data/galleryProducts'
import type { SiteVariant } from '../../../utils/siteVariant'
import { ArrowIcon, CloseIcon, TrashIcon } from '../../icons/UiIcons'
import type { GallerySort } from './types'

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

export function GalleryFilterTrigger({
  activeFilterCount,
  onOpen,
}: {
  activeFilterCount: number
  onOpen: () => void
}) {
  return (
    <button
      className="gallery-filter-trigger"
      type="button"
      aria-label={`Відкрити фільтри, застосовано ${activeFilterCount}`}
      onClick={onOpen}
    >
      <span className="gallery-filter-trigger__label">Фільтри</span>
      <span className="gallery-filter-trigger__count">({activeFilterCount})</span>
      <img src={filterButtonIcon} alt="" aria-hidden="true" />
    </button>
  )
}

export function GalleryFilters({
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

    if (!categoryList) {
      return
    }

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
    categoryListRef.current?.scrollBy({
      top: direction * 168,
      behavior: 'smooth',
    })
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
