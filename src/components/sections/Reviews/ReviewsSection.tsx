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
  const safeReviewIndex = Math.min(activeReviewIndex, Math.max(0, reviews.length - 1))
  const activeReview = reviews[safeReviewIndex]
  const activeMedia = activeReview
    ? activeReview.media ?? activeReview.images.map((url) => ({ url, mediaType: 'IMAGE' as const }))
    : []
  const safeImageIndex = Math.min(activeImageIndex, Math.max(0, activeMedia.length - 1))

  function showReview(reviewIndex: number) {
    setActiveReviewIndex(reviewIndex)
    setActiveImageIndex(0)
  }

  function showPreviousImage() {
    if (!activeReview) return

    setActiveImageIndex((currentIndex) => {
      const safeCurrentIndex = Math.min(currentIndex, activeMedia.length - 1)
      return safeCurrentIndex === 0 ? activeMedia.length - 1 : safeCurrentIndex - 1
    })
  }

  function showNextImage() {
    if (!activeReview) return

    setActiveImageIndex((currentIndex) => {
      const safeCurrentIndex = Math.min(currentIndex, activeMedia.length - 1)
      return safeCurrentIndex === activeMedia.length - 1 ? 0 : safeCurrentIndex + 1
    })
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

        {!activeReview ? (
          <p className="reviews-section__empty">На головній сторінці поки немає відгуків.</p>
        ) : (
          <div className="reviews-showcase">
          <div className="reviews-gallery" aria-label="Фото відгуку">
            <div className="reviews-gallery__thumbs">
              {activeMedia.map((media, imageIndex) => (
                <button
                  className={imageIndex === safeImageIndex ? 'is-active' : undefined}
                  type="button"
                  key={`${activeReview.id}-${imageIndex}`}
                  aria-label={`Показати медіа ${imageIndex + 1}`}
                  aria-pressed={imageIndex === safeImageIndex}
                  onClick={() => setActiveImageIndex(imageIndex)}
                >
                  {media.mediaType === 'VIDEO'
                    ? <span className="reviews-gallery__video-thumb" aria-hidden="true">▶</span>
                    : <img src={media.url} alt="" loading="lazy" decoding="async" />}
                </button>
              ))}
            </div>

            {activeMedia[safeImageIndex]?.mediaType === 'VIDEO'
              ? <video className="reviews-gallery__main" src={activeMedia[safeImageIndex].url} controls preload="metadata" />
              : <img className="reviews-gallery__main" src={activeMedia[safeImageIndex]?.url} alt={`Виріб з відгуку ${activeReview.author}`} loading="lazy" decoding="async" />}

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
                    className={reviewIndex === safeReviewIndex ? 'is-active' : undefined}
                    type="button"
                    key={review.id}
                    aria-label={`Показати відгук ${review.id}`}
                    aria-current={reviewIndex === safeReviewIndex ? 'true' : undefined}
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
        )}
      </div>
    </section>
  )
}
