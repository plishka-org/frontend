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
}

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

export async function getContactRequests(): Promise<ContactRequestResponse[]> {
  if (!hasApiBaseUrl()) {
    return getLocalContactRequests()
  }

  const response = await apiRequest<PageResponse<CallbackRequestDto>>(
    '/api/users/me/callback-requests?size=100',
  )

  return response.content.map(normalizeCallback)
}
