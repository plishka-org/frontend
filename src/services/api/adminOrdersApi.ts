import { apiRequest } from './client'

export type AdminOrderItem = {
  id: number
  productId: number
  name: string
  categoryName?: string
  imageUrl: string | null
  quantity: number
  unitPrice?: number
}

export type AdminOrder = {
  id: number
  orderNumber: string
  createdAt: string
  customerName: string
  phone: string
  items: AdminOrderItem[]
  totalPrice: number
  deliveryCity: string
  comment?: string
}

export type AdminOrdersPage = {
  content: AdminOrder[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

export type AdminOrdersSort = 'newest' | 'oldest' | 'amount-desc' | 'amount-asc'

const SORT_PARAMS: Record<AdminOrdersSort, string> = {
  newest: 'createdAt,desc',
  oldest: 'createdAt,asc',
  'amount-desc': 'totalPrice,desc',
  'amount-asc': 'totalPrice,asc',
}

export function getAdminOrders(search = '', sort: AdminOrdersSort = 'newest', page = 0, size = 10) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: SORT_PARAMS[sort],
  })
  if (search.trim()) params.set('search', search.trim())
  return apiRequest<AdminOrdersPage>(`/api/admin/orders?${params.toString()}`)
}
