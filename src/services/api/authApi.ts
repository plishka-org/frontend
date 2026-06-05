const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export interface AuthUser {
  id: number
  name: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface EmailChangePayload {
  email: string
}

export interface PasswordChangePayload {
  newPassword: string
}

export interface AuthStatusResponse {
  isAuthenticated: boolean
  user: AuthUser | null
}

interface LoginResponse {
  user: AuthUser
}

async function getApiErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as Partial<{ message: string; error: string }>
    return data.message || data.error || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

export async function checkAuthStatus(): Promise<AuthStatusResponse> {
  if (!BASE_URL) {
    return { isAuthenticated: false, user: null }
  }

  const response = await fetch(`${BASE_URL}/api/auth/status`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    return { isAuthenticated: false, user: null }
  }

  return response.json() as Promise<AuthStatusResponse>
}

export async function loginApi(credentials: LoginCredentials): Promise<AuthUser> {
  if (!BASE_URL) {
    throw new Error('Авторизацію ще не підключено. Вкажіть VITE_API_URL для входу.')
  }

  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error('Не вдалося увійти. Перевірте email і пароль.')
  }

  const data = (await response.json()) as Partial<LoginResponse>

  if (!data.user) {
    throw new Error('Login response does not include user data.')
  }

  return data.user
}

export async function logoutApi(): Promise<void> {
  if (!BASE_URL) {
    return
  }

  const response = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Failed to logout')
  }
}

export async function requestEmailChangeApi(payload: EmailChangePayload): Promise<void> {
  if (!BASE_URL) {
    throw new Error('API зміни email ще не підключено. Вкажіть VITE_API_URL.')
  }

  const response = await fetch(`${BASE_URL}/api/auth/change-email`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Не вдалося надіслати запит на зміну email.'))
  }
}

export async function changePasswordApi(payload: PasswordChangePayload): Promise<void> {
  if (!BASE_URL) {
    throw new Error('API зміни пароля ще не підключено. Вкажіть VITE_API_URL.')
  }

  const response = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Не вдалося змінити пароль.'))
  }
}

export async function addToFavoritesApi(productId: string): Promise<void> {
  if (!BASE_URL) return

  const response = await fetch(`${BASE_URL}/api/favorites`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  })

  if (!response.ok) throw new Error('Failed to add to favorites')
}

export async function removeFromFavoritesApi(productId: string): Promise<void> {
  if (!BASE_URL) return

  const response = await fetch(`${BASE_URL}/api/favorites/${productId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) throw new Error('Failed to remove from favorites')
}
