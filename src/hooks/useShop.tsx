/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { bestProducts } from '../data/bestProducts'

type CartItem = {
  productId: string
  quantity: number
}

type CartItemResolved = {
  id: string
  name: string
  category: string
  image: string
  price: number
  quantity: number
}

type ShopContextType = {
  addToCart: (productId: string) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartItems: CartItem[]
  cartItemsResolved: CartItemResolved[]
  cartTotalPrice: number
  favoriteProductIds: string[]
  isFavorite: (productId: string) => boolean
  isInCart: (productId: string) => boolean
  toggleFavorite: (productId: string) => void
}

const ShopContext = createContext<ShopContextType | null>(null)

const cartStorageKey = 'plishkaCart'
const favoritesStorageKey = 'plishkaFavorites'

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? (JSON.parse(rawValue) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStoredValue<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
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
        if (existingItem) return currentItems
        return [...currentItems, { productId, quantity: 1 }]
      })
    }

    function removeFromCart(productId: string) {
      setCartItems((currentItems) =>
        currentItems.filter((item) => item.productId !== productId),
      )
    }

    function updateQuantity(productId: string, quantity: number) {
      if (quantity <= 0) {
        removeFromCart(productId)
        return
      }
      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        ),
      )
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

    const cartItemsResolved: CartItemResolved[] = cartItems.flatMap((item) => {
      const product = bestProducts.find((p) => p.id === item.productId)
      if (!product) return []
      return [{ id: product.id, name: product.name, category: product.category, image: product.image, price: product.price, quantity: item.quantity }]
    })

    const cartTotalPrice = cartItemsResolved.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    )

    return {
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount: cartItems.reduce((total, item) => total + item.quantity, 0),
      cartItems,
      cartItemsResolved,
      cartTotalPrice,
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
  if (!context) throw new Error('useShop must be used within ShopProvider')
  return context
}