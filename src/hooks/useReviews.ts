import { useEffect, useState } from 'react'
import { getReviews, getReviewsApi, getTopReviews } from '../services/api/reviewsApi'

export function useReviews(options?: { topOnly?: boolean }) {
  const [reviews, setReviews] = useState(() =>
    options?.topOnly ? getTopReviews(3) : getReviews(),
  )

  useEffect(() => {
    let isCancelled = false

    getReviewsApi(options?.topOnly ? 3 : undefined)
      .then((nextReviews) => {
        if (!isCancelled) setReviews(nextReviews)
      })
      .catch(() => {
        if (!isCancelled) setReviews(options?.topOnly ? getTopReviews(3) : getReviews())
      })

    return () => {
      isCancelled = true
    }
  }, [options?.topOnly])

  function refresh() {
    getReviewsApi(options?.topOnly ? 3 : undefined)
      .then(setReviews)
      .catch(() => setReviews(options?.topOnly ? getTopReviews(3) : getReviews()))
  }

  return { reviews, refresh }
}
