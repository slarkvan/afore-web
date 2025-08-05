import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validatedData = loginSchema.parse(body)
    
    // 尝试登录
    const result = await AuthService.login(validatedData.email, validatedData.password)
    
    if (!result) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }
    
    // 设置 HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: result.user
    })
    
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: '登录失败，请重试' },
      { status: 500 }
    )
  }
}