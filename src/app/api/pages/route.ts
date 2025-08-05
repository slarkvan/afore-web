import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')
    
    const skip = (page - 1) * limit

    const where: {
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        content?: { contains: string; mode: 'insensitive' }
      }>
      isActive?: boolean
    } = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.page.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      pages,
      total,
      page,
      limit,
      totalPages
    })
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      metaTitle,
      metaDescription,
      isActive = true
    } = body

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be less than 200 characters' },
        { status: 400 }
      )
    }

    // Generate unique slug
    let slug = generateSlug(title)
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    })
    
    if (existingPage) {
      const timestamp = Date.now()
      slug = `${slug}-${timestamp}`
    }

    // Validate meta fields
    if (metaTitle && metaTitle.length > 60) {
      return NextResponse.json(
        { error: 'Meta title should be less than 60 characters' },
        { status: 400 }
      )
    }

    if (metaDescription && metaDescription.length > 160) {
      return NextResponse.json(
        { error: 'Meta description should be less than 160 characters' },
        { status: 400 }
      )
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        metaTitle,
        metaDescription,
        isActive
      }
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    )
  }
}