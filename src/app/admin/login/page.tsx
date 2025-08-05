'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login(email, password)

      if (result.success) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError(result.error || '登录失败')
      }
    } catch {
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-slate-800">管理员登录</CardTitle>
          <CardDescription className="text-center text-slate-600">
            请使用管理员账号登录系统
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@afore.com"
                required
                disabled={isLoading}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                disabled={isLoading}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600" 
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>默认账号：admin@afore.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}