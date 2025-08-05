import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const productId = formData.get('productId') as string
    const files = formData.getAll('images') as File[]

    if (!productId || files.length === 0) {
      return NextResponse.json(
        { error: 'Product ID and images are required' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads/products')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const uploadedImages = []
    const isFirstImage = product.images.length === 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue // Skip non-image files
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        continue // Skip files larger than 5MB
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2)
      const extension = file.name.split('.').pop()
      const filename = `${productId}-${timestamp}-${random}.${extension}`
      const filepath = join(uploadDir, filename)
      const relativePath = `uploads/products/${filename}`

      // Write file to disk
      await writeFile(filepath, buffer)

      // Get the current highest sort order
      const maxSortOrder = product.images.reduce((max, img) => 
        Math.max(max, img.sortOrder), -1)

      // Create database record
      const imageRecord = await prisma.productImage.create({
        data: {
          productId,
          filename,
          originalName: file.name,
          path: relativePath,
          size: file.size,
          mimeType: file.type,
          isMain: isFirstImage && i === 0, // First image of first upload is main
          sortOrder: maxSortOrder + i + 1
        }
      })

      uploadedImages.push(imageRecord)
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { error: 'No valid images were uploaded' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading images:', error)
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    )
  }
}