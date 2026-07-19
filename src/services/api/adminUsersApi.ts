import { apiRequest } from './client'

export type AdminUser = {
  id: number
  name: string
  email: string
  phone: string | null
  isBanned: boolean
  numberOfOrders: number
}

export type AdminUsersPage = {
  content: AdminUser[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

function usersQuery(search: string, page: number, size: number) {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort: 'createdAt,desc' })
  if (search.trim()) params.set('search', search.trim())
  return params.toString()
}

export function getAdminUsers(search = '', page = 0, size = 10) {
  return apiRequest<AdminUsersPage>(`/api/admin/users?${usersQuery(search, page, size)}`)
}

export function getBannedAdminUsers(search = '', page = 0, size = 20) {
  return apiRequest<AdminUsersPage>(`/api/admin/users/banned?${usersQuery(search, page, size)}`)
}

export function banAdminUser(id: number) {
  return apiRequest<AdminUser>(`/api/admin/users/${id}/ban`, { method: 'PUT' })
}

export function unbanAdminUser(id: number) {
  return apiRequest<AdminUser>(`/api/admin/users/${id}/unban`, { method: 'PUT' })
}

export function bulkBanAdminUsers(userIds: number[]) {
  return apiRequest<{ affectedCount: number }>('/api/admin/users/ban/bulk', { method: 'POST', body: { userIds } })
}

export function bulkUnbanAdminUsers(userIds: number[]) {
  return apiRequest<{ affectedCount: number }>('/api/admin/users/unban/bulk', { method: 'POST', body: { userIds } })
}
