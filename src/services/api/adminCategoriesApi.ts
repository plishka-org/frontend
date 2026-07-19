import type { Category } from "../../types/product";
import { apiRequest } from "./client";
import { fetchAdminProductsApi } from "./adminProductsApi";

type CategoryDto = {
  categoryId: number;
  name: string;
  productCount?: number;
  displayOrder?: number;
};

export type AdminCategory = Category & {
  productCount: number;
  displayOrder: number;
};

export type CategoryDeleteStrategy =
  | "KEEP_PRODUCTS"
  | "MOVE_PRODUCTS"
  | "DELETE_PRODUCTS";

function normalizeCategory(dto: CategoryDto, index = 0): AdminCategory {
  return {
    id: dto.categoryId,
    name: dto.name,
    productCount: dto.productCount ?? 0,
    displayOrder: dto.displayOrder ?? index + 1,
  };
}

export async function fetchAdminCategoryListApi(): Promise<AdminCategory[]> {
  const categories = await apiRequest<CategoryDto[]>("/api/admin/categories");
  const normalized = categories.map(normalizeCategory);

  const withCounts = await Promise.all(
    normalized.map(async (category) => {
      if (categories.find((item) => item.categoryId === category.id)?.productCount !== undefined) {
        return category;
      }
      try {
        const result = await fetchAdminProductsApi({
          categoryIds: [category.id],
          page: 0,
          size: 1,
        });
        return { ...category, productCount: result.totalElements };
      } catch {
        return category;
      }
    }),
  );

  return withCounts.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function createAdminCategoryApi(name: string): Promise<AdminCategory> {
  const category = await apiRequest<CategoryDto>("/api/admin/categories", {
    method: "POST",
    body: { name },
  });
  return normalizeCategory(category);
}

export async function updateAdminCategoryApi(id: number, name: string): Promise<AdminCategory> {
  const category = await apiRequest<CategoryDto>(`/api/admin/categories/${id}`, {
    method: "PUT",
    body: { name },
  });
  return normalizeCategory(category);
}

export function deleteAdminCategoryApi(
  id: number,
  strategy: CategoryDeleteStrategy,
  targetCategoryId?: number,
): Promise<void> {
  const params = new URLSearchParams({ strategy });
  if (strategy === "MOVE_PRODUCTS" && targetCategoryId !== undefined) {
    params.set("targetCategoryId", String(targetCategoryId));
  }
  return apiRequest<void>(`/api/admin/categories/${id}?${params.toString()}`, {
    method: "DELETE",
  });
}
