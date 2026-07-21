import { apiRequest } from './client'

export type AdminCallbackRequest = {
  id: number
  name: string
  phone: string
  message: string
  createdAt: string
}

export type AdminCallbackRequestsPage = {
  content: AdminCallbackRequest[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

export type AdminCallbackRequestsSort = 'newest' | 'oldest'

type CallbackRequestDto = {
  callbackRequestId: number
  name: string
  phone: string
  message: string
  createdAt: string
}

type CallbackRequestsPageDto = Omit<AdminCallbackRequestsPage, 'content'> & {
  content: CallbackRequestDto[]
}

const SORT_PARAMS: Record<AdminCallbackRequestsSort, string> = {
  newest: 'createdAt,desc',
  oldest: 'createdAt,asc',
}

export async function getAdminCallbackRequests(
  search = '',
  sort: AdminCallbackRequestsSort = 'newest',
  page = 0,
  size = 10,
): Promise<AdminCallbackRequestsPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: SORT_PARAMS[sort],
  })

  if (search.trim()) params.set('search', search.trim())

  const response = await apiRequest<CallbackRequestsPageDto>(
    `/api/admin/callback-requests?${params.toString()}`,
  )

  return {
    ...response,
    content: response.content.map((request) => ({
      id: request.callbackRequestId,
      name: request.name,
      phone: request.phone,
      message: request.message,
      createdAt: request.createdAt,
    })),
  }
}
