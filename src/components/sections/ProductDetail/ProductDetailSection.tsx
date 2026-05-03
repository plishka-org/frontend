import { useState } from 'react'
import type { BestProduct } from '../../../data/bestProducts'
import type { SiteVariant } from '../../../utils/siteVariant'
import { ArrowIcon, CheckIcon, HeartIcon } from '../../icons/UiIcons'

type ProductDetailSectionProps = {
  isInCart: boolean
  onAddToCart: () => void
  product: BestProduct
  siteVariant: SiteVariant
}

export function ProductDetailSection({
  isInCart,
  onAddToCart,
  product,
  siteVariant,
}: ProductDetailSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(Math.min(1, product.gallery.length - 1))
  const [isFavorite, setIsFavorite] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const selectedImage = product.gallery[selectedIndex]
  const visibleThumbnails = product.gallery.slice(0, 5)
  const hasLongTitle = product.name.length > 14

  function moveSelection(direction: 1 | -1) {
    setSelectedIndex((currentIndex) => {
      const nextIndex = currentIndex + direction
      if (nextIndex < 0) {
        return product.gallery.length - 1
      }
      if (nextIndex >= product.gallery.length) {
        return 0
      }
      return nextIndex
    })
  }

  function openGalleryImage(image: string, index: number) {
    setSelectedIndex(index)
    setLightboxImage(image)
  }

  return (
    <section className="product-detail" aria-labelledby="product-title">
      <div className="product-gallery" aria-label={`Фотографії виробу ${product.name}`}>
        <div className="product-gallery__thumbs">
          {visibleThumbnails.map((image, index) => (
            <button
              className="product-gallery__thumb"
              data-active={index === selectedIndex}
              key={`${image}-${index}`}
              type="button"
              onClick={() => openGalleryImage(image, index)}
              aria-label={`Відкрити фото ${index + 1}`}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>

        <button
          className="product-gallery__main"
          type="button"
          onClick={() => setLightboxImage(selectedImage)}
          aria-label="Відкрити фото на весь екран"
        >
          <img src={selectedImage} alt={product.name} />
        </button>

        <div className="product-gallery__controls" aria-label="Перемикання фото">
          <button type="button" onClick={() => moveSelection(-1)} aria-label="Попереднє фото">
            <ArrowIcon />
          </button>
          <button type="button" onClick={() => moveSelection(1)} aria-label="Наступне фото">
            <ArrowIcon />
          </button>
        </div>
      </div>

      <div className="product-detail__info" data-long-title={hasLongTitle}>
        <button
          className="product-detail__favorite"
          data-active={isFavorite}
          type="button"
          onClick={() => setIsFavorite((value) => !value)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Прибрати з обраного' : 'Додати до обраного'}
        >
          <HeartIcon />
        </button>

        <h1 id="product-title">{product.name}</h1>
        <h2>Опис</h2>
        <p>{product.description}</p>

        {siteVariant === 'order' && (
          <div className="product-purchase">
            <strong>{product.price} грн</strong>
            <button
              className="product-purchase__button"
              data-added={isInCart}
              type="button"
              onClick={onAddToCart}
              aria-pressed={isInCart}
            >
              <span>{isInCart ? 'Додано до кошика' : 'Додати до кошика'}</span>
              {isInCart && <CheckIcon />}
            </button>
          </div>
        )}
      </div>

      {lightboxImage && (
        <div className="product-lightbox" role="dialog" aria-modal="true">
          <button
            className="product-lightbox__backdrop"
            type="button"
            onClick={() => setLightboxImage(null)}
            aria-label="Закрити перегляд фото"
          />
          <img src={lightboxImage} alt={product.name} />
          <button
            className="product-lightbox__close"
            type="button"
            onClick={() => setLightboxImage(null)}
          >
            Закрити
          </button>
        </div>
      )}
    </section>
  )
}
