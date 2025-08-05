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
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
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
    const { name, description, parentId, sortOrder, isActive } = body

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const updateData: Partial<{
      name: string
      slug: string
      description: string | null
      parentId: string | null
      sortOrder: number
      isActive: boolean
    }> = {}

    if (name !== undefined) {
      updateData.name = name
      // Generate new slug if name changed
      if (name !== existingCategory.name) {
        let slug = generateSlug(name)
        
        // Check if slug already exists (excluding current category)
        const conflictingCategory = await prisma.category.findFirst({
          where: { 
            slug,
            NOT: { id: params.id }
          }
        })
        
        if (conflictingCategory) {
          const timestamp = Date.now()
          slug = `${slug}-${timestamp}`
        }
        
        updateData.slug = slug
      }
    }

    if (description !== undefined) updateData.description = description
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder
    if (isActive !== undefined) updateData.isActive = isActive

    // Handle parent category change
    if (parentId !== undefined) {
      if (parentId === null) {
        updateData.parentId = null
      } else {
        // Verify parent exists
        const parentCategory = await prisma.category.findUnique({
          where: { id: parentId }
        })
        
        if (!parentCategory) {
          return NextResponse.json(
            { error: 'Parent category not found' },
            { status: 400 }
          )
        }

        // Prevent circular reference
        if (parentId === params.id) {
          return NextResponse.json(
            { error: 'Category cannot be its own parent' },
            { status: 400 }
          )
        }

        // Check if the category being updated is not an ancestor of the new parent
        const checkCircular = async (categoryId: string, targetParentId: string): Promise<boolean> => {
          const category = await prisma.category.findUnique({
            where: { id: targetParentId },
            select: { parentId: true }
          })
          
          if (!category) return false
          if (category.parentId === categoryId) return true
          if (category.parentId) return checkCircular(categoryId, category.parentId)
          return false
        }

        const isCircular = await checkCircular(params.id, parentId)
        if (isCircular) {
          return NextResponse.json(
            { error: 'Cannot create circular reference in category hierarchy' },
            { status: 400 }
          )
        }

        updateData.parentId = parentId
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: updateData,
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        children: true,
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has children
    if (category.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories. Please delete or move subcategories first.' },
        { status: 400 }
      )
    }

    // Check if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with products. Please move or delete products first.' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}