import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateSlug(title: string): string {
  return title
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
    const page = await prisma.page.findUnique({
      where: { id: params.id }
    })

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page' },
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
      title,
      content,
      metaTitle,
      metaDescription,
      isActive
    } = body

    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { id: params.id }
    })

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    const updateData: Partial<{
      title: string
      slug: string
      content: string
      metaTitle: string | null
      metaDescription: string | null
      isActive: boolean
    }> = {}

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { error: 'Title is required' },
          { status: 400 }
        )
      }

      if (title.length > 200) {
        return NextResponse.json(
          { error: 'Title must be less than 200 characters' },
          { status: 400 }
        )
      }

      updateData.title = title
      // Generate new slug if title changed
      if (title !== existingPage.title) {
        let slug = generateSlug(title)
        
        // Check if slug already exists (excluding current page)
        const conflictingPage = await prisma.page.findFirst({
          where: { 
            slug,
            NOT: { id: params.id }
          }
        })
        
        if (conflictingPage) {
          const timestamp = Date.now()
          slug = `${slug}-${timestamp}`
        }
        
        updateData.slug = slug
      }
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return NextResponse.json(
          { error: 'Content is required' },
          { status: 400 }
        )
      }
      updateData.content = content
    }

    if (metaTitle !== undefined) {
      if (metaTitle && metaTitle.length > 60) {
        return NextResponse.json(
          { error: 'Meta title should be less than 60 characters' },
          { status: 400 }
        )
      }
      updateData.metaTitle = metaTitle || null
    }

    if (metaDescription !== undefined) {
      if (metaDescription && metaDescription.length > 160) {
        return NextResponse.json(
          { error: 'Meta description should be less than 160 characters' },
          { status: 400 }
        )
      }
      updateData.metaDescription = metaDescription || null
    }

    if (isActive !== undefined) updateData.isActive = isActive

    const page = await prisma.page.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { id: params.id }
    })

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of important system pages (optional)
    const protectedSlugs = ['home', 'about', 'contact', 'privacy', 'terms']
    if (protectedSlugs.includes(page.slug)) {
      return NextResponse.json(
        { error: 'This page cannot be deleted as it is a system page' },
        { status: 400 }
      )
    }

    await prisma.page.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Page deleted successfully' })
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    )
  }
}