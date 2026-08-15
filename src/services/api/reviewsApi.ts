import { testimonials } from '../../data/testimonials'
import type { Testimonial } from '../../data/testimonials'
import { apiRequest, hasApiBaseUrl } from './client'
import { getHomeApi, type HomeReview } from './contentApi'
import { resolveMediaUrl, type MediaPreviewDto } from './mediaApi'

type PageResponse<T> = {
  content: T[]
}

type ReviewSummaryDto = {
  reviewId: number
  authorName: string
  content: string
  createdAt: string
  primaryMedia?: MediaPreviewDto | null
}

type ReviewMediaDto = MediaPreviewDto & {
  reviewMediaId: number
  isPrimary: boolean
  displayOrder: number
}

type ReviewDetailDto = {
  reviewId: number
  authorName: string
  content: string
  createdAt: string
  media: ReviewMediaDto[]
}

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

async function normalizeReviewDto(summary: ReviewSummaryDto): Promise<Testimonial> {
  const fallback = testimonials[summary.reviewId % testimonials.length] ?? testimonials[0]
  let detail: ReviewDetailDto | null = null

  try {
    detail = await apiRequest<ReviewDetailDto>(`/api/reviews/${summary.reviewId}`, { auth: false })
  } catch {
    detail = null
  }

  const media = detail?.media?.length
    ? detail.media
    : summary.primaryMedia
      ? [summary.primaryMedia]
      : []
  const images = await Promise.all(media.map((item) => resolveMediaUrl(item.s3Key, fallback.cardImage)))
  const safeImages = images.length ? images : fallback.images

  return normalizeReview({
    id: summary.reviewId,
    author: summary.authorName,
    text: summary.content,
    images: safeImages,
    cardImage: safeImages[0] ?? fallback.cardImage,
    createdAt: summary.createdAt,
  })
}

async function normalizeFeaturedReviewDto(review: HomeReview): Promise<Testimonial> {
  const fallback = testimonials[review.reviewId % testimonials.length] ?? testimonials[0]
  const orderedMedia = [...review.media].sort((first, second) => first.displayOrder - second.displayOrder)
  const images = await Promise.all(
    orderedMedia.map((item) => resolveMediaUrl(item.s3Key, fallback.cardImage)),
  )
  const safeImages = images.length ? images : fallback.images

  return normalizeReview({
    id: review.reviewId,
    author: review.authorName,
    text: review.content,
    images: safeImages,
    cardImage: safeImages[0] ?? fallback.cardImage,
    createdAt: fallback.createdAt,
  })
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

export async function getReviewsApi(limit?: number): Promise<Testimonial[]> {
  if (!hasApiBaseUrl()) {
    return limit ? getTopReviews(limit) : getReviews()
  }

  const page = await apiRequest<PageResponse<ReviewSummaryDto>>(
    `/api/reviews?size=${limit ?? 16}`,
    { auth: false },
  )
  const reviews = await Promise.all(page.content.map(normalizeReviewDto))
  return limit ? reviews.slice(0, limit) : reviews
}

export async function getFeaturedReviewsApi(limit = 3): Promise<Testimonial[]> {
  if (!hasApiBaseUrl()) return getTopReviews(limit)

  const home = await getHomeApi()
  const reviews = await Promise.all(home.featuredReviews.map(normalizeFeaturedReviewDto))
  return reviews.slice(0, limit)
}
