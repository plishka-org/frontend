/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { addToFavoritesApi, removeFromFavoritesApi } from '../services/api/authApi'
import { useAuth } from './useAuth'
import {
  initCartFromStorage,
  initFavoritesFromStorage,
  persistCart,
  persistFavorites,
  subscribeToCartStorageSync,
} from '../store/cartStorage'
import {
  selectCartBadgeCount,
  selectCartLines,
  selectCartTotal,
} from '../store/cartSelectors'

type CartItem = {
  productId: string
  quantity: number
}

type CartLine = ReturnType<typeof selectCartLines>[number]

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

const minCartQuantity = 1
export const maxCartQuantity = 10

function normalizeCartQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) {
    return minCartQuantity
  }
  return Math.min(maxCartQuantity, Math.max(minCartQuantity, Math.floor(quantity)))
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user, isAuthChecked, requestLogin } = useAuth()
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>(() =>
    initFavoritesFromStorage(),
  )
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    initCartFromStorage(),
  )

  useEffect(() => {
    persistFavorites(favoriteProductIds)
  }, [favoriteProductIds])

  useEffect(() => {
    persistCart(cartItems)
  }, [cartItems])

  useEffect(() => {
    return subscribeToCartStorageSync((updatedItems) => {
      setCartItems(updatedItems)
    })
  }, [])

  const value = useMemo<ShopContextType>(() => {
    const cartLines = selectCartLines(cartItems)
    const cartCount = selectCartBadgeCount(cartItems)
    const cartTotal = selectCartTotal(cartItems)

    function addToCart(productId: string, quantity = 1) {
      const quantityToAdd = normalizeCartQuantity(quantity)
      setCartItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.productId === productId)
        if (existingItem) {
          return currentItems.map((item) =>
            item.productId === productId
              ? { ...item, quantity: normalizeCartQuantity(item.quantity + quantityToAdd) }
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
            ? { ...item, quantity: normalizeCartQuantity(quantity) }
            : item,
        )
      })
    }

    function clearCart() {
      setCartItems([])
    }

    function addFavorite(productId: string) {
      setFavoriteProductIds((currentIds) => {
        if (currentIds.includes(productId)) return currentIds
        addToFavoritesApi(productId).catch(console.error)
        return [...currentIds, productId]
      })
    }

    function toggleFavorite(productId: string) {
      if (!isAuthChecked) return

      if (!user) {
        requestLogin(() => addFavorite(productId))
        return
      }

      setFavoriteProductIds((currentIds) => {
        if (currentIds.includes(productId)) {
          removeFromFavoritesApi(productId).catch(console.error)
          return currentIds.filter((item) => item !== productId)
        }
        addToFavoritesApi(productId).catch(console.error)
        return [...currentIds, productId]
      })
    }

    return {
      addToCart,
      cartLines,
      cartCount,
      cartItems,
      cartTotal,
      clearCart,
      favoriteProductIds,
      isFavorite: (productId) => favoriteProductIds.includes(productId),
      isInCart: (productId) => cartItems.some((item) => item.productId === productId),
      removeFromCart,
      toggleFavorite,
      updateCartQuantity,
    }
  }, [
    cartItems,
    favoriteProductIds,
    isAuthChecked,
    requestLogin,
    user,
  ])

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop(): ShopContextType {
  const context = useContext(ShopContext)
  if (!context) {
    throw new Error('useShop must be used within ShopProvider')
  }
  return context
}