import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, parentId, sortOrder = 0, isActive = true } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    let slug = generateSlug(name)
    
    // Check if slug already exists and make it unique
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })
    
    if (existingCategory) {
      const timestamp = Date.now()
      slug = `${slug}-${timestamp}`
    }

    // If parentId is provided, verify parent exists
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      })
      
      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentId,
        sortOrder,
        isActive
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}