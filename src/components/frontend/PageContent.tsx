'use client'

import { Page } from '@/stores/pageStore'

interface PageContentProps {
  page: Page
}

export function PageContent({ page }: PageContentProps) {
  // Simple markdown-like parsing for display
  const renderContent = (content: string) => {
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4">$2</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />')

    // Wrap consecutive <li> elements in <ul>
    html = html.replace(/(<li class="ml-4">.*?<\/li>(?:\s*<li class="ml-4">.*?<\/li>)*)/g, '<ul class="list-disc list-inside mb-4 space-y-1">$1</ul>')
    
    // Wrap content in paragraphs
    if (html && !html.startsWith('<')) {
      html = `<p class="mb-4">${html}</p>`
    }

    return html
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {page.title}
          </h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(page.updatedAt).toLocaleDateString('zh-CN')}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="prose prose-lg max-w-none">
          <div 
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderContent(page.content) }}
          />
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 Afore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}