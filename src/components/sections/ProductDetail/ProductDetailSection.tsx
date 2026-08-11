import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type {
  ProductMediaUi,
  ProductUi,
} from "../../../services/api/productsApi";
import { useShop } from "../../../hooks/useShop";
import { formatPrice } from "../../../utils/formatPrice";
import type { SiteVariant } from "../../../utils/siteVariant";
import { ArrowIcon, CheckIcon, CloseIcon, HeartIcon } from "../../icons/UiIcons";
import { OrderUnavailableNotice } from "../../OrderUnavailableNotice";

type ProductDetailSectionProps = {
  product: ProductUi;
  siteVariant: SiteVariant;
};

export function ProductDetailSection({
  product,
  siteVariant,
}: ProductDetailSectionProps) {
  const mediaItems = useMemo<ProductMediaUi[]>(
    () =>
      product.media?.length
        ? product.media
        : product.gallery.map((url, index) => ({
            url,
            thumbnailUrl: url,
            mediaType: "IMAGE" as const,
            isPrimary: index === 0,
            displayOrder: index,
          })),
    [product.gallery, product.media],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { addToCart, isFavorite, isInCart, toggleFavorite } = useShop();

  const productIsFavorite = isFavorite(product.id);
  const productIsInCart = isInCart(product.id);
  const safeSelectedIndex = Math.min(selectedIndex, Math.max(mediaItems.length - 1, 0));
  const selectedMedia = mediaItems[safeSelectedIndex] ?? mediaItems[0];
  const visibleThumbnails = mediaItems.slice(0, 5);
  const hasLongTitle = product.name.length > 14;

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
      if (event.key === "ArrowRight") {
        setSelectedIndex((current) =>
          current + 1 >= mediaItems.length ? 0 : current + 1,
        );
      }
      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) =>
          current - 1 < 0 ? mediaItems.length - 1 : current - 1,
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, mediaItems.length]);

  function moveSelection(direction: 1 | -1) {
    setSelectedIndex((currentIndex) => {
      const boundedIndex = Math.min(currentIndex, Math.max(mediaItems.length - 1, 0));
      const nextIndex = boundedIndex + direction;
      if (nextIndex < 0) return mediaItems.length - 1;
      if (nextIndex >= mediaItems.length) return 0;
      return nextIndex;
    });
  }

  function openGalleryImage(index: number) {
    setSelectedIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      <section className="product-detail" aria-labelledby="product-title">
        <div
          className="product-gallery"
          aria-label={`Фотографії виробу ${product.name}`}
        >
          <div className="product-gallery__thumbs">
            {visibleThumbnails.map((media, index) => (
              <button
                className="product-gallery__thumb"
                data-active={index === safeSelectedIndex}
                data-media-type={media.mediaType.toLowerCase()}
                key={media.id ?? media.s3Key ?? media.displayOrder}
                type="button"
                onClick={() => openGalleryImage(index)}
                aria-label={`Відкрити ${media.mediaType === "VIDEO" ? "відео" : "фото"} ${index + 1}`}
              >
                {media.thumbnailUrl ? (
                  <img src={media.thumbnailUrl} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="product-gallery__video-placeholder">
                    <span aria-hidden="true">▶</span>
                    Відео
                  </span>
                )}
              </button>
            ))}
          </div>

          {selectedMedia?.mediaType === "VIDEO" ? (
            <div className="product-gallery__main" data-media-type="video">
              {selectedMedia.url ? (
                <video
                  key={selectedMedia.url}
                  src={selectedMedia.url}
                  poster={selectedMedia.thumbnailUrl}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`Відео виробу ${product.name}`}
                />
              ) : (
                <div className="product-gallery__media-loading" role="status">
                  Завантажуємо відео…
                </div>
              )}
            </div>
          ) : (
            <button
              className="product-gallery__main"
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="Відкрити фото на весь екран"
            >
              <img src={selectedMedia?.url} alt={product.name} decoding="async" />
            </button>
          )}

          <div
            className="product-gallery__controls"
            aria-label="Перемикання фото"
          >
            <button
              type="button"
              onClick={() => moveSelection(-1)}
              aria-label="Попереднє фото"
            >
              <ArrowIcon />
            </button>
            <button
              type="button"
              onClick={() => moveSelection(1)}
              aria-label="Наступне фото"
            >
              <ArrowIcon />
            </button>
          </div>
        </div>

        <div className="product-detail__info" data-long-title={hasLongTitle}>
          <button
            className="product-detail__favorite"
            data-active={productIsFavorite}
            type="button"
            onClick={() => toggleFavorite(product.id)}
            aria-pressed={productIsFavorite}
            aria-label={
              productIsFavorite ? "Прибрати з обраного" : "Додати до обраного"
            }
          >
            <HeartIcon />
          </button>

          <h1 id="product-title">{product.name}</h1>
          <h2>Опис</h2>
          <p>{product.description}</p>

          {siteVariant === "usual" && <OrderUnavailableNotice />}

          {siteVariant === "order" && (
            <div className="product-purchase">
              <strong>{formatPrice(product.price)}</strong>
              <button
                className="product-purchase__button"
                data-added={productIsInCart}
                type="button"
                disabled={productIsInCart}
                onClick={() => {
                  if (!productIsInCart) {
                    addToCart(product);
                  }
                }}
                aria-pressed={productIsInCart}
              >
                <span>
                  {productIsInCart ? "Додано до кошика" : "Додати до кошика"}
                </span>
                {productIsInCart && <CheckIcon />}
              </button>
            </div>
          )}
        </div>
      </section>

      {lightboxOpen &&
        createPortal(
          <div
            className="product-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="product-lightbox__close"
              type="button"
              aria-label="Закрити (Esc)"
              onClick={() => setLightboxOpen(false)}
            >
              <CloseIcon />
            </button>

            <figure
              className="product-lightbox__figure"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="product-lightbox__nav product-lightbox__nav--prev"
                type="button"
                aria-label="Попереднє фото"
                onClick={(e) => {
                  e.stopPropagation();
                  moveSelection(-1);
                }}
              >
                <ArrowIcon />
              </button>

              {selectedMedia?.mediaType === "VIDEO" ? (
                selectedMedia.url ? (
                  <video
                    key={selectedMedia.url}
                    src={selectedMedia.url}
                    poster={selectedMedia.thumbnailUrl}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    aria-label={`Відео виробу ${product.name}`}
                  />
                ) : (
                  <div className="product-gallery__media-loading" role="status">
                    Завантажуємо відео…
                  </div>
                )
              ) : (
                <img src={selectedMedia?.url} alt={product.name} />
              )}

              <button
                className="product-lightbox__nav product-lightbox__nav--next"
                type="button"
                aria-label="Наступне фото"
                onClick={(e) => {
                  e.stopPropagation();
                  moveSelection(1);
                }}
              >
                <ArrowIcon />
              </button>

              <figcaption className="product-lightbox__caption">
                {product.name}
              </figcaption>
            </figure>
          </div>,
          document.body,
        )}
    </>
  );
}
