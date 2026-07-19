import fallbackProductImage from "../../assets/galery-block/galery-1.webp";
import type {
  AdminMediaType,
  AdminProductFilters,
  BulkPriceOperation,
  Category,
  CreateProductPayload,
  Product,
  SelectionMode,
  UpdateProductPayload,
} from "../../types/product";
import { apiRequest } from "./client";
import { getHomeApi } from "./contentApi";
import { resolveMediaUrl } from "./mediaApi";

type PageResponse<T> = {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

type CategoryDto = {
  categoryId: number;
  name: string;
};

type ProductMediaDto = {
  productMediaId: number;
  s3Key: string;
  mediaType: AdminMediaType;
  isPrimary: boolean;
  displayOrder: number;
};

type AdminProductDetailDto = {
  productId: number;
  name: string;
  description: string;
  price: number;
  category: CategoryDto | null;
  media: ProductMediaDto[];
};

type BulkOperationResultDto = {
  affectedCount: number;
};

type BulkSelectionPayload = {
  selectionMode: SelectionMode;
  productIds: number[];
  filters: AdminProductFilters | null;
};

type AdminProductsListParams = AdminProductFilters & {
  page?: number;
  size?: number;
  sort?: "name,asc" | "name,desc" | "price,asc" | "price,desc";
};

type PresignUploadResponseDto = {
  s3Key: string;
  uploadUrl: string;
  method: "PUT";
  expiresAt: string;
  requiredHeaders: Record<string, string>;
};

export type AdminProductsPageResult = Omit<
  PageResponse<AdminProductDetailDto>,
  "content"
> & {
  content: Product[];
};

export type BulkPricePayload = BulkSelectionPayload & {
  operation: BulkPriceOperation;
  value: number;
};

export type BulkCategoryPayload = BulkSelectionPayload & {
  categoryId: number;
};

function buildQuery(params: AdminProductsListParams = {}) {
  const searchParams = new URLSearchParams();

  params.categoryIds?.forEach((categoryId) => {
    searchParams.append("categoryIds", String(categoryId));
  });
  if (params.uncategorized) searchParams.set("uncategorized", "true");
  if (params.search?.trim()) searchParams.set("search", params.search.trim());
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function normalizeCategory(dto: CategoryDto): Category {
  return {
    id: dto.categoryId,
    name: dto.name,
  };
}

async function normalizeProduct(
  dto: AdminProductDetailDto,
  homeIds: number[] = [],
): Promise<Product> {
  const media = await Promise.all(
    dto.media.map(async (item) => ({
      id: item.productMediaId,
      s3Key: item.s3Key,
      url: await resolveMediaUrl(item.s3Key, fallbackProductImage),
      mediaType: item.mediaType,
      isPrimary: item.isPrimary,
      displayOrder: item.displayOrder,
    })),
  );
  const category = dto.category ? normalizeCategory(dto.category) : null;
  const homeIndex = homeIds.indexOf(dto.productId);

  return {
    id: dto.productId,
    name: dto.name,
    categoryId: category?.id ?? null,
    category,
    price: Number(dto.price),
    description: dto.description,
    media,
    isOnHome: homeIndex !== -1,
    homeOrder: homeIndex === -1 ? null : homeIndex + 1,
  };
}

export async function fetchAdminCategoriesApi(): Promise<Category[]> {
  const categories = await apiRequest<CategoryDto[]>("/api/admin/categories");
  return categories.map(normalizeCategory);
}

export async function fetchAdminProductsApi(
  params: AdminProductsListParams = {},
  homeIds: number[] = [],
): Promise<AdminProductsPageResult> {
  const page = await apiRequest<PageResponse<AdminProductDetailDto>>(
    `/api/admin/products${buildQuery(params)}`,
  );
  const content = await Promise.all(
    page.content.map((product) => normalizeProduct(product, homeIds)),
  );
  return { ...page, content };
}

export async function fetchAdminProductApi(
  id: number,
  homeIds: number[] = [],
): Promise<Product> {
  const product = await apiRequest<AdminProductDetailDto>(
    `/api/admin/products/${id}`,
  );
  return normalizeProduct(product, homeIds);
}

export async function fetchHomeProductIdsApi(): Promise<number[]> {
  const home = await getHomeApi();
  return home.products.map((product) => product.productId);
}

export async function createAdminProductApi(
  payload: CreateProductPayload,
): Promise<Product> {
  const product = await apiRequest<AdminProductDetailDto>("/api/admin/products", {
    method: "POST",
    body: payload,
  });
  return normalizeProduct(product);
}

export async function updateAdminProductApi(
  id: number,
  payload: UpdateProductPayload,
  homeIds: number[] = [],
): Promise<Product> {
  const product = await apiRequest<AdminProductDetailDto>(
    `/api/admin/products/${id}`,
    {
      method: "PUT",
      body: payload,
    },
  );
  return normalizeProduct(product, homeIds);
}

export function deleteAdminProductApi(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/products/${id}`, { method: "DELETE" });
}

export function bulkDeleteAdminProductsApi(
  payload: BulkSelectionPayload,
): Promise<BulkOperationResultDto> {
  return apiRequest<BulkOperationResultDto>("/api/admin/products/bulk/delete", {
    method: "POST",
    body: payload,
  });
}

export function bulkUpdateAdminPricesApi(
  payload: BulkPricePayload,
): Promise<BulkOperationResultDto> {
  return apiRequest<BulkOperationResultDto>("/api/admin/products/bulk/price", {
    method: "POST",
    body: payload,
  });
}

export function bulkUpdateAdminCategoriesApi(
  payload: BulkCategoryPayload,
): Promise<BulkOperationResultDto> {
  return apiRequest<BulkOperationResultDto>("/api/admin/products/bulk/category", {
    method: "POST",
    body: payload,
  });
}

export function replaceHomeProductsApi(productIds: number[]): Promise<void> {
  return apiRequest<void>("/api/admin/products/home", {
    method: "PUT",
    body: { productIds },
  });
}

export function reorderHomeProductsApi(productIds: number[]): Promise<void> {
  return apiRequest<void>("/api/admin/products/home-order", {
    method: "PUT",
    body: { productIds },
  });
}

export function deleteAdminProductMediaApi(
  productId: number,
  mediaId: number,
): Promise<void> {
  return apiRequest<void>(`/api/admin/products/${productId}/media/${mediaId}`, {
    method: "DELETE",
  });
}

export function setPrimaryAdminMediaApi(
  productId: number,
  mediaId: number,
): Promise<void> {
  return apiRequest<void>(
    `/api/admin/products/${productId}/media/${mediaId}/primary`,
    { method: "PUT" },
  );
}

function getMediaType(file: File): AdminMediaType {
  return file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
}

async function checksumSha256Base64(file: File) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const bytes = new Uint8Array(digest);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function attachUploadedMedia(productId: number, s3Key: string) {
  await apiRequest<void>(`/api/admin/products/${productId}/media/attach`, {
    method: "POST",
    body: { s3Key },
  });
}

export async function uploadAdminProductMediaApi(
  productId: number,
  files: File[],
): Promise<string[]> {
  const uploadedKeys: string[] = [];
  for (const file of files) {
    const checksumSha256Base64Value = await checksumSha256Base64(file);
    const presign = await apiRequest<PresignUploadResponseDto>(
      "/api/admin/files/presign/upload",
      {
        method: "POST",
        body: {
          targetType: "PRODUCT",
          targetId: productId,
          mediaType: getMediaType(file),
          contentType: file.type,
          sizeBytes: file.size,
          originalFilename: file.name,
          checksumSha256Base64: checksumSha256Base64Value,
        },
      },
    );

    const uploadResponse = await fetch(presign.uploadUrl, {
      method: presign.method,
      headers: presign.requiredHeaders,
      body: file,
    });
    if (!uploadResponse.ok) {
      throw new Error("Не вдалося завантажити медіа");
    }
    await attachUploadedMedia(productId, presign.s3Key);
    uploadedKeys.push(presign.s3Key);
  }
  return uploadedKeys;
}
