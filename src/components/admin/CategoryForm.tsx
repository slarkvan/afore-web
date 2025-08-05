'use client'

import { useState, useEffect } from 'react'
import { useCategoryStore, Category } from '@/stores/categoryStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

interface CategoryFormProps {
  category?: Category
  onSuccess?: () => void
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const { 
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    getParentCategories 
  } = useCategoryStore()

  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    parentId: category?.parentId || '',
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive ?? true
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        parentId: category.parentId || '',
        sortOrder: category.sortOrder,
        isActive: category.isActive
      })
    }
  }, [category])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (formData.name.length > 100) {
      errors.name = 'Name must be less than 100 characters'
    }
    
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      parentId: formData.parentId || undefined,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive
    }

    try {
      if (category) {
        await updateCategory(category.id, submitData)
      } else {
        await createCategory(submitData)
      }
      
      if (onSuccess) {
        onSuccess()
      }
      
      // Reset form if creating new category
      if (!category) {
        setFormData({
          name: '',
          description: '',
          parentId: '',
          sortOrder: 0,
          isActive: true
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Get available parent categories (excluding current category and its children)
  const getAvailableParents = () => {
    let availableParents = getParentCategories()
    
    if (category) {
      // Exclude current category and its descendants
      availableParents = availableParents.filter(parent => {
        if (parent.id === category.id) return false
        
        // Check if current category is an ancestor of this parent
        let current = parent
        while (current.parentId) {
          if (current.parentId === category.id) return false
          current = categories.find(c => c.id === current.parentId) || current
          if (current === parent) break // Prevent infinite loop
        }
        
        return true
      })
    }
    
    return availableParents
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Category name"
            className={formErrors.name ? 'border-red-500' : ''}
          />
          {formErrors.name && (
            <div className="text-red-500 text-sm">{formErrors.name}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentId">Parent Category</Label>
          <Select
            value={formData.parentId || "none"}
            onValueChange={(value) => handleInputChange('parentId', value === "none" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Parent (Top Level)</SelectItem>
              {getAvailableParents().map(parent => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Category description (optional)"
          rows={3}
          className={formErrors.description ? 'border-red-500' : ''}
        />
        {formErrors.description && (
          <div className="text-red-500 text-sm">{formErrors.description}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="isActive">Status</Label>
          <Select
            value={formData.isActive.toString()}
            onValueChange={(value) => handleInputChange('isActive', value === 'true')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
        </Button>
      </div>
    </form>
  )
}