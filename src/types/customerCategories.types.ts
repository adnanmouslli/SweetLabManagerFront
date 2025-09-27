// customerCategories.types.ts

// Base interfaces for common properties
interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// Customer Category interface
export interface CustomerCategory extends BaseEntity {
  id: number;
  name: string;
  description: string | null;
  customers?: CustomerInCategory[];
}

// Simple customer representation within a category
export interface CustomerInCategory {
  id: number;
  name: string;
  phone?: string;
  createdAt?: string;
}

// Category with count information for list views
export interface CategoryWithCount {
  id: number;
  name: string;
  _count: {
    customers: number;
  };
}

// Request & Response Types for API Operations

// Get All Categories
export interface GetAllCategoriesResponse {
  categories: CustomerCategory[];
}

// Get Categories List with Count
export type GetCategoriesListResponse = CategoryWithCount[];

// Get Category By ID
export interface GetCategoryByIdRequest {
  categoryId: string;
}

export type GetCategoryByIdResponse = CustomerCategory;

// Create Category
export interface CreateCategoryRequest {
  name: string;
  description?: string | null;
}

export type CreateCategoryResponse = CustomerCategory;

// Update Category
export interface UpdateCategoryRequest {
  name?: string;
  description?: string | null;
}

export type UpdateCategoryResponse = CustomerCategory;

// Delete Category
export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
  deletedCategoryId: number;
}
