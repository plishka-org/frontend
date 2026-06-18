import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { BestProduct } from "../../../data/bestProducts";
import { useShop } from "../../../hooks/useShop";
import { formatPrice } from "../../../utils/formatPrice";
import type { SiteVariant } from "../../../utils/siteVariant";
import { ArrowIcon, CheckIcon, CloseIcon, HeartIcon } from "../../icons/UiIcons";
import { OrderUnavailableNotice } from "../../OrderUnavailableNotice";

type ProductDetailSectionProps = {
  product: BestProduct;
  siteVariant: SiteVariant;
};

export function ProductDetailSection({
  product,
  siteVariant,
}: ProductDetailSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    Math.min(1, product.gallery.length - 1),
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { addToCart, isFavorite, isInCart, toggleFavorite } = useShop();

  const productIsFavorite = isFavorite(product.id);
  const productIsInCart = isInCart(product.id);
  const selectedImage = product.gallery[selectedIndex];
  const visibleThumbnails = product.gallery.slice(0, 5);
  const hasLongTitle = product.name.length > 14;

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
      if (event.key === "ArrowRight") {
        setSelectedIndex((current) =>
          current + 1 >= product.gallery.length ? 0 : current + 1,
        );
      }
      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) =>
          current - 1 < 0 ? product.gallery.length - 1 : current - 1,
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, product.gallery]);

  function moveSelection(direction: 1 | -1) {
    setSelectedIndex((currentIndex) => {
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0) return product.gallery.length - 1;
      if (nextIndex >= product.gallery.length) return 0;
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
            {visibleThumbnails.map((image, index) => (
              <button
                className="product-gallery__thumb"
                data-active={index === selectedIndex}
                key={`${image}-${index}`}
                type="button"
                onClick={() => openGalleryImage(index)}
                aria-label={`Відкрити фото ${index + 1}`}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>

          <button
            className="product-gallery__main"
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Відкрити фото на весь екран"
          >
            <img src={selectedImage} alt={product.name} />
          </button>

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
                    addToCart(product.id);
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

              <img
                src={selectedImage}
                alt={product.name}
              />

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