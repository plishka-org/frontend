import { useEffect, useState } from 'react'
import {
  getFeaturedReviewsApi,
  getReviews,
  getReviewsApi,
  getTopReviews,
} from '../services/api/reviewsApi'

const FEATURED_REVIEWS_LIMIT = 5

function getFallbackReviews(topOnly?: boolean) {
  return topOnly ? getTopReviews(FEATURED_REVIEWS_LIMIT) : getReviews()
}

export function useReviews(options?: { topOnly?: boolean }) {
  const [reviews, setReviews] = useState(() => getFallbackReviews(options?.topOnly))
  const loadReviews = options?.topOnly ? getFeaturedReviewsApi : getReviewsApi

  useEffect(() => {
    let isCancelled = false

    loadReviews(options?.topOnly ? FEATURED_REVIEWS_LIMIT : undefined)
      .then((nextReviews) => {
        if (!isCancelled) {
          setReviews(
            options?.topOnly || nextReviews.length
              ? nextReviews
              : getFallbackReviews(false),
          )
        }
      })
      .catch(() => {
        if (!isCancelled) setReviews(getFallbackReviews(options?.topOnly))
      })

    return () => {
      isCancelled = true
    }
  }, [loadReviews, options?.topOnly])

  function refresh() {
    loadReviews(options?.topOnly ? FEATURED_REVIEWS_LIMIT : undefined)
      .then((nextReviews) => {
        setReviews(
          options?.topOnly || nextReviews.length
            ? nextReviews
            : getFallbackReviews(false),
        )
      })
      .catch(() => setReviews(getFallbackReviews(options?.topOnly)))
  }

  return { reviews, refresh }
}
