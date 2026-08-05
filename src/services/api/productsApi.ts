import fallbackProductImage from "../../assets/galery-block/galery-1.webp";
import { apiRequest } from "./client";
import { resolveMediaUrl, type MediaPreviewDto } from "./mediaApi";

// ── Public storefront product API ───────────────────────────────

export type CategoryDto = {
  categoryId: number;
  name: string;
};

export type ProductMediaPreviewDto = MediaPreviewDto & {
  productMediaId?: number;
  thumbnailS3Key?: string | null;
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
  media?: ProductMediaUi[];
  price: number;
};

export type ProductMediaUi = {
  id?: number;
  s3Key?: string | null;
  thumbnailS3Key?: string | null;
  url: string;
  thumbnailUrl?: string;
  mediaType: "IMAGE" | "VIDEO";
  isPrimary: boolean;
  displayOrder: number;
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
    dto.primaryMedia?.thumbnailS3Key ?? dto.primaryMedia?.s3Key,
    fallbackProductImage,
  );

  return {
    id: String(dto.productId),
    category: dto.category.name,
    name: dto.name,
    description: "",
    image,
    gallery: [image],
    media: dto.primaryMedia
      ? [
          {
            id: dto.primaryMedia.productMediaId,
            s3Key: dto.primaryMedia.s3Key,
            thumbnailS3Key: dto.primaryMedia.thumbnailS3Key,
            url: image,
            thumbnailUrl: image,
            mediaType: dto.primaryMedia.mediaType ?? "IMAGE",
            isPrimary: true,
            displayOrder: 0,
          },
        ]
      : undefined,
    price: Number(dto.price),
  };
}

export function normalizeProductDetailBase(
  dto: ProductDetailDto,
): ProductUi {
  const media: ProductMediaUi[] = dto.media.length
    ? [...dto.media]
        .sort((first, second) => first.displayOrder - second.displayOrder)
        .map((item) => ({
          id: item.productMediaId,
          s3Key: item.s3Key,
          thumbnailS3Key: item.thumbnailS3Key,
          url: item.mediaType === "VIDEO" ? "" : fallbackProductImage,
          thumbnailUrl: item.mediaType === "VIDEO" ? undefined : fallbackProductImage,
          mediaType: item.mediaType ?? "IMAGE",
          isPrimary: item.isPrimary,
          displayOrder: item.displayOrder,
        }))
    : [
        {
          url: fallbackProductImage,
          thumbnailUrl: fallbackProductImage,
          mediaType: "IMAGE",
          isPrimary: true,
          displayOrder: 0,
        },
      ];

  const primaryImage =
    media.find((item) => item.isPrimary && item.mediaType === "IMAGE") ??
    media.find((item) => item.mediaType === "IMAGE");

  return {
    id: String(dto.productId),
    category: dto.category.name,
    name: dto.name,
    description: dto.description,
    image: primaryImage?.url ?? fallbackProductImage,
    gallery: media.map((item) => item.url).filter(Boolean),
    media,
    price: Number(dto.price),
  };
}

export async function resolveProductMediaItem(
  media: ProductMediaUi,
): Promise<ProductMediaUi> {
  const fallbackUrl =
    media.mediaType === "IMAGE" ? media.url || fallbackProductImage : "";
  const url = await resolveMediaUrl(media.s3Key, fallbackUrl);
  const thumbnailUrl = media.thumbnailS3Key
    ? await resolveMediaUrl(media.thumbnailS3Key, media.mediaType === "IMAGE" ? url : "")
    : media.mediaType === "IMAGE"
      ? url
      : undefined;

  return { ...media, url, thumbnailUrl };
}

export async function normalizeProductDetail(
  dto: ProductDetailDto,
): Promise<ProductUi> {
  const product = normalizeProductDetailBase(dto);
  const media = await Promise.all((product.media ?? []).map(resolveProductMediaItem));
  const primaryImage =
    media.find((item) => item.isPrimary && item.mediaType === "IMAGE") ??
    media.find((item) => item.mediaType === "IMAGE");

  return {
    ...product,
    image: primaryImage?.url ?? fallbackProductImage,
    gallery: media.map((item) => item.url).filter(Boolean),
    media,
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

export async function getProductDetailApi(productId: string) {
  const product = await apiRequest<ProductDetailDto>(
    `/api/products/${encodeURIComponent(productId)}`,
    { auth: false },
  );
  return normalizeProductDetailBase(product);
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
