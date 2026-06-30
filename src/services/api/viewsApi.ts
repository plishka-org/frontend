import { apiRequest } from './client'
import { normalizeProductSummary, type ProductSummaryDto, type ProductUi } from './productsApi'

type ProductViewDto = { productViewId: number; viewedAt: string; product: ProductSummaryDto }
type PageResponse<T> = { content: T[] }

export async function recordProductViewApi(productId: string) {
  await apiRequest<void>(`/api/products/${encodeURIComponent(productId)}/view`, { method: 'POST' })
}

export async function getViewedProductsApi(): Promise<ProductUi[]> {
  const page = await apiRequest<PageResponse<ProductViewDto>>('/api/users/me/viewed?size=20')
  return Promise.all(page.content.map((item) => normalizeProductSummary(item.product)))
}
