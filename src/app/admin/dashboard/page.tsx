import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Package, FolderTree, Users, FileText, Plus } from 'lucide-react'

async function getDashboardStats() {
  const [productsCount, categoriesCount, usersCount, pagesCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.user.count(),
    prisma.page.count(),
  ])

  return {
    productsCount,
    categoriesCount,
    usersCount,
    pagesCount,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const cards = [
    {
      title: '产品总数',
      value: stats.productsCount,
      description: '系统中的产品数量',
      icon: Package,
    },
    {
      title: '分类总数',
      value: stats.categoriesCount,
      description: '包含一级和二级分类',
      icon: FolderTree,
    },
    {
      title: '用户总数',
      value: stats.usersCount,
      description: '管理员用户数量',
      icon: Users,
    },
    {
      title: '页面总数',
      value: stats.pagesCount,
      description: '静态页面数量',
      icon: FileText,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">仪表板</h1>
        <p className="text-muted-foreground">欢迎使用 Afore 管理后台</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用功能快速入口</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4 mr-2" />
                添加新产品
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/categories/new">
                <Plus className="h-4 w-4 mr-2" />
                添加新分类
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/pages/new">
                <Plus className="h-4 w-4 mr-2" />
                添加新页面
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统信息</CardTitle>
            <CardDescription>当前系统状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">数据库连接</span>
              <Badge variant="secondary">正常</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">文件上传</span>
              <Badge variant="secondary">可用</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">缓存状态</span>
              <Badge variant="secondary">正常</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}