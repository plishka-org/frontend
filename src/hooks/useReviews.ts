import { useState } from 'react'
import { getReviews, getTopReviews } from '../services/api/reviewsApi'

export function useReviews(options?: { topOnly?: boolean }) {
  const [reviews, setReviews] = useState(() =>
    options?.topOnly ? getTopReviews(3) : getReviews(),
  )

  function refresh() {
    setReviews(options?.topOnly ? getTopReviews(3) : getReviews())
  }

  return { reviews, refresh }
}
