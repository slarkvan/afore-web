'use client'

import { useState, useEffect } from 'react'
import { useProductStore, Product } from '@/stores/productStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductFormProps {
  product?: Product
  onSuccess?: () => void
}

interface ProductSpecs {
  [key: string]: string | number
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { 
    loading,
    error,
    createProduct,
    updateProduct
  } = useProductStore()

  const { categories, fetchCategories } = useCategoryStore()

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    categoryId: product?.categoryId || '',
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
    metaKeywords: product?.metaKeywords || '',
    sortOrder: product?.sortOrder || 0,
    isActive: product?.isActive ?? true
  })

  const [specifications, setSpecifications] = useState<ProductSpecs>(() => {
    if (product?.specifications) {
      try {
        return JSON.parse(product.specifications)
      } catch {
        return {}
      }
    }
    return {}
  })

  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecValue, setNewSpecValue] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        metaKeywords: product.metaKeywords || '',
        sortOrder: product.sortOrder,
        isActive: product.isActive
      })

      if (product.specifications) {
        try {
          setSpecifications(JSON.parse(product.specifications))
        } catch {
          setSpecifications({})
        }
      }
    }
  }, [product])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (formData.name.length > 200) {
      errors.name = 'Name must be less than 200 characters'
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }
    
    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0'
    }
    
    if (!formData.categoryId) {
      errors.categoryId = 'Category is required'
    }

    if (formData.metaTitle && formData.metaTitle.length > 60) {
      errors.metaTitle = 'Meta title should be less than 60 characters'
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      errors.metaDescription = 'Meta description should be less than 160 characters'
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
      description: formData.description.trim(),
      price: formData.price,
      specifications: Object.keys(specifications).length > 0 ? JSON.stringify(specifications) : undefined,
      metaTitle: formData.metaTitle.trim() || undefined,
      metaDescription: formData.metaDescription.trim() || undefined,
      metaKeywords: formData.metaKeywords.trim() || undefined,
      categoryId: formData.categoryId,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive
    }

    try {
      if (product) {
        await updateProduct(product.id, submitData)
      } else {
        await createProduct(submitData)
      }
      
      if (onSuccess) {
        onSuccess()
      }
      
      // Reset form if creating new product
      if (!product) {
        setFormData({
          name: '',
          description: '',
          price: 0,
          categoryId: '',
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
          sortOrder: 0,
          isActive: true
        })
        setSpecifications({})
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

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecifications(prev => ({
        ...prev,
        [newSpecKey.trim()]: newSpecValue.trim()
      }))
      setNewSpecKey('')
      setNewSpecValue('')
    }
  }

  const removeSpecification = (key: string) => {
    setSpecifications(prev => {
      const newSpecs = { ...prev }
      delete newSpecs[key]
      return newSpecs
    })
  }

  const getAvailableCategories = () => {
    return categories.filter(category => category.isActive)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <div className="text-red-500 text-sm">{formErrors.name}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Select
                value={formData.categoryId || "none"}
                onValueChange={(value) => handleInputChange('categoryId', value === "none" ? "" : value)}
              >
                <SelectTrigger className={formErrors.categoryId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a category</SelectItem>
                  {getAvailableCategories().map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.parentId ? `${categories.find(c => c.id === category.parentId)?.name} > ` : ''}
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.categoryId && (
                <div className="text-red-500 text-sm">{formErrors.categoryId}</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter product description"
              rows={4}
              className={formErrors.description ? 'border-red-500' : ''}
            />
            {formErrors.description && (
              <div className="text-red-500 text-sm">{formErrors.description}</div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (CNY) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={formErrors.price ? 'border-red-500' : ''}
              />
              {formErrors.price && (
                <div className="text-red-500 text-sm">{formErrors.price}</div>
              )}
            </div>

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
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Input
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              placeholder="Specification name"
            />
            <Input
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              placeholder="Specification value"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addSpecification}
              disabled={!newSpecKey.trim() || !newSpecValue.trim()}
            >
              Add
            </Button>
          </div>

          {Object.entries(specifications).length > 0 && (
            <div className="space-y-2">
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex-1">
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSpecification(key)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={formData.metaTitle}
              onChange={(e) => handleInputChange('metaTitle', e.target.value)}
              placeholder="SEO title (recommended: under 60 characters)"
              className={formErrors.metaTitle ? 'border-red-500' : ''}
            />
            {formErrors.metaTitle && (
              <div className="text-red-500 text-sm">{formErrors.metaTitle}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription}
              onChange={(e) => handleInputChange('metaDescription', e.target.value)}
              placeholder="SEO description (recommended: under 160 characters)"
              rows={3}
              className={formErrors.metaDescription ? 'border-red-500' : ''}
            />
            {formErrors.metaDescription && (
              <div className="text-red-500 text-sm">{formErrors.metaDescription}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaKeywords">Meta Keywords</Label>
            <Input
              id="metaKeywords"
              value={formData.metaKeywords}
              onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
              placeholder="Keywords separated by commas"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  )
}