import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface UserFilters {
  search?: string
  role?: string
  isActive?: boolean
  page?: number
  limit?: number
}

interface UserStore {
  users: User[]
  totalPages: number
  currentPage: number
  totalResults: number
  loading: boolean
  error: string | null
  filters: UserFilters
  
  // Actions
  fetchUsers: (filters?: UserFilters) => Promise<void>
  createUser: (data: {
    email: string
    password: string
    name: string
    role?: 'SUPER_ADMIN' | 'ADMIN'
    isActive?: boolean
  }) => Promise<User>
  updateUser: (id: string, data: Partial<User & { password?: string }>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  toggleUserStatus: (id: string) => Promise<void>
  
  // Helpers
  getUserById: (id: string) => User | undefined
  getUserByEmail: (email: string) => User | undefined
  setFilters: (filters: Partial<UserFilters>) => void
  clearError: () => void
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  totalPages: 1,
  currentPage: 1,
  totalResults: 0,
  loading: false,
  error: null,
  filters: { page: 1, limit: 20 },

  fetchUsers: async (filters) => {
    const currentFilters = { ...get().filters, ...filters }
    set({ loading: true, error: null, filters: currentFilters })
    
    try {
      const params = new URLSearchParams()
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/users?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data = await response.json()
      set({ 
        users: data.users || data,
        totalResults: data.total || data.length,
        currentPage: data.page || 1,
        totalPages: data.totalPages || 1,
        loading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch users',
        loading: false 
      })
    }
  },

  createUser: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }
      
      const user = await response.json()
      await get().fetchUsers()
      return user
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create user',
        loading: false 
      })
      throw error
    }
  },

  updateUser: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }
      
      await get().fetchUsers()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update user',
        loading: false 
      })
      throw error
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }
      
      await get().fetchUsers()
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete user',
        loading: false 
      })
      throw error
    }
  },

  toggleUserStatus: async (id) => {
    const user = get().getUserById(id)
    if (!user) return
    
    await get().updateUser(id, { isActive: !user.isActive })
  },

  getUserById: (id) => {
    return get().users.find(user => user.id === id)
  },

  getUserByEmail: (email) => {
    return get().users.find(user => user.email === email)
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }))
  },

  clearError: () => {
    set({ error: null })
  }
}))