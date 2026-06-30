import type {
  Product,
  Category,
  CreateProductPayload,
  UpdateProductPayload,
  BulkPriceUpdate,
} from "../../types/product";
import fallbackProductImage from "../../assets/galery-block/galery-1.webp";
import { apiRequest } from "./client";
import { resolveMediaUrl, type MediaPreviewDto } from "./mediaApi";

const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? "Помилка сервера");
  }
  return res.json();
}

// ── Admin product management API ───────────────────────────────

export function fetchCategoriesApi(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export function fetchProductsApi(): Promise<Product[]> {
  return request<Product[]>("/products/admin");
}

export function createProductApi(
  payload: CreateProductPayload,
): Promise<Product> {
  return request<Product>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProductApi(
  id: number,
  payload: UpdateProductPayload,
): Promise<Product> {
  return request<Product>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteProductApi(id: number): Promise<void> {
  return request<void>(`/products/${id}`, { method: "DELETE" });
}

export function deleteProductsApi(ids: number[]): Promise<void> {
  return request<void>("/products/bulk-delete", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

export function uploadProductMediaApi(
  productId: number,
  files: File[],
): Promise<Product> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return request<Product>(`/products/${productId}/media`, {
    method: "POST",
    headers: {},
    body: form,
  });
}

export function deleteProductMediaApi(
  productId: number,
  mediaId: number,
): Promise<void> {
  return request<void>(`/products/${productId}/media/${mediaId}`, {
    method: "DELETE",
  });
}

export function setMainMediaApi(
  productId: number,
  mediaId: number,
): Promise<void> {
  return request<void>(`/products/${productId}/media/${mediaId}/main`, {
    method: "PATCH",
  });
}

export function bulkUpdatePricesApi(
  payload: BulkPriceUpdate,
): Promise<Product[]> {
  return request<Product[]>("/products/bulk-price", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function reorderProductsApi(orderedIds: number[]): Promise<void> {
  return request<void>("/products/reorder", {
    method: "PATCH",
    body: JSON.stringify({ orderedIds }),
  });
}

// ── Public storefront product API ───────────────────────────────

export type CategoryDto = {
  categoryId: number;
  name: string;
};

export type ProductMediaPreviewDto = MediaPreviewDto & {
  productMediaId?: number;
};

export type ProductMediaDto = ProductMediaPreviewDto & {
  isPrimary: boolean;
  displayOrder: number;
};

export type ProductSummaryDto = {
  productId: number;
  name: string;
  category: CategoryDto;
  price: number;
  primaryMedia?: ProductMediaPreviewDto | null;
};

export type ProductDetailDto = {
  productId: number;
  name: string;
  description: string;
  price: number;
  category: CategoryDto;
  media: ProductMediaDto[];
};

type PageResponse<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type ProductUi = {
  id: string;
  category: string;
  name: string;
  displayName?: string;
  description: string;
  image: string;
  gallery: string[];
  price: number;
};

export type ProductListParams = {
  categoryIds?: string[];
  page?: number;
  size?: number;
  sort?: "name,asc" | "name,desc" | "price,asc" | "price,desc";
};

function buildQuery(params: ProductListParams = {}) {
  const searchParams = new URLSearchParams();

  params.categoryIds?.forEach((categoryId) =>
    searchParams.append("categoryIds", categoryId),
  );
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.sort && !params.sort.startsWith("price,"))
    searchParams.set("sort", params.sort);

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function normalizeProductSummary(
  dto: ProductSummaryDto,
): Promise<ProductUi> {
  const image = await resolveMediaUrl(
    dto.primaryMedia?.s3Key,
    fallbackProductImage,
  );

  return {
    id: String(dto.productId),
    category: dto.category.name,
    name: dto.name,
    description: "",
    image,
    gallery: [image],
    price: Number(dto.price),
  };
}

export async function normalizeProductDetail(
  dto: ProductDetailDto,
): Promise<ProductUi> {
  const gallery = await Promise.all(
    (dto.media.length ? dto.media : [{ s3Key: null }]).map((media) =>
      resolveMediaUrl(media.s3Key, fallbackProductImage),
    ),
  );

  return {
    id: String(dto.productId),
    category: dto.category.name,
    name: dto.name,
    description: dto.description,
    image: gallery[0] ?? fallbackProductImage,
    gallery,
    price: Number(dto.price),
  };
}

export async function getCategoriesApi() {
  return apiRequest<CategoryDto[]>("/api/categories", { auth: false });
}

export async function getProductsApi(params?: ProductListParams) {
  const page = await apiRequest<PageResponse<ProductSummaryDto>>(
    `/api/products${buildQuery(params)}`,
    { auth: false },
  );
  const content = await Promise.all(page.content.map(normalizeProductSummary));
  return { ...page, content };
}

export async function getProductApi(productId: string) {
  const product = await apiRequest<ProductDetailDto>(
    `/api/products/${encodeURIComponent(productId)}`,
    { auth: false },
  );
  return normalizeProductDetail(product);
}

export async function getRelatedProductsApi(productId: string, size = 4) {
  const page = await apiRequest<PageResponse<ProductSummaryDto>>(
    `/api/products/${encodeURIComponent(productId)}/related?size=${size}`,
    { auth: false },
  );
  const content = await Promise.all(page.content.map(normalizeProductSummary));
  return { ...page, content };
}

export { fallbackProductImage };