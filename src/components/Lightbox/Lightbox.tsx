import { useEffect, useRef } from 'react'
import type { GalleryProduct } from '../../data/galleryProducts'
import { ArrowIcon, CloseIcon } from '../icons/UiIcons'

type LightboxProps = {
  product: GalleryProduct
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function Lightbox({ product, onClose, onNext, onPrev }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onNext()
      if (event.key === 'ArrowLeft') onPrev()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNext, onPrev])

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      tabIndex={-1}
      ref={dialogRef}
      onClick={handleBackdropClick}
    >
      <button
        className="lightbox__backdrop"
        type="button"
        aria-label="Закрити"
        onClick={onClose}
      />

      <div
        className="lightbox__content"
        onClick={handleBackdropClick}
      >
        <button
          className="lightbox__close"
          type="button"
          aria-label="Закрити (Esc)"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <button
          className="lightbox__nav lightbox__nav--prev"
          type="button"
          aria-label="Попереднє фото"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
        >
          <ArrowIcon />
        </button>

        <figure
          className="lightbox__figure"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            className="lightbox__image"
            src={product.image}
            alt={product.name}
          />
          <figcaption className="lightbox__caption">
            {product.name}
          </figcaption>
        </figure>

        <button
          className="lightbox__nav lightbox__nav--next"
          type="button"
          aria-label="Наступне фото"
          onClick={(e) => { e.stopPropagation(); onNext() }}
        >
          <ArrowIcon />
        </button>
      </div>
    </div>
  )
}