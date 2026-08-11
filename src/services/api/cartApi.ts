import { apiRequest, hasApiBaseUrl } from './client'
import { getProductPrimaryImageApi } from './productsApi'

export type CartItemDto = {
  cartItemId: number
  productId: number
  productName: string
  categoryName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type CartSummaryDto = {
  items: CartItemDto[]
  totalPrice: number
}

export type CartItemInput = {
  productId: string
  quantity: number
}

export type CartLine = {
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    category: string
    image: string
    price: number
  }
  lineTotal: number
}

const cartProductImageCache = new Map<string, Promise<string>>()

async function resolveCartProductImage(productId: string) {
  const cachedImage = cartProductImageCache.get(productId)
  if (cachedImage) return cachedImage

  const imageRequest = getProductPrimaryImageApi(productId).catch(() => {
    cartProductImageCache.delete(productId)
    return ''
  })

  cartProductImageCache.set(productId, imageRequest)
  return imageRequest
}

export async function mapCartSummary(dto: CartSummaryDto): Promise<CartLine[]> {
  return Promise.all(dto.items.map(async (item) => ({
    productId: String(item.productId),
    quantity: item.quantity,
    product: {
      id: String(item.productId),
      name: item.productName,
      category: item.categoryName,
      image: await resolveCartProductImage(String(item.productId)),
      price: Number(item.unitPrice),
    },
    lineTotal: Number(item.subtotal),
  })))
}

export async function getCartApi() {
  if (!hasApiBaseUrl()) return []

  const cart = await apiRequest<CartSummaryDto>('/api/cart')
  return mapCartSummary(cart)
}

export async function addCartItemApi(productId: string, quantity: number) {
  const cart = await apiRequest<CartSummaryDto>('/api/cart/items', {
    method: 'POST',
    body: { productId: Number(productId), quantity },
  })
  return mapCartSummary(cart)
}

export async function updateCartItemApi(productId: string, quantity: number) {
  const cart = await apiRequest<CartSummaryDto>(`/api/cart/items/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    body: { quantity },
  })
  return mapCartSummary(cart)
}

export async function removeCartItemApi(productId: string) {
  const cart = await apiRequest<CartSummaryDto>(`/api/cart/items/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  })
  return mapCartSummary(cart)
}

export async function clearCartApi() {
  await apiRequest<void>('/api/cart', { method: 'DELETE' })
  return []
}

export async function mergeCartApi(items: CartItemInput[]) {
  if (!items.length) return getCartApi()

  const cart = await apiRequest<CartSummaryDto>('/api/cart/merge', {
    method: 'POST',
    body: {
      items: items.map((item) => ({
        productId: Number(item.productId),
        quantity: item.quantity,
      })),
    },
  })

  return mapCartSummary(cart)
}
