import { useCallback, useMemo, useState } from 'react'
import {
  createReview,
  deleteReview,
  getReviews,
  getTopReviews,
  updateReview,
} from '../services/api/reviewsApi'
import type { ReviewCreatePayload, ReviewUpdatePayload } from '../services/api/reviewsApi'

export function useReviews(options?: { topOnly?: boolean }) {
  const [reviews, setReviews] = useState(() =>
    options?.topOnly ? getTopReviews(3) : getReviews(),
  )

  const refresh = useCallback(() => {
    setReviews(options?.topOnly ? getTopReviews(3) : getReviews())
  }, [options?.topOnly])

  const actions = useMemo(
    () => ({
      addReview(payload: ReviewCreatePayload) {
        setReviews(createReview(payload))
      },
      editReview(reviewId: number, authorId: number, payload: ReviewUpdatePayload) {
        setReviews(updateReview(reviewId, authorId, payload))
      },
      removeReview(reviewId: number, authorId: number) {
        setReviews(deleteReview(reviewId, authorId))
      },
      refresh,
    }),
    [refresh],
  )

  return { reviews, ...actions }
}
