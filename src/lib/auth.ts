import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

export interface JWTPayload {
  userId: string
  email: string
  name: string
  role: UserRole
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export class AuthService {
  static async login(email: string, password: string): Promise<{ user: AuthUser; token: string } | null> {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
          isActive: true
        }
      })

      if (!user) {
        return null
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return null
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }

      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)

      return { user: authUser, token }
    } catch (error) {
      console.error('Login error:', error)
      return null
    }
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
      return decoded
    } catch (error) {
      console.error('Token verification error:', error)
      return null
    }
  }

  static async getUserFromToken(token: string): Promise<AuthUser | null> {
    const payload = this.verifyToken(token)
    if (!payload) {
      return null
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: payload.userId,
          isActive: true
        }
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    } catch (error) {
      console.error('Get user from token error:', error)
      return null
    }
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
  }
}