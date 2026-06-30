import { apiRequest } from './client'
import type { Order } from '../../types/order'

type PageResponse<T> = {
  content: T[]
}

type OrderItemDetailDto = {
  orderItemId: number
  productId: number
  productName: string
  categoryName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

type OrderDetailDto = {
  orderId: number
  orderNumber: string
  customerName: string
  totalPrice: number
  deliveryCity: string
  phone: string
  notes?: string
  createdAt: string
  items: OrderItemDetailDto[]
}

type OrderSummaryDto = {
  orderId: number
  orderNumber: string
  totalPrice: number
  createdAt: string
}

export interface OrderPayload {
  customerName: string
  phone: string
  deliveryCity: string
  notes?: string
}

export interface OrderResponse {
  orderId: number
  orderNumber: string
}

function createIdempotencyKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function mapOrderDetail(dto: OrderDetailDto): Order {
  return {
    id: dto.orderId,
    orderNumber: dto.orderNumber,
    date: dto.createdAt,
    totalPrice: Number(dto.totalPrice),
    products: dto.items.map((item) => ({
      id: String(item.orderItemId),
      productId: String(item.productId),
      category: item.categoryName,
      name: item.productName,
      price: Number(item.unitPrice),
      imageUrl: '',
      quantity: item.quantity,
    })),
  }
}

export async function createOrderApi(payload: OrderPayload): Promise<OrderResponse> {
  const response = await apiRequest<OrderDetailDto>('/api/orders', {
    method: 'POST',
    headers: { 'Idempotency-Key': createIdempotencyKey() },
    body: payload,
  })

  return {
    orderId: response.orderId,
    orderNumber: response.orderNumber,
  }
}

export async function getOrdersApi(): Promise<Order[]> {
  const page = await apiRequest<PageResponse<OrderSummaryDto>>('/api/users/me/orders?size=100')

  const details = await Promise.all(
    page.content.map((order) =>
      apiRequest<OrderDetailDto>(`/api/users/me/orders/${order.orderId}`),
    ),
  )

  return details.map(mapOrderDetail)
}
