/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getProductById } from '../data/bestProducts'
import type { BestProduct } from '../data/bestProducts'

const STORAGE_KEY = 'plishkaRecentlyViewed'
const MAX_ITEMS = 10

function readStoredIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStoredIds(ids: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

type RecentlyViewedContextType = {
  recentlyViewedProducts: BestProduct[]
  trackView: (productId: string) => void
  clearRecentlyViewed: () => void
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | null>(null)

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>(readStoredIds)

  useEffect(() => {
    writeStoredIds(productIds)
  }, [productIds])

  const trackView = useCallback((productId: string) => {
    if (!getProductById(productId)) return
    setProductIds((prev) => {
      const filtered = prev.filter((id) => id !== productId)
      return [productId, ...filtered].slice(0, MAX_ITEMS)
    })
  }, [])

  const clearRecentlyViewed = useCallback(() => {
    setProductIds([])
  }, [])

  const recentlyViewedProducts = useMemo<BestProduct[]>(() => {
    return productIds.flatMap((id) => {
      const product = getProductById(id)
      return product ? [product] : []
    })
  }, [productIds])

  const value = useMemo<RecentlyViewedContextType>(
    () => ({ recentlyViewedProducts, trackView, clearRecentlyViewed }),
    [recentlyViewedProducts, trackView, clearRecentlyViewed],
  )

  return (
    <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed(): RecentlyViewedContextType {
  const context = useContext(RecentlyViewedContext)
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider')
  }
  return context
}