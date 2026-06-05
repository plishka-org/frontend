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

export interface AuthStatusResponse {
  isAuthenticated: boolean
  user: AuthUser | null
}

interface LoginResponse {
  user: AuthUser
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
