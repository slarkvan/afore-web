import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 检查是否是管理员路由
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      // 重定向到登录页面
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // 由于 Edge Runtime 限制，我们在这里只检查 token 是否存在
    // 实际的 token 验证在 API 路由和组件中进行
  }
  
  // 如果有 token，访问登录页面时重定向到仪表板
  if (pathname === '/admin/login') {
    const token = request.cookies.get('auth-token')?.value
    if (token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}