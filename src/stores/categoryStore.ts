import { create } from 'zustand'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  parent?: Category
  children?: Category[]
  products?: { id: string }[]
}

interface CategoryStore {
  categories: Category[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchCategories: () => Promise<void>
  createCategory: (data: {
    name: string
    description?: string
    parentId?: string
    sortOrder?: number
    isActive?: boolean
  }) => Promise<void>
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  toggleCategoryStatus: (id: string) => Promise<void>
  
  // Helpers
  getParentCategories: () => Category[]
  getCategoryById: (id: string) => Category | undefined
  getCategoriesByParent: (parentId?: string) => Category[]
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const categories = await response.json()
      set({ categories, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
        loading: false 
      })
    }
  },

  createCategory: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create category')
      
      await get().fetchCategories()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create category',
        loading: false 
      })
    }
  },

  updateCategory: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to update category')
      
      await get().fetchCategories()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update category',
        loading: false 
      })
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete category')
      
      await get().fetchCategories()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete category',
        loading: false 
      })
    }
  },

  toggleCategoryStatus: async (id) => {
    const category = get().getCategoryById(id)
    if (!category) return
    
    await get().updateCategory(id, { isActive: !category.isActive })
  },

  getParentCategories: () => {
    return get().categories.filter(cat => !cat.parentId)
  },

  getCategoryById: (id) => {
    return get().categories.find(cat => cat.id === id)
  },

  getCategoriesByParent: (parentId) => {
    return get().categories.filter(cat => cat.parentId === parentId)
  }
}))