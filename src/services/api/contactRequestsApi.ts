import { apiRequest, hasApiBaseUrl } from './client'

const contactRequestsStorageKey = 'contactRequests'

export interface ContactRequestPayload {
  name: string
  phone: string
  message: string
}

export interface ContactRequestResponse extends ContactRequestPayload {
  id: string | number
  callbackRequestId?: number
  description: string
  createdAt: string
}

type CallbackRequestDto = {
  callbackRequestId: number
  name: string
  phone: string
  message: string
  createdAt: string
}

type PageResponse<T> = {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

export type ContactRequestsPage = PageResponse<ContactRequestResponse>

function normalizeCallback(dto: CallbackRequestDto): ContactRequestResponse {
  return {
    id: dto.callbackRequestId,
    callbackRequestId: dto.callbackRequestId,
    name: dto.name,
    phone: dto.phone,
    message: dto.message,
    description: dto.message,
    createdAt: dto.createdAt,
  }
}

function createLocalContactRequest(payload: ContactRequestPayload): ContactRequestResponse {
  const request = {
    ...payload,
    description: payload.message,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  }

  if (typeof window === 'undefined') {
    return request
  }

  try {
    const existingRequests = JSON.parse(
      window.localStorage.getItem(contactRequestsStorageKey) || '[]',
    ) as ContactRequestResponse[]

    window.localStorage.setItem(
      contactRequestsStorageKey,
      JSON.stringify([...existingRequests, request]),
    )
  } catch {
    window.localStorage.setItem(contactRequestsStorageKey, JSON.stringify([request]))
  }

  return request
}

function getLocalContactRequests(): ContactRequestResponse[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const requests = JSON.parse(
      window.localStorage.getItem(contactRequestsStorageKey) || '[]',
    ) as ContactRequestResponse[]

    return Array.isArray(requests) ? requests : []
  } catch {
    return []
  }
}

export async function createContactRequest(
  payload: ContactRequestPayload,
): Promise<ContactRequestResponse> {
  if (!hasApiBaseUrl()) {
    return createLocalContactRequest(payload)
  }

  const response = await apiRequest<CallbackRequestDto>('/api/callback', {
    method: 'POST',
    body: payload,
  })

  return normalizeCallback(response)
}

export async function getContactRequests(page = 0, size = 10): Promise<ContactRequestsPage> {
  if (!hasApiBaseUrl()) {
    const requests = [...getLocalContactRequests()].sort(
      (first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt),
    )
    const content = requests.slice(page * size, (page + 1) * size)
    const totalPages = Math.ceil(requests.length / size)

    return {
      content,
      pageNumber: page,
      pageSize: size,
      totalElements: requests.length,
      totalPages,
      last: page >= totalPages - 1,
    }
  }

  const params = new URLSearchParams({ page: String(page), size: String(size) })
  const response = await apiRequest<PageResponse<CallbackRequestDto>>(
    `/api/users/me/callback-requests?${params}`,
  )

  return {
    ...response,
    content: response.content.map(normalizeCallback),
  }
}
