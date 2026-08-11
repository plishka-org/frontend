import { getProductById } from '../data/bestProducts'

export type CartProductSnapshot = {
  id: string
  category: string
  name: string
  image: string
  price: number
  description?: string
  gallery?: string[]
}

export type CartItem = {
  productId: string
  quantity: number
  product?: CartProductSnapshot
}

export function selectCartBadgeCount(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => total + item.quantity, 0)
}

export function selectCartTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => {
    const product = item.product ?? getProductById(item.productId)
    return product ? total + product.price * item.quantity : total
  }, 0)
}

export function selectCartLines(cartItems: CartItem[]) {
  return cartItems.flatMap((item) => {
    const product = item.product ?? getProductById(item.productId)
    if (!product) return []
    return [
      {
        ...item,
        product,
        lineTotal: product.price * item.quantity,
      },
    ]
  })
}
