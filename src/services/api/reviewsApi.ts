import { testimonials } from '../../data/testimonials'
import type { Testimonial } from '../../data/testimonials'

export type ReviewCreatePayload = {
  author: string
  authorId: number
  rating: number
  text: string
}

export type ReviewUpdatePayload = {
  rating: number
  text: string
}

const reviewsStorageKey = 'plishkaReviews'

function cloneDefaultReviews() {
  return testimonials.map((review) => ({ ...review, images: [...review.images] }))
}

function normalizeReview(review: Testimonial): Testimonial {
  return {
    ...review,
    rating: Math.min(5, Math.max(1, Math.round(review.rating || 5))),
    images: review.images?.length ? review.images : testimonials[0].images,
    cardImage: review.cardImage || testimonials[0].cardImage,
    createdAt: review.createdAt || new Date().toISOString(),
  }
}

function persistReviews(reviews: Testimonial[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(reviewsStorageKey, JSON.stringify(reviews))
}

export function getReviews(): Testimonial[] {
  if (typeof window === 'undefined') {
    return cloneDefaultReviews()
  }

  try {
    const rawValue = window.localStorage.getItem(reviewsStorageKey)

    if (!rawValue) {
      const defaultReviews = cloneDefaultReviews()
      persistReviews(defaultReviews)
      return defaultReviews
    }

    const parsedReviews = JSON.parse(rawValue) as Testimonial[]
    return Array.isArray(parsedReviews) ? parsedReviews.map(normalizeReview) : cloneDefaultReviews()
  } catch {
    return cloneDefaultReviews()
  }
}

export function createReview(payload: ReviewCreatePayload): Testimonial[] {
  const reviews = getReviews()
  const id = Math.max(0, ...reviews.map((review) => review.id)) + 1
  const fallbackReview = testimonials[id % testimonials.length] ?? testimonials[0]
  const nextReview: Testimonial = {
    id,
    authorId: payload.authorId,
    author: payload.author,
    rating: payload.rating,
    text: payload.text,
    images: [...fallbackReview.images],
    cardImage: fallbackReview.cardImage,
    createdAt: new Date().toISOString(),
  }
  const nextReviews = [nextReview, ...reviews]
  persistReviews(nextReviews)
  return nextReviews
}

export function updateReview(
  reviewId: number,
  authorId: number,
  payload: ReviewUpdatePayload,
): Testimonial[] {
  const reviews = getReviews()
  const nextReviews = reviews.map((review) =>
    review.id === reviewId && review.authorId === authorId
      ? { ...review, rating: payload.rating, text: payload.text }
      : review,
  )
  persistReviews(nextReviews)
  return nextReviews
}

export function deleteReview(reviewId: number, authorId: number): Testimonial[] {
  const reviews = getReviews()
  const nextReviews = reviews.filter(
    (review) => review.id !== reviewId || review.authorId !== authorId,
  )
  persistReviews(nextReviews)
  return nextReviews
}

export function getTopReviews(limit = 3): Testimonial[] {
  return [...getReviews()]
    .sort((firstReview, secondReview) => {
      if (secondReview.rating !== firstReview.rating) {
        return secondReview.rating - firstReview.rating
      }

      return Date.parse(secondReview.createdAt) - Date.parse(firstReview.createdAt)
    })
    .slice(0, limit)
}
