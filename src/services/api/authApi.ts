//  замінити BASE_URL на реальний після підключення бекенду

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export interface AuthStatusResponse {
  isAuthenticated: boolean
  user: {
    id: number
    name: string
    email: string
  } | null
}

export async function checkAuthStatus(): Promise<AuthStatusResponse> {
  //  поки бекенд не готовий — симулюємо відповідь
  if (!BASE_URL) {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ isAuthenticated: false, user: null }), 100),
    )
  }

  const response = await fetch(`${BASE_URL}/api/auth/status`, {
    method: 'GET',
    credentials: 'include', // для cookie-based auth
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    return { isAuthenticated: false, user: null }
  }

  return response.json() as Promise<AuthStatusResponse>
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