import type {
  Product,
  Category,
  CreateProductPayload,
  UpdateProductPayload,
  BulkPriceUpdate,
} from "../../types/product";

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

export function fetchCategoriesApi(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export function fetchProductsApi(): Promise<Product[]> {
  return request<Product[]>("/products/admin");
}

export function createProductApi(payload: CreateProductPayload): Promise<Product> {
  return request<Product>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProductApi(id: number, payload: UpdateProductPayload): Promise<Product> {
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

export function uploadProductMediaApi(productId: number, files: File[]): Promise<Product> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return request<Product>(`/products/${productId}/media`, {
    method: "POST",
    headers: {},
    body: form,
  });
}

export function deleteProductMediaApi(productId: number, mediaId: number): Promise<void> {
  return request<void>(`/products/${productId}/media/${mediaId}`, { method: "DELETE" });
}

export function setMainMediaApi(productId: number, mediaId: number): Promise<void> {
  return request<void>(`/products/${productId}/media/${mediaId}/main`, { method: "PATCH" });
}

export function bulkUpdatePricesApi(payload: BulkPriceUpdate): Promise<Product[]> {
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