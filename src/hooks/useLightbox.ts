import { useCallback, useEffect, useState } from 'react'
import type { GalleryProduct } from '../data/galleryProducts'

type UseLightboxReturn = {
  activeProduct: GalleryProduct | null
  activeIndex: number
  open: (product: GalleryProduct, index: number) => void
  close: () => void
  goNext: () => void
  goPrev: () => void
}

export function useLightbox(products: GalleryProduct[]): UseLightboxReturn {
  const [activeIndex, setActiveIndex] = useState(-1)

  const activeProduct = activeIndex >= 0 ? products[activeIndex] : null

  const open = useCallback((_product: GalleryProduct, index: number) => {
    setActiveIndex(index)
  }, [])

  const close = useCallback(() => {
    setActiveIndex(-1)
  }, [])

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % products.length)
  }, [products.length])

  const goPrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + products.length) % products.length)
  }, [products.length])

  useEffect(() => {
    if (activeIndex === -1) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') goNext()
      if (event.key === 'ArrowLeft') goPrev()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, close, goNext, goPrev])

  useEffect(() => {
    if (activeIndex >= 0) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [activeIndex])

  return { activeProduct, activeIndex, open, close, goNext, goPrev }
}