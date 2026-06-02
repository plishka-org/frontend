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
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <button
        className="lightbox__backdrop"
        type="button"
        aria-label="Закрити"
        onClick={onClose}
      />

      <div className="lightbox__content">
        <button
          className="lightbox__close"
          type="button"
          aria-label="Закрити (Esc)"
          ref={closeButtonRef}
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <button
          className="lightbox__nav lightbox__nav--prev"
          type="button"
          aria-label="Попереднє фото"
          onClick={onPrev}
        >
          <ArrowIcon />
        </button>

        <figure className="lightbox__figure">
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
          onClick={onNext}
        >
          <ArrowIcon />
        </button>
      </div>
    </div>
  )
}