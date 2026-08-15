import { useState } from 'react'
import { useReviews } from '../../../hooks/useReviews'
import { getReviewsUrl } from '../../../utils/productUrl'
import type { SiteVariant } from '../../../utils/siteVariant'
import { ArrowIcon } from '../../icons/UiIcons'

type ReviewsSectionProps = {
  siteVariant: SiteVariant
}

export function ReviewsSection({ siteVariant }: ReviewsSectionProps) {
  const { reviews } = useReviews({ topOnly: true })
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const activeReview = reviews[activeReviewIndex]
  const activeMedia = activeReview.media ?? activeReview.images.map((url) => ({ url, mediaType: 'IMAGE' as const }))

  function showReview(reviewIndex: number) {
    setActiveReviewIndex(reviewIndex)
    setActiveImageIndex(0)
  }

  function showPreviousImage() {
    if (!activeReview) return

    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? activeMedia.length - 1 : currentIndex - 1,
    )
  }

  function showNextImage() {
    if (!activeReview) return

    setActiveImageIndex((currentIndex) =>
      currentIndex === activeMedia.length - 1 ? 0 : currentIndex + 1,
    )
  }

  return (
    <section className="reviews-section" id="reviews" aria-labelledby="reviews-title">
      <div className="reviews-section__inner">
        <div className="reviews-section__top">
          <h1 id="reviews-title">Відгуки</h1>
          <a className="reviews-section__link" href={getReviewsUrl(siteVariant)}>
            <span>Усі відгуки</span>
            <ArrowIcon />
          </a>
        </div>

        <div className="reviews-showcase">
          <div className="reviews-gallery" aria-label="Фото відгуку">
            <div className="reviews-gallery__thumbs">
              {activeMedia.map((media, imageIndex) => (
                <button
                  className={imageIndex === activeImageIndex ? 'is-active' : undefined}
                  type="button"
                  key={`${activeReview.id}-${imageIndex}`}
                  aria-label={`Показати медіа ${imageIndex + 1}`}
                  aria-pressed={imageIndex === activeImageIndex}
                  onClick={() => setActiveImageIndex(imageIndex)}
                >
                  {media.mediaType === 'VIDEO'
                    ? <span className="reviews-gallery__video-thumb" aria-hidden="true">▶</span>
                    : <img src={media.url} alt="" loading="lazy" decoding="async" />}
                </button>
              ))}
            </div>

            {activeMedia[activeImageIndex]?.mediaType === 'VIDEO'
              ? <video className="reviews-gallery__main" src={activeMedia[activeImageIndex].url} controls preload="metadata" />
              : <img className="reviews-gallery__main" src={activeMedia[activeImageIndex]?.url} alt={`Виріб з відгуку ${activeReview.author}`} loading="lazy" decoding="async" />}

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
                    {reviewIndex + 1}
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
