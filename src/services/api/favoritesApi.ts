import { apiRequest } from './client'
import { normalizeProductSummary, type ProductSummaryDto, type ProductUi } from './productsApi'

type PageResponse<T> = {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

export type FavoriteDto = {
  favoriteId: number
  createdAt: string
  product: ProductSummaryDto
}

export async function getFavoritesApi(): Promise<ProductUi[]> {
  const page = await apiRequest<PageResponse<FavoriteDto>>('/api/users/me/favorites?size=100')
  return Promise.all(page.content.map(({ product }) => normalizeProductSummary(product)))
}

export async function addToFavoritesApi(productId: string): Promise<void> {
  await apiRequest<FavoriteDto>(`/api/users/me/favorites/${encodeURIComponent(productId)}`, {
    method: 'POST',
  })
}

export async function removeFromFavoritesApi(productId: string): Promise<void> {
  await apiRequest<void>(`/api/users/me/favorites/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  })
}
