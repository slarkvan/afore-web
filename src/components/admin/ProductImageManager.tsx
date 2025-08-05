'use client'

import { useState, useRef } from 'react'
import { useProductStore, Product, ProductImage } from '@/stores/productStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Trash2, Star, Image as ImageIcon } from 'lucide-react'

interface ProductImageManagerProps {
  product: Product
}

export function ProductImageManager({ product }: ProductImageManagerProps) {
  const {
    loading,
    error,
    uploadProductImages,
    deleteProductImage,
    setMainImage,
    fetchProducts
  } = useProductStore()

  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    try {
      await uploadProductImages(product.id, files)
      // Refresh to get updated images
      await fetchProducts()
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDeleteImage = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      await deleteProductImage(imageId)
      await fetchProducts()
    }
  }

  const handleSetMainImage = async (imageId: string) => {
    await setMainImage(imageId)
    await fetchProducts()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="mx-auto w-12 h-12 text-muted-foreground mb-4">
              <ImageIcon className="w-full h-full" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Supports: JPG, PNG, GIF, WebP (Max 5MB each)
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
            >
              {loading ? 'Uploading...' : 'Select Files'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Images */}
      <Card>
        <CardHeader>
          <CardTitle>Current Images ({product.images?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!product.images || product.images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No images uploaded yet. Upload some images to get started.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {product.images.map((image: ProductImage) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/${image.path}`}
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-image.png'
                      }}
                    />
                    
                    {/* Main Image Badge */}
                    {image.isMain && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="default" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Main
                        </Badge>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!image.isMain && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetMainImage(image.id)}
                          disabled={loading}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Image Info */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    <div className="truncate" title={image.originalName}>
                      {image.originalName}
                    </div>
                    <div>{formatFileSize(image.size)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ul className="list-disc list-inside">
            <li>The first uploaded image will automatically be set as the main image</li>
            <li>Click the star button to set a different image as the main image</li>
            <li>Main images are displayed prominently in product listings</li>
            <li>Use high-quality images for better product presentation</li>
            <li>Recommended image size: at least 800x800 pixels</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}