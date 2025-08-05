import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import slugify from 'slugify'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'zh',
  })
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(price)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}