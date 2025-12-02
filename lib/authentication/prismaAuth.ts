'use server'

import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export type AuthUser = {
  id: number
  username: string
  name: string
}

export type LoginResponse = {
  success: boolean
  error?: string
  user?: AuthUser
}

/**
 * Login user - verify credentials
 */
export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  try {
    // Validasi input
    if (!username || !password) {
      return {
        success: false,
        error: 'Username dan password wajib diisi',
      }
    }

    // Cari user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        password: true,
      },
    })

    // Check if user exists dan password match
    // NOTE: Ini simple comparison, di production gunakan bcrypt
    if (!user || user.password !== password) {
      return {
        success: false,
        error: 'Username atau password salah',
      }
    }

    // Return user data (tanpa password)
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan pada server',
    }
  }
}

/**
 * Set auth cookie - save user to cookies
 */
export async function setAuthCookie(user: AuthUser) {
  cookies().set('auth_user', JSON.stringify(user), {
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

/**
 * Clear auth cookie - logout
 */
export async function clearAuthCookie() {
  cookies().delete('auth_user')
}

/**
 * Get authenticated user from cookies
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const userCookie = cookies().get('auth_user')
  if (!userCookie) return null

  try {
    return JSON.parse(userCookie.value)
  } catch {
    return null
  }
}