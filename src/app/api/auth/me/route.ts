import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: '未认证' },
        { status: 401 }
      )
    }
    
    const user = await AuthService.getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在或已被禁用' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user info error:', error)
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    )
  }
}