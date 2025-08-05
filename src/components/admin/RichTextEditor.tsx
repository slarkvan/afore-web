'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Bold, 
  Italic, 
  Underline,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  Eye,
  FileText
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.slice(start, end)
    
    const newText = value.slice(0, start) + before + selectedText + after + value.slice(end)
    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const formatButtons = [
    {
      icon: Bold,
      title: 'Bold',
      action: () => insertText('**', '**')
    },
    {
      icon: Italic,
      title: 'Italic',
      action: () => insertText('*', '*')
    },
    {
      icon: Underline,
      title: 'Underline',
      action: () => insertText('<u>', '</u>')
    },
    {
      icon: Quote,
      title: 'Quote',
      action: () => insertText('> ')
    },
    {
      icon: Code,
      title: 'Code',
      action: () => insertText('`', '`')
    },
    {
      icon: Link,
      title: 'Link',
      action: () => insertText('[', '](url)')
    },
    {
      icon: List,
      title: 'Bullet List',
      action: () => insertText('- ')
    },
    {
      icon: ListOrdered,
      title: 'Numbered List',
      action: () => insertText('1. ')
    }
  ]

  const renderPreview = (content: string) => {
    // Simple markdown-like parsing for preview
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-muted pl-4 italic text-muted-foreground">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline" target="_blank">$1</a>')
      .replace(/\n/g, '<br />')

    // Wrap consecutive <li> elements in <ul>
    html = html.replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/g, '<ul class="list-disc list-inside space-y-1">$1</ul>')

    return html
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border rounded-t-md bg-muted/50">
        {formatButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={button.title}
            className="h-8 w-8 p-0"
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
        
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant={!isPreview ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setIsPreview(false)}
            className="h-8 px-3"
          >
            <FileText className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            type="button"
            variant={isPreview ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setIsPreview(true)}
            className="h-8 px-3"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Editor/Preview */}
      {isPreview ? (
        <Card className={className}>
          <CardContent className="p-4 min-h-[200px]">
            {value ? (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
              />
            ) : (
              <div className="text-muted-foreground">Nothing to preview</div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Enter content..."}
          className={`min-h-[200px] rounded-t-none ${className}`}
          style={{ resize: 'vertical' }}
        />
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground">
        <strong>Formatting:</strong> **bold**, *italic*, `code`, &gt; quote, - list, [link](url)
      </div>
    </div>
  )
}