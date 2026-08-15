import { apiRequest } from './client'
import { resolveMediaUrl } from './mediaApi'

type OrderMediaDto = {
  productMediaId: number
  s3Key: string
  mediaType: 'IMAGE' | 'VIDEO'
}

type AdminOrderSummaryDto = {
  orderId: number
  orderNumber: string
  createdAt: string
  customerName: string
  phone: string
  items: Array<{
    productId: number
    productName: string
    primaryImage: OrderMediaDto | null
  }>
  totalPrice: number
  deliveryCity: string
}

type AdminOrderDetailDto = Omit<AdminOrderSummaryDto, 'items'> & {
  items: Array<{
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
    primaryImage: OrderMediaDto | null
  }>
  notes: string | null
}

export type AdminOrderItem = {
  productId: number
  productName: string
  imageUrl: string | null
}

export type AdminOrderSummary = {
  orderId: number
  orderNumber: string
  createdAt: string
  customerName: string
  phone: string
  items: AdminOrderItem[]
  totalPrice: number
  deliveryCity: string
}

export type AdminOrderDetail = Omit<AdminOrderSummary, 'items'> & {
  items: Array<AdminOrderItem & {
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  notes: string | null
}

export type AdminOrdersPage = {
  content: AdminOrderSummary[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

type AdminOrdersPageDto = Omit<AdminOrdersPage, 'content'> & {
  content: AdminOrderSummaryDto[]
}

export type AdminOrdersSort = 'newest' | 'oldest' | 'amount-desc' | 'amount-asc'

const SORT_PARAMS: Record<AdminOrdersSort, string> = {
  newest: 'createdAt,desc',
  oldest: 'createdAt,asc',
  'amount-desc': 'totalPrice,desc',
  'amount-asc': 'totalPrice,asc',
}

async function resolveOrderImage(media: OrderMediaDto | null) {
  return media?.s3Key ? resolveMediaUrl(media.s3Key, '') : null
}

async function normalizeSummary(order: AdminOrderSummaryDto): Promise<AdminOrderSummary> {
  const items = await Promise.all(order.items.map(async (item) => ({
    productId: item.productId,
    productName: item.productName,
    imageUrl: await resolveOrderImage(item.primaryImage),
  })))
  return { ...order, items }
}

async function normalizeDetail(order: AdminOrderDetailDto): Promise<AdminOrderDetail> {
  const items = await Promise.all(order.items.map(async (item) => ({
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.subtotal,
    imageUrl: await resolveOrderImage(item.primaryImage),
  })))
  return { ...order, items }
}

export async function getAdminOrders(search = '', sort: AdminOrdersSort = 'newest', page = 0, size = 10) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: SORT_PARAMS[sort],
  })
  if (search.trim()) params.set('search', search.trim())
  const result = await apiRequest<AdminOrdersPageDto>(`/api/admin/orders?${params.toString()}`)
  return { ...result, content: await Promise.all(result.content.map(normalizeSummary)) }
}

export async function getAdminOrder(orderId: number) {
  const order = await apiRequest<AdminOrderDetailDto>(`/api/admin/orders/${orderId}`)
  return normalizeDetail(order)
}
