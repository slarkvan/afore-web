import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { PageContent } from '@/components/frontend/PageContent'

interface PageProps {
  params: { slug: string }
}

async function getPage(slug: string) {
  try {
    // Use internal API call for server-side rendering
    const { prisma } = await import('@/lib/prisma')
    
    const page = await prisma.page.findFirst({
      where: { 
        slug: slug,
        isActive: true
      }
    })
    
    return page
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getPage(params.slug)
  
  if (!page) {
    return {
      title: 'Page Not Found'
    }
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.content.replace(/<[^>]*>/g, '').substring(0, 160),
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || page.content.replace(/<[^>]*>/g, '').substring(0, 160),
      type: 'article'
    }
  }
}

export default async function Page({ params }: PageProps) {
  const page = await getPage(params.slug)
  
  if (!page) {
    notFound()
  }

  return <PageContent page={page} />
}