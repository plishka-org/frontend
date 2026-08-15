import {
  apiRequest,
  clearAuthTokens,
  decodeJwtPayload,
  getAccessToken,
  getDeviceId,
  hasApiBaseUrl,
  saveAuthTokens,
  type AuthTokens,
} from './client'

export interface AuthUser {
  id: number
  name: string
  email: string
  phone?: string
  role: 'admin' | 'user'
  roles: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface EmailChangePayload {
  newEmail: string
  currentPassword: string
}

export interface PasswordChangePayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthStatusResponse {
  isAuthenticated: boolean
  user: AuthUser | null
}

export interface RegisterPayload {
  name: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
}

export interface DeleteAccountPayload {
  currentPassword: string
}

type JwtClaims = {
  roles?: string[]
  userId?: number
}

type UserProfileDto = {
  id: number
  name: string
  email: string
  phone?: string
}

type MessageResponseDto = {
  message: string
}

function getRolesFromAccessToken() {
  const token = getAccessToken()
  if (!token) return []

  const claims = decodeJwtPayload<JwtClaims>(token)
  return Array.isArray(claims?.roles) ? claims.roles : []
}

function toAuthUser(profile: UserProfileDto): AuthUser {
  const roles = getRolesFromAccessToken()
  return {
    ...profile,
    roles,
    role: roles.includes('ADMIN') ? 'admin' : 'user',
  }
}

export function clearClientAuthState() {
  clearAuthTokens()
}

export async function getCurrentUserApi(): Promise<AuthUser> {
  const profile = await apiRequest<UserProfileDto>('/api/users/me')
  return toAuthUser(profile)
}

export async function checkAuthStatus(): Promise<AuthStatusResponse> {
  if (!hasApiBaseUrl() || !getAccessToken()) {
    return { isAuthenticated: false, user: null }
  }

  try {
    const user = await getCurrentUserApi()
    return { isAuthenticated: true, user }
  } catch {
    clearAuthTokens()
    return { isAuthenticated: false, user: null }
  }
}

export async function loginApi(credentials: LoginCredentials): Promise<AuthUser> {
  const tokens = await apiRequest<AuthTokens>('/api/auth/login', {
    method: 'POST',
    auth: false,
    headers: { 'Device-Id': getDeviceId() },
    body: credentials,
  })

  saveAuthTokens(tokens)
  return getCurrentUserApi()
}

export async function logoutApi(): Promise<void> {
  if (!hasApiBaseUrl() || !getAccessToken()) {
    clearAuthTokens()
    return
  }

  try {
    await apiRequest<MessageResponseDto>('/api/auth/logout', {
      method: 'POST',
      headers: { 'Device-Id': getDeviceId() },
    })
  } finally {
    clearAuthTokens()
  }
}

export async function updateProfileApi(payload: { name: string; phone?: string }): Promise<AuthUser> {
  const profile = await apiRequest<UserProfileDto>('/api/users/me', {
    method: 'PUT',
    body: payload,
  })

  return toAuthUser(profile)
}

export async function deleteAccountApi(payload: DeleteAccountPayload): Promise<void> {
  await apiRequest<MessageResponseDto>('/api/users/me', {
    method: 'DELETE',
    body: payload,
  })
  clearAuthTokens()
}

export async function requestEmailChangeApi(payload: EmailChangePayload): Promise<void> {
  await apiRequest<MessageResponseDto>('/api/users/me/email', {
    method: 'PUT',
    body: payload,
  })
}

export async function changePasswordApi(payload: PasswordChangePayload): Promise<void> {
  await apiRequest<MessageResponseDto>('/api/users/me/password', {
    method: 'PUT',
    body: payload,
  })
  clearAuthTokens()
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await apiRequest<MessageResponseDto>('/api/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: { email },
  })
}

export async function resetPasswordApi(
  token: string,
  password: string,
  confirmPassword = password,
): Promise<void> {
  await apiRequest<MessageResponseDto>('/api/auth/reset-password', {
    method: 'POST',
    auth: false,
    body: { token, password, confirmPassword },
  })
}

export async function registerApi(payload: RegisterPayload): Promise<void> {
  await apiRequest<MessageResponseDto>('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: payload,
  })
}

export async function verifyEmailApi(token: string): Promise<void> {
  await apiRequest<MessageResponseDto>(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
    method: 'GET',
    auth: false,
  })
}

export async function verifyEmailChangeApi(token: string): Promise<void> {
  await apiRequest<MessageResponseDto>('/api/auth/verify-email-change', {
    method: 'POST',
    auth: false,
    body: { token },
  })
}
