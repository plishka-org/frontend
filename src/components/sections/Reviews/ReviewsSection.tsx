import { useState } from 'react'
import { reviews } from '../../../data/reviews'
import { ArrowIcon } from '../../icons/UiIcons'

export function ReviewsSection() {
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)
  const [activeImageIndex, setActiveImageIndex] = useState(1)
  const activeReview = reviews[activeReviewIndex]

  function showReview(reviewIndex: number) {
    setActiveReviewIndex(reviewIndex)
    setActiveImageIndex(1)
  }

  function showPreviousImage() {
    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? activeReview.images.length - 1 : currentIndex - 1,
    )
  }

  function showNextImage() {
    setActiveImageIndex((currentIndex) =>
      currentIndex === activeReview.images.length - 1 ? 0 : currentIndex + 1,
    )
  }

  return (
    <section className="reviews-section" id="reviews" aria-labelledby="reviews-title">
      <div className="reviews-section__inner">
        <div className="reviews-section__top">
          <h1 id="reviews-title">Відгуки</h1>
          <a className="reviews-section__link" href="#reviews">
            <span>Усі відгуки</span>
            <ArrowIcon />
          </a>
        </div>

        <div className="reviews-showcase">
          <div className="reviews-gallery" aria-label="Фото відгуку">
            <div className="reviews-gallery__thumbs">
              {activeReview.images.map((image, imageIndex) => (
                <button
                  className={imageIndex === activeImageIndex ? 'is-active' : undefined}
                  type="button"
                  key={`${activeReview.id}-${imageIndex}`}
                  aria-label={`Показати фото ${imageIndex + 1}`}
                  aria-pressed={imageIndex === activeImageIndex}
                  onClick={() => setActiveImageIndex(imageIndex)}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>

            <img
              className="reviews-gallery__main"
              src={activeReview.images[activeImageIndex]}
              alt={`Виріб з відгуку ${activeReview.author}`}
            />

            <div className="reviews-gallery__controls" aria-label="Перемикання фото">
              <button type="button" aria-label="Попереднє фото" onClick={showPreviousImage}>
                <ArrowIcon />
              </button>
              <button type="button" aria-label="Наступне фото" onClick={showNextImage}>
                <ArrowIcon />
              </button>
            </div>
          </div>

          <div className="reviews-content">
            <div className="reviews-content__meta">
              <div className="reviews-pagination" aria-label="Сторінки відгуків">
                {reviews.map((review, reviewIndex) => (
                  <button
                    className={reviewIndex === activeReviewIndex ? 'is-active' : undefined}
                    type="button"
                    key={review.id}
                    aria-label={`Показати відгук ${review.id}`}
                    aria-current={reviewIndex === activeReviewIndex ? 'true' : undefined}
                    onClick={() => showReview(reviewIndex)}
                  >
                    {review.id}
                  </button>
                ))}
              </div>
              <span className="reviews-content__quote" aria-hidden="true">
                “
              </span>
            </div>

            <blockquote className="reviews-content__text">
              <p>{activeReview.text}</p>
              <cite>{activeReview.author}</cite>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}
