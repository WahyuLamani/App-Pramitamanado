'use client'

export type AuthUser = {
  id: number
  username: string
  name: string
}

export function getUserFromCookie(): AuthUser | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  const authCookie = cookies.find(c => c.trim().startsWith('auth_user='))
  
  if (!authCookie) return null
  
  try {
    const value = authCookie.split('=')[1]
    return JSON.parse(decodeURIComponent(value))
  } catch {
    return null
  }
}

const AUTH_STORAGE_KEY = 'medical_booking_user'

/**
 * Save user to localStorage after successful login
 */
export function saveUserToStorage(user: AuthUser) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

/**
 * Logout user - clear localStorage
 */
export async function logout() {
  // Clear localStorage
  localStorage.removeItem(AUTH_STORAGE_KEY)
  
  // Clear cookie via server action
  const { clearAuthCookie } = await import('@/lib/authentication/prismaAuth')
  await clearAuthCookie()
  
  window.location.href = '/login'
}


export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  
  // Try cookies first
  const userFromCookie = getUserFromCookie()
  if (userFromCookie) return userFromCookie
  
  // Fallback to localStorage
  const userStr = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}
/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

/**
 * Require authentication - redirect to login if not authenticated
 * Use this in client components
 */
export function requireAuth() {
  if (typeof window === 'undefined') return

  if (!isAuthenticated()) {
    window.location.href = '/login'
  }
}