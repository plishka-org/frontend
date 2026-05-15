import { useState } from 'react'
import { testimonials } from '../../../data/testimonials'
import type { Testimonial } from '../../../data/testimonials'
import type { SiteVariant } from '../../../utils/siteVariant'
import { ArrowIcon } from '../../icons/UiIcons'
import { Footer } from '../../layout/Footer/Footer'
import { Header } from '../../layout/Header/Header'
import { ContactsSection } from '../../sections/Contacts/ContactsSection'
import ContactForm from '../../sections/ContactForm/ContactForm'

type ReviewsPageProps = {
  siteVariant: SiteVariant
}

export function ReviewsPage({ siteVariant }: ReviewsPageProps) {
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)
  const [activeImageIndex, setActiveImageIndex] = useState(1)
  const activeReview = testimonials[activeReviewIndex]

  function selectReview(reviewIndex: number) {
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
    <main className="page-shell reviews-page">
      <Header activePage="reviews" siteVariant={siteVariant} />
      <section className="reviews-page-section" aria-labelledby="reviews-page-title">
        <div className="reviews-page-section__inner">
          <div className="reviews-page-section__top">
            <div>
              <h1 id="reviews-page-title">Відгуки</h1>
              <p>
                Кожна деталь нашої роботи - це історія, написана разом із вами.
                Ми вдячні за те, що ви обираєте майстерність, яка залишається на покоління
              </p>
            </div>
            <a className="reviews-page-section__link" href="#all-reviews">
              <span>Усі відгуки</span>
              <ArrowIcon />
            </a>
          </div>

          <div className="reviews-feature">
            <div className="reviews-feature-gallery" aria-label="Фото відгуку">
              <div className="reviews-feature-gallery__thumbs">
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
                className="reviews-feature-gallery__main"
                src={activeReview.images[activeImageIndex]}
                alt={`Виріб з відгуку ${activeReview.author}`}
              />

              <div className="reviews-feature-gallery__controls" aria-label="Перемикання фото">
                <button type="button" aria-label="Попереднє фото" onClick={showPreviousImage}>
                  <ArrowIcon />
                </button>
                <button type="button" aria-label="Наступне фото" onClick={showNextImage}>
                  <ArrowIcon />
                </button>
              </div>
            </div>

            <div className="reviews-feature-content">
              <span aria-hidden="true">“</span>
              <blockquote>
                <p>{activeReview.text}</p>
                <cite>{activeReview.author}</cite>
              </blockquote>
            </div>
          </div>

          <ReviewsGrid
            activeReviewId={activeReview.id}
            onReviewSelect={selectReview}
            reviews={testimonials}
          />
        </div>
      </section>
      <ContactForm />
      <ContactsSection />
      <Footer />
    </main>
  )
}

type ReviewsGridProps = {
  activeReviewId: number
  onReviewSelect: (reviewIndex: number) => void
  reviews: Testimonial[]
}

function ReviewsGrid({
  activeReviewId,
  onReviewSelect,
  reviews,
}: ReviewsGridProps) {
  return (
    <div className="reviews-grid-block" id="all-reviews">
      <div className="reviews-grid" aria-label="Усі відгуки">
        {reviews.map((review, reviewIndex) => (
          <ReviewCard
            isActive={review.id === activeReviewId}
            key={review.id}
            onSelect={() => onReviewSelect(reviewIndex)}
            review={review}
          />
        ))}
      </div>
    </div>
  )
}

type ReviewCardProps = {
  isActive: boolean
  onSelect: () => void
  review: Testimonial
}

function ReviewCard({ isActive, onSelect, review }: ReviewCardProps) {
  return (
    <article className="review-card" data-active={isActive}>
      <button
        type="button"
        aria-label={`Показати відгук ${review.author}`}
        aria-pressed={isActive}
        onClick={onSelect}
      >
        <img src={review.cardImage} alt="" />
        <span className="review-card__text">{review.text}</span>
        <span className="review-card__author">{review.author}</span>
      </button>
    </article>
  )
}
