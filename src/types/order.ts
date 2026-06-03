export type OrderProduct = {
  id: string
  category: string
  name: string
  price: number
  imageUrl: string
}

export type Order = {
  id: number
  date: string      
  products: OrderProduct[]
  totalPrice: number
}