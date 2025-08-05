import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    // Find the image
    const image = await prisma.productImage.findUnique({
      where: { id: params.imageId }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Delete physical file
    const filepath = join(process.cwd(), image.path)
    if (existsSync(filepath)) {
      try {
        await unlink(filepath)
      } catch (error) {
        console.error('Failed to delete physical file:', error)
        // Continue with database deletion even if file deletion fails
      }
    }

    // If this was the main image, set another image as main
    if (image.isMain) {
      const otherImage = await prisma.productImage.findFirst({
        where: {
          productId: image.productId,
          id: { not: params.imageId }
        },
        orderBy: { sortOrder: 'asc' }
      })

      if (otherImage) {
        await prisma.productImage.update({
          where: { id: otherImage.id },
          data: { isMain: true }
        })
      }
    }

    // Delete database record
    await prisma.productImage.delete({
      where: { id: params.imageId }
    })

    return NextResponse.json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}