import { create } from 'zustand'

export interface Page {
  id: string
  title: string
  slug: string
  content: string
  metaTitle?: string
  metaDescription?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface PageFilters {
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

interface PageStore {
  pages: Page[]
  totalPages: number
  currentPage: number
  totalResults: number
  loading: boolean
  error: string | null
  filters: PageFilters
  
  // Actions
  fetchPages: (filters?: PageFilters) => Promise<void>
  createPage: (data: {
    title: string
    content: string
    metaTitle?: string
    metaDescription?: string
    isActive?: boolean
  }) => Promise<Page>
  updatePage: (id: string, data: Partial<Page>) => Promise<void>
  deletePage: (id: string) => Promise<void>
  togglePageStatus: (id: string) => Promise<void>
  
  // Helpers
  getPageById: (id: string) => Page | undefined
  getPageBySlug: (slug: string) => Page | undefined
  setFilters: (filters: Partial<PageFilters>) => void
  clearError: () => void
}

export const usePageStore = create<PageStore>((set, get) => ({
  pages: [],
  totalPages: 1,
  currentPage: 1,
  totalResults: 0,
  loading: false,
  error: null,
  filters: { page: 1, limit: 20 },

  fetchPages: async (filters) => {
    const currentFilters = { ...get().filters, ...filters }
    set({ loading: true, error: null, filters: currentFilters })
    
    try {
      const params = new URLSearchParams()
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/pages?${params}`)
      if (!response.ok) throw new Error('Failed to fetch pages')
      
      const data = await response.json()
      set({ 
        pages: data.pages || data,
        totalResults: data.total || data.length,
        currentPage: data.page || 1,
        totalPages: data.totalPages || 1,
        loading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch pages',
        loading: false 
      })
    }
  },

  createPage: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create page')
      
      const page = await response.json()
      await get().fetchPages()
      return page
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create page',
        loading: false 
      })
      throw error
    }
  },

  updatePage: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to update page')
      
      await get().fetchPages()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update page',
        loading: false 
      })
    }
  },

  deletePage: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete page')
      
      await get().fetchPages()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete page',
        loading: false 
      })
    }
  },

  togglePageStatus: async (id) => {
    const page = get().getPageById(id)
    if (!page) return
    
    await get().updatePage(id, { isActive: !page.isActive })
  },

  getPageById: (id) => {
    return get().pages.find(page => page.id === id)
  },

  getPageBySlug: (slug) => {
    return get().pages.find(page => page.slug === slug)
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }))
  },

  clearError: () => {
    set({ error: null })
  }
}))