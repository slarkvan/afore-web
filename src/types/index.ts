import { UserRole, Category, Product, ProductImage } from '@prisma/client'

// Extended types with relations
export type CategoryWithChildren = Category & {
  children: Category[]
  parent?: Category | null
  _count?: {
    products: number
  }
}

export type ProductWithDetails = Product & {
  category: Category
  images: ProductImage[]
}

export type ProductWithCategory = Product & {
  category: Category
}

export type CategoryWithProducts = Category & {
  products: Product[]
  children: Category[]
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface CategoryForm {
  name: string
  slug: string
  description?: string
  parentId?: string
  sortOrder: number
  isActive: boolean
}

export interface ProductForm {
  name: string
  slug: string
  description: string
  price: number
  specifications?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  categoryId: string
  sortOrder: number
  isActive: boolean
}

export interface PageForm {
  title: string
  slug: string
  content: string
  metaTitle?: string
  metaDescription?: string
  isActive: boolean
}

export interface UserForm {
  name: string
  email: string
  password?: string
  role: UserRole
  isActive: boolean
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filter and search types
export interface ProductFilters {
  categoryId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  isActive?: boolean
  sortBy?: 'name' | 'price' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface CategoryFilters {
  parentId?: string | null
  search?: string
  isActive?: boolean
}

// File upload types
export interface UploadedFile {
  filename: string
  originalName: string
  path: string
  size: number
  mimeType: string
}

// Breadcrumb type
export interface Breadcrumb {
  label: string
  href: string
}