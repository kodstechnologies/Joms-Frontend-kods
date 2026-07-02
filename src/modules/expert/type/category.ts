export interface SubCategory {
  _id: string
  name: string
  description: string
  vectorIcon: string
  status: "ACTIVE" | "PAUSED" | "DELETED"
}

export interface Category {
  _id: string;
  categoryId: string;
  name: string;
  description: string;

  icon3D: string | null;
  image: string | null;

  status: "ACTIVE" | "PAUSED" | "DELETED";

  subCategories: SubCategory[];

  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export interface CategoryListResponse {
  success: boolean
  message: string
  data: Category[]
  meta: {
    pagination: PaginationMeta
  }
}

export interface SubCategoryListResponse {
  success: boolean
  message: string
  data: SubCategory[]
  meta: {
    pagination: PaginationMeta
  }
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  icon3D: string;
}

export interface CategoryByIdResponse {
  success: boolean;
  message: string;
  data: Category;
}