import { useEffect, useState } from 'react'
import {
  getFeaturedReviewsApi,
  getReviews,
  getReviewsApi,
  getTopReviews,
} from '../services/api/reviewsApi'

function getFallbackReviews(topOnly?: boolean) {
  return topOnly ? getTopReviews(3) : getReviews()
}

export function useReviews(options?: { topOnly?: boolean }) {
  const [reviews, setReviews] = useState(() => getFallbackReviews(options?.topOnly))
  const loadReviews = options?.topOnly ? getFeaturedReviewsApi : getReviewsApi

  useEffect(() => {
    let isCancelled = false

    loadReviews(options?.topOnly ? 3 : undefined)
      .then((nextReviews) => {
        if (!isCancelled) {
          setReviews(nextReviews.length ? nextReviews : getFallbackReviews(options?.topOnly))
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
    loadReviews(options?.topOnly ? 3 : undefined)
      .then((nextReviews) => setReviews(nextReviews.length ? nextReviews : getFallbackReviews(options?.topOnly)))
      .catch(() => setReviews(getFallbackReviews(options?.topOnly)))
  }

  return { reviews, refresh }
}
