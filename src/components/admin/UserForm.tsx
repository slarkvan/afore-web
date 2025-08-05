'use client'

import { useState, useEffect } from 'react'
import { useUserStore, User } from '@/stores/userStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'

interface UserFormProps {
  user?: User
  onSuccess?: () => void
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const { 
    loading,
    error,
    createUser,
    updateUser
  } = useUserStore()

  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    name: user?.name || '',
    role: user?.role || 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN',
    isActive: user?.isActive ?? true
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        name: user.name,
        role: user.role,
        isActive: user.isActive
      })
    }
  }, [user])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email format'
      }
    }
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }

    if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters long'
    }

    // Password validation only for new users or when password is provided
    if (!user || formData.password) {
      if (!formData.password) {
        errors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = {
      email: formData.email.trim(),
      name: formData.name.trim(),
      role: formData.role,
      isActive: formData.isActive,
      ...(formData.password && { password: formData.password })
    }

    try {
      if (user) {
        await updateUser(user.id, submitData)
      } else {
        await createUser({
          email: submitData.email,
          password: submitData.password!,
          name: submitData.name,
          role: submitData.role,
          isActive: submitData.isActive
        })
      }
      
      if (onSuccess) {
        onSuccess()
      }
      
      // Reset form if creating new user
      if (!user) {
        setFormData({
          email: '',
          password: '',
          name: '',
          role: 'ADMIN',
          isActive: true
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              className={formErrors.name ? 'border-red-500' : ''}
            />
            {formErrors.name && (
              <div className="text-red-500 text-sm">{formErrors.name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className={formErrors.email ? 'border-red-500' : ''}
            />
            {formErrors.email && (
              <div className="text-red-500 text-sm">{formErrors.email}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {user ? '(leave empty to keep current)' : '*'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={user ? 'Enter new password' : 'Enter password'}
                className={formErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {formErrors.password && (
              <div className="text-red-500 text-sm">{formErrors.password}</div>
            )}
            {!user && (
              <div className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions & Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              {formData.role === 'SUPER_ADMIN' 
                ? 'Full access to all features and user management'
                : 'Standard admin access to manage content and products'
              }
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <Select
              value={formData.isActive.toString()}
              onValueChange={(value) => handleInputChange('isActive', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              {formData.isActive 
                ? 'User can log in and access the admin panel'
                : 'User account is disabled and cannot log in'
              }
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
        </Button>
      </div>
    </form>
  )
}