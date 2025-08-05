import { create } from 'zustand'

export interface ProductImage {
  id: string
  productId: string
  filename: string
  originalName: string
  path: string
  size: number
  mimeType: string
  isMain: boolean
  sortOrder: number
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  specifications?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  sortOrder: number
  isActive: boolean
  categoryId: string
  createdAt: Date
  updatedAt: Date
  category?: {
    id: string
    name: string
    slug: string
  }
  images?: ProductImage[]
}

interface ProductFilters {
  categoryId?: string
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

interface ProductStore {
  products: Product[]
  totalProducts: number
  currentPage: number
  totalPages: number
  loading: boolean
  error: string | null
  filters: ProductFilters
  
  // Actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>
  createProduct: (data: {
    name: string
    description: string
    price: number
    specifications?: string
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string
    categoryId: string
    sortOrder?: number
    isActive?: boolean
  }) => Promise<Product>
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  toggleProductStatus: (id: string) => Promise<void>
  uploadProductImages: (productId: string, files: FileList) => Promise<void>
  deleteProductImage: (imageId: string) => Promise<void>
  setMainImage: (imageId: string) => Promise<void>
  
  // Helpers
  getProductById: (id: string) => Product | undefined
  setFilters: (filters: Partial<ProductFilters>) => void
  clearError: () => void
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  totalProducts: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  filters: { page: 1, limit: 20 },

  fetchProducts: async (filters) => {
    const currentFilters = { ...get().filters, ...filters }
    set({ loading: true, error: null, filters: currentFilters })
    
    try {
      const params = new URLSearchParams()
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      
      const data = await response.json()
      set({ 
        products: data.products || data,
        totalProducts: data.total || data.length,
        currentPage: data.page || 1,
        totalPages: data.totalPages || 1,
        loading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        loading: false 
      })
    }
  },

  createProduct: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create product')
      
      const product = await response.json()
      await get().fetchProducts()
      return product
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create product',
        loading: false 
      })
      throw error
    }
  },

  updateProduct: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to update product')
      
      await get().fetchProducts()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update product',
        loading: false 
      })
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete product')
      
      await get().fetchProducts()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete product',
        loading: false 
      })
    }
  },

  toggleProductStatus: async (id) => {
    const product = get().getProductById(id)
    if (!product) return
    
    await get().updateProduct(id, { isActive: !product.isActive })
  },

  uploadProductImages: async (productId, files) => {
    set({ loading: true, error: null })
    try {
      const formData = new FormData()
      formData.append('productId', productId)
      
      Array.from(files).forEach(file => {
        formData.append('images', file)
      })

      const response = await fetch('/api/products/images', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) throw new Error('Failed to upload images')
      
      await get().fetchProducts()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to upload images',
        loading: false 
      })
    }
  },

  deleteProductImage: async (imageId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/products/images/${imageId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete image')
      
      await get().fetchProducts()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete image',
        loading: false 
      })
    }
  },

  setMainImage: async (imageId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/products/images/${imageId}/main`, {
        method: 'PUT'
      })
      if (!response.ok) throw new Error('Failed to set main image')
      
      await get().fetchProducts()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to set main image',
        loading: false 
      })
    }
  },

  getProductById: (id) => {
    return get().products.find(product => product.id === id)
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }))
  },

  clearError: () => {
    set({ error: null })
  }
}))