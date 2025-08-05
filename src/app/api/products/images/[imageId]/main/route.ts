import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
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

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // First, set all images of this product to not main
      await tx.productImage.updateMany({
        where: { productId: image.productId },
        data: { isMain: false }
      })

      // Then set this image as main
      await tx.productImage.update({
        where: { id: params.imageId },
        data: { isMain: true }
      })
    })

    return NextResponse.json({ message: 'Main image updated successfully' })
  } catch (error) {
    console.error('Error setting main image:', error)
    return NextResponse.json(
      { error: 'Failed to set main image' },
      { status: 500 }
    )
  }
}