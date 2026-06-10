import type { CartItem } from './cartSelectors'

export const CART_STORAGE_KEY = 'plishkaCart'
export const FAVORITES_STORAGE_KEY = 'plishkaFavorites'

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ігноруємо
  }
}

export type UserType = 'guest' | 'authenticated'

export function initCartFromStorage(): CartItem[] {
  return safeRead<CartItem[]>(CART_STORAGE_KEY, [])
}

export function initFavoritesFromStorage(): string[] {
  return safeRead<string[]>(FAVORITES_STORAGE_KEY, [])
}

export function persistCart(cartItems: CartItem[]): void {
  safeWrite(CART_STORAGE_KEY, cartItems)
}

export function persistFavorites(favoriteIds: string[]): void {
  safeWrite(FAVORITES_STORAGE_KEY, favoriteIds)
}
export function subscribeToCartStorageSync(
  onExternalChange: (items: CartItem[]) => void,
): () => void {
  if (typeof window === 'undefined') return () => {}

  function handleStorage(event: StorageEvent) {
    if (event.key !== CART_STORAGE_KEY || event.newValue === null) return

    try {
      const updated = JSON.parse(event.newValue) as CartItem[]
      onExternalChange(updated)
    } catch {
      // некоректне значення — ігноруємо
    }
  }

  window.addEventListener('storage', handleStorage)
  return () => window.removeEventListener('storage', handleStorage)
}