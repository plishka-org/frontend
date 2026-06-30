export interface Category {
  id: number;
  name: string;
}

export type AdminMediaType = "IMAGE" | "VIDEO";

export interface ProductMedia {
  id: number;
  s3Key: string | null;
  url: string;
  mediaType: AdminMediaType;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Product {
  id: number;
  name: string;
  categoryId: number | null;
  category: Category | null;
  price: number;
  description: string;
  media: ProductMedia[];
  isOnHome: boolean;
  homeOrder: number | null;
}

export type PriceActionType = "+%" | "-%" | "+" | "-";

export type PriceTargetType = "all" | "category" | "selected" | "unselected";

export type SelectionMode = "SELECTED" | "EXCEPT_SELECTED";

export type BulkPriceOperation =
  | "INCREASE_PERCENT"
  | "DECREASE_PERCENT"
  | "INCREASE_AMOUNT"
  | "DECREASE_AMOUNT";

export interface AdminProductFilters {
  categoryIds?: number[];
  uncategorized?: boolean;
  search?: string | null;
}

export interface CreateProductPayload {
  name: string;
  categoryId: number;
  price: number;
  description: string;
}

export type UpdateProductPayload = CreateProductPayload;
