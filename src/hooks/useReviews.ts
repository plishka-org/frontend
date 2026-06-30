import { useEffect, useState } from 'react'
import { getReviews, getReviewsApi, getTopReviews } from '../services/api/reviewsApi'

function getFallbackReviews(topOnly?: boolean) {
  return topOnly ? getTopReviews(3) : getReviews()
}

export function useReviews(options?: { topOnly?: boolean }) {
  const [reviews, setReviews] = useState(() => getFallbackReviews(options?.topOnly))

  useEffect(() => {
    let isCancelled = false

    getReviewsApi(options?.topOnly ? 3 : undefined)
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
  }, [options?.topOnly])

  function refresh() {
    getReviewsApi(options?.topOnly ? 3 : undefined)
      .then((nextReviews) => setReviews(nextReviews.length ? nextReviews : getFallbackReviews(options?.topOnly)))
      .catch(() => setReviews(getFallbackReviews(options?.topOnly)))
  }

  return { reviews, refresh }
}
