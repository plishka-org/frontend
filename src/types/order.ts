export type OrderProduct = {
  id: string
  productId?: string
  category: string
  name: string
  price: number
  imageUrl: string
  quantity?: number
}

export type Order = {
  id: number
  orderNumber?: string
  date: string      
  products: OrderProduct[]
  totalPrice: number
}
