import { useState } from 'react'
import type { Testimonial } from '../../../data/testimonials'
import { useAuth } from '../../../hooks/useAuth'
import { useReviews } from '../../../hooks/useReviews'
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
  const { user, requestLogin } = useAuth()
  const { reviews, addReview, editReview, removeReview } = useReviews()
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)
  const [activeImageIndex, setActiveImageIndex] = useState(1)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTouched, setReviewTouched] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const activeReview = reviews[Math.min(activeReviewIndex, reviews.length - 1)]
  const reviewTextError =
    reviewTouched && reviewText.trim().length < 10 ? 'Напишіть щонайменше 10 символів' : ''
  const isEditing = editingReviewId !== null

  function selectReview(reviewIndex: number) {
    setActiveReviewIndex(reviewIndex)
    setActiveImageIndex(1)
  }

  function showPreviousImage() {
    if (!activeReview) return

    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? activeReview.images.length - 1 : currentIndex - 1,
    )
  }

  function showNextImage() {
    if (!activeReview) return

    setActiveImageIndex((currentIndex) =>
      currentIndex === activeReview.images.length - 1 ? 0 : currentIndex + 1,
    )
  }

  function handleLoginClick() {
    requestLogin()
  }

  function resetReviewForm() {
    setReviewText('')
    setReviewRating(5)
    setReviewTouched(false)
    setEditingReviewId(null)
  }

  function handleReviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setReviewTouched(true)

    const trimmedText = reviewText.trim()

    if (!user || trimmedText.length < 10) {
      return
    }

    if (isEditing) {
      editReview(editingReviewId, user.id, {
        rating: reviewRating,
        text: trimmedText,
      })
    } else {
      addReview({
        author: user.name,
        authorId: user.id,
        rating: reviewRating,
        text: trimmedText,
      })
      setActiveReviewIndex(0)
      setActiveImageIndex(1)
    }

    resetReviewForm()
  }

  function startEditingReview(review: Testimonial) {
    setEditingReviewId(review.id)
    setReviewText(review.text)
    setReviewRating(review.rating)
    setReviewTouched(false)
  }

  function handleDeleteReview(review: Testimonial) {
    if (!user || user.id !== review.authorId) {
      return
    }

    if (!window.confirm('Ви впевнені?')) {
      return
    }

    removeReview(review.id, user.id)
    setActiveReviewIndex((currentIndex) => Math.max(0, Math.min(currentIndex, reviews.length - 2)))
    setActiveImageIndex(1)

    if (editingReviewId === review.id) {
      resetReviewForm()
    }
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
            currentUserId={user?.id ?? null}
            onDeleteReview={handleDeleteReview}
            onEditReview={startEditingReview}
            onReviewSelect={selectReview}
            reviews={reviews}
          />

          <section className="reviews-manager" aria-labelledby="reviews-manager-title">
            <div className="reviews-manager__intro">
              <h2 id="reviews-manager-title">
                {isEditing ? 'Редагувати відгук' : 'Залишити відгук'}
              </h2>
              <p>
                Оцініть роботу майстерні та напишіть короткий відгук. Редагувати або видалити можна лише власні відгуки.
              </p>
            </div>

            {!user ? (
              <div className="reviews-manager__auth">
                <p>Увійдіть, щоб залишити відгук.</p>
                <button type="button" onClick={handleLoginClick}>
                  Увійти
                </button>
              </div>
            ) : (
              <form className="reviews-manager__form" onSubmit={handleReviewSubmit} noValidate>
                <StarRating
                  label="Оцінка"
                  rating={reviewRating}
                  onChange={setReviewRating}
                />
                <label className="reviews-manager__field">
                  <span>Текст відгуку</span>
                  <textarea
                    value={reviewText}
                    maxLength={500}
                    placeholder="Поділіться враженнями від замовлення..."
                    aria-invalid={Boolean(reviewTextError)}
                    onBlur={() => setReviewTouched(true)}
                    onChange={(event) => setReviewText(event.target.value)}
                  />
                  <small>{reviewText.length}/500</small>
                  {reviewTextError && <em role="alert">{reviewTextError}</em>}
                </label>
                <div className="reviews-manager__actions">
                  {isEditing && (
                    <button type="button" onClick={resetReviewForm}>
                      Скасувати
                    </button>
                  )}
                  <button type="submit">
                    {isEditing ? 'Зберегти зміни' : 'Опублікувати відгук'}
                  </button>
                </div>
              </form>
            )}
          </section>
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
  currentUserId: number | null
  onDeleteReview: (review: Testimonial) => void
  onEditReview: (review: Testimonial) => void
  onReviewSelect: (reviewIndex: number) => void
  reviews: Testimonial[]
}

function ReviewsGrid({
  activeReviewId,
  currentUserId,
  onDeleteReview,
  onEditReview,
  onReviewSelect,
  reviews,
}: ReviewsGridProps) {
  return (
    <div className="reviews-grid-block" id="all-reviews">
      <div className="reviews-grid" aria-label="Усі відгуки">
        {reviews.map((review, reviewIndex) => (
          <ReviewCard
            isActive={review.id === activeReviewId}
            isOwnReview={currentUserId === review.authorId}
            key={review.id}
            onDelete={() => onDeleteReview(review)}
            onEdit={() => onEditReview(review)}
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
  isOwnReview: boolean
  onDelete: () => void
  onEdit: () => void
  onSelect: () => void
  review: Testimonial
}

function ReviewCard({ isActive, isOwnReview, onDelete, onEdit, onSelect, review }: ReviewCardProps) {
  return (
    <article className="review-card" data-active={isActive}>
      <button
        type="button"
        aria-label={`Показати відгук ${review.author}`}
        aria-pressed={isActive}
        onClick={onSelect}
      >
        <img src={review.cardImage} alt="" />
        <span className="review-card__rating" aria-label={`Оцінка ${review.rating} з 5`}>
          {'★'.repeat(review.rating)}
        </span>
        <span className="review-card__text">{review.text}</span>
        <span className="review-card__author">{review.author}</span>
      </button>
      {isOwnReview && (
        <div className="review-card__actions" aria-label="Керування відгуком">
          <button type="button" onClick={onEdit}>
            Редагувати
          </button>
          <button type="button" onClick={onDelete}>
            Видалити
          </button>
        </div>
      )}
    </article>
  )
}

type StarRatingProps = {
  label: string
  rating: number
  onChange: (rating: number) => void
}

function StarRating({ label, rating, onChange }: StarRatingProps) {
  return (
    <fieldset className="reviews-manager__rating">
      <legend>{label}</legend>
      <div>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`Оцінка ${value} з 5`}
            aria-pressed={value === rating}
            data-active={value <= rating}
            onClick={() => onChange(value)}
          >
            ★
          </button>
        ))}
      </div>
    </fieldset>
  )
}
