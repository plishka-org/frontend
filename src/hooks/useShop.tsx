/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getProductById } from '../data/bestProducts'

type CartItem = {
  productId: string
  quantity: number
}

type CartLine = CartItem & {
  lineTotal: number
  product: NonNullable<ReturnType<typeof getProductById>>
}

type ShopContextType = {
  addToCart: (productId: string, quantity?: number) => void
  cartLines: CartLine[]
  cartCount: number
  cartItems: CartItem[]
  cartTotal: number
  clearCart: () => void
  favoriteProductIds: string[]
  isFavorite: (productId: string) => boolean
  isInCart: (productId: string) => boolean
  removeFromCart: (productId: string) => void
  toggleFavorite: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
}

const ShopContext = createContext<ShopContextType | null>(null)

const cartStorageKey = 'plishkaCart'
const favoritesStorageKey = 'plishkaFavorites'
const minCartQuantity = 1
export const maxCartQuantity = 10

function normalizeCartQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) {
    return minCartQuantity
  }

  return Math.min(maxCartQuantity, Math.max(minCartQuantity, Math.floor(quantity)))
}

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
    const cartLines = cartItems.flatMap((item) => {
      const product = getProductById(item.productId)

      if (!product) {
        return []
      }

      return [
        {
          ...item,
          lineTotal: product.price * item.quantity,
          product,
        },
      ]
    })

    function addToCart(productId: string, quantity = 1) {
      const quantityToAdd = normalizeCartQuantity(quantity)

      setCartItems((currentItems) => {
        if (!getProductById(productId)) {
          return currentItems
        }

        const existingItem = currentItems.find((item) => item.productId === productId)

        if (existingItem) {
          return currentItems.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: normalizeCartQuantity(item.quantity + quantityToAdd),
                }
              : item,
          )
        }

        return [...currentItems, { productId, quantity: quantityToAdd }]
      })
    }

    function removeFromCart(productId: string) {
      setCartItems((currentItems) => currentItems.filter((item) => item.productId !== productId))
    }

    function updateCartQuantity(productId: string, quantity: number) {
      setCartItems((currentItems) => {
        if (quantity <= 0) {
          return currentItems.filter((item) => item.productId !== productId)
        }

        return currentItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: normalizeCartQuantity(quantity),
              }
            : item,
        )
      })
    }

    function clearCart() {
      setCartItems([])
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
      cartLines,
      cartCount: cartItems.reduce((total, item) => total + item.quantity, 0),
      cartItems,
      cartTotal: cartLines.reduce((total, item) => total + item.lineTotal, 0),
      clearCart,
      favoriteProductIds,
      isFavorite: (productId) => favoriteProductIds.includes(productId),
      isInCart: (productId) => cartItems.some((item) => item.productId === productId),
      removeFromCart,
      toggleFavorite,
      updateCartQuantity,
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
