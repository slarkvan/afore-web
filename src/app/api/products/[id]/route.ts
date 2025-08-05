import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        images: {
          orderBy: [
            { isMain: 'desc' },
            { sortOrder: 'asc' }
          ]
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      price,
      specifications,
      metaTitle,
      metaDescription,
      metaKeywords,
      categoryId,
      sortOrder,
      isActive
    } = body

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const updateData: Partial<{
      name: string
      slug: string
      description: string
      price: number
      specifications: string | null
      metaTitle: string | null
      metaDescription: string | null
      metaKeywords: string | null
      categoryId: string
      sortOrder: number
      isActive: boolean
    }> = {}

    if (name !== undefined) {
      updateData.name = name
      // Generate new slug if name changed
      if (name !== existingProduct.name) {
        let slug = generateSlug(name)
        
        // Check if slug already exists (excluding current product)
        const conflictingProduct = await prisma.product.findFirst({
          where: { 
            slug,
            NOT: { id: params.id }
          }
        })
        
        if (conflictingProduct) {
          const timestamp = Date.now()
          slug = `${slug}-${timestamp}`
        }
        
        updateData.slug = slug
      }
    }

    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price.toString())
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder
    if (isActive !== undefined) updateData.isActive = isActive

    // Handle specifications
    if (specifications !== undefined) {
      if (specifications === null || specifications === '') {
        updateData.specifications = null
      } else {
        try {
          const parsedSpecs = JSON.parse(specifications)
          JSON.stringify(parsedSpecs) // Validate it can be stringified back
          updateData.specifications = JSON.stringify(parsedSpecs)
        } catch {
          return NextResponse.json(
            { error: 'Invalid specifications JSON format' },
            { status: 400 }
          )
        }
      }
    }

    // Handle category change
    if (categoryId !== undefined) {
      // Verify category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })
      
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 400 }
        )
      }

      updateData.categoryId = categoryId
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        images: {
          orderBy: [
            { isMain: 'desc' },
            { sortOrder: 'asc' }
          ]
        }
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
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

    // Delete product (images will be deleted via cascade)
    await prisma.product.delete({
      where: { id: params.id }
    })

    // TODO: Also delete physical image files from filesystem
    // This would require implementing file cleanup logic

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}