'use client'

import { useState, useEffect } from 'react'
import { usePageStore, Page } from '@/stores/pageStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

interface PageFormProps {
  page?: Page
  onSuccess?: () => void
}

export function PageForm({ page, onSuccess }: PageFormProps) {
  const { 
    loading,
    error,
    createPage,
    updatePage
  } = usePageStore()

  const [formData, setFormData] = useState({
    title: page?.title || '',
    content: page?.content || '',
    metaTitle: page?.metaTitle || '',
    metaDescription: page?.metaDescription || '',
    isActive: page?.isActive ?? true
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title,
        content: page.content,
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
        isActive: page.isActive
      })
    }
  }, [page])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (formData.title.length > 200) {
      errors.title = 'Title must be less than 200 characters'
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Content is required'
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
      title: formData.title.trim(),
      content: formData.content.trim(),
      metaTitle: formData.metaTitle.trim() || undefined,
      metaDescription: formData.metaDescription.trim() || undefined,
      isActive: formData.isActive
    }

    try {
      if (page) {
        await updatePage(page.id, submitData)
      } else {
        await createPage(submitData)
      }
      
      if (onSuccess) {
        onSuccess()
      }
      
      // Reset form if creating new page
      if (!page) {
        setFormData({
          title: '',
          content: '',
          metaTitle: '',
          metaDescription: '',
          isActive: true
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
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

  const generateSlugPreview = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
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
          <div className="space-y-2">
            <Label htmlFor="title">Page Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter page title"
              className={formErrors.title ? 'border-red-500' : ''}
            />
            {formErrors.title && (
              <div className="text-red-500 text-sm">{formErrors.title}</div>
            )}
            {formData.title && (
              <div className="text-xs text-muted-foreground">
                URL will be: <code>/{generateSlugPreview(formData.title)}</code>
              </div>
            )}
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
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="content">Page Content *</Label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => handleInputChange('content', value)}
              placeholder="Enter page content..."
              className={formErrors.content ? 'border-red-500' : ''}
            />
            {formErrors.content && (
              <div className="text-red-500 text-sm">{formErrors.content}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings */}
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
            <div className="text-xs text-muted-foreground">
              {formData.metaTitle.length}/60 characters
            </div>
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
            <div className="text-xs text-muted-foreground">
              {formData.metaDescription.length}/160 characters
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : (page ? 'Update Page' : 'Create Page')}
        </Button>
      </div>
    </form>
  )
}