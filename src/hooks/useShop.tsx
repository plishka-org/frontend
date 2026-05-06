/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type CartItem = {
  productId: string
  quantity: number
}

type ShopContextType = {
  addToCart: (productId: string) => void
  cartCount: number
  cartItems: CartItem[]
  favoriteProductIds: string[]
  isFavorite: (productId: string) => boolean
  isInCart: (productId: string) => boolean
  toggleFavorite: (productId: string) => void
}

const ShopContext = createContext<ShopContextType | null>(null)

const cartStorageKey = 'plishkaCart'
const favoritesStorageKey = 'plishkaFavorites'

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? (JSON.parse(rawValue) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStoredValue<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>(() =>
    readStoredValue(favoritesStorageKey, []),
  )
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readStoredValue(cartStorageKey, []),
  )

  useEffect(() => {
    writeStoredValue(favoritesStorageKey, favoriteProductIds)
  }, [favoriteProductIds])

  useEffect(() => {
    writeStoredValue(cartStorageKey, cartItems)
  }, [cartItems])

  const value = useMemo<ShopContextType>(() => {
    function addToCart(productId: string) {
      setCartItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.productId === productId)

        if (existingItem) {
          return currentItems
        }

        return [...currentItems, { productId, quantity: 1 }]
      })
    }

    function toggleFavorite(productId: string) {
      setFavoriteProductIds((currentIds) =>
        currentIds.includes(productId)
          ? currentIds.filter((item) => item !== productId)
          : [...currentIds, productId],
      )
    }

    return {
      addToCart,
      cartCount: cartItems.reduce((total, item) => total + item.quantity, 0),
      cartItems,
      favoriteProductIds,
      isFavorite: (productId) => favoriteProductIds.includes(productId),
      isInCart: (productId) => cartItems.some((item) => item.productId === productId),
      toggleFavorite,
    }
  }, [cartItems, favoriteProductIds])

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop(): ShopContextType {
  const context = useContext(ShopContext)

  if (!context) {
    throw new Error('useShop must be used within ShopProvider')
  }

  return context
}
