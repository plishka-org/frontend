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
  return testimonials.map((review) => ({
    ...review,
    images: [...review.images],
    media: review.media?.map((item) => ({ ...item })),
  }))
}

function normalizeReview(review: Testimonial): Testimonial {
  return {
    ...review,
    images: review.images?.length ? review.images : testimonials[0].images,
    media: review.media?.length
      ? review.media
      : (review.images?.length ? review.images : testimonials[0].images).map((url) => ({ url, mediaType: 'IMAGE' as const })),
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
  const resolvedMedia = await Promise.all(media.map(async (item) => ({
    url: await resolveMediaUrl(item.s3Key, fallback.cardImage),
    mediaType: item.mediaType ?? 'IMAGE',
  })))
  const safeMedia = resolvedMedia.length
    ? resolvedMedia
    : fallback.images.map((url) => ({ url, mediaType: 'IMAGE' as const }))
  const images = safeMedia.filter((item) => item.mediaType === 'IMAGE').map((item) => item.url)
  const safeImages = images.length ? images : fallback.images

  return normalizeReview({
    id: summary.reviewId,
    author: summary.authorName,
    text: summary.content,
    images: safeImages,
    media: safeMedia,
    cardImage: safeImages[0] ?? fallback.cardImage,
    createdAt: summary.createdAt,
  })
}

async function normalizeFeaturedReviewDto(review: HomeReview): Promise<Testimonial> {
  const fallback = testimonials[review.reviewId % testimonials.length] ?? testimonials[0]
  const orderedMedia = [...review.media].sort((first, second) => first.displayOrder - second.displayOrder)
  const resolvedMedia = await Promise.all(orderedMedia.map(async (item) => ({
    url: await resolveMediaUrl(item.s3Key, fallback.cardImage),
    mediaType: item.mediaType,
  })))
  const safeMedia = resolvedMedia.length
    ? resolvedMedia
    : fallback.images.map((url) => ({ url, mediaType: 'IMAGE' as const }))
  const images = safeMedia.filter((item) => item.mediaType === 'IMAGE').map((item) => item.url)
  const safeImages = images.length ? images : fallback.images

  return normalizeReview({
    id: review.reviewId,
    author: review.authorName,
    text: review.content,
    images: safeImages,
    media: safeMedia,
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

export async function getFeaturedReviewsApi(limit = 5): Promise<Testimonial[]> {
  if (!hasApiBaseUrl()) return getTopReviews(limit)

  const home = await getHomeApi()
  const reviews = await Promise.all(home.featuredReviews.map(normalizeFeaturedReviewDto))
  return reviews.slice(0, limit)
}
