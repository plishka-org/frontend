export const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const DEVICE_ID_KEY = 'plishkaDeviceId'

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  auth?: boolean
  body?: BodyInit | object | null
  retryOnUnauthorized?: boolean
}

let refreshPromise: Promise<AuthTokens> | null = null

function safeStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function isPlainJsonBody(body: ApiRequestOptions['body']): body is object {
  return Boolean(body) && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as Partial<{ message: string; error: string }>
    return {
      data,
      message: data.message || data.error || `API request failed with status ${response.status}`,
    }
  } catch {
    return {
      data: null,
      message: `API request failed with status ${response.status}`,
    }
  }
}

function createDeviceId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.random() * 16 | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function hasApiBaseUrl() {
  return Boolean(API_BASE_URL)
}

export function getDeviceId() {
  const storage = safeStorage()
  if (!storage) return createDeviceId()

  const existingDeviceId = storage.getItem(DEVICE_ID_KEY)
  if (existingDeviceId) return existingDeviceId

  const deviceId = createDeviceId()
  storage.setItem(DEVICE_ID_KEY, deviceId)
  return deviceId
}

export function getAccessToken() {
  return safeStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null
}

export function getRefreshToken() {
  return safeStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null
}

export function saveAuthTokens(tokens: AuthTokens) {
  const storage = safeStorage()
  if (!storage) return

  storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function clearAuthTokens() {
  const storage = safeStorage()
  if (!storage) return

  storage.removeItem(ACCESS_TOKEN_KEY)
  storage.removeItem(REFRESH_TOKEN_KEY)
  storage.removeItem('authToken')
  storage.removeItem('token')
  storage.removeItem('user')
}

export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=')
    return JSON.parse(atob(paddedPayload)) as T
  } catch {
    return null
  }
}

async function refreshTokens() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is missing', null)
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Device-Id': getDeviceId(),
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    clearAuthTokens()
    const { data, message } = await readErrorMessage(response)
    throw new ApiError(response.status, message, data)
  }

  const tokens = (await response.json()) as AuthTokens
  saveAuthTokens(tokens)
  return tokens
}

async function getRefreshPromise() {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('API is not configured. Set VITE_API_URL.')
  }

  const {
    auth = true,
    body,
    headers,
    retryOnUnauthorized = true,
    ...requestOptions
  } = options
  const requestHeaders = new Headers(headers)

  if (isPlainJsonBody(body) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (auth) {
    const accessToken = getAccessToken()
    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`)
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    body: isPlainJsonBody(body) ? JSON.stringify(body) : body,
  })

  if (response.status === 401 && auth && retryOnUnauthorized && getRefreshToken()) {
    await getRefreshPromise()
    return apiRequest<T>(path, { ...options, retryOnUnauthorized: false })
  }

  if (!response.ok) {
    const { data, message } = await readErrorMessage(response)
    throw new ApiError(response.status, message, data)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
