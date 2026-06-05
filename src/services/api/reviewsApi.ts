import { testimonials } from '../../data/testimonials'
import type { Testimonial } from '../../data/testimonials'

function cloneDefaultReviews() {
  return testimonials.map((review) => ({ ...review, images: [...review.images] }))
}

function normalizeReview(review: Testimonial): Testimonial {
  return {
    ...review,
    images: review.images?.length ? review.images : testimonials[0].images,
    cardImage: review.cardImage || testimonials[0].cardImage,
    createdAt: review.createdAt || new Date().toISOString(),
  }
}

export function getReviews(): Testimonial[] {
  return cloneDefaultReviews().map(normalizeReview)
}

export function getTopReviews(limit = 3): Testimonial[] {
  return [...getReviews()]
    .sort((firstReview, secondReview) => {
      return Date.parse(secondReview.createdAt) - Date.parse(firstReview.createdAt)
    })
    .slice(0, limit)
}
