'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Users, 
  FileText,
  Settings
} from 'lucide-react'

const navigation = [
  {
    name: '仪表板',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    name: '产品管理',
    href: '/admin/products',
    icon: Package
  },
  {
    name: '分类管理',
    href: '/admin/categories',
    icon: FolderTree
  },
  {
    name: '用户管理',
    href: '/admin/users',
    icon: Users
  },
  {
    name: '页面管理',
    href: '/admin/pages',
    icon: FileText
  },
  {
    name: '系统设置',
    href: '/admin/settings',
    icon: Settings
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-card border-r">
      <div className="flex items-center justify-center h-16 border-b">
        <span className="text-foreground text-xl font-medium">Afore</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Button
              key={item.name}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start h-10"
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}