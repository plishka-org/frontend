const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const contactRequestsStorageKey = 'contactRequests'

export interface ContactRequestPayload {
  name: string
  phone: string
  description: string
}

export interface ContactRequestResponse extends ContactRequestPayload {
  id: string | number
  createdAt: string
}

function createLocalContactRequest(
  payload: ContactRequestPayload,
): ContactRequestResponse {
  const request = {
    ...payload,
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

export async function createContactRequest(
  payload: ContactRequestPayload,
): Promise<ContactRequestResponse> {
  if (!BASE_URL) {
    return createLocalContactRequest(payload)
  }

  const response = await fetch(`${BASE_URL}/api/contact-requests`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to create contact request')
  }

  return response.json() as Promise<ContactRequestResponse>
}
