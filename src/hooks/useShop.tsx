/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  addToFavoritesApi,
  getFavoritesApi,
  removeFromFavoritesApi,
} from '../services/api/favoritesApi'
import {
  addCartItemApi,
  clearCartApi,
  getCartApi,
  mergeCartApi,
  removeCartItemApi,
  updateCartItemApi,
  type CartLine as ApiCartLine,
} from '../services/api/cartApi'
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
import { getProductById } from '../data/bestProducts'
import type { ProductUi } from '../services/api/productsApi'

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
  favoriteProducts: ProductUi[]
  favoritesLoading: boolean
  favoritesError: string | null
  refetchFavorites: () => void
  isFavorite: (productId: string) => boolean
  isInCart: (productId: string) => boolean
  removeFromCart: (productId: string) => void
  toggleFavorite: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
}

const ShopContext = createContext<ShopContextType | null>(null)

const minCartQuantity = 1
export const maxCartQuantity = 50

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
  const [favoriteProducts, setFavoriteProducts] = useState<ProductUi[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [favoritesError, setFavoritesError] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    initCartFromStorage(),
  )
  const [serverCartLines, setServerCartLines] = useState<ApiCartLine[]>([])

  useEffect(() => {
    persistFavorites(favoriteProductIds)
  }, [favoriteProductIds])

  useEffect(() => {
    if (user) return
    persistCart(cartItems)
  }, [cartItems, user])

  useEffect(() => {
    return subscribeToCartStorageSync((updatedItems) => {
      setCartItems(updatedItems)
    })
  }, [])

  const loadFavorites = useCallback(() => {
    if (!user) return

    let isCancelled = false
    setFavoritesLoading(true)
    setFavoritesError(null)

    getFavoritesApi()
      .then((products) => {
        if (isCancelled) return
        setFavoriteProducts(products)
        setFavoriteProductIds(products.map((product) => product.id))
      })
      .catch((error: unknown) => {
        if (isCancelled) return
        setFavoritesError(
          error instanceof Error ? error.message : 'Не вдалося завантажити список обраного.',
        )
      })
      .finally(() => {
        if (!isCancelled) setFavoritesLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [user])

  const loadServerCart = useCallback(() => {
    if (!user) return

    let isCancelled = false

    getCartApi()
      .then((lines) => {
        if (!isCancelled) setServerCartLines(lines)
      })
      .catch(console.error)

    return () => {
      isCancelled = true
    }
  }, [user])

useEffect(() => {
    if (!isAuthChecked) return
    if (!user) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    const cancel = loadFavorites()
    return cancel
  }, [isAuthChecked, user, loadFavorites])

  useEffect(() => {
    if (!isAuthChecked || !user) return

    const numericCartItems = cartItems.filter((item) => Number.isFinite(Number(item.productId)))
    const cancel = numericCartItems.length
      ? undefined
      : loadServerCart()

    if (numericCartItems.length) {
      mergeCartApi(numericCartItems)
        .then((lines) => {
          setServerCartLines(lines)
          setCartItems([])
          persistCart([])
        })
        .catch(() => {
          const fallbackCancel = loadServerCart()
          fallbackCancel?.()
        })
    }

    return cancel
  }, [cartItems, isAuthChecked, loadServerCart, user])

  function enrichServerCartLine(line: ApiCartLine): CartLine {
    const localProduct = getProductById(line.productId)

    return {
      productId: line.productId,
      quantity: line.quantity,
      product: {
        ...line.product,
        image: line.product.image || localProduct?.image || '',
        gallery: localProduct?.gallery ?? [],
        description: localProduct?.description ?? '',
      },
      lineTotal: line.lineTotal,
    }
  }

  const value = useMemo<ShopContextType>(() => {
    const cartLines = user
      ? serverCartLines.map(enrichServerCartLine)
      : selectCartLines(cartItems)
    const cartCount = selectCartBadgeCount(cartItems)
    const cartTotal = user
      ? serverCartLines.reduce((total, line) => total + line.lineTotal, 0)
      : selectCartTotal(cartItems)
    const visibleCartItems = user
      ? serverCartLines.map(({ productId, quantity }) => ({ productId, quantity }))
      : cartItems
    const visibleCartCount = user
      ? serverCartLines.reduce((total, line) => total + line.quantity, 0)
      : cartCount

    function addToCart(productId: string, quantity = 1) {
      const quantityToAdd = normalizeCartQuantity(quantity)
      if (user && Number.isFinite(Number(productId))) {
        addCartItemApi(productId, quantityToAdd)
          .then(setServerCartLines)
          .catch(console.error)
        return
      }

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
      if (user && Number.isFinite(Number(productId))) {
        removeCartItemApi(productId)
          .then(setServerCartLines)
          .catch(console.error)
        return
      }

      setCartItems((currentItems) => currentItems.filter((item) => item.productId !== productId))
    }

    function updateCartQuantity(productId: string, quantity: number) {
      if (user && Number.isFinite(Number(productId))) {
        if (quantity <= 0) {
          removeCartItemApi(productId)
            .then(setServerCartLines)
            .catch(console.error)
          return
        }

        updateCartItemApi(productId, normalizeCartQuantity(quantity))
          .then(setServerCartLines)
          .catch(console.error)
        return
      }

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
      if (user) {
        clearCartApi()
          .then(setServerCartLines)
          .catch(console.error)
        return
      }

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
      cartCount: visibleCartCount,
      cartItems: visibleCartItems,
      cartTotal,
      clearCart,
      favoriteProductIds,
      favoriteProducts,
      favoritesLoading,
      favoritesError,
      refetchFavorites: loadFavorites,
      isFavorite: (productId) => favoriteProductIds.includes(productId),
      isInCart: (productId) => visibleCartItems.some((item) => item.productId === productId),
      removeFromCart,
      toggleFavorite,
      updateCartQuantity,
    }
  }, [
    cartItems,
    favoriteProductIds,
    favoriteProducts,
    favoritesLoading,
    favoritesError,
    loadFavorites,
    isAuthChecked,
    requestLogin,
    user,
    serverCartLines,
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
