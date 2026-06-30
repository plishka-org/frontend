export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductMedia {
  id: number;
  url: string;
  isMain: boolean;
  order: number;
}

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  category: Category;
  price: number;
  description: string;
  media: ProductMedia[];
  isOnMain: boolean;
  mainOrder: number | null; // порядок відображення на головній (1-10)
  displayOrder: number;     // порядок у загальному списку (drag-and-drop)
  isActive: boolean;
}

export type PriceActionType = "+%" | "-%" | "+" | "-";

export type PriceTargetType = "all" | "category" | "selected" | "unselected";

export interface BulkPriceUpdate {
  action: PriceActionType;
  value: number;
  target: PriceTargetType;
  categoryId?: number;
  productIds?: number[];
}

export interface CreateProductPayload {
  name: string;
  categoryId: number;
  price: number;
  description: string;
  isOnMain: boolean;
}

export interface UpdateProductPayload {
  name?: string;
  categoryId?: number;
  price?: number;
  description?: string;
  isOnMain?: boolean;
  displayOrder?: number;
  mainOrder?: number | null;
}